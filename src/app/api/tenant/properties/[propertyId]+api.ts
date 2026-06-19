import {
  badRequestResponse,
  notFoundResponse,
  internalServerErrorResponse,
  successResponse,
} from "@/lib/api-response";
import { guardErrorResponse, requireTenant } from "@/lib/auth-guards.server";
import { findTenantPropertyById } from "@/lib/tenant/property-serializer.server";

type RouteParams = {
  propertyId: string;
};

export async function GET(request: Request, { propertyId }: RouteParams) {
  try {
    const context = await requireTenant(request);

    if (!propertyId) {
      return badRequestResponse("Property ID is required.");
    }

    const property = await findTenantPropertyById(propertyId, context.user.id);

    if (!property) {
      return notFoundResponse("This property could not be found.");
    }

    return successResponse({ property });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      console.error("GET /api/tenant/properties/[propertyId] failed:", error);
      return internalServerErrorResponse();
    }
  }
}
