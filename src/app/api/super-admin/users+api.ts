import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import { internalServerErrorResponse, successResponse } from "@/lib/api-response";
import { guardErrorResponse, requireSuperAdmin } from "@/lib/auth-guards.server";
import { paged, parsePagination, serializeUsers } from "@/lib/super-admin/super-admin.server";

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    const { url, page, pageSize, offset } = parsePagination(request);
    const filter = url.searchParams.get("filter") ?? "all";
    const query = url.searchParams.get("q")?.trim();
    const roleFilter =
      filter === "tenants" ? eq(user.role, "TENANT") : filter === "landlords" ? eq(user.role, "LANDLORD") : filter === "super-admins" ? eq(user.role, "SUPER_ADMIN") : undefined;
    const statusFilter = filter === "suspended" ? eq(user.accountStatus, "SUSPENDED") : undefined;
    const searchFilter = query ? or(ilike(user.name, `%${query}%`), ilike(user.email, `%${query}%`)) : undefined;
    const filters = [roleFilter, statusFilter, searchFilter].filter(Boolean);
    const where = filters.length ? and(...filters) : undefined;

    const [totalRows, rows] = await Promise.all([
      where ? db.select({ value: count() }).from(user).where(where) : db.select({ value: count() }).from(user),
      db.query.user.findMany({
        where,
        with: { landlordProfile: true },
        orderBy: [desc(user.createdAt)],
        limit: pageSize,
        offset,
      }),
    ]);

    return successResponse(paged(await serializeUsers(rows), page, pageSize, totalRows[0]?.value ?? 0));
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
