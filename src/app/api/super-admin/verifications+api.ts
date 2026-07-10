import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { landlordProfiles } from "@/db/schema";
import { internalServerErrorResponse, successResponse } from "@/lib/api-response";
import { guardErrorResponse, requireSuperAdmin } from "@/lib/auth-guards.server";
import { paged, parsePagination, serializeLandlordVerifications } from "@/lib/super-admin/super-admin.server";
import type { LandlordVerificationStatus } from "@/types/landlord";

const statusFilters = new Set<LandlordVerificationStatus>(["NOT_SUBMITTED", "PENDING", "APPROVED", "REJECTED", "CHANGES_REQUESTED"]);

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    const { url, page, pageSize, offset } = parsePagination(request);
    const status = url.searchParams.get("status") as LandlordVerificationStatus | null;
    const q = url.searchParams.get("q")?.trim().toLowerCase();
    const where = status && status !== "NOT_SUBMITTED" && statusFilters.has(status) ? eq(landlordProfiles.verificationStatus, status) : undefined;

    const [totalRows, rows] = await Promise.all([
      where ? db.select({ value: count() }).from(landlordProfiles).where(where) : db.select({ value: count() }).from(landlordProfiles),
      db.query.landlordProfiles.findMany({
        where,
        with: { user: true },
        orderBy: [desc(landlordProfiles.updatedAt)],
        limit: q ? 200 : pageSize,
        offset: q ? 0 : offset,
      }),
    ]);

    const serialized = await serializeLandlordVerifications(rows);
    const filtered = q
      ? serialized.filter((item) =>
          [
            item.legalName,
            item.agencyName,
            item.user?.name,
            item.user?.email,
            item.user?.phone,
            item.verificationStatus,
          ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(q)),
        )
      : serialized;

    return successResponse(paged(q ? filtered.slice(offset, offset + pageSize) : filtered, page, pageSize, q ? filtered.length : (totalRows[0]?.value ?? 0)));
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      console.error("GET /api/super-admin/verifications failed:", error);
      return internalServerErrorResponse();
    }
  }
}
