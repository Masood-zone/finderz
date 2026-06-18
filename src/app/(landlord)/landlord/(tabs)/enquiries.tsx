// import { MessageCircle } from "lucide-react-native";
import { RefreshControl, ScrollView, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
// import { StateView } from "@/components/general/state-view";
import {
  LandlordCard,
  LandlordTopBar,
  StatusPill,
} from "@/components/landlord/landlord-shell";
// import { getErrorMessage } from "@/lib/get-error-message";
import { useLandlordEnquiries } from "@/services/queries/hooks";

export default function LandlordEnquiriesScreen() {
  const enquiries = useLandlordEnquiries();

  // if (enquiries.isError) {
  //   return (
  //     <StateView
  //       icon={<MessageCircle color={colors.primary} size={34} />}
  //       title="Enquiries unavailable"
  //       message={getErrorMessage(enquiries.error, "Unable to load enquiries.")}
  //       primaryAction={{ title: "Try Again", onPress: () => void enquiries.refetch() }}
  //     />
  //   );
  // }

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
          <LandlordCard key={enquiry.id}>
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
              <StatusPill
                label={enquiry.status}
                tone={enquiry.status === "OPEN" ? "warning" : "neutral"}
              />
            </View>
          </LandlordCard>
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
