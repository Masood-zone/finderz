import { apiClient } from "./axios";
import type {
  TenantEnquiryDetailResponse,
  TenantEnquiryListResponse,
  TenantEnquiryStatusFilter,
  TenantFavouriteListResponse,
  TenantFeedResponse,
  TenantFilters,
  TenantProfileResponse,
  TenantPropertyDetailResponse,
  TenantPropertySearchResponse,
} from "@/types/tenant";
import type { ApiSuccess } from "@/types/api";

function requireId(value: string, label: string) {
  if (!value) {
    throw new Error(`${label} is required.`);
  }
}

function toParams(filters: TenantFilters) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(","));
      return;
    }

    params.set(key, String(value));
  });

  return params.toString();
}

export async function getTenantFeed(filters: Pick<TenantFilters, "latitude" | "longitude" | "radiusKm" | "city" | "region" | "area"> = {}) {
  const query = toParams(filters);
  const response = await apiClient.get<ApiSuccess<TenantFeedResponse>>(`/api/tenant/feed${query ? `?${query}` : ""}`);
  return response.data.data;
}

export async function searchTenantProperties(filters: TenantFilters) {
  const query = toParams(filters);
  const response = await apiClient.get<ApiSuccess<TenantPropertySearchResponse>>(`/api/tenant/properties${query ? `?${query}` : ""}`);
  return response.data.data;
}

export async function getTenantProperty(propertyId: string) {
  requireId(propertyId, "Property ID");
  const response = await apiClient.get<ApiSuccess<TenantPropertyDetailResponse>>(`/api/tenant/properties/${propertyId}`);
  return response.data.data;
}

export async function getTenantFavourites() {
  const response = await apiClient.get<ApiSuccess<TenantFavouriteListResponse>>("/api/tenant/favourites");
  return response.data.data;
}

export async function addTenantFavourite(propertyId: string) {
  const response = await apiClient.post<ApiSuccess<{ propertyId: string; isFavourite: boolean }>>("/api/tenant/favourites", { propertyId });
  return response.data.data;
}

export async function removeTenantFavourite(propertyId: string) {
  const response = await apiClient.delete<ApiSuccess<{ propertyId: string; isFavourite: boolean }>>("/api/tenant/favourites", { data: { propertyId } });
  return response.data.data;
}

export async function getTenantEnquiries(status: TenantEnquiryStatusFilter = "active") {
  const response = await apiClient.get<ApiSuccess<TenantEnquiryListResponse>>(`/api/tenant/enquiries?status=${status}`);
  return response.data.data;
}

export async function getTenantEnquiry(enquiryId: string) {
  requireId(enquiryId, "Enquiry ID");
  const response = await apiClient.get<ApiSuccess<TenantEnquiryDetailResponse>>(`/api/tenant/enquiries/${enquiryId}`);
  return response.data.data;
}

export async function createTenantEnquiry(input: { propertyId: string; message: string; preferredContactMethod?: string; preferredInspectionDate?: string }) {
  const response = await apiClient.post<ApiSuccess<{ enquiryId: string }>>("/api/tenant/enquiries", input);
  return response.data.data;
}

export async function getTenantProfile() {
  const response = await apiClient.get<ApiSuccess<TenantProfileResponse>>("/api/tenant/profile");
  return response.data.data;
}
