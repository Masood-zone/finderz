import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { enquiries, favourites, messages } from "@/db/schema";
import { internalServerErrorResponse, successResponse } from "@/lib/api-response";
import { guardErrorResponse, requireTenant } from "@/lib/auth-guards.server";

export async function GET(request: Request) {
  try {
    const context = await requireTenant(request);
    const [savedProperties, enquiryCount, unreadMessages] = await Promise.all([
      db.select({ value: count() }).from(favourites).where(eq(favourites.userId, context.user.id)),
      db.select({ value: count() }).from(enquiries).where(eq(enquiries.tenantId, context.user.id)),
      db
        .select({ value: count() })
        .from(messages)
        .innerJoin(enquiries, eq(messages.enquiryId, enquiries.id))
        .where(and(eq(enquiries.tenantId, context.user.id), eq(messages.isRead, false))),
    ]);

    return successResponse({
      user: context.user,
      stats: {
        savedProperties: savedProperties[0]?.value ?? 0,
        enquiries: enquiryCount[0]?.value ?? 0,
        unreadMessages: unreadMessages[0]?.value ?? 0,
      },
    });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
