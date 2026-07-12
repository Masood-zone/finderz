import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { enquiries, messages, properties, propertyImages, user } from "@/db/schema";
import { badRequestResponse, internalServerErrorResponse, notFoundResponse, successResponse, validationErrorResponse } from "@/lib/api-response";
import { guardErrorResponse, requireTenant } from "@/lib/auth-guards.server";
import type { TenantEnquiry } from "@/types/tenant";
import { serializeProperties } from "@/lib/tenant/property-serializer.server";
import { dispatchNotification } from "@/lib/notifications/dispatcher.server";

type RouteParams = {
  enquiryId: string;
};

type EnquiryDetailRow = typeof enquiries.$inferSelect & {
  landlord: typeof user.$inferSelect;
  property: typeof properties.$inferSelect & {
    images?: (typeof propertyImages.$inferSelect)[];
  };
  messages?: (typeof messages.$inferSelect)[];
};

const replySchema = z.object({
  content: z.string().trim().min(1, "Enter a message.").max(1000, "Message is too long."),
});

async function getOwnedEnquiry(enquiryId: string, tenantId: string) {
  const row = await db.query.enquiries.findFirst({
    where: eq(enquiries.id, enquiryId),
    with: {
      landlord: true,
      property: {
        with: {
          images: true,
        },
      },
      messages: true,
    },
  });

  const enquiryRow = row as EnquiryDetailRow | undefined;
  if (!enquiryRow || enquiryRow.tenantId !== tenantId) {
    return null;
  }

  return enquiryRow;
}

async function serializeEnquiryDetail(enquiryRow: EnquiryDetailRow, tenantId: string) {
  const [property] = await serializeProperties([enquiryRow.property], tenantId);
  const sortedMessages = [...(enquiryRow.messages ?? [])].sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime());
  const lastMessage = sortedMessages.at(-1) ?? null;
  const enquiry: TenantEnquiry = {
    id: enquiryRow.id,
    status: enquiryRow.status,
    preferredContactMethod: enquiryRow.preferredContactMethod,
    preferredInspectionDate: enquiryRow.preferredInspectionDate?.toISOString() ?? null,
    createdAt: enquiryRow.createdAt.toISOString(),
    updatedAt: enquiryRow.updatedAt.toISOString(),
    landlord: {
      id: enquiryRow.landlord.id,
      name: enquiryRow.landlord.name,
      email: enquiryRow.landlord.email,
      phone: enquiryRow.landlord.phone,
      image: enquiryRow.landlord.image,
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
    unreadCount: sortedMessages.filter((message) => message.senderId !== tenantId && !message.isRead).length,
  };

  return {
    enquiry,
    messages: sortedMessages.map((message) => ({
      id: message.id,
      senderId: message.senderId,
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt.toISOString(),
    })),
  };
}

export async function GET(request: Request, { enquiryId }: RouteParams) {
  try {
    const context = await requireTenant(request);

    if (!enquiryId) {
      return badRequestResponse("Enquiry ID is required.");
    }

    const enquiryRow = await getOwnedEnquiry(enquiryId, context.user.id);

    if (!enquiryRow) {
      return notFoundResponse("This enquiry could not be found.");
    }

    return successResponse(await serializeEnquiryDetail(enquiryRow, context.user.id));
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      console.error("GET /api/tenant/enquiries/[enquiryId] failed:", error);
      return internalServerErrorResponse();
    }
  }
}

export async function POST(request: Request, { enquiryId }: RouteParams) {
  try {
    const context = await requireTenant(request);

    if (!enquiryId) {
      return badRequestResponse("Enquiry ID is required.");
    }

    const existing = await getOwnedEnquiry(enquiryId, context.user.id);
    if (!existing) {
      return notFoundResponse("This enquiry could not be found.");
    }

    const body = await request.json();
    const parsed = replySchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    await db.insert(messages).values({
      id: crypto.randomUUID(),
      enquiryId: existing.id,
      senderId: context.user.id,
      content: parsed.data.content,
      isRead: false,
    });

    await db
      .update(enquiries)
      .set({ status: "OPEN", updatedAt: new Date() })
      .where(eq(enquiries.id, existing.id));
    await dispatchNotification({ recipientIds: [existing.landlordId], type: "ENQUIRY_REPLY", category: "ENQUIRY", eventKey: "enquiry.tenant_reply", title: "New tenant reply", message: `${context.user.name} replied about ${existing.property.title}.`, deepLink: `/landlord/enquiries/${existing.id}`, relatedEntityType: "enquiry", relatedEntityId: existing.id, deduplicationKey: `tenant-reply:${existing.id}:${crypto.randomUUID()}` });

    const updated = await getOwnedEnquiry(enquiryId, context.user.id);
    return successResponse(await serializeEnquiryDetail(updated ?? existing, context.user.id));
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      console.error("POST /api/tenant/enquiries/[enquiryId] failed:", error);
      return internalServerErrorResponse();
    }
  }
}
