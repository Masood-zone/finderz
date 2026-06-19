import { apiClient } from "./axios";
import { authClient } from "@/lib/auth-client";
import type { ApiSuccess, CurrentUserResponse } from "@/types/api";

export type UpdateProfileInput = {
  name: string;
  image?: string | null;
  phone?: string | null;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
};

type BetterAuthProfileClient = typeof authClient & {
  $fetch?: (path: string, init: { method: string; body?: Record<string, unknown> }) => Promise<unknown>;
};

const profileClient = authClient as BetterAuthProfileClient;

export async function getCurrentUser() {
  const response = await apiClient.get<ApiSuccess<CurrentUserResponse>>("/api/users/me");
  return response.data.data;
}

export async function updateProfile(input: UpdateProfileInput) {
  if (!profileClient.$fetch) {
    throw new Error("Profile updates are not configured yet.");
  }

  await profileClient.$fetch("/update-user", {
    method: "POST",
    body: input,
  });

  return getCurrentUser();
}

export async function changePassword(input: ChangePasswordInput) {
  if (!profileClient.$fetch) {
    throw new Error("Password updates are not configured yet.");
  }

  await profileClient.$fetch("/change-password", {
    method: "POST",
    body: {
      currentPassword: input.currentPassword,
      newPassword: input.newPassword,
      revokeOtherSessions: input.revokeOtherSessions ?? false,
    },
  });
}
