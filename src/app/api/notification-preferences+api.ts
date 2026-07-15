import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { notificationPreferences } from "@/db/schema";
import { guardErrorResponse, requireSession } from "@/lib/auth-guards.server";
import { internalServerErrorResponse, successResponse, validationErrorResponse } from "@/lib/api-response";

const categories = ["GENERAL", "PROPERTY", "VERIFICATION", "ENQUIRY", "REPORT", "ACCOUNT"] as const;
const updateSchema = z.object({ category: z.enum(categories), emailEnabled: z.boolean(), smsEnabled: z.boolean(), pushEnabled: z.boolean() });
const defaults = (category: typeof categories[number]) => ({ category, emailEnabled: true, smsEnabled: category === "ACCOUNT", pushEnabled: true });

export async function GET(request: Request) {
  try {
    const context = await requireSession(request);
    const rows = await db.query.notificationPreferences.findMany({ where: eq(notificationPreferences.userId, context.user.id) });
    return successResponse({ preferences: categories.map((category) => rows.find((row) => row.category === category) ?? defaults(category)) });
  } catch (error) { try { return guardErrorResponse(error); } catch { return internalServerErrorResponse(); } }
}
export async function PUT(request: Request) {
  try {
    const context = await requireSession(request); const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) return validationErrorResponse(parsed.error);
    const existing = await db.query.notificationPreferences.findFirst({ where: and(eq(notificationPreferences.userId, context.user.id), eq(notificationPreferences.category, parsed.data.category)) });
    if (existing) await db.update(notificationPreferences).set({ ...parsed.data, updatedAt: new Date() }).where(eq(notificationPreferences.id, existing.id));
    else await db.insert(notificationPreferences).values({ id: crypto.randomUUID(), userId: context.user.id, ...parsed.data });
    return successResponse({ preference: parsed.data });
  } catch (error) { try { return guardErrorResponse(error); } catch { return internalServerErrorResponse(); } }
}
