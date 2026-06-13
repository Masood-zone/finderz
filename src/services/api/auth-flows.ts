import { authClient, signIn, signUp } from "@/lib/auth-client";
import type { SignInInput, SignUpInput } from "@/lib/auth-client";

type BetterAuthFlowClient = typeof authClient & {
  requestPasswordReset?: (input: { email: string; redirectTo?: string }) => Promise<unknown>;
  sendVerificationEmail?: (input: { email: string; callbackURL?: string }) => Promise<unknown>;
  $fetch?: (path: string, init: { method: string; body?: Record<string, unknown> }) => Promise<unknown>;
};

const flowClient = authClient as BetterAuthFlowClient;

export function signInWithEmail(input: SignInInput) {
  return signIn(input);
}

export function signUpWithEmail(input: SignUpInput) {
  return signUp(input);
}

export async function requestPasswordResetEmail(email: string) {
  const redirectTo = "finderz://reset-password";

  if (flowClient.requestPasswordReset) {
    return flowClient.requestPasswordReset({ email, redirectTo });
  }

  if (flowClient.$fetch) {
    return flowClient.$fetch("/request-password-reset", {
      method: "POST",
      body: { email, redirectTo },
    });
  }

  throw new Error("Password reset email delivery is not configured yet.");
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
