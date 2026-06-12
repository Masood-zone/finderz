import { index, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { properties } from "./properties";

export const reportStatus = pgEnum("report_status", ["OPEN", "REVIEWING", "RESOLVED", "DISMISSED"]);

export const propertyReports = pgTable(
  "property_reports",
  {
    id: text("id").primaryKey(),
    propertyId: text("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    reporterId: text("reporter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    reason: text("reason").notNull(),
    description: text("description"),
    status: reportStatus("status").notNull().default("OPEN"),
    reviewedBy: text("reviewed_by").references(() => user.id, { onDelete: "set null" }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("property_reports_property_id_idx").on(table.propertyId),
    index("property_reports_reporter_id_idx").on(table.reporterId),
    index("property_reports_status_idx").on(table.status),
  ],
);
