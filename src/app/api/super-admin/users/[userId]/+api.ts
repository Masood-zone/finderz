import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { user } from "@/db/schema";
import { internalServerErrorResponse, notFoundResponse, successResponse, validationErrorResponse } from "@/lib/api-response";
import { guardErrorResponse, requireSuperAdmin } from "@/lib/auth-guards.server";
import {
  ensureNotFinalActiveSuperAdmin,
  finalAdminResponse,
  requireReason,
  serializeUsers,
  writeAdminAuditLog,
} from "@/lib/super-admin/super-admin.server";

const actionSchema = z.object({
  action: z.enum(["suspend", "reactivate"]),
  reason: z.string().trim().optional(),
});

type RouteContext = {
  params: {
    userId: string;
  };
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const context = await requireSuperAdmin(request);
    const parsed = actionSchema.safeParse(await request.json());
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const existing = await db.query.user.findFirst({ where: eq(user.id, params.userId), with: { landlordProfile: true } });
    if (!existing) return notFoundResponse("User not found.");

    if (parsed.data.action === "suspend") {
      const reasonError = requireReason(parsed.data.reason);
      if (reasonError) return reasonError;
      await ensureNotFinalActiveSuperAdmin(existing.id);
    }

    const accountStatus = parsed.data.action === "reactivate" ? "ACTIVE" : "SUSPENDED";
    const [updated] = await db.update(user).set({ accountStatus, updatedAt: new Date() }).where(eq(user.id, existing.id)).returning();
    await writeAdminAuditLog(context, `USER_${parsed.data.action.toUpperCase()}`, "user", existing.id, {
      previousStatus: existing.accountStatus,
      nextStatus: accountStatus,
      reason: parsed.data.reason ?? null,
    });
    const [serialized] = await serializeUsers([{ ...updated, landlordProfile: existing.landlordProfile }]);
    return successResponse({ user: serialized }, { message: "User account updated." });
  } catch (error) {
    try {
      return finalAdminResponse(error);
    } catch {
      try {
        return guardErrorResponse(error);
      } catch {
        return internalServerErrorResponse();
      }
    }
  }
}
