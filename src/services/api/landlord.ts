import { apiClient } from "./axios";
import type { ApiSuccess } from "@/types/api";
import type {
  LandlordDashboardResponse,
  LandlordEnquiry,
  LandlordOnboardingInput,
  LandlordProfileResponse,
  LandlordProperty,
  LandlordPropertyListResponse,
  LandlordPropertyStatus,
  LandlordVerificationResponse,
  SaveLandlordPropertyInput,
} from "@/types/landlord";

function requireId(value: string, label: string) {
  if (!value) {
    throw new Error(`${label} is required.`);
  }
}

export async function getLandlordDashboard() {
  const response = await apiClient.get<ApiSuccess<LandlordDashboardResponse>>("/api/landlord/dashboard");
  return response.data.data;
}

export async function getLandlordProfile() {
  const response = await apiClient.get<ApiSuccess<LandlordProfileResponse>>("/api/landlord/profile");
  return response.data.data;
}

export async function submitLandlordOnboarding(input: LandlordOnboardingInput) {
  const response = await apiClient.post<ApiSuccess<Pick<LandlordProfileResponse, "profile">>>("/api/landlord/profile", input);
  return response.data.data;
}

export async function getLandlordVerificationStatus() {
  const response = await apiClient.get<ApiSuccess<LandlordVerificationResponse>>("/api/landlord/verification");
  return response.data.data;
}

export async function getLandlordProperties(status: LandlordPropertyStatus = "all") {
  const response = await apiClient.get<ApiSuccess<LandlordPropertyListResponse>>(`/api/landlord/properties?status=${status}`);
  return response.data.data;
}

export async function getLandlordProperty(propertyId: string) {
  requireId(propertyId, "Property ID");
  const response = await apiClient.get<ApiSuccess<{ property: LandlordProperty }>>(`/api/landlord/properties/${propertyId}`);
  return response.data.data;
}

export async function saveLandlordProperty(input: SaveLandlordPropertyInput) {
  const { id, ...body } = input;
  if (id) {
    requireId(id, "Property ID");
    const response = await apiClient.patch<ApiSuccess<{ property: LandlordProperty }>>(`/api/landlord/properties/${id}`, body);
    return response.data.data;
  }

  const response = await apiClient.post<ApiSuccess<{ property: LandlordProperty }>>("/api/landlord/properties", body);
  return response.data.data;
}

export async function markLandlordPropertyAsRented(propertyId: string) {
  requireId(propertyId, "Property ID");
  const response = await apiClient.patch<ApiSuccess<{ property: LandlordProperty }>>(`/api/landlord/properties/${propertyId}`, {
    action: "mark-rented",
  });
  return response.data.data;
}

export async function duplicateLandlordProperty(propertyId: string) {
  requireId(propertyId, "Property ID");
  const response = await apiClient.post<ApiSuccess<{ property: LandlordProperty }>>(`/api/landlord/properties/${propertyId}`, {
    action: "duplicate",
  });
  return response.data.data;
}

export async function deleteLandlordProperty(propertyId: string) {
  requireId(propertyId, "Property ID");
  const response = await apiClient.delete<ApiSuccess<{ propertyId: string }>>(`/api/landlord/properties/${propertyId}`);
  return response.data.data;
}

export async function getLandlordEnquiries() {
  const response = await apiClient.get<ApiSuccess<{ enquiries: LandlordEnquiry[] }>>("/api/landlord/enquiries");
  return response.data.data;
}
