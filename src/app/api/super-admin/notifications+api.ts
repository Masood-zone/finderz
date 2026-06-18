import { and, count, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { internalServerErrorResponse, successResponse, validationErrorResponse } from "@/lib/api-response";
import { guardErrorResponse, requireSuperAdmin } from "@/lib/auth-guards.server";
import { paged, parsePagination, serializeNotification, writeAdminAuditLog } from "@/lib/super-admin/super-admin.server";

const actionSchema = z.object({
  action: z.enum(["mark_read", "mark_all_read"]),
  notificationId: z.string().optional(),
});

const adminNotificationTypes = ["ADMIN_APPROVAL", "PROPERTY_REPORT", "LANDLORD_VERIFICATION", "ACCOUNT_ISSUE", "PENDING_APPROVAL"];

export async function GET(request: Request) {
  try {
    const context = await requireSuperAdmin(request);
    const { page, pageSize, offset } = parsePagination(request);
    const where = and(eq(notifications.userId, context.user.id), inArray(notifications.type, adminNotificationTypes));
    const [totalRows, rows] = await Promise.all([
      db.select({ value: count() }).from(notifications).where(where),
      db.query.notifications.findMany({ where, orderBy: [desc(notifications.createdAt)], limit: pageSize, offset }),
    ]);
    return successResponse(paged(rows.map(serializeNotification), page, pageSize, totalRows[0]?.value ?? 0));
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}

export async function PATCH(request: Request) {
  try {
    const context = await requireSuperAdmin(request);
    const parsed = actionSchema.safeParse(await request.json());
    if (!parsed.success) return validationErrorResponse(parsed.error);

    if (parsed.data.action === "mark_all_read") {
      await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, context.user.id));
      await writeAdminAuditLog(context, "NOTIFICATIONS_MARK_ALL_READ", "notification", null);
    } else if (parsed.data.notificationId) {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.id, parsed.data.notificationId), eq(notifications.userId, context.user.id)));
      await writeAdminAuditLog(context, "NOTIFICATION_MARK_READ", "notification", parsed.data.notificationId);
    }

    const rows = await db.query.notifications.findMany({
      where: eq(notifications.userId, context.user.id),
      orderBy: [desc(notifications.createdAt)],
      limit: 20,
    });
    return successResponse({ notifications: rows.map(serializeNotification) });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
