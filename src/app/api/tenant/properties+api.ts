import { internalServerErrorResponse, successResponse } from "@/lib/api-response";
import { guardErrorResponse, requireTenant } from "@/lib/auth-guards.server";
import { findTenantProperties, getTenantFiltersFromUrl } from "@/lib/tenant/property-serializer.server";
import type { TenantPropertySort } from "@/types/tenant";

export async function GET(request: Request) {
  try {
    const context = await requireTenant(request);
    const filters = getTenantFiltersFromUrl(request);
    const result = await findTenantProperties(context.user.id, filters);

    return successResponse({
      query: {
        q: filters.q ?? null,
        sort: filters.sort ?? ("relevance" satisfies TenantPropertySort),
        page: result.page,
        pageSize: result.pageSize,
      },
      total: result.total,
      hasMore: result.hasMore,
      properties: result.properties,
    });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
