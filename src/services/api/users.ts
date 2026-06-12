import { apiClient } from "./axios";
import type { ApiSuccess, CurrentUserResponse } from "@/types/api";

export type UpdateProfileInput = {
  name?: string;
  phone?: string | null;
};

export async function getCurrentUser() {
  const response = await apiClient.get<ApiSuccess<CurrentUserResponse>>("/api/users/me");
  return response.data.data;
}

export async function updateProfile(input: UpdateProfileInput) {
  const response = await apiClient.patch<ApiSuccess<CurrentUserResponse>>("/api/users/me", input);
  return response.data.data;
}
