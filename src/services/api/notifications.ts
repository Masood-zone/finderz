import { apiClient } from "./axios";
import type { ApiSuccess } from "@/types/api";
import type { AppNotification, NotificationPreference } from "@/types/notifications";
export type NotificationList = { notifications: AppNotification[]; unreadCount: number; pagination: { page: number; pageSize: number; total: number } };
export async function getNotifications(page = 1) { const { data } = await apiClient.get<ApiSuccess<NotificationList>>("/api/notifications", { params: { page } }); return data.data; }
export async function markNotificationRead(notificationId?: string) { const { data } = await apiClient.patch<ApiSuccess<{ updated: boolean }>>("/api/notifications", notificationId ? { action: "mark_read", notificationId } : { action: "mark_all_read" }); return data.data; }
export async function getNotificationPreferences() { const { data } = await apiClient.get<ApiSuccess<{ preferences: NotificationPreference[] }>>("/api/notification-preferences"); return data.data; }
export async function updateNotificationPreference(input: NotificationPreference) { const { data } = await apiClient.put<ApiSuccess<{ preference: NotificationPreference }>>("/api/notification-preferences", input); return data.data; }
export async function registerPushToken(input: { token: string; platform: "android" | "ios" | "web"; deviceId?: string }) { await apiClient.put("/api/push-tokens", input); }
export async function revokePushTokens(token?: string) { await apiClient.delete("/api/push-tokens", { params: token ? { token } : undefined }); }
