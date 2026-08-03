import { and, asc, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { enquiries, properties } from "@/db/schema";
import { ghanaSampleLocations, propertyTypes } from "@/db/seed-data";
import { internalServerErrorResponse, successResponse } from "@/lib/api-response";
import { guardErrorResponse, requireTenant } from "@/lib/auth-guards.server";
import { countTenantVisibleFavourites, getLocationSort, getPopularLocations, getTenantFiltersFromUrl, serializeProperties, tenantVisiblePropertyCondition } from "@/lib/tenant/property-serializer.server";

const categories = ["All", ...propertyTypes.map((type) => type.charAt(0) + type.slice(1).toLowerCase())];

function getLocationLabel(filters: ReturnType<typeof getTenantFiltersFromUrl>) {
  if (filters.area && filters.city) return `${filters.area}, ${filters.city}`;
  if (filters.city && filters.region) return `${filters.city}, ${filters.region}`;
  if (filters.city) return filters.city;
  if (filters.region) return filters.region;
  if (filters.latitude !== undefined && filters.longitude !== undefined) return "Near you";
  return "Ghana";
}

function getNearbyWhere(baseWhere: SQL | undefined, filters: ReturnType<typeof getTenantFiltersFromUrl>) {
  const locationConditions = [
    filters.city ? ilike(properties.city, `%${filters.city}%`) : undefined,
    filters.region ? ilike(properties.region, `%${filters.region}%`) : undefined,
    filters.area ? ilike(properties.area, `%${filters.area}%`) : undefined,
  ].filter(Boolean) as SQL[];

  if (!locationConditions.length) {
    return baseWhere;
  }

  return and(baseWhere, or(...locationConditions));
}

function seededPopularLocations() {
  return ghanaSampleLocations.slice(0, 6).map((location) => ({
    region: location.region,
    city: location.city,
    count: 0,
  }));
}

export async function GET(request: Request) {
  try {
    const context = await requireTenant(request);
    const filters = getTenantFiltersFromUrl(request);
    const baseWhere = tenantVisiblePropertyCondition();
    const nearbyWhere = getNearbyWhere(baseWhere, filters);
    const locationOrder = getLocationSort(filters);

    const [recommendedRows, affordableRows, recentRows, locations, savedProperties, openEnquiries] = await Promise.all([
      db.query.properties.findMany({
        where: nearbyWhere,
        with: { images: true },
        orderBy: [...locationOrder, desc(properties.rentAmount)],
        limit: 6,
      }),
      db.query.properties.findMany({
        where: nearbyWhere,
        with: { images: true },
        orderBy: [...locationOrder, asc(properties.rentAmount)],
        limit: 6,
      }),
      db.query.properties.findMany({
        where: baseWhere,
        with: { images: true },
        orderBy: [desc(properties.createdAt)],
        limit: 4,
      }),
      getPopularLocations(),
      countTenantVisibleFavourites(context.user.id),
      db.select({ value: count() }).from(enquiries).where(and(eq(enquiries.tenantId, context.user.id), eq(enquiries.status, "OPEN"))),
    ]);

    const [fallbackRecommendedRows, fallbackAffordableRows] =
      recommendedRows.length || nearbyWhere === baseWhere
        ? [recommendedRows, affordableRows]
        : await Promise.all([
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
          ]);

    const [recommended, affordableNearby, recentlyAdded] = await Promise.all([
      serializeProperties(fallbackRecommendedRows, context.user.id),
      serializeProperties(fallbackAffordableRows, context.user.id),
      serializeProperties(recentRows, context.user.id),
    ]);

    return successResponse({
      user: context.user,
      location: getLocationLabel(filters),
      categories,
      recommended,
      affordableNearby,
      recentlyAdded,
      popularLocations: locations.length
        ? locations.map((location) => ({
            region: location.region,
            city: location.city,
            count: Number(location.count),
          }))
        : seededPopularLocations(),
      stats: {
        savedProperties,
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
