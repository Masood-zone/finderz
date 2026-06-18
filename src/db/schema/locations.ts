import { index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const ghanaRegions = pgTable(
  "ghana_regions",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    capital: text("capital"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("ghana_regions_name_idx").on(table.name)],
);

export const ghanaCities = pgTable(
  "ghana_cities",
  {
    id: text("id").primaryKey(),
    regionId: text("region_id")
      .notNull()
      .references(() => ghanaRegions.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("ghana_cities_region_id_idx").on(table.regionId),
    uniqueIndex("ghana_cities_region_slug_idx").on(table.regionId, table.slug),
  ],
);
