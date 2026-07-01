import { count, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { adminAuditLogs, enquiries, landlordProfiles, properties, propertyReports, user } from "@/db/schema";
import { internalServerErrorResponse, successResponse } from "@/lib/api-response";
import { guardErrorResponse, requireSuperAdmin } from "@/lib/auth-guards.server";
import { serializeActivity, serializeAdminProperties } from "@/lib/super-admin/super-admin.server";

export async function GET(request: Request) {
  try {
    const context = await requireSuperAdmin(request);
    const [
      totalUsers,
      totalTenants,
      totalLandlords,
      verifiedLandlords,
      pendingLandlordVerifications,
      totalProperties,
      pendingApprovals,
      reportedListings,
      activeEnquiries,
      activityRows,
      approvalRows,
    ] = await Promise.all([
      db.select({ value: count() }).from(user),
      db.select({ value: count() }).from(user).where(eq(user.role, "TENANT")),
      db.select({ value: count() }).from(user).where(eq(user.role, "LANDLORD")),
      db.select({ value: count() }).from(landlordProfiles).where(eq(landlordProfiles.verificationStatus, "APPROVED")),
      db.select({ value: count() }).from(landlordProfiles).where(eq(landlordProfiles.verificationStatus, "PENDING")),
      db.select({ value: count() }).from(properties),
      db.select({ value: count() }).from(properties).where(eq(properties.approvalStatus, "PENDING")),
      db.select({ value: count() }).from(propertyReports).where(inArray(propertyReports.status, ["OPEN", "REVIEWING"])),
      db.select({ value: count() }).from(enquiries).where(inArray(enquiries.status, ["OPEN", "RESPONDED"])),
      db.query.adminAuditLogs.findMany({
        with: { administrator: true },
        orderBy: [desc(adminAuditLogs.createdAt)],
        limit: 8,
      }),
      db.query.properties.findMany({
        where: eq(properties.approvalStatus, "PENDING"),
        with: { images: true, landlord: { with: { user: true } } },
        orderBy: [desc(properties.updatedAt)],
        limit: 5,
      }),
    ]);

    return successResponse({
      user: context.user,
      stats: {
        totalUsers: totalUsers[0]?.value ?? 0,
        totalTenants: totalTenants[0]?.value ?? 0,
        totalLandlords: totalLandlords[0]?.value ?? 0,
        verifiedLandlords: verifiedLandlords[0]?.value ?? 0,
        pendingLandlordVerifications: pendingLandlordVerifications[0]?.value ?? 0,
        totalProperties: totalProperties[0]?.value ?? 0,
        pendingApprovals: pendingApprovals[0]?.value ?? 0,
        reportedListings: reportedListings[0]?.value ?? 0,
        activeEnquiries: activeEnquiries[0]?.value ?? 0,
      },
      recentActivity: activityRows.map(serializeActivity),
      recentApprovals: await serializeAdminProperties(approvalRows),
    });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
