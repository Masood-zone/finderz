import { internalServerErrorResponse, successResponse } from "@/lib/api-response";
import { guardErrorResponse, requireLandlord } from "@/lib/auth-guards.server";
import { getLandlordProfileForUser, serializeVerification } from "@/lib/landlord/landlord.server";

export async function GET(request: Request) {
  try {
    const context = await requireLandlord(request);
    const profile = await getLandlordProfileForUser(context.user.id);

    return successResponse(serializeVerification(profile ?? null));
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
