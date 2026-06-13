import { and, asc, count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { enquiries, favourites, properties } from "@/db/schema";
import { internalServerErrorResponse, successResponse } from "@/lib/api-response";
import { guardErrorResponse, requireTenant } from "@/lib/auth-guards.server";
import { getPopularLocations, serializeProperties } from "@/lib/tenant/property-serializer.server";

const categories = ["All", "Room", "Studio", "Apartment", "House", "Hostel", "Commercial"];

export async function GET(request: Request) {
  try {
    const context = await requireTenant(request);
    const baseWhere = and(eq(properties.approvalStatus, "APPROVED"), eq(properties.isAvailable, true));

    const [recommendedRows, affordableRows, recentRows, locations, savedProperties, openEnquiries] = await Promise.all([
      db.query.properties.findMany({
        where: baseWhere,
        with: { images: true },
        orderBy: [desc(properties.rentAmount)],
        limit: 6,
      }),
      db.query.properties.findMany({
        where: baseWhere,
        with: { images: true },
        orderBy: [asc(properties.rentAmount)],
        limit: 6,
      }),
      db.query.properties.findMany({
        where: baseWhere,
        with: { images: true },
        orderBy: [desc(properties.createdAt)],
        limit: 4,
      }),
      getPopularLocations(),
      db.select({ value: count() }).from(favourites).where(eq(favourites.userId, context.user.id)),
      db.select({ value: count() }).from(enquiries).where(and(eq(enquiries.tenantId, context.user.id), eq(enquiries.status, "OPEN"))),
    ]);

    const [recommended, affordableNearby, recentlyAdded] = await Promise.all([
      serializeProperties(recommendedRows, context.user.id),
      serializeProperties(affordableRows, context.user.id),
      serializeProperties(recentRows, context.user.id),
    ]);

    return successResponse({
      user: context.user,
      location: "Accra, Ghana",
      categories,
      recommended,
      affordableNearby,
      recentlyAdded,
      popularLocations: locations.map((location) => ({
        region: location.region,
        city: location.city,
        count: Number(location.count),
      })),
      stats: {
        savedProperties: savedProperties[0]?.value ?? 0,
        openEnquiries: openEnquiries[0]?.value ?? 0,
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
