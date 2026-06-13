import { and, asc, desc, eq, gte, ilike, inArray, lte, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { amenities, favourites, landlordProfiles, properties, propertyAmenities, propertyImages, user } from "@/db/schema";
import type { TenantFilters, TenantProperty, TenantPropertySort } from "@/types/tenant";

const DEFAULT_PAGE_SIZE = 12;

type PropertyRow = typeof properties.$inferSelect & {
  images?: (typeof propertyImages.$inferSelect)[];
};

function numberParam(value: string | null) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function getTenantFiltersFromUrl(request: Request): TenantFilters {
  const url = new URL(request.url);
  const params = url.searchParams;

  return {
    q: params.get("q") ?? undefined,
    region: params.get("region") ?? undefined,
    city: params.get("city") ?? undefined,
    area: params.get("area") ?? undefined,
    minRent: numberParam(params.get("minRent")),
    maxRent: numberParam(params.get("maxRent")),
    paymentPeriod: params.get("paymentPeriod") ?? undefined,
    propertyType: params.get("propertyType") ?? undefined,
    bedrooms: numberParam(params.get("bedrooms")),
    bathrooms: numberParam(params.get("bathrooms")),
    furnishingStatus: params.get("furnishingStatus") ?? undefined,
    availability: (params.get("availability") as TenantFilters["availability"]) ?? undefined,
    verifiedOnly: params.get("verifiedOnly") === "true",
    amenities: params.get("amenities")?.split(",").filter(Boolean),
    sort: (params.get("sort") as TenantPropertySort | null) ?? undefined,
    page: numberParam(params.get("page")),
  };
}

function buildPropertyConditions(filters: TenantFilters) {
  const conditions: SQL[] = [eq(properties.approvalStatus, "APPROVED")];

  if (filters.availability === "unavailable") {
    conditions.push(eq(properties.isAvailable, false));
  } else if (filters.availability !== "any") {
    conditions.push(eq(properties.isAvailable, true));
  }

  if (filters.q) {
    const query = `%${filters.q.trim()}%`;
    conditions.push(
      or(ilike(properties.title, query), ilike(properties.city, query), ilike(properties.area, query), ilike(properties.region, query), ilike(properties.description, query))!,
    );
  }

  if (filters.region) conditions.push(ilike(properties.region, `%${filters.region}%`));
  if (filters.city) conditions.push(ilike(properties.city, `%${filters.city}%`));
  if (filters.area) conditions.push(ilike(properties.area, `%${filters.area}%`));
  if (filters.minRent !== undefined) conditions.push(gte(properties.rentAmount, filters.minRent));
  if (filters.maxRent !== undefined) conditions.push(lte(properties.rentAmount, filters.maxRent));
  if (filters.paymentPeriod) conditions.push(eq(properties.paymentPeriod, filters.paymentPeriod as typeof properties.paymentPeriod.enumValues[number]));
  if (filters.propertyType) conditions.push(eq(properties.propertyType, filters.propertyType as typeof properties.propertyType.enumValues[number]));
  if (filters.bedrooms !== undefined) conditions.push(gte(properties.bedrooms, filters.bedrooms));
  if (filters.bathrooms !== undefined) conditions.push(gte(properties.bathrooms, filters.bathrooms));
  if (filters.furnishingStatus) conditions.push(eq(properties.furnishingStatus, filters.furnishingStatus as typeof properties.furnishingStatus.enumValues[number]));

  return conditions;
}

function getSort(sort: TenantPropertySort = "relevance") {
  if (sort === "lowest-price") return asc(properties.rentAmount);
  if (sort === "highest-price") return desc(properties.rentAmount);
  return desc(properties.createdAt);
}

export async function getFavouritePropertyIds(userId: string, propertyIds: string[]) {
  if (!propertyIds.length) {
    return new Set<string>();
  }

  const rows = await db
    .select({ propertyId: favourites.propertyId })
    .from(favourites)
    .where(and(eq(favourites.userId, userId), inArray(favourites.propertyId, propertyIds)));

  return new Set(rows.map((row) => row.propertyId));
}

async function getAmenitiesForProperties(propertyIds: string[]) {
  if (!propertyIds.length) {
    return new Map<string, TenantProperty["amenities"]>();
  }

  const rows = await db
    .select({
      propertyId: propertyAmenities.propertyId,
      id: amenities.id,
      name: amenities.name,
      slug: amenities.slug,
      icon: amenities.icon,
    })
    .from(propertyAmenities)
    .innerJoin(amenities, eq(propertyAmenities.amenityId, amenities.id))
    .where(inArray(propertyAmenities.propertyId, propertyIds));

  const map = new Map<string, TenantProperty["amenities"]>();
  for (const row of rows) {
    const list = map.get(row.propertyId) ?? [];
    list.push({ id: row.id, name: row.name, slug: row.slug, icon: row.icon });
    map.set(row.propertyId, list);
  }

  return map;
}

async function getLandlordsForProfiles(landlordIds: string[]) {
  if (!landlordIds.length) {
    return new Map<string, TenantProperty["landlord"]>();
  }

  const rows = await db
    .select({
      profileId: landlordProfiles.id,
      verificationStatus: landlordProfiles.verificationStatus,
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      image: user.image,
      createdAt: user.createdAt,
      activeListings: sql<number>`count(${properties.id})`,
    })
    .from(landlordProfiles)
    .innerJoin(user, eq(landlordProfiles.userId, user.id))
    .leftJoin(properties, eq(properties.landlordId, landlordProfiles.id))
    .where(inArray(landlordProfiles.id, landlordIds))
    .groupBy(landlordProfiles.id, landlordProfiles.verificationStatus, user.id, user.name, user.email, user.phone, user.image, user.createdAt);

  return new Map(
    rows.map((row) => [
      row.profileId,
      {
        id: row.userId,
        name: row.name,
        email: row.email,
        phone: row.phone,
        image: row.image,
        verified: row.verificationStatus === "APPROVED",
        activeListings: Number(row.activeListings),
        memberSince: row.createdAt.toISOString(),
      },
    ]),
  );
}

export async function serializeProperties(rows: PropertyRow[], userId: string): Promise<TenantProperty[]> {
  const propertyIds = rows.map((row) => row.id);
  const landlordIds = Array.from(new Set(rows.map((row) => row.landlordId)));
  const [favouriteIds, amenitiesByProperty, landlordsByProfile] = await Promise.all([
    getFavouritePropertyIds(userId, propertyIds),
    getAmenitiesForProperties(propertyIds),
    getLandlordsForProfiles(landlordIds),
  ]);

  return rows.map((row) => {
    const sortedImages = [...(row.images ?? [])].sort((left, right) => left.position - right.position);
    const cover = sortedImages.find((image) => image.isCover) ?? sortedImages[0];

    return {
      id: row.id,
      title: row.title,
      description: row.description,
      propertyType: row.propertyType,
      region: row.region,
      city: row.city,
      area: row.area,
      address: row.address,
      landmark: row.landmark,
      rentAmount: row.rentAmount,
      paymentPeriod: row.paymentPeriod,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      furnishingStatus: row.furnishingStatus,
      isNegotiable: row.isNegotiable,
      isAvailable: row.isAvailable,
      approvalStatus: row.approvalStatus,
      availableFrom: row.availableFrom?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      coverImage: cover?.imageUrl ?? null,
      images: sortedImages.map((image) => ({
        id: image.id,
        url: image.imageUrl,
        isCover: image.isCover,
        position: image.position,
      })),
      amenities: amenitiesByProperty.get(row.id) ?? [],
      landlord: landlordsByProfile.get(row.landlordId) ?? null,
      isFavourite: favouriteIds.has(row.id),
    };
  });
}

export async function findTenantProperties(userId: string, filters: TenantFilters = {}) {
  const page = Math.max(filters.page ?? 1, 1);
  const pageSize = DEFAULT_PAGE_SIZE;
  const conditions = buildPropertyConditions(filters);

  const [totalRow] = await db.select({ value: sql<number>`count(distinct ${properties.id})` }).from(properties).where(and(...conditions));

  const rows = await db.query.properties.findMany({
    where: and(...conditions),
    with: {
      images: true,
    },
    orderBy: [getSort(filters.sort)],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  const serialized = await serializeProperties(rows, userId);

  return {
    total: Number(totalRow.value),
    page,
    pageSize,
    hasMore: page * pageSize < Number(totalRow.value),
    properties: serialized,
  };
}

export async function findTenantPropertyById(propertyId: string, userId: string) {
  const row = await db.query.properties.findFirst({
    where: eq(properties.id, propertyId),
    with: {
      images: true,
    },
  });

  if (!row) {
    return null;
  }

  const [property] = await serializeProperties([row], userId);
  return property;
}

export async function getPopularLocations() {
  return db
    .select({
      region: properties.region,
      city: properties.city,
      count: sql<number>`count(${properties.id})`,
    })
    .from(properties)
    .where(and(eq(properties.approvalStatus, "APPROVED"), eq(properties.isAvailable, true)))
    .groupBy(properties.region, properties.city)
    .orderBy(desc(sql<number>`count(${properties.id})`))
    .limit(6);
}
