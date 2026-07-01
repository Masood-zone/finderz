import { router, type Href } from "expo-router";
import { ChevronRight, MessageCircle } from "lucide-react-native";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { StateView } from "@/components/general/state-view";
import {
  LandlordCard,
  LandlordTopBar,
  StatusPill,
} from "@/components/landlord/landlord-shell";
import { TenantSkeleton } from "@/components/tenant/tenant-state";
import { getErrorMessage } from "@/lib/get-error-message";
import { useLandlordEnquiries } from "@/services/queries/hooks";

export default function LandlordEnquiriesScreen() {
  const enquiries = useLandlordEnquiries();

  if (enquiries.isLoading) {
    return <TenantSkeleton variant="enquiries" />;
  }

  if (enquiries.isError) {
    return (
      <StateView
        icon={<MessageCircle color={colors.primary} size={34} />}
        title="Enquiries unavailable"
        message={getErrorMessage(enquiries.error, "Unable to load enquiries.")}
        primaryAction={{ title: "Try Again", onPress: () => void enquiries.refetch() }}
      />
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <LandlordTopBar
        title="Enquiries"
        subtitle="Tenant interest and inspection requests"
      />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={enquiries.isRefetching}
            tintColor={colors.primary}
            onRefresh={() => void enquiries.refetch()}
          />
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {(enquiries.data?.enquiries ?? []).map((enquiry) => (
          <Pressable key={enquiry.id} onPress={() => router.push(`/landlord/enquiries/${enquiry.id}` as Href)}>
          <LandlordCard>
            <View className="flex-row justify-between gap-3">
              <View className="min-w-0 flex-1">
                <AppText variant="title" numberOfLines={1}>
                  {enquiry.tenant.name}
                </AppText>
                <AppText muted numberOfLines={1}>
                  {enquiry.property.title}, {enquiry.property.area}
                </AppText>
                <AppText variant="caption" muted className="mt-2">
                  Prefers {enquiry.preferredContactMethod.toLowerCase()}
                </AppText>
              </View>
              <View className="items-end gap-3">
                <StatusPill
                  label={enquiry.status}
                  tone={enquiry.status === "OPEN" ? "warning" : "neutral"}
                />
                <ChevronRight color={colors.outline} size={18} />
              </View>
            </View>
          </LandlordCard>
          </Pressable>
        ))}
        {!enquiries.isLoading && !enquiries.data?.enquiries.length ? (
          <LandlordCard>
            <AppText variant="title">No enquiries yet</AppText>
            <AppText muted className="mt-1">
              Tenant enquiries for your owned properties will appear here.
            </AppText>
          </LandlordCard>
        ) : null}
      </ScrollView>
    </View>
  );
}
