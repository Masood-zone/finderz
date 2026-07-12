import { db } from "@/db";
import { properties } from "@/db/schema";
import {
  badRequestResponse,
  forbiddenResponse,
  internalServerErrorResponse,
  notFoundResponse,
  successResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { guardErrorResponse, requireLandlord } from "@/lib/auth-guards.server";
import {
  getLandlordProfileForUser,
  getOwnedProperty,
  replacePropertyAmenities,
  replacePropertyImages,
  serializeLandlordProperties,
} from "@/lib/landlord/landlord.server";
import { eq } from "drizzle-orm";
import { savePropertySchema } from "../properties+api";

type RouteParams = {
  propertyId: string;
};

export async function GET(request: Request, { propertyId }: RouteParams) {
  try {
    const context = await requireLandlord(request);
    const profile = await getLandlordProfileForUser(context.user.id);

    if (!profile) {
      return forbiddenResponse();
    }

    if (!propertyId) {
      return badRequestResponse("Property ID is required.");
    }

    const row = await getOwnedProperty(profile.id, propertyId);
    if (!row) {
      return notFoundResponse("Property not found.");
    }

    const [property] = await serializeLandlordProperties([row]);
    return successResponse({ property });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      console.error("GET /api/landlord/properties/[propertyId] failed:", error);
      return internalServerErrorResponse();
    }
  }
}

export async function PATCH(request: Request, { propertyId }: RouteParams) {
  try {
    const context = await requireLandlord(request);
    const profile = await getLandlordProfileForUser(context.user.id);

    if (!profile) {
      return forbiddenResponse();
    }

    if (!propertyId) {
      return badRequestResponse("Property ID is required.");
    }

    const existing = await getOwnedProperty(profile.id, propertyId);
    if (!existing) {
      return notFoundResponse("Property not found.");
    }

    const body = await request.json();
    if (body?.action === "mark-rented") {
      const [updated] = await db
        .update(properties)
        .set({
          approvalStatus: "RENTED",
          isAvailable: false,
          updatedAt: new Date(),
        })
        .where(eq(properties.id, existing.id))
        .returning();
      const [property] = await serializeLandlordProperties([
        { ...updated, images: existing.images },
      ]);
      return successResponse({ property });
    }

    const parsed = savePropertySchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const [updated] = await db
      .update(properties)
      .set({
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
        approvalStatus: parsed.data.submitForApproval
          ? "PENDING"
          : existing.approvalStatus === "DRAFT"
            ? "DRAFT"
            : existing.approvalStatus,
        contactPreferences: parsed.data.contactPreferences ?? null,
        inspectionAvailability: parsed.data.inspectionAvailability ?? null,
        houseRules: parsed.data.houseRules ?? null,
        availableFrom: parsed.data.availableFrom
          ? new Date(parsed.data.availableFrom)
          : null,
        updatedAt: new Date(),
      })
      .where(eq(properties.id, existing.id))
      .returning();

    await Promise.all([
      replacePropertyAmenities(existing.id, parsed.data.amenities),
      replacePropertyImages(existing.id, parsed.data.images),
    ]);
    const row = await getOwnedProperty(profile.id, existing.id);
    const [property] = await serializeLandlordProperties(
      row ? [row] : [{ ...updated, images: [] }],
    );
    return successResponse({ property });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      console.error(
        "PATCH /api/landlord/properties/[propertyId] failed:",
        error,
      );
      return internalServerErrorResponse();
    }
  }
}

export async function POST(request: Request, { propertyId }: RouteParams) {
  try {
    const context = await requireLandlord(request);
    const profile = await getLandlordProfileForUser(context.user.id);

    if (!profile) {
      return forbiddenResponse();
    }

    if (!propertyId) {
      return badRequestResponse("Property ID is required.");
    }

    const existing = await getOwnedProperty(profile.id, propertyId);
    if (!existing) {
      return notFoundResponse("Property not found.");
    }

    const body = await request.json();
    if (body?.action !== "duplicate") {
      return notFoundResponse("Unsupported property action.");
    }

    const { images, ...propertyValues } = existing;
    const newId = crypto.randomUUID();
    const [created] = await db
      .insert(properties)
      .values({
        ...propertyValues,
        id: newId,
        title: `${propertyValues.title} Copy`,
        approvalStatus: "DRAFT",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    await replacePropertyImages(
      newId,
      images.map((image) => ({
        imageUrl: image.imageUrl,
        publicId: image.publicId,
        position: image.position,
        isCover: image.isCover,
      })),
    );

    const [property] = await serializeLandlordProperties([
      { ...created, images: [] },
    ]);
    return successResponse({ property }, { status: 201 });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      console.error(
        "POST /api/landlord/properties/[propertyId] failed:",
        error,
      );
      return internalServerErrorResponse();
    }
  }
}

export async function DELETE(request: Request, { propertyId }: RouteParams) {
  try {
    const context = await requireLandlord(request);
    const profile = await getLandlordProfileForUser(context.user.id);

    if (!profile) {
      return forbiddenResponse();
    }

    if (!propertyId) {
      return badRequestResponse("Property ID is required.");
    }

    const existing = await getOwnedProperty(profile.id, propertyId);
    if (!existing) {
      return notFoundResponse("Property not found.");
    }

    await db.delete(properties).where(eq(properties.id, existing.id));
    return successResponse({ propertyId: existing.id });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      console.error(
        "DELETE /api/landlord/properties/[propertyId] failed:",
        error,
      );
      return internalServerErrorResponse();
    }
  }
}
