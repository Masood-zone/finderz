import { Bell, CheckCircle2 } from "lucide-react-native";
import { Pressable, View } from "react-native";
import type { ReactNode } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { FinderzLogo } from "@/components/ui/finderz-logo";
import { TenantAvatar } from "@/components/tenant/tenant-shell";
import { router, type Href } from "expo-router";
import { useNotifications } from "@/services/queries/hooks";

export function LandlordTopBar({ title, subtitle, userName, image, right }: { title?: string; subtitle?: string; userName?: string; image?: string | null; right?: ReactNode }) {
  const insets = useSafeAreaInsets();
  const notifications = useNotifications();

  return (
    <View className="flex-row items-center justify-between px-4 pb-3" style={{ backgroundColor: colors.background, paddingTop: Math.max(insets.top, 12) }}>
      <View className="min-w-0 flex-1 flex-row items-center gap-3">
        {userName ? <TenantAvatar name={userName} image={image} size={42} /> : <FinderzLogo variant="mark" size="sm" />}
        <View className="min-w-0 flex-1">
          <AppText variant={title ? "caption" : "title"} muted={Boolean(title)}>
            {title ?? "FinderZ"}
          </AppText>
          {subtitle ? (
            <AppText variant="caption" numberOfLines={1} style={{ color: colors.text, fontFamily: "Manrope_700Bold" }}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
      </View>
      {right ?? (
        <Pressable onPress={() => router.push("/landlord/notifications" as Href)} className="h-10 w-10 items-center justify-center" style={{ borderRadius: radius.xl, backgroundColor: colors.surface }}>
          <Bell color={colors.primary} size={20} />
          {(notifications.data?.unreadCount ?? 0) > 0 ? <View className="absolute right-2 top-2 h-2 w-2 rounded-full" style={{ backgroundColor: colors.error }} /> : null}
        </Pressable>
      )}
    </View>
  );
}

export function LandlordCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <View className={`rounded-2xl border p-4 ${className}`} style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
      {children}
    </View>
  );
}

export function StatCard({ label, value, accent = false, icon }: { label: string; value: number | string; accent?: boolean; icon?: ReactNode }) {
  return (
    <View className="min-h-[112px] flex-1 justify-between rounded-2xl border p-4" style={{ backgroundColor: colors.surface, borderColor: accent ? colors.gold : colors.border }}>
      <View className="flex-row items-center justify-between gap-2">
        <AppText variant="label" muted>
          {label}
        </AppText>
        {icon}
      </View>
      <AppText variant="display" style={{ color: colors.primary }}>
        {value}
      </AppText>
    </View>
  );
}

export function StatusPill({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "success" | "warning" | "danger" }) {
  const bg = tone === "success" ? colors.successSoft : tone === "warning" ? colors.warningSoft : tone === "danger" ? colors.errorSoft : colors.surfaceBlue;
  const fg = tone === "success" ? colors.success : tone === "warning" ? colors.warning : tone === "danger" ? colors.error : colors.primary;
  return (
    <View className="flex-row items-center gap-1 rounded-full px-3 py-1" style={{ backgroundColor: bg }}>
      {tone === "success" ? <CheckCircle2 color={fg} size={13} /> : null}
      <AppText variant="caption" style={{ color: fg, fontFamily: "Manrope_700Bold" }}>
        {label}
      </AppText>
    </View>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <AppText variant="title">{title}</AppText>
      {action}
    </View>
  );
}
