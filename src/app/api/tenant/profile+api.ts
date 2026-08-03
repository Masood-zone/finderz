import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { enquiries, messages } from "@/db/schema";
import { internalServerErrorResponse, successResponse } from "@/lib/api-response";
import { guardErrorResponse, requireTenant } from "@/lib/auth-guards.server";
import { countTenantVisibleFavourites } from "@/lib/tenant/property-serializer.server";

export async function GET(request: Request) {
  try {
    const context = await requireTenant(request);
    const [savedProperties, enquiryCount, unreadMessages] = await Promise.all([
      countTenantVisibleFavourites(context.user.id),
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
        savedProperties,
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
