import { apiClient } from "./axios";
import type { ApiSuccess, DashboardStats } from "@/types/api";

export async function getTenantDashboard() {
  const response = await apiClient.get<ApiSuccess<DashboardStats>>("/api/tenant/dashboard");
  return response.data.data;
}
