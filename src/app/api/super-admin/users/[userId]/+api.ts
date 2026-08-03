import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { adminAuditLogs, properties, user } from "@/db/schema";
import { badRequestResponse, internalServerErrorResponse, notFoundResponse, successResponse, validationErrorResponse } from "@/lib/api-response";
import { guardErrorResponse, requireSuperAdmin } from "@/lib/auth-guards.server";
import { dispatchNotification } from "@/lib/notifications/dispatcher.server";
import {
  ensureNotFinalActiveSuperAdmin,
  finalAdminResponse,
  requireReason,
  serializeUsers,
} from "@/lib/super-admin/super-admin.server";

const actionSchema = z.object({
  action: z.enum(["suspend", "reactivate"]),
  reason: z.string().trim().optional(),
});

type RouteParams = {
  userId: string;
};

export async function PATCH(request: Request, { userId }: RouteParams) {
  try {
    const context = await requireSuperAdmin(request);

    if (!userId) {
      return badRequestResponse("User ID is required.");
    }

    const parsed = actionSchema.safeParse(await request.json());
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const existing = await db.query.user.findFirst({ where: eq(user.id, userId), with: { landlordProfile: true } });
    if (!existing) return notFoundResponse("User not found.");

    if (parsed.data.action === "suspend") {
      const reasonError = requireReason(parsed.data.reason);
      if (reasonError) return reasonError;
      await ensureNotFinalActiveSuperAdmin(existing.id);
    }

    const accountStatus = parsed.data.action === "reactivate" ? "ACTIVE" : "SUSPENDED";
    const ownedListings = existing.landlordProfile
      ? await db.query.properties.findMany({
          where: eq(properties.landlordId, existing.landlordProfile.id),
        })
      : [];
    const updateUser = db
      .update(user)
      .set({ accountStatus, updatedAt: new Date() })
      .where(eq(user.id, existing.id))
      .returning();
    const insertAudit = db.insert(adminAuditLogs).values({
        id: crypto.randomUUID(),
        administratorId: context.user.id,
        action: `USER_${parsed.data.action.toUpperCase()}`,
        entityType: "user",
        entityId: existing.id,
        metadata: {
          previousStatus: existing.accountStatus,
          nextStatus: accountStatus,
          reason: parsed.data.reason ?? null,
          affectedListingIds:
            parsed.data.action === "suspend"
              ? ownedListings.map((listing) => listing.id)
              : [],
          previousListings:
            parsed.data.action === "suspend"
              ? ownedListings.map((listing) => ({
                  id: listing.id,
                  isAvailable: listing.isAvailable,
                  approvalStatus: listing.approvalStatus,
                }))
              : [],
        },
      });
    let updated: typeof user.$inferSelect | undefined;

    if (parsed.data.action === "suspend" && existing.landlordProfile) {
      const [updatedRows] = await db.batch([
        updateUser,
        db
          .update(properties)
          .set({ isAvailable: false, updatedAt: new Date() })
          .where(eq(properties.landlordId, existing.landlordProfile.id)),
        insertAudit,
      ]);
      [updated] = updatedRows;
    } else {
      const [updatedRows] = await db.batch([updateUser, insertAudit]);
      [updated] = updatedRows;
    }

    if (!updated) {
      return internalServerErrorResponse();
    }
    await dispatchNotification({ recipientIds: [existing.id], type: "ACCOUNT_MODERATION", category: "ACCOUNT", eventKey: `account.${parsed.data.action}`, priority: "CRITICAL", title: parsed.data.action === "suspend" ? "Account suspended" : "Account reactivated", message: parsed.data.action === "suspend" ? `Your FinderZ account has been suspended. ${parsed.data.reason ?? "Contact support for help."}` : "Your FinderZ account has been reactivated.", deepLink: "/account-status", relatedEntityType: "user", relatedEntityId: existing.id, deduplicationKey: `account-${parsed.data.action}:${existing.id}:${updated.updatedAt.toISOString()}` });
    const [serialized] = await serializeUsers([{ ...updated, landlordProfile: existing.landlordProfile }]);
    return successResponse({ user: serialized }, { message: "User account updated." });
  } catch (error) {
    try {
      return finalAdminResponse(error);
    } catch {
      try {
        return guardErrorResponse(error);
      } catch {
        console.error("PATCH /api/super-admin/users/[userId] failed:", error);
        return internalServerErrorResponse();
      }
    }
  }
}
