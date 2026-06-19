import { apiClient } from "./axios";
import type { ApiSuccess } from "@/types/api";
import type {
  PropertyModerationAction,
  ReportModerationAction,
  SuperAdminDashboardResponse,
  SuperAdminListResponse,
  SuperAdminNotification,
  SuperAdminPropertyDetail,
  SuperAdminPropertySummary,
  SuperAdminReport,
  SuperAdminUser,
  UserModerationAction,
} from "@/types/super-admin";

function requireId(value: string, label: string) {
  if (!value) {
    throw new Error(`${label} is required.`);
  }
}

type ListParams = {
  page?: number;
  pageSize?: number;
  filter?: string;
  status?: string;
  q?: string;
  location?: string;
};

function params(input: ListParams = {}) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined && value !== "")) as Record<string, string | number>;
}

export async function getSuperAdminDashboard() {
  const response = await apiClient.get<ApiSuccess<SuperAdminDashboardResponse>>("/api/super-admin/dashboard");
  return response.data.data;
}

export async function getSuperAdminApprovals(input: ListParams = {}) {
  const response = await apiClient.get<ApiSuccess<SuperAdminListResponse<SuperAdminPropertySummary>>>("/api/super-admin/approvals", {
    params: params(input),
  });
  return response.data.data;
}

export async function getSuperAdminProperty(propertyId: string) {
  requireId(propertyId, "Property ID");
  const response = await apiClient.get<ApiSuccess<{ property: SuperAdminPropertyDetail }>>(`/api/super-admin/approvals/${propertyId}`);
  return response.data.data;
}

export async function moderateSuperAdminProperty(input: { propertyId: string; action: PropertyModerationAction; reason?: string }) {
  requireId(input.propertyId, "Property ID");
  const response = await apiClient.patch<ApiSuccess<{ property: SuperAdminPropertyDetail }>>(`/api/super-admin/approvals/${input.propertyId}`, {
    action: input.action,
    reason: input.reason,
  });
  return response.data.data;
}

export async function getSuperAdminReports(input: ListParams = {}) {
  const response = await apiClient.get<ApiSuccess<SuperAdminListResponse<SuperAdminReport>>>("/api/super-admin/reports", {
    params: params(input),
  });
  return response.data.data;
}

export async function moderateSuperAdminReport(input: { reportId: string; action: ReportModerationAction; reason?: string }) {
  requireId(input.reportId, "Report ID");
  const response = await apiClient.patch<ApiSuccess<{ report: SuperAdminReport | null }>>(`/api/super-admin/reports/${input.reportId}`, {
    action: input.action,
    reason: input.reason,
  });
  return response.data.data;
}

export async function getSuperAdminUsers(input: ListParams = {}) {
  const response = await apiClient.get<ApiSuccess<SuperAdminListResponse<SuperAdminUser>>>("/api/super-admin/users", {
    params: params(input),
  });
  return response.data.data;
}

export async function moderateSuperAdminUser(input: { userId: string; action: UserModerationAction; reason?: string }) {
  requireId(input.userId, "User ID");
  const response = await apiClient.patch<ApiSuccess<{ user: SuperAdminUser }>>(`/api/super-admin/users/${input.userId}`, {
    action: input.action,
    reason: input.reason,
  });
  return response.data.data;
}

export async function getSuperAdminNotifications(input: ListParams = {}) {
  const response = await apiClient.get<ApiSuccess<SuperAdminListResponse<SuperAdminNotification>>>("/api/super-admin/notifications", {
    params: params(input),
  });
  return response.data.data;
}

export async function updateSuperAdminNotifications(input: { action: "mark_read" | "mark_all_read"; notificationId?: string }) {
  const response = await apiClient.patch<ApiSuccess<{ notifications: SuperAdminNotification[] }>>("/api/super-admin/notifications", input);
  return response.data.data;
}
