import { AdminCard, StatusPill, SuperAdminShell } from "@/components/super-admin/super-admin-shell";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { useSuperAdminNotificationAction, useSuperAdminNotifications } from "@/services/queries/hooks";
import { router, type Href } from "expo-router";
import { Bell, Building2, ShieldAlert, UserCog } from "lucide-react-native";
import { ActivityIndicator, StyleSheet, View } from "react-native";

function relatedHref(data: unknown) {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  if (typeof record.propertyId === "string") return `/super-admin/approvals/${record.propertyId}` as Href;
  if (typeof record.reportId === "string") return "/super-admin/reports" as Href;
  if (typeof record.userId === "string") return "/super-admin/users" as Href;
  return null;
}

function NotificationIcon({ type }: { type: string }) {
  const Icon = type.includes("REPORT") ? ShieldAlert : type.includes("ACCOUNT") ? UserCog : type.includes("APPROVAL") ? Building2 : Bell;
  return <Icon size={22} color={colors.primary} />;
}

export default function NotificationCentreScreen() {
  const notifications = useSuperAdminNotifications({ pageSize: 50 });
  const action = useSuperAdminNotificationAction();

  return (
    <SuperAdminShell title="Notification Centre" subtitle="Administrative alerts for approvals, reports, verifications, and account issues.">
      <AppButton title="Mark All as Read" variant="secondary" loading={action.isPending} onPress={() => action.mutate({ action: "mark_all_read" })} />
      {notifications.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      <View style={styles.stack}>
        {(notifications.data?.items ?? []).map((item) => {
          const href = relatedHref(item.data);
          return (
            <AdminCard key={item.id} style={{ borderColor: item.isRead ? colors.border : colors.primaryMuted }}>
              <View style={styles.row}>
                <NotificationIcon type={item.type} />
                <View style={{ flex: 1 }}>
                  <View style={styles.titleRow}>
                    <AppText variant="title">{item.title}</AppText>
                    {!item.isRead ? <StatusPill label="Unread" tone="warning" /> : null}
                  </View>
                  <AppText>{item.message}</AppText>
                  <AppText muted>{new Date(item.createdAt).toLocaleString()}</AppText>
                </View>
              </View>
              <View style={styles.actions}>
                {!item.isRead ? <AppButton title="Mark as Read" variant="secondary" loading={action.isPending} onPress={() => action.mutate({ action: "mark_read", notificationId: item.id })} /> : null}
                {href ? <AppButton title="Open Related Entity" onPress={() => router.push(href)} /> : null}
              </View>
            </AdminCard>
          );
        })}
        {!notifications.data?.items.length ? <AppText muted>No administrative notifications yet.</AppText> : null}
      </View>
    </SuperAdminShell>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 14,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  titleRow: {
    alignItems: "flex-start",
    gap: 8,
  },
  actions: {
    gap: 10,
    marginTop: 12,
  },
});
