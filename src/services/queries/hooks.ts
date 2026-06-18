import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assignRole } from "@/services/api/onboarding";
import { getGhanaLocations } from "@/services/api/locations";
import {
  deleteLandlordProperty,
  duplicateLandlordProperty,
  getLandlordDashboard,
  getLandlordEnquiries,
  getLandlordProfile,
  getLandlordProperties,
  getLandlordProperty,
  getLandlordVerificationStatus,
  markLandlordPropertyAsRented,
  saveLandlordProperty,
  submitLandlordOnboarding,
} from "@/services/api/landlord";
import { getSuperAdminDashboard } from "@/services/api/super-admin";
import { getTenantDashboard } from "@/services/api/tenant";
import {
  addTenantFavourite,
  createTenantEnquiry,
  getTenantEnquiries,
  getTenantEnquiry,
  getTenantFavourites,
  getTenantFeed,
  getTenantProfile,
  getTenantProperty,
  removeTenantFavourite,
  searchTenantProperties,
} from "@/services/api/tenant-app";
import { getCurrentUser, updateProfile } from "@/services/api/users";
import { queryKeys } from "./keys";
import type { TenantEnquiryStatusFilter, TenantFilters } from "@/types/tenant";
import type { LandlordPropertyStatus, SaveLandlordPropertyInput } from "@/types/landlord";

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: getCurrentUser,
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });
}

export function useTenantDashboard() {
  return useQuery({
    queryKey: queryKeys.tenantDashboard,
    queryFn: getTenantDashboard,
  });
}

export function useTenantFeed() {
  return useQuery({
    queryKey: queryKeys.tenantFeed,
    queryFn: getTenantFeed,
  });
}

export function useTenantProperties(filters: TenantFilters) {
  return useQuery({
    queryKey: queryKeys.tenantProperties(filters),
    queryFn: () => searchTenantProperties(filters),
  });
}

export function useTenantProperty(propertyId: string) {
  return useQuery({
    queryKey: queryKeys.tenantProperty(propertyId),
    queryFn: () => getTenantProperty(propertyId),
    enabled: Boolean(propertyId),
  });
}

export function useTenantFavourites() {
  return useQuery({
    queryKey: queryKeys.tenantFavourites,
    queryFn: getTenantFavourites,
  });
}

export function useTenantEnquiries(status: TenantEnquiryStatusFilter) {
  return useQuery({
    queryKey: queryKeys.tenantEnquiries(status),
    queryFn: () => getTenantEnquiries(status),
  });
}

export function useTenantEnquiry(enquiryId: string) {
  return useQuery({
    queryKey: queryKeys.tenantEnquiry(enquiryId),
    queryFn: () => getTenantEnquiry(enquiryId),
    enabled: Boolean(enquiryId),
  });
}

export function useTenantProfile() {
  return useQuery({
    queryKey: queryKeys.tenantProfile,
    queryFn: getTenantProfile,
  });
}

export function useToggleTenantFavourite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ propertyId, favourite }: { propertyId: string; favourite: boolean }) =>
      favourite ? addTenantFavourite(propertyId) : removeTenantFavourite(propertyId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenantFeed });
      queryClient.invalidateQueries({ queryKey: queryKeys.tenantFavourites });
      queryClient.invalidateQueries({ queryKey: queryKeys.tenantProperty(variables.propertyId) });
      queryClient.invalidateQueries({ queryKey: ["tenant-properties"] });
    },
  });
}

export function useCreateTenantEnquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTenantEnquiry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-enquiries"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.tenantProfile });
    },
  });
}

export function useLandlordDashboard() {
  return useQuery({
    queryKey: queryKeys.landlordDashboard,
    queryFn: getLandlordDashboard,
  });
}

export function useLandlordProfile() {
  return useQuery({
    queryKey: queryKeys.landlordProfile,
    queryFn: getLandlordProfile,
  });
}

export function useSubmitLandlordOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitLandlordOnboarding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.landlordProfile });
      queryClient.invalidateQueries({ queryKey: queryKeys.landlordVerification });
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });
}

export function useLandlordVerificationStatus() {
  return useQuery({
    queryKey: queryKeys.landlordVerification,
    queryFn: getLandlordVerificationStatus,
  });
}

export function useLandlordProperties(status: LandlordPropertyStatus = "all") {
  return useQuery({
    queryKey: queryKeys.landlordProperties(status),
    queryFn: () => getLandlordProperties(status),
  });
}

export function useLandlordProperty(propertyId: string) {
  return useQuery({
    queryKey: queryKeys.landlordProperty(propertyId),
    queryFn: () => getLandlordProperty(propertyId),
    enabled: Boolean(propertyId),
  });
}

export function useSaveLandlordProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SaveLandlordPropertyInput) => saveLandlordProperty(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["landlord-properties"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.landlordDashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.landlordProperty(data.property.id) });
    },
  });
}

export function useLandlordPropertyAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ propertyId, action }: { propertyId: string; action: "mark-rented" | "duplicate" | "delete" }) => {
      if (action === "mark-rented") return markLandlordPropertyAsRented(propertyId);
      if (action === "duplicate") return duplicateLandlordProperty(propertyId);
      await deleteLandlordProperty(propertyId);
      return { property: null };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-properties"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.landlordDashboard });
    },
  });
}

export function useLandlordEnquiries() {
  return useQuery({
    queryKey: queryKeys.landlordEnquiries,
    queryFn: getLandlordEnquiries,
  });
}

export function useGhanaLocations() {
  return useQuery({
    queryKey: queryKeys.ghanaLocations,
    queryFn: getGhanaLocations,
    staleTime: 1000 * 60 * 60,
  });
}

export function useSuperAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.superAdminDashboard,
    queryFn: getSuperAdminDashboard,
  });
}
