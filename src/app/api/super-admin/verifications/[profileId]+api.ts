import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { landlordProfiles, notifications } from "@/db/schema";
import { badRequestResponse, internalServerErrorResponse, notFoundResponse, successResponse, validationErrorResponse } from "@/lib/api-response";
import { guardErrorResponse, requireSuperAdmin } from "@/lib/auth-guards.server";
import {
  finalAdminResponse,
  getActivityForEntity,
  requireReason,
  serializeLandlordVerifications,
  writeAdminAuditLog,
} from "@/lib/super-admin/super-admin.server";

type RouteParams = {
  profileId: string;
};

const actionSchema = z.object({
  action: z.enum(["approve", "request_changes", "reject"]),
  reason: z.string().trim().optional(),
});

async function getVerificationDetail(profileId: string) {
  const row = await db.query.landlordProfiles.findFirst({
    where: eq(landlordProfiles.id, profileId),
    with: { user: true },
  });

  if (!row) {
    return null;
  }

  const [verification] = await serializeLandlordVerifications([row]);
  const reviewHistory = await getActivityForEntity("landlord_verification", profileId);
  return { ...verification, reviewHistory };
}

export async function GET(request: Request, { profileId }: RouteParams) {
  try {
    await requireSuperAdmin(request);

    if (!profileId) {
      return badRequestResponse("Landlord profile ID is required.");
    }

    const verification = await getVerificationDetail(profileId);
    if (!verification) {
      return notFoundResponse("Verification profile not found.");
    }

    return successResponse({ verification });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      console.error("GET /api/super-admin/verifications/[profileId] failed:", error);
      return internalServerErrorResponse();
    }
  }
}

export async function PATCH(request: Request, { profileId }: RouteParams) {
  try {
    const context = await requireSuperAdmin(request);

    if (!profileId) {
      return badRequestResponse("Landlord profile ID is required.");
    }

    const parsed = actionSchema.safeParse(await request.json());
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const existing = await db.query.landlordProfiles.findFirst({ where: eq(landlordProfiles.id, profileId), with: { user: true } });
    if (!existing) return notFoundResponse("Verification profile not found.");

    const reasonError = parsed.data.action === "approve" ? null : requireReason(parsed.data.reason);
    if (reasonError) return reasonError;

    const next =
      parsed.data.action === "approve"
        ? {
            verificationStatus: "APPROVED" as const,
            verificationNotes: null,
            verifiedAt: new Date(),
          }
        : {
            verificationStatus: parsed.data.action === "request_changes" ? ("CHANGES_REQUESTED" as const) : ("REJECTED" as const),
            verificationNotes: parsed.data.reason,
            verifiedAt: null,
          };

    await db
      .update(landlordProfiles)
      .set({
        ...next,
        updatedAt: new Date(),
      })
      .where(eq(landlordProfiles.id, existing.id));

    await writeAdminAuditLog(context, `LANDLORD_VERIFICATION_${parsed.data.action.toUpperCase()}`, "landlord_verification", existing.id, {
      previousStatus: existing.verificationStatus,
      nextStatus: next.verificationStatus,
      reason: parsed.data.reason ?? null,
    });

    if (existing.userId) {
      await db.insert(notifications).values({
        id: crypto.randomUUID(),
        userId: existing.userId,
        type: "LANDLORD_VERIFICATION",
        title: parsed.data.action === "approve" ? "Verification approved" : parsed.data.action === "request_changes" ? "Verification changes requested" : "Verification rejected",
        message:
          parsed.data.action === "approve"
            ? "Your landlord verification has been approved. You can now manage listings with verified status."
            : (parsed.data.reason ?? "Please update your landlord verification details and resubmit."),
        data: { profileId: existing.id, action: parsed.data.action },
      });
    }

    const verification = await getVerificationDetail(existing.id);
    return successResponse({ verification }, { message: "Landlord verification review updated." });
  } catch (error) {
    try {
      return finalAdminResponse(error);
    } catch {
      try {
        return guardErrorResponse(error);
      } catch {
        console.error("PATCH /api/super-admin/verifications/[profileId] failed:", error);
        return internalServerErrorResponse();
      }
    }
  }
}
