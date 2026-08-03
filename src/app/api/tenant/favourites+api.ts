import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { favourites } from "@/db/schema";
import { internalServerErrorResponse, successResponse, validationErrorResponse } from "@/lib/api-response";
import { guardErrorResponse, requireTenant } from "@/lib/auth-guards.server";
import { findTenantPropertyById, findTenantVisiblePropertiesByIds } from "@/lib/tenant/property-serializer.server";

const favouriteSchema = z.object({
  propertyId: z.string().min(1),
});

export async function GET(request: Request) {
  try {
    const context = await requireTenant(request);
    const rows = await db.query.favourites.findMany({
      where: eq(favourites.userId, context.user.id),
      with: {
        property: {
          with: {
            images: true,
          },
        },
      },
      orderBy: [desc(favourites.createdAt)],
    });

    const propertyIds = rows.map((row) => row.property?.id).filter((id): id is string => Boolean(id));
    const serialized = await findTenantVisiblePropertiesByIds(propertyIds, context.user.id);

    return successResponse({ favourites: serialized });
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
    const context = await requireTenant(request);
    const parsed = favouriteSchema.safeParse(await request.json());

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const property = await findTenantPropertyById(parsed.data.propertyId, context.user.id);

    if (!property || property.approvalStatus !== "APPROVED") {
      return successResponse({ propertyId: parsed.data.propertyId, isFavourite: false }, { status: 404 });
    }

    await db
      .insert(favourites)
      .values({
        id: crypto.randomUUID(),
        userId: context.user.id,
        propertyId: parsed.data.propertyId,
      })
      .onConflictDoNothing();

    return successResponse({ propertyId: parsed.data.propertyId, isFavourite: true });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}

export async function DELETE(request: Request) {
  try {
    const context = await requireTenant(request);
    const parsed = favouriteSchema.safeParse(await request.json());

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    await db.delete(favourites).where(and(eq(favourites.userId, context.user.id), eq(favourites.propertyId, parsed.data.propertyId)));

    return successResponse({ propertyId: parsed.data.propertyId, isFavourite: false });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
