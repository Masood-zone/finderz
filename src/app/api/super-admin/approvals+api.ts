import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { internalServerErrorResponse, successResponse } from "@/lib/api-response";
import { guardErrorResponse, requireSuperAdmin } from "@/lib/auth-guards.server";
import { paged, parsePagination, serializeAdminProperties } from "@/lib/super-admin/super-admin.server";

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    const { url, page, pageSize, offset } = parsePagination(request);
    const query = url.searchParams.get("q")?.trim();
    const location = url.searchParams.get("location")?.trim();
    const onlyPending = eq(properties.approvalStatus, "PENDING");
    const filters = [
      onlyPending,
      query ? or(ilike(properties.title, `%${query}%`), ilike(properties.description, `%${query}%`)) : undefined,
      location ? or(ilike(properties.city, `%${location}%`), ilike(properties.area, `%${location}%`), ilike(properties.region, `%${location}%`)) : undefined,
    ].filter(Boolean);
    const where = filters.length > 1 ? and(...filters) : onlyPending;
    const [totalRows, rows] = await Promise.all([
      db.select({ value: count() }).from(properties).where(where),
      db.query.properties.findMany({
        where,
        with: { images: true, landlord: { with: { user: true } } },
        orderBy: [desc(properties.updatedAt)],
        limit: pageSize,
        offset,
      }),
    ]);

    return successResponse(paged(await serializeAdminProperties(rows), page, pageSize, totalRows[0]?.value ?? 0));
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
