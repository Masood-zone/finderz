import { boolean, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const notificationCategory = pgEnum("notification_category", [
  "GENERAL", "PROPERTY", "VERIFICATION", "ENQUIRY", "REPORT", "ACCOUNT",
]);
export const notificationPriority = pgEnum("notification_priority", ["NORMAL", "HIGH", "CRITICAL"]);
export const notificationChannel = pgEnum("notification_channel", ["EMAIL", "SMS", "PUSH"]);
export const deliveryStatus = pgEnum("notification_delivery_status", ["PENDING", "SENDING", "SENT", "FAILED", "SKIPPED"]);

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  category: notificationCategory("category").notNull().default("GENERAL"),
  eventKey: text("event_key").notNull().default("legacy"),
  priority: notificationPriority("priority").notNull().default("NORMAL"),
  title: text("title").notNull(),
  message: text("message").notNull(),
  deepLink: text("deep_link"),
  relatedEntityType: text("related_entity_type"),
  relatedEntityId: text("related_entity_id"),
  deduplicationKey: text("deduplication_key"),
  data: jsonb("data"),
  isRead: boolean("is_read").notNull().default(false),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("notifications_user_id_idx").on(table.userId),
  index("notifications_is_read_idx").on(table.isRead),
  uniqueIndex("notifications_user_deduplication_idx").on(table.userId, table.deduplicationKey),
]);

export const notificationPreferences = pgTable("notification_preferences", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  category: notificationCategory("category").notNull(),
  emailEnabled: boolean("email_enabled").notNull().default(true),
  smsEnabled: boolean("sms_enabled").notNull().default(false),
  pushEnabled: boolean("push_enabled").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("notification_preferences_user_category_idx").on(table.userId, table.category)]);

export const pushTokens = pgTable("notification_push_tokens", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  platform: text("platform").notNull(),
  deviceId: text("device_id"),
  active: boolean("active").notNull().default(true),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("notification_push_tokens_token_idx").on(table.token), index("notification_push_tokens_user_idx").on(table.userId)]);

export const notificationDeliveries = pgTable("notification_deliveries", {
  id: text("id").primaryKey(),
  notificationId: text("notification_id").notNull().references(() => notifications.id, { onDelete: "cascade" }),
  channel: notificationChannel("channel").notNull(),
  status: deliveryStatus("status").notNull().default("PENDING"),
  attempts: integer("attempts").notNull().default(0),
  providerReference: text("provider_reference"),
  error: text("error"),
  nextRetryAt: timestamp("next_retry_at", { withTimezone: true }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("notification_deliveries_notification_channel_idx").on(table.notificationId, table.channel), index("notification_deliveries_due_idx").on(table.status, table.nextRetryAt)]);
