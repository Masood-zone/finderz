import { eq } from "drizzle-orm";
import { db } from "@/db";
import { enquiries, messages, properties, propertyImages, user } from "@/db/schema";
import { badRequestResponse, internalServerErrorResponse, notFoundResponse, successResponse } from "@/lib/api-response";
import { guardErrorResponse, requireTenant } from "@/lib/auth-guards.server";
import type { TenantEnquiry } from "@/types/tenant";
import { serializeProperties } from "@/lib/tenant/property-serializer.server";

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

export async function GET(request: Request, { enquiryId }: RouteParams) {
  try {
    const context = await requireTenant(request);

    if (!enquiryId) {
      return badRequestResponse("Enquiry ID is required.");
    }

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

    if (!enquiryRow || enquiryRow.tenantId !== context.user.id) {
      return notFoundResponse("This enquiry could not be found.");
    }

    const [property] = await serializeProperties([enquiryRow.property], context.user.id);
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
      unreadCount: sortedMessages.filter((message) => message.senderId !== context.user.id && !message.isRead).length,
    };

    return successResponse({
      enquiry,
      messages: sortedMessages.map((message) => ({
        id: message.id,
        senderId: message.senderId,
        content: message.content,
        isRead: message.isRead,
        createdAt: message.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      console.error("GET /api/tenant/enquiries/[enquiryId] failed:", error);
      return internalServerErrorResponse();
    }
  }
}
