import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { properties, propertyReports, user } from "@/db/schema";
import { internalServerErrorResponse, successResponse } from "@/lib/api-response";
import { guardErrorResponse, requireSuperAdmin } from "@/lib/auth-guards.server";

export async function GET(request: Request) {
  try {
    const context = await requireSuperAdmin(request);
    const [totalUsers] = await db.select({ value: count() }).from(user);
    const [pendingProperties] = await db
      .select({ value: count() })
      .from(properties)
      .where(eq(properties.approvalStatus, "PENDING"));
    const [openReports] = await db.select({ value: count() }).from(propertyReports).where(eq(propertyReports.status, "OPEN"));

    return successResponse({
      user: context.user,
      stats: {
        totalUsers: totalUsers.value,
        pendingProperties: pendingProperties.value,
        openReports: openReports.value,
      },
    });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
