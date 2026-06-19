import { router, type Href } from "expo-router";
import { Bell, CheckSquare, Gavel, LogOut, ShieldCheck, Users } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { AdminCard, StatusPill, SuperAdminShell } from "@/components/super-admin/super-admin-shell";
import { TenantAvatar } from "@/components/tenant/tenant-shell";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { getErrorMessage } from "@/lib/get-error-message";
import { signOut } from "@/lib/auth-client";
import { useCurrentUser } from "@/services/queries/hooks";

const quickLinks = [
  { label: "Approvals", href: "/super-admin/approvals" as Href, icon: CheckSquare },
  { label: "Users", href: "/super-admin/users" as Href, icon: Users },
  { label: "Reports", href: "/super-admin/reports" as Href, icon: Gavel },
  { label: "Alerts", href: "/super-admin/notifications" as Href, icon: Bell },
];

export default function SuperAdminProfileScreen() {
  const currentUser = useCurrentUser();
  const user = currentUser.data?.user;

  const leave = async () => {
    await signOut();
    router.replace("/sign-in");
  };

  return (
    <SuperAdminShell title="Profile" subtitle="Super Administrator account and access controls.">
      {currentUser.isError ? (
        <AdminCard>
          <AppText variant="title" style={{ color: colors.error }}>
            Unable to load profile
          </AppText>
          <AppText muted style={{ marginTop: 6 }}>
            {getErrorMessage(currentUser.error, "Your profile could not be loaded.")}
          </AppText>
          <View style={{ marginTop: 12 }}>
            <AppButton title="Try Again" variant="secondary" onPress={() => void currentUser.refetch()} />
          </View>
        </AdminCard>
      ) : null}

      <AdminCard>
        <View style={styles.profileHeader}>
          <TenantAvatar name={user?.name} image={user?.image} size={72} />
          <AppText variant="headline" style={{ color: colors.primary }}>
            {user?.name ?? "Super Administrator"}
          </AppText>
          <AppText muted>{user?.email ?? "Loading account..."}</AppText>
          <View style={styles.pills}>
            <StatusPill label={user?.role?.replaceAll("_", " ") ?? "SUPER ADMIN"} tone="success" />
            <StatusPill label={user?.accountStatus ?? "ACTIVE"} tone={user?.accountStatus === "ACTIVE" ? "success" : "warning"} />
          </View>
        </View>
      </AdminCard>

      <AdminCard>
        <View style={styles.accountRow}>
          <ShieldCheck color={colors.primary} size={22} />
          <View style={{ flex: 1 }}>
            <AppText style={{ fontFamily: "Manrope_700Bold" }}>Administrator Access</AppText>
            <AppText muted>Marketplace moderation, approvals, reports, alerts, and user safety tools.</AppText>
          </View>
        </View>
        <View style={{ marginTop: 12 }}>
          <AppButton title="Edit Profile" variant="secondary" onPress={() => router.push("/super-admin/edit-profile" as Href)} />
        </View>
      </AdminCard>

      <AdminCard>
        <AppText variant="title">Quick Links</AppText>
        <View style={styles.quickGrid}>
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Pressable key={item.label} style={styles.quickLink} onPress={() => router.push(item.href)}>
                <Icon color={colors.primary} size={22} />
                <AppText style={{ color: colors.primary, fontFamily: "Manrope_700Bold" }}>{item.label}</AppText>
              </Pressable>
            );
          })}
        </View>
      </AdminCard>

      <Pressable style={styles.signOut} onPress={leave}>
        <LogOut color={colors.error} size={22} />
        <AppText style={{ color: colors.error, fontFamily: "Manrope_700Bold" }}>Sign Out</AppText>
      </Pressable>
    </SuperAdminShell>
  );
}

const styles = StyleSheet.create({
  accountRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginTop: 10,
  },
  profileHeader: {
    alignItems: "center",
    gap: 8,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  quickLink: {
    alignItems: "center",
    backgroundColor: colors.surfaceBlue,
    borderRadius: 8,
    flexBasis: "47%",
    flexGrow: 1,
    gap: 8,
    minHeight: 88,
    justifyContent: "center",
    padding: 12,
  },
  signOut: {
    alignItems: "center",
    backgroundColor: colors.errorSoft,
    borderRadius: 8,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    padding: 16,
  },
});
