import { router, type Href } from "expo-router";
import {
  CheckCircle2,
  Clock3,
  HomeIcon,
  MessageCircle,
  Plus,
  XCircle,
} from "lucide-react-native";
import { RefreshControl, ScrollView, View } from "react-native";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
// import { StateView } from "@/components/general/state-view";
import {
  LandlordCard,
  LandlordTopBar,
  SectionHeader,
  StatCard,
  StatusPill,
} from "@/components/landlord/landlord-shell";
// import { getErrorMessage } from "@/lib/get-error-message";
import { useLandlordDashboard } from "@/services/queries/hooks";

function formatCedis(pesewas: number) {
  return `GH₵${(pesewas / 100).toLocaleString("en-GH", { maximumFractionDigits: 0 })}`;
}

export default function LandlordDashboardScreen() {
  const dashboard = useLandlordDashboard();

  // if (dashboard.isError) {
  //   return (
  //     <StateView
  //       icon={<FileWarning color={colors.primary} size={34} />}
  //       title="Dashboard unavailable"
  //       message={getErrorMessage(dashboard.error, "Unable to load your landlord dashboard.")}
  //       primaryAction={{ title: "Try Again", onPress: () => void dashboard.refetch() }}
  //     />
  //   );
  // }

  const data = dashboard.data;
  const stats = data?.stats;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <LandlordTopBar
        title={`Welcome back, ${data?.user.name.split(" ")[0] ?? "landlord"}`}
        subtitle="Dashboard Overview"
        userName={data?.user.name}
      />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={dashboard.isRefetching}
            tintColor={colors.primary}
            onRefresh={() => void dashboard.refetch()}
          />
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 18 }}
        showsVerticalScrollIndicator={false}
      >
        {data?.verification.status !== "APPROVED" ? (
          <LandlordCard>
            <View className="flex-row items-start justify-between gap-3">
              <View className="min-w-0 flex-1">
                <StatusPill
                  label={
                    data?.verification.status.replaceAll("_", " ") ??
                    "NOT SUBMITTED"
                  }
                  tone="warning"
                />
                <AppText variant="title" className="mt-3">
                  Verification required
                </AppText>
                <AppText muted className="mt-1">
                  {data?.verification.nextAction ??
                    "Complete landlord onboarding to start verification."}
                </AppText>
              </View>
              <AppButton
                title="View"
                variant="secondary"
                style={{ alignSelf: "flex-start" }}
                onPress={() =>
                  router.push("/landlord/verification-status" as Href)
                }
              />
            </View>
          </LandlordCard>
        ) : null}

        <View className="flex-row gap-3">
          <StatCard
            label="Total Listings"
            value={stats?.totalListings ?? 0}
            icon={<HomeIcon color={colors.primary} size={21} />}
          />
          <StatCard
            label="Active Listings"
            value={stats?.activeListings ?? 0}
            accent
            icon={<CheckCircle2 color={colors.success} size={21} />}
          />
        </View>
        <View className="flex-row gap-3">
          <StatCard
            label="Pending"
            value={stats?.pendingListings ?? 0}
            icon={<Clock3 color={colors.warning} size={21} />}
          />
          <StatCard
            label="Rejected"
            value={stats?.rejectedListings ?? 0}
            icon={<XCircle color={colors.error} size={21} />}
          />
        </View>
        <View className="flex-row gap-3">
          <StatCard label="Rented" value={stats?.rentedListings ?? 0} />
          <StatCard
            label="Enquiries"
            value={stats?.totalEnquiries ?? 0}
            icon={<MessageCircle color={colors.primary} size={21} />}
          />
        </View>

        <LandlordCard>
          <SectionHeader title="Listing Performance" />
          <View className="gap-3">
            {(data?.listingPerformance.length
              ? data.listingPerformance
              : [{ label: "No listings yet", value: 0 }]
            ).map((item) => (
              <View key={item.label}>
                <View className="mb-1 flex-row justify-between">
                  <AppText style={{ textTransform: "capitalize" }}>
                    {item.label}
                  </AppText>
                  <AppText style={{ fontFamily: "Manrope_700Bold" }}>
                    {item.value}
                  </AppText>
                </View>
                <View
                  className="h-2 overflow-hidden rounded-full"
                  style={{ backgroundColor: colors.surfaceBlue }}
                >
                  <View
                    className="h-2 rounded-full"
                    style={{
                      width: `${Math.min(100, item.value * 20)}%`,
                      backgroundColor: colors.primary,
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        </LandlordCard>

        <View>
          <SectionHeader
            title="Recent Enquiries"
            action={
              <AppButton
                title="View All"
                variant="ghost"
                style={{ minHeight: 36, paddingHorizontal: 8 }}
                onPress={() => router.push("/landlord/enquiries" as Href)}
              />
            }
          />
          <View className="gap-3">
            {(data?.recentEnquiries ?? []).slice(0, 3).map((enquiry) => (
              <LandlordCard key={enquiry.id}>
                <View className="flex-row justify-between gap-3">
                  <View className="min-w-0 flex-1">
                    <AppText style={{ fontFamily: "Manrope_700Bold" }}>
                      {enquiry.tenant.name}
                    </AppText>
                    <AppText variant="caption" muted numberOfLines={1}>
                      {enquiry.property.title}, {enquiry.property.area}
                    </AppText>
                  </View>
                  <StatusPill label={enquiry.status} />
                </View>
              </LandlordCard>
            ))}
            {!data?.recentEnquiries.length ? (
              <LandlordCard>
                <AppText muted>No enquiries yet.</AppText>
              </LandlordCard>
            ) : null}
          </View>
        </View>

        <View>
          <SectionHeader title="Active Portfolio Highlights" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
          >
            {(data?.portfolioHighlights ?? []).map((property) => (
              <LandlordCard key={property.id} className="w-64">
                <StatusPill
                  label={property.approvalStatus}
                  tone={
                    property.approvalStatus === "approved"
                      ? "success"
                      : "neutral"
                  }
                />
                <AppText variant="title" className="mt-3" numberOfLines={1}>
                  {property.title}
                </AppText>
                <AppText muted numberOfLines={1}>
                  {property.area}, {property.city}
                </AppText>
                <AppText
                  className="mt-3"
                  style={{
                    color: colors.primary,
                    fontFamily: "Manrope_800ExtraBold",
                  }}
                >
                  {formatCedis(property.rentAmount)}/
                  {property.paymentPeriod.toLowerCase()}
                </AppText>
              </LandlordCard>
            ))}
            {!data?.portfolioHighlights.length ? (
              <View style={{ width: 260 }}>
                <LandlordCard>
                  <AppText muted>
                    Add your first property to see portfolio highlights.
                  </AppText>
                  <View className="mt-3">
                    <AppButton
                      title="Add Property"
                      icon={<Plus color="#fff" size={18} />}
                      onPress={() =>
                        router.push(
                          "/landlord/properties/create/basics" as Href,
                        )
                      }
                    />
                  </View>
                </LandlordCard>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}
