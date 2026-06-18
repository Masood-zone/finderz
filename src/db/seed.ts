import "dotenv/config";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from ".";
import { amenities, ghanaCities, ghanaRegions, user } from "./schema";
import { ghanaRegionsWithCities, ghanaSampleLocations, propertyTypes, standardAmenities } from "./seed-data";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function seedAmenities() {
  for (const amenity of standardAmenities) {
    await db
      .insert(amenities)
      .values(amenity)
      .onConflictDoUpdate({
        target: amenities.slug,
        set: {
          name: amenity.name,
          icon: amenity.icon,
        },
      });
  }
}

async function seedGhanaLocations() {
  for (const region of ghanaRegionsWithCities) {
    await db
      .insert(ghanaRegions)
      .values({
        id: region.id,
        name: region.name,
        slug: region.slug,
        capital: region.capital,
      })
      .onConflictDoUpdate({
        target: ghanaRegions.slug,
        set: {
          name: region.name,
          capital: region.capital,
        },
      });

    for (const city of region.cities) {
      await db
        .insert(ghanaCities)
        .values({
          id: `city-${region.slug}-${slugify(city)}`,
          regionId: region.id,
          name: city,
          slug: slugify(city),
        })
        .onConflictDoUpdate({
          target: [ghanaCities.regionId, ghanaCities.slug],
          set: {
            name: city,
          },
        });
    }
  }
}

async function seedSuperAdministrator() {
  const name = process.env.SUPER_ADMIN_NAME;
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error("SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL, and SUPER_ADMIN_PASSWORD are required to seed the administrator.");
  }

  const existing = await db.query.user.findFirst({
    where: eq(user.email, email),
  });

  if (!existing) {
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });
  }

  await db
    .update(user)
    .set({
      name,
      role: "SUPER_ADMIN",
      accountStatus: "ACTIVE",
      onboardingCompleted: true,
      updatedAt: new Date(),
    })
    .where(eq(user.email, email));
}

async function main() {
  await seedAmenities();
  await seedGhanaLocations();
  await seedSuperAdministrator();

  console.log(
    JSON.stringify(
      {
        ok: true,
        seeded: {
          propertyTypes: propertyTypes.length,
          sampleLocationRegions: ghanaSampleLocations.length,
          ghanaRegions: ghanaRegionsWithCities.length,
          ghanaCities: ghanaRegionsWithCities.reduce((count, region) => count + region.cities.length, 0),
          amenities: standardAmenities.length,
          superAdministrator: process.env.SUPER_ADMIN_EMAIL,
        },
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
