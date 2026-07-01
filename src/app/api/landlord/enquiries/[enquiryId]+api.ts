import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { enquiries, messages, properties, user } from "@/db/schema";
import { badRequestResponse, internalServerErrorResponse, notFoundResponse, successResponse, validationErrorResponse } from "@/lib/api-response";
import { guardErrorResponse, requireLandlord } from "@/lib/auth-guards.server";
import type { LandlordEnquiryDetailResponse } from "@/types/landlord";

type RouteParams = {
  enquiryId: string;
};

type LandlordEnquiryDetailRow = typeof enquiries.$inferSelect & {
  tenant: typeof user.$inferSelect;
  property: typeof properties.$inferSelect;
  messages?: (typeof messages.$inferSelect)[];
};

const replySchema = z.object({
  content: z.string().trim().min(1, "Enter a message.").max(1000, "Message is too long."),
});

function serializeEnquiry(row: LandlordEnquiryDetailRow): LandlordEnquiryDetailResponse {
  const sortedMessages = [...(row.messages ?? [])].sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime());

  return {
    enquiry: {
      id: row.id,
      status: row.status,
      preferredContactMethod: row.preferredContactMethod,
      preferredInspectionDate: row.preferredInspectionDate?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      tenant: {
        id: row.tenant.id,
        name: row.tenant.name,
        email: row.tenant.email,
        phone: row.tenant.phone,
        image: row.tenant.image,
      },
      property: {
        id: row.property.id,
        title: row.property.title,
        area: row.property.area,
        city: row.property.city,
      },
    },
    messages: sortedMessages.map((message) => ({
      id: message.id,
      senderId: message.senderId,
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt.toISOString(),
    })),
  };
}

async function getOwnedEnquiry(enquiryId: string, landlordId: string) {
  const row = await db.query.enquiries.findFirst({
    where: eq(enquiries.id, enquiryId),
    with: {
      tenant: true,
      property: true,
      messages: true,
    },
  });

  const enquiry = row as LandlordEnquiryDetailRow | undefined;
  if (!enquiry || enquiry.landlordId !== landlordId) {
    return null;
  }

  return enquiry;
}

export async function GET(request: Request, { enquiryId }: RouteParams) {
  try {
    const context = await requireLandlord(request);

    if (!enquiryId) {
      return badRequestResponse("Enquiry ID is required.");
    }

    const enquiry = await getOwnedEnquiry(enquiryId, context.user.id);
    if (!enquiry) {
      return notFoundResponse("This enquiry could not be found.");
    }

    return successResponse(serializeEnquiry(enquiry));
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      console.error("GET /api/landlord/enquiries/[enquiryId] failed:", error);
      return internalServerErrorResponse();
    }
  }
}

export async function POST(request: Request, { enquiryId }: RouteParams) {
  try {
    const context = await requireLandlord(request);

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
      .set({ status: "RESPONDED", updatedAt: new Date() })
      .where(eq(enquiries.id, existing.id));

    const updated = await getOwnedEnquiry(enquiryId, context.user.id);
    return successResponse(serializeEnquiry(updated ?? existing));
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      console.error("POST /api/landlord/enquiries/[enquiryId] failed:", error);
      return internalServerErrorResponse();
    }
  }
}
