import { z } from "zod";
import { auth } from "@/lib/auth";
import { successResponse, validationErrorResponse } from "@/lib/api-response";

const requestSchema = z.object({
  email: z.email("Enter a valid email address."),
});

const genericMessage = "If that email is registered, a verification code has been sent.";

export async function POST(request: Request) {
  const body = requestSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return validationErrorResponse(body.error);

  try {
    await auth.api.requestPasswordReset({
      body: { email: body.data.email.trim().toLowerCase() },
    });
  } catch (error) {
    // Keep the public response account-enumeration safe. Delivery failures remain visible in server logs.
    console.error("POST /api/password-reset/request failed:", error);
  }

  return successResponse({ requested: true }, { message: genericMessage });
}
