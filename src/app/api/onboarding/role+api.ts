import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { adminAuditLogs, user } from "@/db/schema";
import { errorResponse, internalServerErrorResponse, successResponse, validationErrorResponse } from "@/lib/api-response";
import { guardErrorResponse, requireSession } from "@/lib/auth-guards.server";

const assignRoleSchema = z.object({
  role: z.enum(["TENANT", "LANDLORD"]),
});

function serializeUser(currentUser: typeof user.$inferSelect) {
  return {
    id: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone,
    role: currentUser.role,
    onboardingCompleted: currentUser.onboardingCompleted,
    accountStatus: currentUser.accountStatus,
  };
}

export async function POST(request: Request) {
  try {
    const context = await requireSession(request);
    const body = assignRoleSchema.safeParse(await request.json());

    if (!body.success) {
      return validationErrorResponse(body.error);
    }

    if (context.user.onboardingCompleted) {
      return errorResponse("ONBOARDING_ALREADY_COMPLETED", "Role onboarding has already been completed.", 409);
    }

    const [updatedUser] = await db
      .update(user)
      .set({
        role: body.data.role,
        onboardingCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(user.id, context.user.id))
      .returning();

    await db.insert(adminAuditLogs).values({
      id: `audit-role-${context.user.id}-${Date.now()}`,
      administratorId: context.user.id,
      action: "ONBOARDING_ROLE_ASSIGNED",
      entityType: "user",
      entityId: context.user.id,
      metadata: {
        role: body.data.role,
        source: "self_onboarding",
      },
    });

    return successResponse(
      {
        user: serializeUser(updatedUser),
      },
      { message: "Role assigned successfully." },
    );
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
