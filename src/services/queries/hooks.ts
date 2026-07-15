import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assignRole } from "@/services/api/onboarding";
import { getGhanaLocations } from "@/services/api/locations";
import {
  deleteLandlordProperty,
  duplicateLandlordProperty,
  getLandlordDashboard,
  getLandlordEnquiries,
  getLandlordEnquiry,
  getLandlordProfile,
  getLandlordProperties,
  getLandlordProperty,
  getLandlordVerificationStatus,
  markLandlordPropertyAsRented,
  replyToLandlordEnquiry,
  saveLandlordProperty,
  submitLandlordOnboarding,
} from "@/services/api/landlord";
import {
  getSuperAdminApprovals,
  getSuperAdminDashboard,
  getSuperAdminLandlordVerification,
  getSuperAdminLandlordVerifications,
  getSuperAdminNotifications,
  getSuperAdminProperty,
  getSuperAdminReports,
  getSuperAdminUsers,
  moderateSuperAdminProperty,
  moderateSuperAdminLandlordVerification,
  moderateSuperAdminReport,
  moderateSuperAdminUser,
  updateSuperAdminNotifications,
} from "@/services/api/super-admin";
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
  replyToTenantEnquiry,
  reportTenantProperty,
  searchTenantProperties,
} from "@/services/api/tenant-app";
import { changePassword, getCurrentUser, updateProfile } from "@/services/api/users";
import { getNotificationPreferences, getNotifications, markNotificationRead, updateNotificationPreference } from "@/services/api/notifications";
import type { NotificationPreference } from "@/types/notifications";
import { queryKeys } from "./keys";
import type { TenantEnquiryStatusFilter, TenantFilters } from "@/types/tenant";
import type { LandlordPropertyStatus, SaveLandlordPropertyInput } from "@/types/landlord";
import type { LandlordVerificationAction, PropertyModerationAction, ReportModerationAction, UserModerationAction } from "@/types/super-admin";

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
      queryClient.invalidateQueries();
    },
  });
}

export function useNotifications() { return useQuery({ queryKey: queryKeys.notifications, queryFn: () => getNotifications() }); }
export function useNotificationAction() { const client = useQueryClient(); return useMutation({ mutationFn: (id?: string) => markNotificationRead(id), onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.notifications }) }); }
export function useNotificationPreferences() { return useQuery({ queryKey: queryKeys.notificationPreferences, queryFn: getNotificationPreferences }); }
export function useUpdateNotificationPreference() { const client = useQueryClient(); return useMutation({ mutationFn: (input: NotificationPreference) => updateNotificationPreference(input), onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.notificationPreferences }) }); }

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
  });
}

export function useTenantDashboard() {
  return useQuery({
    queryKey: queryKeys.tenantDashboard,
    queryFn: getTenantDashboard,
  });
}

export function useTenantFeed(filters: Pick<TenantFilters, "latitude" | "longitude" | "radiusKm" | "city" | "region" | "area"> = {}) {
  return useQuery({
    queryKey: queryKeys.tenantFeed(filters),
    queryFn: () => getTenantFeed(filters),
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
      queryClient.invalidateQueries({ queryKey: ["tenant-feed"] });
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tenant-enquiries"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.tenantProfile });
      queryClient.invalidateQueries({ queryKey: queryKeys.tenantProperty(variables.propertyId) });
      queryClient.invalidateQueries({ queryKey: ["tenant-feed"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-properties"] });
    },
  });
}

export function useReportTenantProperty() { return useMutation({ mutationFn: reportTenantProperty }); }

export function useReplyTenantEnquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ enquiryId, content }: { enquiryId: string; content: string }) => replyToTenantEnquiry(enquiryId, content),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.tenantEnquiry(variables.enquiryId), data);
      queryClient.invalidateQueries({ queryKey: ["tenant-enquiries"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.tenantProfile });
      queryClient.invalidateQueries({ queryKey: ["tenant-feed"] });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.landlordDashboard });
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

export function useLandlordEnquiry(enquiryId: string) {
  return useQuery({
    queryKey: queryKeys.landlordEnquiry(enquiryId),
    queryFn: () => getLandlordEnquiry(enquiryId),
    enabled: Boolean(enquiryId),
  });
}

export function useReplyLandlordEnquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ enquiryId, content }: { enquiryId: string; content: string }) => replyToLandlordEnquiry(enquiryId, content),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.landlordEnquiry(variables.enquiryId), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.landlordEnquiries });
      queryClient.invalidateQueries({ queryKey: queryKeys.landlordDashboard });
    },
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

export function useSuperAdminApprovals(filters: { page?: number; pageSize?: number; q?: string; location?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.superAdminApprovals(filters),
    queryFn: () => getSuperAdminApprovals(filters),
  });
}

export function useSuperAdminProperty(propertyId: string) {
  return useQuery({
    queryKey: queryKeys.superAdminProperty(propertyId),
    queryFn: () => getSuperAdminProperty(propertyId),
    enabled: Boolean(propertyId),
  });
}

export function useSuperAdminPropertyAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { propertyId: string; action: PropertyModerationAction; reason?: string }) => moderateSuperAdminProperty(input),
    onSuccess: (data, variables) => {
      if (data.property) {
        queryClient.setQueryData(queryKeys.superAdminProperty(variables.propertyId), data);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.superAdminDashboard });
      queryClient.invalidateQueries({ queryKey: ["super-admin-approvals"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.superAdminProperty(variables.propertyId) });
      queryClient.invalidateQueries({ queryKey: ["super-admin-reports"] });
    },
  });
}

export function useSuperAdminLandlordVerifications(filters: { page?: number; pageSize?: number; status?: string; q?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.superAdminLandlordVerifications(filters),
    queryFn: () => getSuperAdminLandlordVerifications(filters),
  });
}

export function useSuperAdminLandlordVerification(profileId: string) {
  return useQuery({
    queryKey: queryKeys.superAdminLandlordVerification(profileId),
    queryFn: () => getSuperAdminLandlordVerification(profileId),
    enabled: Boolean(profileId),
  });
}

export function useSuperAdminLandlordVerificationAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { profileId: string; action: LandlordVerificationAction; reason?: string }) => moderateSuperAdminLandlordVerification(input),
    onSuccess: (data, variables) => {
      if (data.verification) {
        queryClient.setQueryData(queryKeys.superAdminLandlordVerification(variables.profileId), data);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.superAdminDashboard });
      queryClient.invalidateQueries({ queryKey: ["super-admin-landlord-verifications"] });
      queryClient.invalidateQueries({ queryKey: ["super-admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["super-admin-notifications"] });
    },
  });
}

export function useSuperAdminReports(filters: { page?: number; pageSize?: number; status?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.superAdminReports(filters),
    queryFn: () => getSuperAdminReports(filters),
  });
}

export function useSuperAdminReportAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { reportId: string; action: ReportModerationAction; reason?: string }) => moderateSuperAdminReport(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.superAdminDashboard });
      queryClient.invalidateQueries({ queryKey: ["super-admin-reports"] });
      queryClient.invalidateQueries({ queryKey: ["super-admin-approvals"] });
    },
  });
}

export function useSuperAdminUsers(filters: { page?: number; pageSize?: number; filter?: string; q?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.superAdminUsers(filters),
    queryFn: () => getSuperAdminUsers(filters),
  });
}

export function useSuperAdminUserAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { userId: string; action: UserModerationAction; reason?: string }) => moderateSuperAdminUser(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.superAdminDashboard });
      queryClient.invalidateQueries({ queryKey: ["super-admin-users"] });
    },
  });
}

export function useSuperAdminNotifications(filters: { page?: number; pageSize?: number } = {}) {
  return useQuery({
    queryKey: queryKeys.superAdminNotifications(filters),
    queryFn: () => getSuperAdminNotifications(filters),
  });
}

export function useSuperAdminNotificationAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { action: "mark_read" | "mark_all_read"; notificationId?: string }) => updateSuperAdminNotifications(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin-notifications"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.superAdminDashboard });
    },
  });
}
