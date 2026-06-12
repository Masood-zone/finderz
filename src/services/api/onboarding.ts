import { apiClient } from "./axios";
import type { ApiSuccess, CurrentUserResponse } from "@/types/api";
import type { PublicOnboardingRole } from "@/types/auth";

export type AssignRoleInput = {
  role: PublicOnboardingRole;
};

export async function assignRole(input: AssignRoleInput) {
  const response = await apiClient.post<ApiSuccess<CurrentUserResponse>>("/api/onboarding/role", input);
  return response.data.data;
}
