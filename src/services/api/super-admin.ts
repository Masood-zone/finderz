import { apiClient } from "./axios";
import type { ApiSuccess, DashboardStats } from "@/types/api";

export async function getSuperAdminDashboard() {
  const response = await apiClient.get<ApiSuccess<DashboardStats>>("/api/super-admin/dashboard");
  return response.data.data;
}
