import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  adminAuditLogs,
  properties,
  propertyReports,
  user,
} from "@/db/schema";
import {
  badRequestResponse,
  errorResponse,
  internalServerErrorResponse,
  notFoundResponse,
  successResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { guardErrorResponse, requireSuperAdmin } from "@/lib/auth-guards.server";
import { dispatchNotification } from "@/lib/notifications/dispatcher.server";
import { requireReason, serializeReport } from "@/lib/super-admin/super-admin.server";

const actionSchema = z.object({
  action: z.enum([
    "start_review",
    "resolve",
    "dismiss",
    "suspend_listing",
    "suspend_owner",
  ]),
  reason: z.string().trim().max(1000).optional(),
});

type RouteParams = { reportId: string };

export async function PATCH(request: Request, { reportId }: RouteParams) {
  try {
    const context = await requireSuperAdmin(request);

    if (!reportId) {
      return badRequestResponse("Report ID is required.");
    }

    const parsed = actionSchema.safeParse(await request.json());
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const report = await db.query.propertyReports.findFirst({
      where: eq(propertyReports.id, reportId),
      with: {
        property: {
          with: {
            landlord: { with: { user: true, properties: true } },
          },
        },
        reporter: true,
      },
    });

    if (!report) return notFoundResponse("Report not found.");
    if (report.status === "RESOLVED" || report.status === "DISMISSED") {
      return errorResponse(
        "REPORT_ALREADY_CLOSED",
        "This report has already been closed.",
        409,
      );
    }

    const { action, reason } = parsed.data;
    if (action === "start_review" && report.status !== "OPEN") {
      return errorResponse(
        "REPORT_ALREADY_IN_REVIEW",
        "This report is already being reviewed.",
        409,
      );
    }

    if (action === "suspend_listing" || action === "suspend_owner") {
      const reasonError = requireReason(reason);
      if (reasonError) return reasonError;
    }

    const owner = report.property?.landlord?.user;
    const ownerProfile = report.property?.landlord;
    if (action === "suspend_owner" && (!owner || !ownerProfile)) {
      return badRequestResponse("The property owner could not be identified.");
    }

    const affectedListings =
      action === "suspend_owner" ? (ownerProfile?.properties ?? []) : [];
    const nextStatus =
      action === "start_review"
        ? "REVIEWING"
        : action === "dismiss"
          ? "DISMISSED"
          : "RESOLVED";

    const reportUpdate = db
      .update(propertyReports)
      .set({
        status: nextStatus,
        reviewedBy: context.user.id,
        reviewedAt: new Date(),
      })
      .where(
        and(
          eq(propertyReports.id, report.id),
          inArray(propertyReports.status, ["OPEN", "REVIEWING"]),
        ),
      );
    const auditInsert = db.insert(adminAuditLogs).values({
        id: crypto.randomUUID(),
        administratorId: context.user.id,
        action: `REPORT_${action.toUpperCase()}`,
        entityType: "property_report",
        entityId: report.id,
        metadata: {
          propertyId: report.propertyId,
          ownerUserId: owner?.id ?? null,
          reason: reason ?? null,
          previousReportStatus: report.status,
          nextReportStatus: nextStatus,
          previousPropertyStatus: report.property?.approvalStatus ?? null,
          previousPropertyAvailability: report.property?.isAvailable ?? null,
          previousOwnerStatus: owner?.accountStatus ?? null,
          affectedListingIds: affectedListings.map((listing) => listing.id),
          affectedListings: affectedListings.map((listing) => ({
            id: listing.id,
            approvalStatus: listing.approvalStatus,
            isAvailable: listing.isAvailable,
          })),
        },
      });

    if (action === "suspend_listing" && report.property) {
      await db.batch([
        db
          .update(properties)
          .set({
            approvalStatus: "REJECTED",
            isAvailable: false,
            rejectionReason: reason,
            updatedAt: new Date(),
          })
          .where(eq(properties.id, report.property.id)),
        reportUpdate,
        auditInsert,
      ]);
    } else if (action === "suspend_owner" && owner && ownerProfile) {
      await db.batch([
        db
          .update(user)
          .set({ accountStatus: "SUSPENDED", updatedAt: new Date() })
          .where(eq(user.id, owner.id)),
        db
          .update(properties)
          .set({ isAvailable: false, updatedAt: new Date() })
          .where(eq(properties.landlordId, ownerProfile.id)),
        reportUpdate,
        auditInsert,
      ]);
    } else {
      await db.batch([reportUpdate, auditInsert]);
    }

    const updated = await db.query.propertyReports.findFirst({
      where: eq(propertyReports.id, report.id),
      with: {
        property: {
          with: {
            landlord: { with: { user: true, properties: true } },
          },
        },
        reporter: true,
      },
    });

    const reporterTitle =
      action === "start_review"
        ? "Property report under review"
        : action === "dismiss"
          ? "Property report dismissed"
          : action === "suspend_owner"
            ? "Property owner suspended"
            : action === "suspend_listing"
              ? "Reported listing suspended"
              : "Property report resolved";

    await dispatchNotification({
      recipientIds: [report.reporterId],
      type: "REPORT_MODERATION",
      category: "REPORT",
      eventKey: `report.${action}`,
      title: reporterTitle,
      message:
        reason ??
        (action === "start_review"
          ? "FinderZ has started reviewing your property report."
          : "FinderZ has completed its review of your property report."),
      deepLink:
        action === "suspend_listing" || action === "suspend_owner"
          ? "/property-unavailable?reason=suspended"
          : `/tenant/property/${report.propertyId}`,
      relatedEntityType: "property_report",
      relatedEntityId: report.id,
      deduplicationKey: `report-${action}:${report.id}`,
    });

    if (
      owner &&
      (action === "suspend_listing" || action === "suspend_owner")
    ) {
      await dispatchNotification({
        recipientIds: [owner.id],
        type:
          action === "suspend_owner"
            ? "ACCOUNT_MODERATION"
            : "PROPERTY_SUSPENDED",
        category: action === "suspend_owner" ? "ACCOUNT" : "PROPERTY",
        eventKey:
          action === "suspend_owner"
            ? "account.suspended_from_report"
            : "property.suspended_from_report",
        priority: "HIGH",
        title:
          action === "suspend_owner"
            ? "Account suspended"
            : "Property suspended",
        message:
          reason ??
          (action === "suspend_owner"
            ? "Your FinderZ account has been suspended after a report review."
            : `${report.property?.title ?? "Your property"} was suspended after a report review.`),
        deepLink:
          action === "suspend_owner"
            ? "/account-status"
            : `/landlord/properties/${report.propertyId}`,
        relatedEntityType:
          action === "suspend_owner" ? "user" : "property",
        relatedEntityId:
          action === "suspend_owner" ? owner.id : report.propertyId,
        deduplicationKey: `report-${action}-owner:${report.id}`,
      });
    }

    return successResponse(
      { report: updated ? serializeReport(updated) : null },
      { message: "Report updated." },
    );
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch (unexpectedError) {
      console.error(
        "PATCH /api/super-admin/reports/[reportId] failed:",
        unexpectedError,
      );
      return internalServerErrorResponse();
    }
  }
}
