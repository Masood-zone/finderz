import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { user } from "@/db/schema";
import { guardErrorResponse, requireSession } from "@/lib/auth-guards.server";
import { internalServerErrorResponse, successResponse, validationErrorResponse } from "@/lib/api-response";
import { fullNameSchema } from "@/lib/validation/full-name";

const updateProfileSchema = z.object({
  name: fullNameSchema.optional(),
  image: z.string().url().nullable().optional(),
  phone: z.string().min(3).max(30).nullable().optional(),
});

function serializeUser(currentUser: typeof user.$inferSelect) {
  return {
    id: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    emailVerified: currentUser.emailVerified,
    image: currentUser.image,
    phone: currentUser.phone,
    role: currentUser.role,
    onboardingCompleted: currentUser.onboardingCompleted,
    accountStatus: currentUser.accountStatus,
  };
}

export async function GET(request: Request) {
  try {
    const context = await requireSession(request);

    return successResponse({
      user: serializeUser(context.user),
    });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}

export async function PATCH(request: Request) {
  try {
    const context = await requireSession(request);
    const body = updateProfileSchema.safeParse(await request.json());

    if (!body.success) {
      return validationErrorResponse(body.error);
    }

    const [updatedUser] = await db
      .update(user)
      .set({
        ...body.data,
        updatedAt: new Date(),
      })
      .where(eq(user.id, context.user.id))
      .returning();

    return successResponse({
      user: serializeUser(updatedUser),
    });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
