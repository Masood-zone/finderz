import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { propertyReports } from "@/db/schema";
import {
  errorResponse,
  internalServerErrorResponse,
  notFoundResponse,
  successResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { guardErrorResponse, requireTenant } from "@/lib/auth-guards.server";
import { notifySuperAdmins } from "@/lib/notifications/dispatcher.server";
import { findTenantPropertyById } from "@/lib/tenant/property-serializer.server";
import { propertyReportSubmissionSchema } from "@/lib/validation/property-report";

export async function POST(request: Request) {
  try {
    const context = await requireTenant(request);
    const parsed = propertyReportSubmissionSchema.safeParse(await request.json());

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const property = await findTenantPropertyById(
      parsed.data.propertyId,
      context.user.id,
    );

    if (!property) {
      return notFoundResponse("This property is no longer available to report.");
    }

    const duplicate = await db.query.propertyReports.findFirst({
      where: and(
        eq(propertyReports.propertyId, property.id),
        eq(propertyReports.reporterId, context.user.id),
        inArray(propertyReports.status, ["OPEN", "REVIEWING"]),
      ),
    });

    if (duplicate) {
      return errorResponse(
        "REPORT_ALREADY_OPEN",
        "You already have an open report for this property.",
        409,
      );
    }

    const reportId = crypto.randomUUID();
    await db.insert(propertyReports).values({
      id: reportId,
      propertyId: property.id,
      reporterId: context.user.id,
      reason: parsed.data.reason,
      description: parsed.data.description,
    });

    await notifySuperAdmins({
      type: "PROPERTY_REPORT",
      category: "REPORT",
      eventKey: "report.created",
      priority: "HIGH",
      title: "New property report",
      message: `${context.user.name} reported ${property.title}.`,
      deepLink: "/super-admin/reports",
      relatedEntityType: "property_report",
      relatedEntityId: reportId,
      deduplicationKey: `report-created:${reportId}`,
      data: {
        reportId,
        propertyId: property.id,
        reason: parsed.data.reason,
      },
    });

    return successResponse(
      { reportId },
      { status: 201, message: "Report submitted." },
    );
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch (unexpectedError) {
      console.error("POST /api/tenant/reports failed", unexpectedError);
      return internalServerErrorResponse();
    }
  }
}
