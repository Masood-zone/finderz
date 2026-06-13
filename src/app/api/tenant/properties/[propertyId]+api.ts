import { notFoundResponse, internalServerErrorResponse, successResponse } from "@/lib/api-response";
import { guardErrorResponse, requireTenant } from "@/lib/auth-guards.server";
import { findTenantPropertyById } from "@/lib/tenant/property-serializer.server";

type RouteParams = {
  propertyId: string;
};

export async function GET(request: Request, { params }: { params: RouteParams }) {
  try {
    const context = await requireTenant(request);
    const property = await findTenantPropertyById(params.propertyId, context.user.id);

    if (!property) {
      return notFoundResponse("This property could not be found.");
    }

    return successResponse({ property });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
