import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { enquiries, landlordProfiles, properties } from "@/db/schema";
import { internalServerErrorResponse, successResponse } from "@/lib/api-response";
import { guardErrorResponse, requireLandlord } from "@/lib/auth-guards.server";

export async function GET(request: Request) {
  try {
    const context = await requireLandlord(request);
    const profile = await db.query.landlordProfiles.findFirst({
      where: eq(landlordProfiles.userId, context.user.id),
    });

    const [listedProperties] = profile
      ? await db.select({ value: count() }).from(properties).where(eq(properties.landlordId, profile.id))
      : [{ value: 0 }];
    const [receivedEnquiries] = await db.select({ value: count() }).from(enquiries).where(eq(enquiries.landlordId, context.user.id));

    return successResponse({
      user: context.user,
      stats: {
        listedProperties: listedProperties.value,
        receivedEnquiries: receivedEnquiries.value,
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
