import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { internalServerErrorResponse, successResponse } from "@/lib/api-response";
import { guardErrorResponse, requireLandlord } from "@/lib/auth-guards.server";
import {
  getLandlordCounts,
  getLandlordEnquiries,
  getLandlordProfileForUser,
  getListingPerformance,
  serializeLandlordProperties,
  serializeVerification,
} from "@/lib/landlord/landlord.server";

export async function GET(request: Request) {
  try {
    const context = await requireLandlord(request);
    const profile = await getLandlordProfileForUser(context.user.id);

    if (!profile) {
      return successResponse({
        user: context.user,
        verification: serializeVerification(null),
        stats: {
          totalListings: 0,
          activeListings: 0,
          pendingListings: 0,
          rejectedListings: 0,
          rentedListings: 0,
          totalEnquiries: 0,
        },
        recentEnquiries: [],
        listingPerformance: [],
        portfolioHighlights: [],
      });
    }

    const [stats, recentEnquiries, listingPerformance, highlights] = await Promise.all([
      getLandlordCounts(profile.id, context.user.id),
      getLandlordEnquiries(context.user.id, 5),
      getListingPerformance(profile.id),
      db.query.properties.findMany({
        where: eq(properties.landlordId, profile.id),
        with: { images: true },
        orderBy: [desc(properties.updatedAt)],
        limit: 6,
      }),
    ]);

    return successResponse({
      user: {
        id: context.user.id,
        name: context.user.name,
        email: context.user.email,
        phone: context.user.phone,
        role: context.user.role,
        onboardingCompleted: context.user.onboardingCompleted,
        accountStatus: context.user.accountStatus,
      },
      verification: serializeVerification(profile),
      stats,
      recentEnquiries,
      listingPerformance,
      portfolioHighlights: await serializeLandlordProperties(highlights),
    });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
