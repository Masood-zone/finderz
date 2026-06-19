import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { properties, propertyReports } from "@/db/schema";
import { badRequestResponse, internalServerErrorResponse, notFoundResponse, successResponse, validationErrorResponse } from "@/lib/api-response";
import { guardErrorResponse, requireSuperAdmin } from "@/lib/auth-guards.server";
import { requireReason, serializeReport, writeAdminAuditLog } from "@/lib/super-admin/super-admin.server";

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
