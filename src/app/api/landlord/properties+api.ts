import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { forbiddenResponse, internalServerErrorResponse, successResponse, validationErrorResponse } from "@/lib/api-response";
import { guardErrorResponse, requireLandlord } from "@/lib/auth-guards.server";
import { getLandlordCounts, getLandlordProfileForUser, getOwnedProperty, replacePropertyAmenities, replacePropertyImages, serializeLandlordProperties } from "@/lib/landlord/landlord.server";
import type { LandlordPropertyStatus } from "@/types/landlord";
import { notifySuperAdmins } from "@/lib/notifications/dispatcher.server";

const coordinateString = (minimum: number, maximum: number, label: string) =>
  z
    .string()
    .trim()
    .refine((value) => Number.isFinite(Number(value)), `${label} must be a number.`)
    .refine((value) => Number(value) >= minimum && Number(value) <= maximum, `${label} is outside the valid range.`)
    .nullable()
    .optional();

export const savePropertySchema = z.object({
  id: z.string().optional(),
  submissionId: z.string().min(8).max(100).optional(),
  title: z.string().trim().min(2).max(160),
  propertyType: z.enum(["APARTMENT", "HOUSE", "ROOM", "STUDIO", "HOSTEL", "COMMERCIAL"]),
  description: z.string().trim().min(10).max(2500),
  bedrooms: z.coerce.number().int().min(0).max(20),
  bathrooms: z.coerce.number().int().min(0).max(20),
  furnishingStatus: z.enum(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"]),
  isAvailable: z.boolean(),
  region: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  area: z.string().trim().min(2).max(120),
  landmark: z.string().trim().max(160).nullable().optional(),
  address: z.string().trim().min(3).max(240),
  latitude: coordinateString(-90, 90, "Latitude"),
  longitude: coordinateString(-180, 180, "Longitude"),
  rentAmountCedis: z.coerce.number().min(0),
  paymentPeriod: z.enum(["MONTHLY", "QUARTERLY", "BIANNUALLY", "YEARLY"]),
  advancePeriodMonths: z.coerce.number().int().min(1).max(60),
  isNegotiable: z.boolean(),
  additionalCharges: z.string().trim().max(500).nullable().optional(),
  availableFrom: z.string().nullable().optional(),
  amenities: z.array(z.string().trim().min(1)).default([]),
  images: z
    .array(
      z.object({
        imageUrl: z.string().url(),
        publicId: z.string().nullable().optional(),
        position: z.number().int().min(0).default(0),
        isCover: z.boolean().default(false),
      }),
    )
    .default([]),
  contactPreferences: z.string().trim().max(160).nullable().optional(),
  inspectionAvailability: z.string().trim().max(500).nullable().optional(),
  houseRules: z.string().trim().max(1000).nullable().optional(),
  submitForApproval: z.boolean().default(false),
}).superRefine((value, context) => {
  const hasLatitude = value.latitude !== null && value.latitude !== undefined && value.latitude !== "";
  const hasLongitude = value.longitude !== null && value.longitude !== undefined && value.longitude !== "";

  if (hasLatitude !== hasLongitude) {
    context.addIssue({ code: "custom", path: hasLatitude ? ["longitude"] : ["latitude"], message: "Latitude and longitude must be provided together." });
  }

  if (value.submitForApproval && (!hasLatitude || !hasLongitude)) {
    context.addIssue({ code: "custom", path: ["latitude"], message: "Select the property's exact map location before submitting for approval." });
  }
});

function statusToApproval(status: LandlordPropertyStatus | null) {
  if (!status || status === "all") return undefined;
  return status.toUpperCase() as typeof properties.approvalStatus.enumValues[number];
}

export async function GET(request: Request) {
  try {
    const context = await requireLandlord(request);
    const profile = await getLandlordProfileForUser(context.user.id);
    const url = new URL(request.url);
    const status = statusToApproval(url.searchParams.get("status") as LandlordPropertyStatus | null);

    if (!profile) {
      return successResponse({
        properties: [],
        counts: { all: 0, draft: 0, pending: 0, approved: 0, rejected: 0, rented: 0 },
      });
    }

    const rows = await db.query.properties.findMany({
      where: status ? and(eq(properties.landlordId, profile.id), eq(properties.approvalStatus, status)) : eq(properties.landlordId, profile.id),
      with: { images: true },
      orderBy: [desc(properties.updatedAt)],
    });
    const counts = await getLandlordCounts(profile.id, context.user.id);
    const draft = await db.select().from(properties).where(and(eq(properties.landlordId, profile.id), eq(properties.approvalStatus, "DRAFT")));

    return successResponse({
      properties: await serializeLandlordProperties(rows),
      counts: {
        all: counts.totalListings,
        draft: draft.length,
        pending: counts.pendingListings,
        approved: counts.activeListings,
        rejected: counts.rejectedListings,
        rented: counts.rentedListings,
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

export async function POST(request: Request) {
  try {
    const context = await requireLandlord(request);
    const profile = await getLandlordProfileForUser(context.user.id);

    if (!profile) {
      return forbiddenResponse();
    }

    const parsed = savePropertySchema.safeParse(await request.json());
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    // The client keeps this ID for the lifetime of the create flow. If the
    // property row was committed but a later relation write or the response
    // failed, retrying repairs and returns that same property instead of
    // creating a duplicate listing.
    const propertyId = parsed.data.submissionId ?? crypto.randomUUID();
    const existing = await getOwnedProperty(profile.id, propertyId);
    if (existing) {
      await Promise.all([
        replacePropertyAmenities(propertyId, parsed.data.amenities),
        replacePropertyImages(propertyId, parsed.data.images),
      ]);
      const repaired = await getOwnedProperty(profile.id, propertyId);
      const [property] = await serializeLandlordProperties(repaired ? [repaired] : [existing]);
      return successResponse({ property });
    }

    const now = new Date();
    const [created] = await db
      .insert(properties)
      .values({
        id: propertyId,
        landlordId: profile.id,
        title: parsed.data.title,
        description: parsed.data.description,
        propertyType: parsed.data.propertyType,
        region: parsed.data.region,
        city: parsed.data.city,
        area: parsed.data.area,
        landmark: parsed.data.landmark ?? null,
        address: parsed.data.address,
        latitude: parsed.data.latitude ?? null,
        longitude: parsed.data.longitude ?? null,
        rentAmount: Math.round(parsed.data.rentAmountCedis * 100),
        paymentPeriod: parsed.data.paymentPeriod,
        advancePeriodMonths: parsed.data.advancePeriodMonths,
        additionalCharges: parsed.data.additionalCharges ?? null,
        bedrooms: parsed.data.bedrooms,
        bathrooms: parsed.data.bathrooms,
        furnishingStatus: parsed.data.furnishingStatus,
        isNegotiable: parsed.data.isNegotiable,
        isAvailable: parsed.data.isAvailable,
        approvalStatus: parsed.data.submitForApproval ? "PENDING" : "DRAFT",
        contactPreferences: parsed.data.contactPreferences ?? null,
        inspectionAvailability: parsed.data.inspectionAvailability ?? null,
        houseRules: parsed.data.houseRules ?? null,
        availableFrom: parsed.data.availableFrom ? new Date(parsed.data.availableFrom) : null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    await Promise.all([replacePropertyAmenities(propertyId, parsed.data.amenities), replacePropertyImages(propertyId, parsed.data.images)]);
    const [property] = await serializeLandlordProperties([{ ...created, images: [] }]);

    if (parsed.data.submitForApproval) await notifySuperAdmins({ type: "PENDING_APPROVAL", category: "PROPERTY", eventKey: "property.submitted", title: "Property awaiting approval", message: `${context.user.name} submitted ${created.title} for review.`, deepLink: `/super-admin/approvals/${created.id}`, relatedEntityType: "property", relatedEntityId: created.id, deduplicationKey: `property-submitted:${created.id}:${created.updatedAt.toISOString()}` });

    return successResponse({ property }, { status: 201 });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
