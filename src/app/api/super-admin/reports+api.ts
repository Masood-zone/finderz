import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { propertyReports } from "@/db/schema";
import { internalServerErrorResponse, successResponse } from "@/lib/api-response";
import { guardErrorResponse, requireSuperAdmin } from "@/lib/auth-guards.server";
import { paged, parsePagination, serializeReport } from "@/lib/super-admin/super-admin.server";

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    const { url, page, pageSize, offset } = parsePagination(request);
    const status = url.searchParams.get("status");
    const where = status && status !== "all" ? eq(propertyReports.status, status.toUpperCase() as typeof propertyReports.status.enumValues[number]) : undefined;
    const [totalRows, rows] = await Promise.all([
      where ? db.select({ value: count() }).from(propertyReports).where(where) : db.select({ value: count() }).from(propertyReports),
      db.query.propertyReports.findMany({
        where,
        with: {
          property: {
            with: {
              landlord: { with: { user: true, properties: true } },
            },
          },
          reporter: true,
        },
        orderBy: [desc(propertyReports.createdAt)],
        limit: pageSize,
        offset,
      }),
    ]);

    return successResponse(paged(rows.map(serializeReport), page, pageSize, totalRows[0]?.value ?? 0));
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
