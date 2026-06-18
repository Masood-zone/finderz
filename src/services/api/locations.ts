import { apiClient } from "./axios";
import type { ApiSuccess } from "@/types/api";
import type { GhanaLocationsResponse } from "@/types/locations";

export async function getGhanaLocations() {
  const response = await apiClient.get<ApiSuccess<GhanaLocationsResponse>>("/api/locations/ghana");
  return response.data.data;
}
