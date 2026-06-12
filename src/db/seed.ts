import "dotenv/config";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from ".";
import { amenities, user } from "./schema";
import { ghanaSampleLocations, propertyTypes, standardAmenities } from "./seed-data";

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
  await seedSuperAdministrator();

  console.log(
    JSON.stringify(
      {
        ok: true,
        seeded: {
          propertyTypes: propertyTypes.length,
          sampleLocationRegions: ghanaSampleLocations.length,
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
