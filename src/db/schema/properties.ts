import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const landlordType = pgEnum("landlord_type", ["INDIVIDUAL", "AGENCY"]);
export const verificationStatus = pgEnum("verification_status", ["NOT_SUBMITTED", "PENDING", "APPROVED", "REJECTED", "CHANGES_REQUESTED"]);
export const propertyType = pgEnum("property_type", ["APARTMENT", "HOUSE", "ROOM", "STUDIO", "HOSTEL", "COMMERCIAL"]);
export const paymentPeriod = pgEnum("payment_period", ["MONTHLY", "QUARTERLY", "BIANNUALLY", "YEARLY"]);
export const furnishingStatus = pgEnum("furnishing_status", ["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"]);
export const approvalStatus = pgEnum("approval_status", ["DRAFT", "PENDING", "APPROVED", "REJECTED", "RENTED"]);

export const landlordProfiles = pgTable(
  "landlord_profiles",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    legalName: text("legal_name"),
    landlordType: landlordType("landlord_type").notNull().default("INDIVIDUAL"),
    agencyName: text("agency_name"),
    address: text("address"),
    preferredContactMethod: text("preferred_contact_method"),
    identityDocumentType: text("identity_document_type"),
    identityDocumentUrl: text("identity_document_url"),
    identityDocumentPublicId: text("identity_document_public_id"),
    verificationStatus: verificationStatus("verification_status").notNull().default("NOT_SUBMITTED"),
    verificationNotes: text("verification_notes"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("landlord_profiles_user_id_idx").on(table.userId)],
);

export const properties = pgTable(
  "properties",
  {
    id: text("id").primaryKey(),
    landlordId: text("landlord_id")
      .notNull()
      .references(() => landlordProfiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    propertyType: propertyType("property_type").notNull(),
    region: text("region").notNull(),
    city: text("city").notNull(),
    area: text("area").notNull(),
    landmark: text("landmark"),
    address: text("address").notNull(),
    latitude: text("latitude"),
    longitude: text("longitude"),
    rentAmount: integer("rent_amount").notNull(),
    paymentPeriod: paymentPeriod("payment_period").notNull(),
    advancePeriodMonths: integer("advance_period_months").notNull().default(1),
    additionalCharges: text("additional_charges"),
    bedrooms: integer("bedrooms").notNull().default(0),
    bathrooms: integer("bathrooms").notNull().default(0),
    furnishingStatus: furnishingStatus("furnishing_status").notNull().default("UNFURNISHED"),
    isNegotiable: boolean("is_negotiable").notNull().default(false),
    isAvailable: boolean("is_available").notNull().default(true),
    approvalStatus: approvalStatus("approval_status").notNull().default("DRAFT"),
    rejectionReason: text("rejection_reason"),
    contactPreferences: text("contact_preferences"),
    inspectionAvailability: text("inspection_availability"),
    houseRules: text("house_rules"),
    availableFrom: timestamp("available_from", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("properties_landlord_id_idx").on(table.landlordId),
    index("properties_location_idx").on(table.region, table.city, table.area),
    index("properties_approval_status_idx").on(table.approvalStatus),
    index("properties_available_idx").on(table.isAvailable),
  ],
);
