import { z } from "zod";
import { errorResponse, internalServerErrorResponse, successResponse, validationErrorResponse } from "@/lib/api-response";
import { verifyPasswordResetOtp } from "@/lib/password-reset.server";

const verifySchema = z.object({
  email: z.email("Enter a valid email address."),
  otp: z.string().regex(/^\d{6}$/, "Enter the six-digit verification code."),
});

export async function POST(request: Request) {
  try {
    const body = verifySchema.safeParse(await request.json().catch(() => null));
    if (!body.success) return validationErrorResponse(body.error);

    const resetToken = await verifyPasswordResetOtp({
      email: body.data.email,
      otp: body.data.otp,
    });

    if (!resetToken) {
      return errorResponse("INVALID_RESET_CODE", "That code is invalid or has expired. Request a new code and try again.", 400);
    }

    return successResponse({ resetToken }, { message: "Code verified." });
  } catch (error) {
    console.error("POST /api/password-reset/verify failed:", error);
    return internalServerErrorResponse();
  }
}
