import { boolean, index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { properties } from "./properties";

export const propertyImages = pgTable(
  "property_images",
  {
    id: text("id").primaryKey(),
    propertyId: text("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    publicId: text("public_id"),
    position: integer("position").notNull().default(0),
    isCover: boolean("is_cover").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("property_images_property_id_idx").on(table.propertyId)],
);
