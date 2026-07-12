import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { properties, propertyReports } from "@/db/schema";
import { badRequestResponse, internalServerErrorResponse, notFoundResponse, successResponse, validationErrorResponse } from "@/lib/api-response";
import { guardErrorResponse, requireSuperAdmin } from "@/lib/auth-guards.server";
import { requireReason, serializeReport, writeAdminAuditLog } from "@/lib/super-admin/super-admin.server";
import { dispatchNotification } from "@/lib/notifications/dispatcher.server";

const actionSchema = z.object({
  action: z.enum(["resolve", "dismiss", "suspend_listing"]),
  reason: z.string().trim().optional(),
});

type RouteParams = {
  reportId: string;
};

export async function PATCH(request: Request, { reportId }: RouteParams) {
  try {
    const context = await requireSuperAdmin(request);

    if (!reportId) {
      return badRequestResponse("Report ID is required.");
    }

    const parsed = actionSchema.safeParse(await request.json());
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const report = await db.query.propertyReports.findFirst({ where: eq(propertyReports.id, reportId) });
    if (!report) return notFoundResponse("Report not found.");

    if (parsed.data.action === "suspend_listing") {
      const reasonError = requireReason(parsed.data.reason);
      if (reasonError) return reasonError;
      await db.update(properties).set({ approvalStatus: "REJECTED", isAvailable: false, rejectionReason: parsed.data.reason, updatedAt: new Date() }).where(eq(properties.id, report.propertyId));
    }

    const status = parsed.data.action === "dismiss" ? "DISMISSED" : "RESOLVED";
    await db.update(propertyReports).set({ status, reviewedBy: context.user.id, reviewedAt: new Date() }).where(eq(propertyReports.id, report.id));
    await writeAdminAuditLog(context, `REPORT_${parsed.data.action.toUpperCase()}`, "property_report", report.id, {
      propertyId: report.propertyId,
      reason: parsed.data.reason ?? null,
    });

    const updated = await db.query.propertyReports.findFirst({
      where: eq(propertyReports.id, report.id),
      with: { property: true, reporter: true },
    });
    await dispatchNotification({ recipientIds: [report.reporterId], type: "REPORT_MODERATION", category: "REPORT", eventKey: `report.${parsed.data.action}`, title: parsed.data.action === "dismiss" ? "Report dismissed" : parsed.data.action === "suspend_listing" ? "Reported listing suspended" : "Report resolved", message: parsed.data.reason ?? "FinderZ has completed its review of your property report.", deepLink: `/tenant/property/${report.propertyId}`, relatedEntityType: "property_report", relatedEntityId: report.id, deduplicationKey: `report-${parsed.data.action}:${report.id}` });
    if (parsed.data.action === "suspend_listing") { const property = await db.query.properties.findFirst({ where: eq(properties.id, report.propertyId), with: { landlord: true } }); if (property?.landlord?.userId) await dispatchNotification({ recipientIds: [property.landlord.userId], type: "PROPERTY_SUSPENDED", category: "PROPERTY", eventKey: "property.suspended_from_report", priority: "HIGH", title: "Property suspended", message: parsed.data.reason ?? `${property.title} was suspended after a report review.`, deepLink: `/landlord/properties/${property.id}`, relatedEntityType: "property", relatedEntityId: property.id, deduplicationKey: `property-report-suspended:${report.id}` }); }
    return successResponse({ report: updated ? serializeReport(updated) : null }, { message: "Report updated." });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      console.error("PATCH /api/super-admin/reports/[reportId] failed:", error);
      return internalServerErrorResponse();
    }
  }
}
