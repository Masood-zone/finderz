import { authClient, signIn, signUp } from "@/lib/auth-client";
import type { SignInInput, SignUpInput } from "@/lib/auth-client";
import { apiClient } from "./axios";
import type { ApiSuccess } from "@/types/api";

type BetterAuthFlowClient = typeof authClient & {
  requestPasswordReset?: (input: { email: string; redirectTo?: string }) => Promise<unknown>;
  sendVerificationEmail?: (input: { email: string; callbackURL?: string }) => Promise<unknown>;
  $fetch?: (path: string, init: { method: string; body?: Record<string, unknown> }) => Promise<unknown>;
  resetPassword?: (input: { newPassword: string; token: string }) => Promise<{ error?: { message?: string } | null }>;
};

const flowClient = authClient as BetterAuthFlowClient;

export function signInWithEmail(input: SignInInput) {
  return signIn(input);
}

export function signUpWithEmail(input: SignUpInput) {
  return signUp(input);
}

export async function requestPasswordResetOtp(email: string) {
  const response = await apiClient.post<ApiSuccess<{ requested: true }>>("/api/password-reset/request", { email });
  return response.data.data;
}

export async function verifyPasswordResetOtp(email: string, otp: string) {
  const response = await apiClient.post<ApiSuccess<{ resetToken: string }>>("/api/password-reset/verify", { email, otp });
  return response.data.data;
}

export async function resetPasswordWithToken(newPassword: string, token: string) {
  if (!flowClient.resetPassword) throw new Error("Password reset is not available.");
  const result = await flowClient.resetPassword({ newPassword, token });
  if (result.error) throw result.error;
  return result;
}

export async function resendVerificationEmail(email: string) {
  const callbackURL = "finderz://email-verified";

  if (flowClient.sendVerificationEmail) {
    return flowClient.sendVerificationEmail({ email, callbackURL });
  }

  if (flowClient.$fetch) {
    return flowClient.$fetch("/send-verification-email", {
      method: "POST",
      body: { email, callbackURL },
    });
  }

  throw new Error("Email verification delivery is not configured yet.");
}
