import { router, type Href } from "expo-router";
import { Bell, CheckCheck } from "lucide-react-native";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaScreen } from "@/components/ui/safe-area-screen";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { TenantErrorState, TenantSkeleton } from "@/components/tenant/tenant-state";
import { useNotificationAction, useNotifications } from "@/services/queries/hooks";
import { getErrorMessage } from "@/lib/get-error-message";

export function NotificationCenter() {
  const query = useNotifications(); const action = useNotificationAction();
  if (query.isLoading) return <TenantSkeleton variant="enquiries" />;
  if (query.isError) return <TenantErrorState title="Notifications unavailable" message={getErrorMessage(query.error, "Please try again.")} onRetry={() => void query.refetch()} />;
  const items = query.data?.notifications ?? [];
  return <SafeAreaScreen>
    <View className="flex-row items-center justify-between px-4 py-3"><AppText variant="headline">Notifications</AppText><Pressable onPress={() => action.mutate(undefined)} className="flex-row items-center gap-2"><CheckCheck color={colors.primary} size={18}/><AppText style={{ color: colors.primary }}>Mark all read</AppText></Pressable></View>
    <ScrollView refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} />} contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
      {!items.length ? <View className="items-center py-20"><Bell color={colors.outline} size={40}/><AppText variant="title" className="mt-4">You’re all caught up</AppText><AppText muted className="mt-1 text-center">Updates about your FinderZ activity will appear here.</AppText></View> : items.map((item) => <Pressable key={item.id} onPress={() => { if (!item.isRead) action.mutate(item.id); if (item.deepLink?.startsWith("/")) router.push(item.deepLink as Href); }} className="rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: item.isRead ? colors.surface : colors.surfaceBlue }}><View className="flex-row justify-between gap-3"><AppText className="flex-1" style={{ fontFamily: "Manrope_700Bold" }}>{item.title}</AppText>{!item.isRead ? <View className="mt-2 h-2 w-2 rounded-full" style={{ backgroundColor: colors.primary }}/>:null}</View><AppText muted className="mt-1">{item.message}</AppText><AppText variant="caption" muted className="mt-2">{new Date(item.createdAt).toLocaleString()}</AppText></Pressable>)}
    </ScrollView>
  </SafeAreaScreen>;
}
