import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { enquiries } from "@/db/schema";
import { internalServerErrorResponse, successResponse } from "@/lib/api-response";
import { guardErrorResponse, requireTenant } from "@/lib/auth-guards.server";
import { countTenantVisibleFavourites } from "@/lib/tenant/property-serializer.server";

export async function GET(request: Request) {
  try {
    const context = await requireTenant(request);
    const savedProperties = await countTenantVisibleFavourites(context.user.id);
    const [openEnquiries] = await db
      .select({ value: count() })
      .from(enquiries)
      .where(and(eq(enquiries.tenantId, context.user.id), eq(enquiries.status, "OPEN")));

    return successResponse({
      user: context.user,
      stats: {
        savedProperties,
        openEnquiries: openEnquiries.value,
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
