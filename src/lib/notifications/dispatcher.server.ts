import { and, eq, inArray, isNull, lte, or } from "drizzle-orm";
import { db } from "@/db";
import { notificationDeliveries, notificationPreferences, notifications, pushTokens, user } from "@/db/schema";
import { sendExpoPush, sendNotificationEmail, sendNotificationSms } from "./providers.server";

export type NotificationCategory = "GENERAL" | "PROPERTY" | "VERIFICATION" | "ENQUIRY" | "REPORT" | "ACCOUNT";
type DispatchInput = {
  recipientIds: string[]; type: string; category: NotificationCategory; eventKey: string;
  title: string; message: string; priority?: "NORMAL" | "HIGH" | "CRITICAL";
  deepLink?: string; relatedEntityType?: string; relatedEntityId?: string; deduplicationKey: string;
  data?: Record<string, unknown>;
};

export async function dispatchNotification(input: DispatchInput) {
  try { await dispatchNotificationInternal(input); }
  catch (error) { console.warn("Notification dispatch failed", safeError(error)); }
}

async function dispatchNotificationInternal(input: DispatchInput) {
  const recipients = [...new Set(input.recipientIds)];
  for (const userId of recipients) {
    const id = crypto.randomUUID();
    const [created] = await db.insert(notifications).values({
      id, userId, type: input.type, category: input.category, eventKey: input.eventKey,
      priority: input.priority ?? "NORMAL", title: input.title, message: input.message,
      deepLink: input.deepLink, relatedEntityType: input.relatedEntityType,
      relatedEntityId: input.relatedEntityId, deduplicationKey: input.deduplicationKey, data: input.data,
    }).onConflictDoNothing().returning();
    if (!created) continue;

    const preference = await db.query.notificationPreferences.findFirst({ where: and(eq(notificationPreferences.userId, userId), eq(notificationPreferences.category, input.category)) });
    const defaultSmsEnabled = input.category === "ACCOUNT";
    const channels = [
      preference?.emailEnabled ?? true ? "EMAIL" : null,
      (preference?.smsEnabled ?? defaultSmsEnabled) ? "SMS" : null,
      preference?.pushEnabled ?? true ? "PUSH" : null,
    ].filter(Boolean) as ("EMAIL" | "SMS" | "PUSH")[];
    if (channels.length) await db.insert(notificationDeliveries).values(channels.map((channel) => ({ id: crypto.randomUUID(), notificationId: id, channel })));
  }
  await processDueNotificationDeliveries(12).catch((error) => console.warn("Notification delivery batch failed", safeError(error)));
}

export async function notifySuperAdmins(input: Omit<DispatchInput, "recipientIds">) {
  const admins = await db.select({ id: user.id }).from(user).where(and(eq(user.role, "SUPER_ADMIN"), eq(user.accountStatus, "ACTIVE")));
  return dispatchNotification({ ...input, recipientIds: admins.map((admin) => admin.id) });
}

export async function processDueNotificationDeliveries(limit = 10) {
  const due = await db.query.notificationDeliveries.findMany({
    where: and(inArray(notificationDeliveries.status, ["PENDING", "FAILED"]), or(isNull(notificationDeliveries.nextRetryAt), lte(notificationDeliveries.nextRetryAt, new Date()))),
    limit,
  });
  for (const delivery of due) await attemptDelivery(delivery.id);
}

async function attemptDelivery(deliveryId: string) {
  const delivery = await db.query.notificationDeliveries.findFirst({ where: eq(notificationDeliveries.id, deliveryId) });
  if (!delivery || delivery.attempts >= 5) return;
  const notification = await db.query.notifications.findFirst({ where: eq(notifications.id, delivery.notificationId) });
  if (!notification) return;
  const recipient = await db.query.user.findFirst({ where: eq(user.id, notification.userId) });
  if (!recipient) return;
  const disabled = process.env.NOTIFICATION_DELIVERY_ENABLED !== "true";
  const dryRun = process.env.NOTIFICATION_DRY_RUN !== "false";
  if (disabled || dryRun) {
    await db.update(notificationDeliveries).set({ status: "SKIPPED", error: disabled ? "External delivery disabled" : "Dry run", updatedAt: new Date() }).where(eq(notificationDeliveries.id, delivery.id));
    return;
  }
  try {
    let result: { reference?: string } = {};
    if (delivery.channel === "EMAIL") result = await sendNotificationEmail(recipient.email, notification.title, notification.message);
    if (delivery.channel === "SMS") {
      if (!recipient.phone) throw new Error("Recipient has no phone number");
      result = await sendNotificationSms(recipient.phone, notification.message);
    }
    if (delivery.channel === "PUSH") {
      const tokens = await db.select({ token: pushTokens.token }).from(pushTokens).where(and(eq(pushTokens.userId, recipient.id), eq(pushTokens.active, true)));
      result = await sendExpoPush(tokens.map((item) => item.token), notification.title, notification.message, notification.deepLink);
    }
    await db.update(notificationDeliveries).set({ status: "SENT", attempts: delivery.attempts + 1, providerReference: result.reference, error: null, sentAt: new Date(), updatedAt: new Date() }).where(eq(notificationDeliveries.id, delivery.id));
  } catch (error) {
    const attempts = delivery.attempts + 1;
    await db.update(notificationDeliveries).set({ status: "FAILED", attempts, error: safeError(error), nextRetryAt: attempts >= 5 ? null : new Date(Date.now() + Math.min(60, 2 ** attempts) * 60_000), updatedAt: new Date() }).where(eq(notificationDeliveries.id, delivery.id));
  }
}

function safeError(error: unknown) { return error instanceof Error ? error.message.slice(0, 500) : "Provider delivery failed"; }
