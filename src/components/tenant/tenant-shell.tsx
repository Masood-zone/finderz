import { Bell } from "lucide-react-native";
import { Image, Pressable, View } from "react-native";
import type { ReactNode } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { FinderzLogo } from "@/components/ui/finderz-logo";
import { router, type Href } from "expo-router";
import { useNotifications } from "@/services/queries/hooks";

export function TenantAvatar({ name, image, size = 40 }: { name?: string; image?: string | null; size?: number }) {
  const initials =
    name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "FZ";

  return (
    <View className="items-center justify-center overflow-hidden" style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surfaceBlue }}>
      {image ? (
        <Image source={{ uri: image }} resizeMode="cover" style={{ width: size, height: size }} />
      ) : (
        <AppText variant="caption" style={{ color: colors.primary, fontFamily: "Manrope_800ExtraBold" }}>
          {initials}
        </AppText>
      )}
    </View>
  );
}

export function TenantTopBar({ title, subtitle, userName, right }: { title?: string; subtitle?: string; userName?: string; right?: ReactNode }) {
  const insets = useSafeAreaInsets();
  const notifications = useNotifications();

  return (
    <View className="flex-row items-center justify-between px-4 pb-3" style={{ backgroundColor: colors.background, paddingTop: Math.max(insets.top, 12) }}>
      <View className="min-w-0 flex-1 flex-row items-center gap-3">
        {title ? <TenantAvatar name={userName} size={40} /> : <FinderzLogo variant="mark" size="sm" />}
        <View className="min-w-0 flex-1">
          <AppText variant={title ? "caption" : "title"} muted={Boolean(title)}>
            {title ?? "FinderZ"}
          </AppText>
          {subtitle ? (
            <AppText variant="caption" style={{ color: colors.text, fontFamily: "Manrope_700Bold" }} numberOfLines={1}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
      </View>
      {right ?? (
        <Pressable onPress={() => router.push("/tenant/notifications" as Href)} className="h-10 w-10 items-center justify-center" style={{ borderRadius: radius.xl, backgroundColor: colors.surface }}>
          <Bell color={colors.primary} size={20} />
          {(notifications.data?.unreadCount ?? 0) > 0 ? <View className="absolute right-2 top-2 h-2 w-2 rounded-full" style={{ backgroundColor: colors.error }} /> : null}
        </Pressable>
      )}
    </View>
  );
}

export function TenantSectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <AppText variant="title">{title}</AppText>
      {action}
    </View>
  );
}

export function TenantChip({ label, active = false, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="h-10 items-center justify-center px-4"
      style={{
        borderRadius: 999,
        backgroundColor: active ? colors.primary : colors.surfaceBlue,
        borderWidth: active ? 0 : 1,
        borderColor: colors.border,
      }}
    >
      <AppText variant="caption" style={{ color: active ? "#fff" : colors.primary, fontFamily: "Manrope_700Bold" }}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function TenantCard({ children }: { children: ReactNode }) {
  return (
    <View
      className="overflow-hidden"
      style={{
        borderRadius: radius.xl,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: "rgba(197,197,211,0.55)",
      }}
    >
      {children}
    </View>
  );
}
