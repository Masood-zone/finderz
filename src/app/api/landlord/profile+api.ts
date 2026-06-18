import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { landlordProfiles, user } from "@/db/schema";
import { internalServerErrorResponse, successResponse, validationErrorResponse } from "@/lib/api-response";
import { guardErrorResponse, requireLandlord } from "@/lib/auth-guards.server";
import { getLandlordProfileForUser } from "@/lib/landlord/landlord.server";

const onboardingSchema = z.object({
  legalName: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(7).max(30),
  profileImage: z
    .object({
      secureUrl: z.string().url(),
    })
    .nullable()
    .optional(),
  landlordType: z.enum(["INDIVIDUAL", "AGENCY"]),
  agencyName: z.string().trim().max(160).nullable().optional(),
  address: z.string().trim().min(3).max(240),
  preferredContactMethod: z.enum(["PHONE", "WHATSAPP", "EMAIL", "IN_APP"]),
  identityDocumentType: z.string().trim().min(2).max(80),
  identityDocument: z.object({
    secureUrl: z.string().url(),
    publicId: z.string().nullable().optional(),
  }),
});

function serializeProfile(profile: typeof landlordProfiles.$inferSelect | null) {
  if (!profile) return null;
  return {
    id: profile.id,
    legalName: profile.legalName,
    landlordType: profile.landlordType,
    agencyName: profile.agencyName,
    address: profile.address,
    preferredContactMethod: profile.preferredContactMethod,
    identityDocumentType: profile.identityDocumentType,
    verificationStatus: profile.verificationStatus,
    verificationNotes: profile.verificationNotes,
    verifiedAt: profile.verifiedAt?.toISOString() ?? null,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}

export async function GET(request: Request) {
  try {
    const context = await requireLandlord(request);
    const profile = await getLandlordProfileForUser(context.user.id);

    return successResponse({
      user: {
        id: context.user.id,
        name: context.user.name,
        email: context.user.email,
        phone: context.user.phone,
        role: context.user.role,
        onboardingCompleted: context.user.onboardingCompleted,
        accountStatus: context.user.accountStatus,
        image: context.user.image,
        emailVerified: context.user.emailVerified,
      },
      profile: serializeProfile(profile ?? null),
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
    const context = await requireLandlord(request);
    const parsed = onboardingSchema.safeParse(await request.json());

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const now = new Date();
    const existing = await getLandlordProfileForUser(context.user.id);
    const profileValues = {
      legalName: parsed.data.legalName,
      landlordType: parsed.data.landlordType,
      agencyName: parsed.data.landlordType === "AGENCY" ? (parsed.data.agencyName ?? null) : null,
      address: parsed.data.address,
      preferredContactMethod: parsed.data.preferredContactMethod,
      identityDocumentType: parsed.data.identityDocumentType,
      identityDocumentUrl: parsed.data.identityDocument.secureUrl,
      identityDocumentPublicId: parsed.data.identityDocument.publicId ?? null,
      verificationStatus: "PENDING" as const,
      verificationNotes: null,
      verifiedAt: null,
      updatedAt: now,
    };

    const [profile] = existing
      ? await db.update(landlordProfiles).set(profileValues).where(eq(landlordProfiles.id, existing.id)).returning()
      : await db
          .insert(landlordProfiles)
          .values({
            id: crypto.randomUUID(),
            userId: context.user.id,
            ...profileValues,
          })
          .returning();

    await db
      .update(user)
      .set({
        name: parsed.data.legalName,
        phone: parsed.data.phone,
        image: parsed.data.profileImage?.secureUrl ?? context.user.image,
        onboardingCompleted: true,
        updatedAt: now,
      })
      .where(eq(user.id, context.user.id));

    return successResponse({ profile: serializeProfile(profile) }, { status: existing ? 200 : 201 });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
