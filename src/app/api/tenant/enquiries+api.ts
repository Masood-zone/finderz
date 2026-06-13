import { and, count, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { enquiries, messages, properties, propertyImages, user } from "@/db/schema";
import { internalServerErrorResponse, notFoundResponse, successResponse, validationErrorResponse } from "@/lib/api-response";
import { guardErrorResponse, requireTenant } from "@/lib/auth-guards.server";
import { findTenantPropertyById, serializeProperties } from "@/lib/tenant/property-serializer.server";
import type { TenantEnquiry, TenantEnquiryStatusFilter } from "@/types/tenant";

const createEnquirySchema = z.object({
  propertyId: z.string().min(1),
  message: z.string().trim().min(1).max(1000),
  preferredContactMethod: z.enum(["PHONE", "WHATSAPP", "EMAIL", "IN_APP"]).default("IN_APP"),
  preferredInspectionDate: z.string().optional(),
});

type EnquiryRow = typeof enquiries.$inferSelect & {
  landlord: typeof user.$inferSelect;
  property: typeof properties.$inferSelect & {
    images?: Array<typeof propertyImages.$inferSelect>;
  };
  messages?: Array<typeof messages.$inferSelect>;
};

function filterToStatuses(filter: string | null) {
  if (filter === "awaiting-reply") {
    return ["OPEN"] as const;
  }

  if (filter === "closed") {
    return ["CLOSED", "CANCELLED"] as const;
  }

  return ["OPEN", "RESPONDED"] as const;
}

async function serializeEnquiries(rows: EnquiryRow[], userId: string): Promise<TenantEnquiry[]> {
  const properties = await serializeProperties(
    rows.map((row) => row.property).filter(Boolean),
    userId,
  );
  const propertyMap = new Map(properties.map((property) => [property.id, property]));

  return rows.map((row) => {
    const sortedMessages = [...(row.messages ?? [])].sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime());
    const lastMessage = sortedMessages.at(-1) ?? null;
    const property = propertyMap.get(row.propertyId)!;

    return {
      id: row.id,
      status: row.status,
      preferredContactMethod: row.preferredContactMethod,
      preferredInspectionDate: row.preferredInspectionDate?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      landlord: {
        id: row.landlord.id,
        name: row.landlord.name,
        email: row.landlord.email,
        phone: row.landlord.phone,
        image: row.landlord.image,
      },
      property,
      lastMessage: lastMessage
        ? {
            id: lastMessage.id,
            content: lastMessage.content,
            createdAt: lastMessage.createdAt.toISOString(),
            senderId: lastMessage.senderId,
            isRead: lastMessage.isRead,
          }
        : null,
      unreadCount: sortedMessages.filter((message) => message.senderId !== userId && !message.isRead).length,
    };
  });
}

export async function GET(request: Request) {
  try {
    const context = await requireTenant(request);
    const url = new URL(request.url);
    const statusFilter = url.searchParams.get("status") as TenantEnquiryStatusFilter | null;
    const statuses = filterToStatuses(statusFilter);

    const [rows, active, awaitingReply, closed] = await Promise.all([
      db.query.enquiries.findMany({
        where: and(eq(enquiries.tenantId, context.user.id), inArray(enquiries.status, [...statuses])),
        with: {
          landlord: true,
          property: {
            with: {
              images: true,
            },
          },
          messages: true,
        },
        orderBy: [desc(enquiries.updatedAt)],
      }),
      db.select({ value: count() }).from(enquiries).where(and(eq(enquiries.tenantId, context.user.id), inArray(enquiries.status, ["OPEN", "RESPONDED"]))),
      db.select({ value: count() }).from(enquiries).where(and(eq(enquiries.tenantId, context.user.id), eq(enquiries.status, "OPEN"))),
      db.select({ value: count() }).from(enquiries).where(and(eq(enquiries.tenantId, context.user.id), inArray(enquiries.status, ["CLOSED", "CANCELLED"]))),
    ]);

    return successResponse({
      enquiries: await serializeEnquiries(rows as EnquiryRow[], context.user.id),
      counts: {
        active: active[0]?.value ?? 0,
        "awaiting-reply": awaitingReply[0]?.value ?? 0,
        closed: closed[0]?.value ?? 0,
      },
    });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireTenant(request);
    const parsed = createEnquirySchema.safeParse(await request.json());

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const property = await findTenantPropertyById(parsed.data.propertyId, context.user.id);

    if (!property || !property.landlord) {
      return notFoundResponse("This property is no longer available for enquiries.");
    }

    const enquiryId = crypto.randomUUID();
    await db.insert(enquiries).values({
      id: enquiryId,
      propertyId: property.id,
      tenantId: context.user.id,
      landlordId: property.landlord.id,
      preferredContactMethod: parsed.data.preferredContactMethod,
      preferredInspectionDate: parsed.data.preferredInspectionDate ? new Date(parsed.data.preferredInspectionDate) : null,
    });
    await db.insert(messages).values({
      id: crypto.randomUUID(),
      enquiryId,
      senderId: context.user.id,
      content: parsed.data.message,
      isRead: true,
    });

    return successResponse({ enquiryId }, { status: 201 });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
