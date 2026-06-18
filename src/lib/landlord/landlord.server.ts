import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { amenities, enquiries, landlordProfiles, propertyAmenities, propertyImages, properties } from "@/db/schema";
import type { AuthenticatedContext } from "@/lib/auth-guards.server";
import type { LandlordEnquiry, LandlordProperty, LandlordVerificationResponse } from "@/types/landlord";

export async function getLandlordProfileForUser(userId: string) {
  return db.query.landlordProfiles.findFirst({
    where: eq(landlordProfiles.userId, userId),
  });
}

export async function requireLandlordProfile(context: AuthenticatedContext) {
  const profile = await getLandlordProfileForUser(context.user.id);

  if (!profile) {
    throw new Error("LANDLORD_PROFILE_REQUIRED");
  }

  return profile;
}

export function serializeVerification(profile: typeof landlordProfiles.$inferSelect | null): LandlordVerificationResponse {
  const status = profile?.verificationStatus ?? "NOT_SUBMITTED";
  const nextAction =
    status === "APPROVED"
      ? "You can manage and submit listings."
      : status === "PENDING"
        ? "Your documents are under review."
        : status === "CHANGES_REQUESTED"
          ? "Update the requested details and resubmit."
          : status === "REJECTED"
            ? "Review the notes and submit a corrected verification request."
            : "Submit your landlord verification details.";

  return {
    status,
    notes: profile?.verificationNotes ?? null,
    submittedAt: profile?.createdAt.toISOString() ?? null,
    verifiedAt: profile?.verifiedAt?.toISOString() ?? null,
    nextAction,
  };
}

async function getAmenitiesForProperties(propertyIds: string[]) {
  if (!propertyIds.length) {
    return new Map<string, string[]>();
  }

  const rows = await db
    .select({
      propertyId: propertyAmenities.propertyId,
      name: amenities.name,
    })
    .from(propertyAmenities)
    .innerJoin(amenities, eq(propertyAmenities.amenityId, amenities.id))
    .where(inArray(propertyAmenities.propertyId, propertyIds));

  const map = new Map<string, string[]>();
  rows.forEach((row) => {
    const list = map.get(row.propertyId) ?? [];
    list.push(row.name);
    map.set(row.propertyId, list);
  });
  return map;
}

async function getEnquiryCounts(propertyIds: string[]) {
  if (!propertyIds.length) {
    return new Map<string, number>();
  }

  const rows = await db
    .select({
      propertyId: enquiries.propertyId,
      value: count(),
    })
    .from(enquiries)
    .where(inArray(enquiries.propertyId, propertyIds))
    .groupBy(enquiries.propertyId);

  return new Map(rows.map((row) => [row.propertyId, row.value]));
}

export async function serializeLandlordProperties(rows: (typeof properties.$inferSelect & { images?: (typeof propertyImages.$inferSelect)[] })[]) {
  const propertyIds = rows.map((row) => row.id);
  const [amenitiesByProperty, enquiriesByProperty] = await Promise.all([getAmenitiesForProperties(propertyIds), getEnquiryCounts(propertyIds)]);

  return rows.map<LandlordProperty>((row) => ({
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
    approvalStatus: row.approvalStatus.toLowerCase() as LandlordProperty["approvalStatus"],
    rejectionReason: row.rejectionReason,
    contactPreferences: row.contactPreferences,
    inspectionAvailability: row.inspectionAvailability,
    houseRules: row.houseRules,
    availableFrom: row.availableFrom?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    images: [...(row.images ?? [])]
      .sort((left, right) => left.position - right.position)
      .map((image) => ({
        id: image.id,
        imageUrl: image.imageUrl,
        publicId: image.publicId,
        position: image.position,
        isCover: image.isCover,
      })),
    amenities: amenitiesByProperty.get(row.id) ?? [],
    enquiryCount: enquiriesByProperty.get(row.id) ?? 0,
  }));
}

export async function getOwnedProperty(profileId: string, propertyId: string) {
  return db.query.properties.findFirst({
    where: and(eq(properties.id, propertyId), eq(properties.landlordId, profileId)),
    with: {
      images: true,
    },
  });
}

export async function replacePropertyAmenities(propertyId: string, amenityNames: string[]) {
  await db.delete(propertyAmenities).where(eq(propertyAmenities.propertyId, propertyId));

  const cleanNames = Array.from(new Set(amenityNames.map((name) => name.trim()).filter(Boolean)));
  if (!cleanNames.length) {
    return;
  }

  const existing = await db.select().from(amenities).where(inArray(amenities.name, cleanNames));
  const existingByName = new Map(existing.map((amenity) => [amenity.name, amenity]));
  const missing = cleanNames.filter((name) => !existingByName.has(name));

  if (missing.length) {
    await db.insert(amenities).values(
      missing.map((name) => ({
        id: crypto.randomUUID(),
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      })),
    );
  }

  const finalAmenities = await db.select().from(amenities).where(inArray(amenities.name, cleanNames));
  await db.insert(propertyAmenities).values(finalAmenities.map((amenity) => ({ propertyId, amenityId: amenity.id })));
}

export async function replacePropertyImages(
  propertyId: string,
  images: {
    imageUrl: string;
    publicId?: string | null;
    position: number;
    isCover: boolean;
  }[],
) {
  await db.delete(propertyImages).where(eq(propertyImages.propertyId, propertyId));

  if (!images.length) {
    return;
  }

  await db.insert(propertyImages).values(
    images.map((image, index) => ({
      id: crypto.randomUUID(),
      propertyId,
      imageUrl: image.imageUrl,
      publicId: image.publicId,
      position: image.position ?? index,
      isCover: image.isCover || index === 0,
    })),
  );
}

export async function getLandlordEnquiries(landlordUserId: string, limit = 20): Promise<LandlordEnquiry[]> {
  const rows = await db.query.enquiries.findMany({
    where: eq(enquiries.landlordId, landlordUserId),
    with: {
      tenant: true,
      property: true,
    },
    orderBy: [desc(enquiries.updatedAt)],
    limit,
  });

  return rows.map((row) => ({
    id: row.id,
    status: row.status,
    preferredContactMethod: row.preferredContactMethod,
    preferredInspectionDate: row.preferredInspectionDate?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    tenant: {
      id: row.tenant.id,
      name: row.tenant.name,
      email: row.tenant.email,
      phone: row.tenant.phone,
      image: row.tenant.image,
    },
    property: {
      id: row.property.id,
      title: row.property.title,
      area: row.property.area,
      city: row.property.city,
    },
  }));
}

export async function getLandlordCounts(profileId: string, landlordUserId: string) {
  const [total, active, pending, rejected, rented, allEnquiries] = await Promise.all([
    db.select({ value: count() }).from(properties).where(eq(properties.landlordId, profileId)),
    db.select({ value: count() }).from(properties).where(and(eq(properties.landlordId, profileId), eq(properties.approvalStatus, "APPROVED"), eq(properties.isAvailable, true))),
    db.select({ value: count() }).from(properties).where(and(eq(properties.landlordId, profileId), eq(properties.approvalStatus, "PENDING"))),
    db.select({ value: count() }).from(properties).where(and(eq(properties.landlordId, profileId), eq(properties.approvalStatus, "REJECTED"))),
    db.select({ value: count() }).from(properties).where(and(eq(properties.landlordId, profileId), eq(properties.approvalStatus, "RENTED"))),
    db.select({ value: count() }).from(enquiries).where(eq(enquiries.landlordId, landlordUserId)),
  ]);

  return {
    totalListings: total[0]?.value ?? 0,
    activeListings: active[0]?.value ?? 0,
    pendingListings: pending[0]?.value ?? 0,
    rejectedListings: rejected[0]?.value ?? 0,
    rentedListings: rented[0]?.value ?? 0,
    totalEnquiries: allEnquiries[0]?.value ?? 0,
  };
}

export async function getListingPerformance(profileId: string) {
  const rows = await db
    .select({
      status: properties.approvalStatus,
      value: sql<number>`count(${properties.id})`,
    })
    .from(properties)
    .where(eq(properties.landlordId, profileId))
    .groupBy(properties.approvalStatus);

  return rows.map((row) => ({ label: row.status.toLowerCase(), value: Number(row.value) }));
}
