import { index, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { properties } from "./properties";

export const enquiryStatus = pgEnum("enquiry_status", ["OPEN", "RESPONDED", "CLOSED", "CANCELLED"]);
export const contactMethod = pgEnum("contact_method", ["PHONE", "WHATSAPP", "EMAIL", "IN_APP"]);

export const enquiries = pgTable(
  "enquiries",
  {
    id: text("id").primaryKey(),
    propertyId: text("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    landlordId: text("landlord_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: enquiryStatus("status").notNull().default("OPEN"),
    preferredInspectionDate: timestamp("preferred_inspection_date", { withTimezone: true }),
    preferredContactMethod: contactMethod("preferred_contact_method").notNull().default("PHONE"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("enquiries_property_id_idx").on(table.propertyId),
    index("enquiries_tenant_id_idx").on(table.tenantId),
    index("enquiries_landlord_id_idx").on(table.landlordId),
  ],
);
