import { asc } from "drizzle-orm";
import { db } from "@/db";
import { ghanaCities, ghanaRegions } from "@/db/schema";
import { internalServerErrorResponse, successResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const [regions, cities] = await Promise.all([
      db.select().from(ghanaRegions).orderBy(asc(ghanaRegions.name)),
      db.select().from(ghanaCities).orderBy(asc(ghanaCities.name)),
    ]);

    return successResponse({
      regions: regions.map((region) => ({
        id: region.id,
        name: region.name,
        slug: region.slug,
        capital: region.capital,
        cities: cities
          .filter((city) => city.regionId === region.id)
          .map((city) => ({
            id: city.id,
            name: city.name,
            slug: city.slug,
          })),
      })),
    });
  } catch {
    return internalServerErrorResponse();
  }
}
