import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assignRole } from "@/services/api/onboarding";
import { getLandlordDashboard } from "@/services/api/landlord";
import { getSuperAdminDashboard } from "@/services/api/super-admin";
import { getTenantDashboard } from "@/services/api/tenant";
import { getCurrentUser, updateProfile } from "@/services/api/users";
import { queryKeys } from "./keys";

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

export function useLandlordDashboard() {
  return useQuery({
    queryKey: queryKeys.landlordDashboard,
    queryFn: getLandlordDashboard,
  });
}

export function useSuperAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.superAdminDashboard,
    queryFn: getSuperAdminDashboard,
  });
}
