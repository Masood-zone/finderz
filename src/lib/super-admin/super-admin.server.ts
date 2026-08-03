import { and, count, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  adminAuditLogs,
  amenities,
  enquiries,
  landlordProfiles,
  notifications,
  properties,
  propertyAmenities,
  propertyImages,
  propertyReports,
  user,
} from "@/db/schema";
import { errorResponse } from "@/lib/api-response";
import type { AuthenticatedContext } from "@/lib/auth-guards.server";
import type {
  SuperAdminActivity,
  SuperAdminLandlordVerification,
  SuperAdminNotification,
  SuperAdminPropertyDetail,
  SuperAdminPropertySummary,
  SuperAdminReport,
  SuperAdminUser,
} from "@/types/super-admin";

export function parsePagination(request: Request) {
  const url = new URL(request.url);
  const page = Math.max(Number(url.searchParams.get("page") ?? 1), 1);
  const pageSize = Math.min(Math.max(Number(url.searchParams.get("pageSize") ?? 20), 1), 50);
  return { url, page, pageSize, offset: (page - 1) * pageSize };
}

export function paged<T>(items: T[], page: number, pageSize: number, total: number) {
  return {
    items,
    page,
    pageSize,
    total,
    totalPages: Math.max(Math.ceil(total / pageSize), 1),
  };
}

export async function writeAdminAuditLog(
  context: AuthenticatedContext,
  action: string,
  entityType: string,
  entityId: string | null,
  metadata?: Record<string, unknown>,
) {
  await db.insert(adminAuditLogs).values({
    id: crypto.randomUUID(),
    administratorId: context.user.id,
    action,
    entityType,
    entityId,
    metadata: metadata ?? {},
  });
}

export async function ensureNotFinalActiveSuperAdmin(targetUserId: string) {
  const target = await db.query.user.findFirst({ where: eq(user.id, targetUserId) });
  if (target?.role !== "SUPER_ADMIN" || target.accountStatus !== "ACTIVE") {
    return;
  }

  const [activeAdmins] = await db
    .select({ value: count() })
    .from(user)
    .where(and(eq(user.role, "SUPER_ADMIN"), eq(user.accountStatus, "ACTIVE")));

  if ((activeAdmins?.value ?? 0) <= 1) {
    throw new Response(JSON.stringify({
      success: false,
      error: {
        code: "FINAL_SUPER_ADMIN",
        message: "The final active Super Administrator cannot be suspended.",
      },
    }), {
      status: 409,
      headers: { "content-type": "application/json" },
    });
  }
}

export function finalAdminResponse(error: unknown) {
  if (error instanceof Response) {
    return error;
  }
  throw error;
}

async function getAmenitiesForProperties(propertyIds: string[]) {
  if (!propertyIds.length) return new Map<string, string[]>();
  const rows = await db
    .select({ propertyId: propertyAmenities.propertyId, name: amenities.name })
    .from(propertyAmenities)
    .innerJoin(amenities, eq(propertyAmenities.amenityId, amenities.id))
    .where(inArray(propertyAmenities.propertyId, propertyIds));

  const map = new Map<string, string[]>();
  rows.forEach((row) => {
    map.set(row.propertyId, [...(map.get(row.propertyId) ?? []), row.name]);
  });
  return map;
}

async function getReportCounts(propertyIds: string[]) {
  if (!propertyIds.length) return new Map<string, number>();
  const rows = await db
    .select({ propertyId: propertyReports.propertyId, value: count() })
    .from(propertyReports)
    .where(inArray(propertyReports.propertyId, propertyIds))
    .groupBy(propertyReports.propertyId);
  return new Map(rows.map((row) => [row.propertyId, row.value]));
}

async function getEnquiryCounts(propertyIds: string[]) {
  if (!propertyIds.length) return new Map<string, number>();
  const rows = await db
    .select({ propertyId: enquiries.propertyId, value: count() })
    .from(enquiries)
    .where(inArray(enquiries.propertyId, propertyIds))
    .groupBy(enquiries.propertyId);
  return new Map(rows.map((row) => [row.propertyId, row.value]));
}

export async function serializeAdminProperties(rows: (typeof properties.$inferSelect & {
  images?: (typeof propertyImages.$inferSelect)[];
  landlord?: (typeof landlordProfiles.$inferSelect & { user?: typeof user.$inferSelect | null }) | null;
})[]): Promise<SuperAdminPropertySummary[]> {
  const propertyIds = rows.map((row) => row.id);
  const [amenitiesByProperty, reportsByProperty, enquiriesByProperty] = await Promise.all([
    getAmenitiesForProperties(propertyIds),
    getReportCounts(propertyIds),
    getEnquiryCounts(propertyIds),
  ]);

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    propertyType: row.propertyType,
    region: row.region,
    city: row.city,
    area: row.area,
    landmark: row.landmark,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    rentAmount: row.rentAmount,
    paymentPeriod: row.paymentPeriod,
    advancePeriodMonths: row.advancePeriodMonths,
    additionalCharges: row.additionalCharges,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    furnishingStatus: row.furnishingStatus,
    isNegotiable: row.isNegotiable,
    isAvailable: row.isAvailable,
    approvalStatus: row.approvalStatus.toLowerCase() as SuperAdminPropertySummary["approvalStatus"],
    rejectionReason: row.rejectionReason,
    contactPreferences: row.contactPreferences,
    inspectionAvailability: row.inspectionAvailability,
    houseRules: row.houseRules,
    availableFrom: row.availableFrom?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    images: [...(row.images ?? [])].sort((left, right) => left.position - right.position).map((image) => ({
      id: image.id,
      imageUrl: image.imageUrl,
      publicId: image.publicId,
      position: image.position,
      isCover: image.isCover,
    })),
    amenities: amenitiesByProperty.get(row.id) ?? [],
    enquiryCount: enquiriesByProperty.get(row.id) ?? 0,
    reportCount: reportsByProperty.get(row.id) ?? 0,
    landlord: {
      id: row.landlord?.id ?? row.landlordId,
      userId: row.landlord?.userId ?? "",
      legalName: row.landlord?.legalName ?? null,
      agencyName: row.landlord?.agencyName ?? null,
      verificationStatus: row.landlord?.verificationStatus ?? "NOT_SUBMITTED",
      verifiedAt: row.landlord?.verifiedAt?.toISOString() ?? null,
      user: row.landlord?.user
        ? {
            id: row.landlord.user.id,
            name: row.landlord.user.name,
            email: row.landlord.user.email,
            phone: row.landlord.user.phone,
            image: row.landlord.user.image,
            accountStatus: row.landlord.user.accountStatus,
          }
        : null,
    },
  }));
}

export async function getAdminPropertyDetail(propertyId: string): Promise<SuperAdminPropertyDetail | null> {
  const row = await db.query.properties.findFirst({
    where: eq(properties.id, propertyId),
    with: {
      images: true,
      landlord: { with: { user: true } },
    },
  });

  if (!row) return null;

  const [property] = await serializeAdminProperties([row]);
  const [reportsResult, submissionHistoryResult] = await Promise.allSettled([
    getReportsForProperty(propertyId),
    getActivityForEntity("property", propertyId),
  ]);

  const reports = reportsResult.status === "fulfilled" ? reportsResult.value : [];
  const submissionHistory =
    submissionHistoryResult.status === "fulfilled" ? submissionHistoryResult.value : [];

  return { ...property, reports, submissionHistory };
}

export async function getReportsForProperty(propertyId: string): Promise<SuperAdminReport[]> {
  const rows = await db.query.propertyReports.findMany({
    where: eq(propertyReports.propertyId, propertyId),
    with: {
      property: {
        with: {
          landlord: { with: { user: true, properties: true } },
        },
      },
      reporter: true,
    },
    orderBy: [desc(propertyReports.createdAt)],
  });
  return rows.map(serializeReport);
}

export function serializeReport(row: typeof propertyReports.$inferSelect & {
  property?: (typeof properties.$inferSelect & {
    landlord?: (typeof landlordProfiles.$inferSelect & {
      user?: typeof user.$inferSelect | null;
      properties?: (typeof properties.$inferSelect)[];
    }) | null;
  }) | null;
  reporter?: typeof user.$inferSelect | null;
}): SuperAdminReport {
  return {
    id: row.id,
    reason: row.reason,
    description: row.description,
    status: row.status,
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    property: row.property
      ? {
          id: row.property.id,
          title: row.property.title,
          area: row.property.area,
          city: row.property.city,
          approvalStatus: row.property.approvalStatus,
          isAvailable: row.property.isAvailable,
        }
      : null,
    owner: row.property?.landlord?.user
      ? {
          profileId: row.property.landlord.id,
          userId: row.property.landlord.user.id,
          name: row.property.landlord.user.name,
          email: row.property.landlord.user.email,
          phone: row.property.landlord.user.phone,
          accountStatus: row.property.landlord.user.accountStatus,
          listingCount: row.property.landlord.properties?.length ?? 0,
        }
      : null,
    reporter: row.reporter
      ? {
          id: row.reporter.id,
          name: row.reporter.name,
          email: row.reporter.email,
        }
      : null,
  };
}

export async function getActivityForEntity(entityType: string, entityId: string): Promise<SuperAdminActivity[]> {
  const rows = await db.query.adminAuditLogs.findMany({
    where: and(eq(adminAuditLogs.entityType, entityType), eq(adminAuditLogs.entityId, entityId)),
    with: { administrator: true },
    orderBy: [desc(adminAuditLogs.createdAt)],
    limit: 20,
  });
  return rows.map(serializeActivity);
}

export function serializeActivity(row: typeof adminAuditLogs.$inferSelect & { administrator?: typeof user.$inferSelect | null }): SuperAdminActivity {
  return {
    id: row.id,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    createdAt: row.createdAt.toISOString(),
    administrator: row.administrator
      ? {
          id: row.administrator.id,
          name: row.administrator.name,
          email: row.administrator.email,
        }
      : null,
  };
}

export async function serializeUsers(rows: (typeof user.$inferSelect & {
  landlordProfile?: typeof landlordProfiles.$inferSelect | null;
})[]): Promise<SuperAdminUser[]> {
  const landlordIds = rows.map((row) => row.landlordProfile?.id).filter(Boolean) as string[];
  const listingCounts = landlordIds.length
    ? await db
        .select({ landlordId: properties.landlordId, value: count() })
        .from(properties)
        .where(inArray(properties.landlordId, landlordIds))
        .groupBy(properties.landlordId)
    : [];
  const listingMap = new Map(listingCounts.map((row) => [row.landlordId, row.value]));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    image: row.image,
    role: row.role,
    accountStatus: row.accountStatus,
    onboardingCompleted: row.onboardingCompleted,
    createdAt: row.createdAt.toISOString(),
    landlordVerificationStatus: row.landlordProfile?.verificationStatus ?? null,
    listingCount: row.landlordProfile ? (listingMap.get(row.landlordProfile.id) ?? 0) : 0,
  }));
}

export async function serializeLandlordVerifications(rows: (typeof landlordProfiles.$inferSelect & {
  user?: typeof user.$inferSelect | null;
})[]): Promise<SuperAdminLandlordVerification[]> {
  const landlordIds = rows.map((row) => row.id);
  const listingCounts = landlordIds.length
    ? await db
        .select({ landlordId: properties.landlordId, value: count() })
        .from(properties)
        .where(inArray(properties.landlordId, landlordIds))
        .groupBy(properties.landlordId)
    : [];
  const listingMap = new Map(listingCounts.map((row) => [row.landlordId, row.value]));

  return rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    legalName: row.legalName,
    landlordType: row.landlordType,
    agencyName: row.agencyName,
    address: row.address,
    preferredContactMethod: row.preferredContactMethod as SuperAdminLandlordVerification["preferredContactMethod"],
    identityDocumentType: row.identityDocumentType,
    identityDocumentUrl: row.identityDocumentUrl,
    verificationStatus: row.verificationStatus,
    verificationNotes: row.verificationNotes,
    verifiedAt: row.verifiedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    user: row.user
      ? {
          id: row.user.id,
          name: row.user.name,
          email: row.user.email,
          phone: row.user.phone,
          image: row.user.image,
          accountStatus: row.user.accountStatus,
          onboardingCompleted: row.user.onboardingCompleted,
        }
      : null,
    listingCount: listingMap.get(row.id) ?? 0,
  }));
}

export function serializeNotification(row: typeof notifications.$inferSelect): SuperAdminNotification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    data: row.data,
    isRead: row.isRead,
    createdAt: row.createdAt.toISOString(),
  };
}

export function requireReason(reason: string | undefined | null) {
  if (!reason?.trim()) {
    return errorResponse("REASON_REQUIRED", "A reason is required for this administrative action.", 400);
  }
  return null;
}
