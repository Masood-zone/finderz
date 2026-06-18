import { AppText } from "@/components/ui/app-text";
import { colors, radius, shadows } from "@/components/ui/design-system";
import { SafeAreaScreen } from "@/components/ui/safe-area-screen";
import type { Href } from "expo-router";
import { router, usePathname } from "expo-router";
import { Bell, CheckSquare, Gauge, Gavel, Users } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

const navItems = [
  { label: "Dashboard", href: "/super-admin" as Href, icon: Gauge },
  { label: "Approvals", href: "/super-admin/approvals" as Href, icon: CheckSquare },
  { label: "Users", href: "/super-admin/users" as Href, icon: Users },
  { label: "Reports", href: "/super-admin/reports" as Href, icon: Gavel },
  { label: "Alerts", href: "/super-admin/notifications" as Href, icon: Bell },
];

type SuperAdminShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  scroll?: boolean;
};

export function SuperAdminShell({ title, subtitle, children, scroll = true }: SuperAdminShellProps) {
  const pathname = usePathname();

  const body = (
    <>
      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <AppText variant="title" style={styles.brand}>
              FinderZ Admin
            </AppText>
            <AppText muted>{title}</AppText>
          </View>
          <View style={styles.avatar}>
            <AppText variant="label" style={{ color: colors.surface }}>
              SA
            </AppText>
          </View>
        </View>

        <View style={styles.hero}>
          <AppText variant="headline" style={styles.heroTitle}>
            {title}
          </AppText>
          {subtitle ? <AppText muted>{subtitle}</AppText> : null}
        </View>

        {children}
      </View>
    </>
  );

  return (
    <SafeAreaScreen style={styles.screen}>
      {scroll ? (
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {body}
        </ScrollView>
      ) : (
        body
      )}
      <View style={styles.nav}>
        {navItems.map((item) => {
          const href = String(item.href);
          const active = pathname === href || (href !== "/super-admin" && pathname.startsWith(href));
          const Icon = item.icon;
          return (
            <Pressable key={item.label} onPress={() => router.push(item.href)} style={[styles.navItem, active && styles.navItemActive]}>
              <Icon size={20} color={active ? colors.goldDark : colors.muted} />
              <AppText variant="label" style={{ color: active ? colors.goldDark : colors.muted }}>
                {item.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaScreen>
  );
}

export function AdminCard({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function StatusPill({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "success" | "warning" | "danger" }) {
  const palette = {
    neutral: { backgroundColor: colors.surfaceBlue, color: colors.primary },
    success: { backgroundColor: colors.successSoft, color: colors.success },
    warning: { backgroundColor: colors.warningSoft, color: colors.warning },
    danger: { backgroundColor: colors.errorSoft, color: colors.error },
  }[tone];
  return (
    <View style={[styles.pill, { backgroundColor: palette.backgroundColor }]}>
      <AppText variant="label" style={{ color: palette.color }}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: "#f8f9ff",
    padding: 16,
    gap: 18,
  },
  screen: {
    backgroundColor: "#f8f9ff",
  },
  scrollContent: {
    paddingBottom: 104,
  },
  header: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    ...shadows.sm,
  },
  brand: {
    color: "#00236f",
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.primaryContainer,
    borderColor: colors.gold,
    borderRadius: 20,
    borderWidth: 2,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  hero: {
    gap: 4,
  },
  heroTitle: {
    color: "#00236f",
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 16,
    ...shadows.sm,
  },
  nav: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    bottom: 0,
    flexDirection: "row",
    gap: 4,
    justifyContent: "space-around",
    left: 0,
    paddingBottom: 18,
    paddingHorizontal: 8,
    paddingTop: 10,
    position: "absolute",
    right: 0,
    ...shadows.md,
  },
  navItem: {
    alignItems: "center",
    borderRadius: radius.lg,
    flex: 1,
    gap: 2,
    paddingVertical: 6,
  },
  navItemActive: {
    backgroundColor: colors.warningSoft,
  },
  pill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
