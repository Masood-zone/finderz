import { useState } from "react";
import { Image, Pressable, RefreshControl, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { SafeAreaScreen } from "@/components/ui/safe-area-screen";
import { TenantChip, TenantTopBar } from "@/components/tenant/tenant-shell";
import { TenantEmptyState, TenantErrorState, TenantSkeleton } from "@/components/tenant/tenant-state";
import { getErrorMessage } from "@/lib/get-error-message";
import { useTenantEnquiries } from "@/services/queries/hooks";
import type { TenantEnquiryStatusFilter } from "@/types/tenant";

const tabs: { label: string; value: TenantEnquiryStatusFilter }[] = [
  { label: "Active", value: "active" },
  { label: "Awaiting Reply", value: "awaiting-reply" },
  { label: "Closed", value: "closed" },
];

export default function TenantEnquiriesScreen() {
  const [status, setStatus] = useState<TenantEnquiryStatusFilter>("active");
  const enquiries = useTenantEnquiries(status);

  if (enquiries.isLoading) {
    return <TenantSkeleton variant="enquiries" />;
  }

  if (enquiries.isError) {
    return <TenantErrorState message={getErrorMessage(enquiries.error, "Unable to load enquiries.")} onRetry={() => void enquiries.refetch()} />;
  }

  return (
    <SafeAreaScreen edges={["right", "bottom", "left"]}>
      <TenantTopBar />
      <View className="px-4 py-4">
        <View className="flex-row items-center justify-between">
          <AppText variant="headline">Enquiries</AppText>
          <View className="rounded-full px-3 py-1" style={{ backgroundColor: colors.primary }}>
            <AppText variant="caption" style={{ color: "#fff", fontFamily: "Manrope_700Bold" }}>
              {enquiries.data?.counts.active ?? 0} ACTIVE
            </AppText>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4" contentContainerStyle={{ gap: 10 }}>
          {tabs.map((tab) => (
            <TenantChip key={tab.value} label={tab.label} active={status === tab.value} onPress={() => setStatus(tab.value)} />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={enquiries.isRefetching} tintColor={colors.primary} onRefresh={() => void enquiries.refetch()} />}
        contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 120, gap: 14 }}
        showsVerticalScrollIndicator={false}
      >
        {!enquiries.data?.enquiries.length ? (
          <TenantEmptyState title="No enquiries here" message="Conversations you start from property detail pages will show up here." actionTitle="Browse Listings" onAction={() => router.push("/tenant/search")} />
        ) : (
          enquiries.data.enquiries.map((enquiry) => (
            <Pressable key={enquiry.id} className="flex-row gap-4 rounded-2xl p-4" style={{ backgroundColor: colors.surface }} onPress={() => router.push({ pathname: "/tenant/enquiry/[enquiryId]", params: { enquiryId: enquiry.id } })}>
              <View className="h-20 w-20 overflow-hidden" style={{ borderRadius: radius.lg, backgroundColor: colors.surfaceBlue }}>
                {enquiry.property.coverImage ? <Image source={{ uri: enquiry.property.coverImage }} resizeMode="cover" style={{ width: "100%", height: "100%" }} /> : null}
              </View>
              <View className="min-w-0 flex-1">
                <View className="flex-row justify-between gap-3">
                  <AppText style={{ fontFamily: "Manrope_700Bold" }} numberOfLines={1}>
                    {enquiry.property.title}
                  </AppText>
                  <AppText variant="caption" muted>
                    {new Date(enquiry.updatedAt).toLocaleDateString()}
                  </AppText>
                </View>
                <AppText variant="caption" style={{ color: colors.primary, fontFamily: "Manrope_700Bold" }}>
                  {enquiry.landlord.name}
                </AppText>
                <View className="mt-2 flex-row items-center gap-2">
                  <AppText muted className="min-w-0 flex-1" numberOfLines={1}>
                    {enquiry.lastMessage?.content ?? "No messages yet"}
                  </AppText>
                  {enquiry.unreadCount ? <View className="h-3 w-3 rounded-full" style={{ backgroundColor: colors.primary }} /> : null}
                </View>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaScreen>
  );
}
