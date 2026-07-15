import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { properties } from "@/db/schema";
import {
  badRequestResponse,
  internalServerErrorResponse,
  notFoundResponse,
  successResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import {
  guardErrorResponse,
  requireSuperAdmin,
} from "@/lib/auth-guards.server";
import {
  finalAdminResponse,
  getAdminPropertyDetail,
  requireReason,
  writeAdminAuditLog,
} from "@/lib/super-admin/super-admin.server";
import { dispatchNotification } from "@/lib/notifications/dispatcher.server";

const actionSchema = z.object({
  action: z.enum(["approve", "reject", "request_changes", "suspend"]),
  reason: z.string().trim().optional(),
});

type RouteContext = {
  propertyId: string;
};

export async function GET(request: Request, { propertyId }: RouteContext) {
  try {
    await requireSuperAdmin(request);

    if (!propertyId) {
      return badRequestResponse("Property ID is required.");
    }

    const property = await getAdminPropertyDetail(propertyId);

    if (!property) {
      return notFoundResponse("Property not found.");
    }

    return successResponse({ property });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      console.error("GET /api/approvals/[propertyId] failed:", error);
      return internalServerErrorResponse();
    }
  }
}

export async function PATCH(request: Request, { propertyId }: RouteContext) {
  try {
    const context = await requireSuperAdmin(request);

    if (!propertyId) {
      return badRequestResponse("Property ID is required.");
    }

    const parsed = actionSchema.safeParse(await request.json());

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const existing = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId),
    });

    if (!existing) {
      return notFoundResponse("Property not found.");
    }

    const reasonError =
      parsed.data.action === "reject" ||
      parsed.data.action === "request_changes" ||
      parsed.data.action === "suspend"
        ? requireReason(parsed.data.reason)
        : null;

    if (reasonError) return reasonError;

    const next =
      parsed.data.action === "approve"
        ? {
            approvalStatus: "APPROVED" as const,
            rejectionReason: null,
            isAvailable: true,
          }
        : parsed.data.action === "suspend"
          ? {
              approvalStatus: "REJECTED" as const,
              rejectionReason: parsed.data.reason,
              isAvailable: false,
            }
          : {
              approvalStatus: "REJECTED" as const,
              rejectionReason: parsed.data.reason,
            };

    await db
      .update(properties)
      .set({
        ...next,
        updatedAt: new Date(),
      })
      .where(eq(properties.id, existing.id));

    await writeAdminAuditLog(
      context,
      `PROPERTY_${parsed.data.action.toUpperCase()}`,
      "property",
      existing.id,
      {
        previousStatus: existing.approvalStatus,
        reason: parsed.data.reason ?? null,
      },
    );

    const property = await getAdminPropertyDetail(existing.id);
    if (property?.landlord?.userId) await dispatchNotification({ recipientIds: [property.landlord.userId], type: "PROPERTY_MODERATION", category: "PROPERTY", eventKey: `property.${parsed.data.action}`, priority: parsed.data.action === "suspend" ? "HIGH" : "NORMAL", title: parsed.data.action === "approve" ? "Property approved" : parsed.data.action === "request_changes" ? "Property changes requested" : parsed.data.action === "suspend" ? "Property suspended" : "Property rejected", message: parsed.data.action === "approve" ? `${existing.title} is now live on FinderZ.` : (parsed.data.reason ?? `${existing.title} was reviewed.`), deepLink: `/landlord/properties/${existing.id}`, relatedEntityType: "property", relatedEntityId: existing.id, deduplicationKey: `property-${parsed.data.action}:${existing.id}:${existing.updatedAt.toISOString()}` });

    return successResponse(
      { property },
      { message: "Property review updated." },
    );
  } catch (error) {
    try {
      return finalAdminResponse(error);
    } catch {
      try {
        return guardErrorResponse(error);
      } catch {
        console.error("PATCH /api/approvals/[propertyId] failed:", error);
        return internalServerErrorResponse();
      }
    }
  }
}
