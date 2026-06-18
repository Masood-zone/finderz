import { AdminCard, StatusPill, SuperAdminShell } from "@/components/super-admin/super-admin-shell";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { useSuperAdminDashboard } from "@/services/queries/hooks";
import { router, type Href } from "expo-router";
import { Activity, CheckSquare, Home, MessageCircle, ShieldCheck, Users } from "lucide-react-native";
import { ActivityIndicator, StyleSheet, View } from "react-native";

const statIcons = [Users, Users, ShieldCheck, Home, CheckSquare, Activity, MessageCircle];

export default function SuperAdminDashboardScreen() {
  const dashboard = useSuperAdminDashboard();
  const stats = dashboard.data?.stats;
  const statRows = stats
    ? [
        ["Total Users", stats.totalUsers],
        ["Tenants", stats.totalTenants],
        ["Verified Landlords", stats.verifiedLandlords],
        ["Properties", stats.totalProperties],
        ["Pending Approvals", stats.pendingApprovals],
        ["Reported Listings", stats.reportedListings],
        ["Active Enquiries", stats.activeEnquiries],
      ]
    : [];

  return (
    <SuperAdminShell title="Welcome back, Admin." subtitle="Here's what's happening on the FinderZ marketplace today.">
      {dashboard.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      <View style={styles.grid}>
        {statRows.map(([label, value], index) => {
          const Icon = statIcons[index] ?? Activity;
          const urgent = label === "Pending Approvals" || label === "Reported Listings";
          return (
            <AdminCard key={label} style={styles.statCard}>
              <Icon size={22} color={urgent ? colors.error : colors.primary} />
              <AppText variant="label" muted>
                {label}
              </AppText>
              <AppText variant="title" style={{ color: urgent ? colors.error : colors.primary }}>
                {value}
              </AppText>
            </AdminCard>
          );
        })}
      </View>

      <AdminCard>
        <AppText variant="title">Quick Actions</AppText>
        <View style={styles.actions}>
          <AppButton title="Approve Listings" onPress={() => router.push("/super-admin/approvals" as Href)} />
          <AppButton title="User Management" variant="secondary" onPress={() => router.push("/super-admin/users" as Href)} />
          <AppButton title="Moderation" variant="secondary" onPress={() => router.push("/super-admin/reports" as Href)} />
          <AppButton title="Notifications" variant="secondary" onPress={() => router.push("/super-admin/notifications" as Href)} />
        </View>
      </AdminCard>

      <AdminCard>
        <AppText variant="title">Recent Submission Requests</AppText>
        <View style={styles.stack}>
          {(dashboard.data?.recentApprovals ?? []).map((property) => (
            <View key={property.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <AppText variant="title">{property.title}</AppText>
                <AppText muted>
                  {property.area}, {property.city} - GHS {(property.rentAmount / 100).toLocaleString()}
                </AppText>
                <StatusPill label="Pending" tone="warning" />
              </View>
              <AppButton title="Review" variant="secondary" onPress={() => router.push(`/super-admin/approvals/${property.id}` as Href)} style={{ alignSelf: "center" }} />
            </View>
          ))}
          {!dashboard.data?.recentApprovals.length ? <AppText muted>No pending submissions yet.</AppText> : null}
        </View>
      </AdminCard>

      <AdminCard>
        <AppText variant="title">Recent Administrative Activity</AppText>
        <View style={styles.stack}>
          {(dashboard.data?.recentActivity ?? []).map((item) => (
            <View key={item.id} style={styles.activityRow}>
              <View style={styles.dot} />
              <View style={{ flex: 1 }}>
                <AppText>{item.action.replaceAll("_", " ")}</AppText>
                <AppText muted>{new Date(item.createdAt).toLocaleString()}</AppText>
              </View>
            </View>
          ))}
          {!dashboard.data?.recentActivity.length ? <AppText muted>No audit activity recorded yet.</AppText> : null}
        </View>
      </AdminCard>
    </SuperAdminShell>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flexBasis: "47%",
    flexGrow: 1,
    gap: 8,
    minHeight: 118,
  },
  actions: {
    gap: 10,
    marginTop: 12,
  },
  stack: {
    gap: 12,
    marginTop: 12,
  },
  row: {
    alignItems: "flex-start",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 12,
    paddingTop: 12,
  },
  activityRow: {
    flexDirection: "row",
    gap: 12,
  },
  dot: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    height: 12,
    marginTop: 6,
    width: 12,
  },
});
