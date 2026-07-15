import { and, count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { notificationPreferences, notifications } from "@/db/schema";
import { internalServerErrorResponse, successResponse, validationErrorResponse } from "@/lib/api-response";
import { guardErrorResponse, requireSession } from "@/lib/auth-guards.server";
import { processDueNotificationDeliveries } from "@/lib/notifications/dispatcher.server";

const patchSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("mark_read"), notificationId: z.string().min(1) }),
  z.object({ action: z.literal("mark_all_read") }),
]);

export async function GET(request: Request) {
  try {
    const context = await requireSession(request);
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize")) || 20));
    const where = eq(notifications.userId, context.user.id);
    const [rows, totalRows, unreadRows] = await Promise.all([
      db.query.notifications.findMany({ where, orderBy: [desc(notifications.createdAt)], limit: pageSize, offset: (page - 1) * pageSize }),
      db.select({ value: count() }).from(notifications).where(where),
      db.select({ value: count() }).from(notifications).where(and(where, eq(notifications.isRead, false))),
    ]);
    void processDueNotificationDeliveries(5);
    return successResponse({ notifications: rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString(), readAt: row.readAt?.toISOString() ?? null })), unreadCount: unreadRows[0]?.value ?? 0, pagination: { page, pageSize, total: totalRows[0]?.value ?? 0 } });
  } catch (error) { try { return guardErrorResponse(error); } catch { console.error("GET /api/notifications failed", error); return internalServerErrorResponse(); } }
}

export async function PATCH(request: Request) {
  try {
    const context = await requireSession(request);
    const parsed = patchSchema.safeParse(await request.json());
    if (!parsed.success) return validationErrorResponse(parsed.error);
    const now = new Date();
    if (parsed.data.action === "mark_all_read") await db.update(notifications).set({ isRead: true, readAt: now }).where(eq(notifications.userId, context.user.id));
    else await db.update(notifications).set({ isRead: true, readAt: now }).where(and(eq(notifications.id, parsed.data.notificationId), eq(notifications.userId, context.user.id)));
    return successResponse({ updated: true });
  } catch (error) { try { return guardErrorResponse(error); } catch { console.error("PATCH /api/notifications failed", error); return internalServerErrorResponse(); } }
}
