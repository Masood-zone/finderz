import { AdminCard, StatusPill, SuperAdminShell } from "@/components/super-admin/super-admin-shell";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { useSuperAdminUserAction, useSuperAdminUsers } from "@/services/queries/hooks";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

const filters = [
  { label: "All", value: "all" },
  { label: "Tenants", value: "tenants" },
  { label: "Landlords", value: "landlords" },
  { label: "Super Admins", value: "super-admins" },
  { label: "Suspended", value: "suspended" },
];

export default function UserManagementScreen() {
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [reason, setReason] = useState("");
  const users = useSuperAdminUsers({ pageSize: 30, filter, q });
  const action = useSuperAdminUserAction();

  return (
    <SuperAdminShell title="User Management" subtitle="Inspect accounts, verification state, and listing activity.">
      <AppInput label="Search users" value={q} onChangeText={setQ} placeholder="Name or email" />
      <View style={styles.tabs}>
        {filters.map((item) => (
          <Pressable key={item.value} style={[styles.tab, filter === item.value && styles.tabActive]} onPress={() => setFilter(item.value)}>
            <AppText variant="label" style={{ color: filter === item.value ? colors.primary : colors.muted }}>
              {item.label}
            </AppText>
          </Pressable>
        ))}
      </View>
      <AppInput label="Suspension reason" value={reason} onChangeText={setReason} placeholder="Required when suspending an account" />
      {users.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      <View style={styles.stack}>
        {(users.data?.items ?? []).map((item) => (
          <AdminCard key={item.id}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <AppText variant="title">{item.name}</AppText>
                <AppText muted>{item.email}</AppText>
                <View style={styles.pills}>
                  <StatusPill label={item.role.replace("_", " ")} />
                  <StatusPill label={item.accountStatus} tone={item.accountStatus === "ACTIVE" ? "success" : "danger"} />
                </View>
              </View>
            </View>
            <AppText muted>
              Landlord verification: {item.landlordVerificationStatus?.replaceAll("_", " ") ?? "N/A"} - Listings: {item.listingCount}
            </AppText>
            <View style={styles.actions}>
              <AppButton title="View Account" variant="secondary" onPress={() => {}} />
              {item.accountStatus === "SUSPENDED" ? (
                <AppButton title="Reactivate" loading={action.isPending} onPress={() => action.mutate({ userId: item.id, action: "reactivate" })} />
              ) : (
                <AppButton title="Suspend" variant="danger" loading={action.isPending} onPress={() => action.mutate({ userId: item.id, action: "suspend", reason })} />
              )}
            </View>
          </AdminCard>
        ))}
        {!users.data?.items.length ? <AppText muted>No users match this filter.</AppText> : null}
      </View>
    </SuperAdminShell>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tab: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tabActive: {
    backgroundColor: colors.warningSoft,
    borderColor: colors.gold,
  },
  stack: {
    gap: 14,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  actions: {
    gap: 10,
    marginTop: 12,
  },
});
