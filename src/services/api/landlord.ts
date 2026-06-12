import { apiClient } from "./axios";
import type { ApiSuccess, DashboardStats } from "@/types/api";

export async function getLandlordDashboard() {
  const response = await apiClient.get<ApiSuccess<DashboardStats>>("/api/landlord/dashboard");
  return response.data.data;
}
