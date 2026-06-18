import { internalServerErrorResponse, successResponse } from "@/lib/api-response";
import { guardErrorResponse, requireLandlord } from "@/lib/auth-guards.server";
import { getLandlordEnquiries } from "@/lib/landlord/landlord.server";

export async function GET(request: Request) {
  try {
    const context = await requireLandlord(request);
    const enquiries = await getLandlordEnquiries(context.user.id, 50);

    return successResponse({ enquiries });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
