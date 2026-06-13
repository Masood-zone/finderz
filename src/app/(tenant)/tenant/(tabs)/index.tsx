import { RefreshControl, ScrollView, TextInput, View } from "react-native";
import { Link, router } from "expo-router";
import { MapPin, Search, SlidersHorizontal } from "lucide-react-native";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { PropertyCard } from "@/components/tenant/property-card";
import { TenantChip, TenantSectionHeader, TenantTopBar } from "@/components/tenant/tenant-shell";
import { TenantEmptyState, TenantErrorState, TenantSkeleton } from "@/components/tenant/tenant-state";
import { getErrorMessage } from "@/lib/get-error-message";
import { useTenantFeed, useToggleTenantFavourite } from "@/services/queries/hooks";
import type { TenantProperty } from "@/types/tenant";

function SectionPropertyRail({ title, properties }: { title: string; properties: TenantProperty[] }) {
  const toggleFavourite = useToggleTenantFavourite();

  if (!properties.length) {
    return null;
  }

  return (
    <View className="mt-7">
      <TenantSectionHeader title={title} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingRight: 16 }}>
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} onToggleFavourite={(item) => toggleFavourite.mutate({ propertyId: item.id, favourite: !item.isFavourite })} />
        ))}
      </ScrollView>
    </View>
  );
}

export default function TenantHomeScreen() {
  const feed = useTenantFeed();

  const refresh = () => {
    void feed.refetch();
  };

  if (feed.isLoading) {
    return <TenantSkeleton rows={4} />;
  }

  if (feed.isError) {
    return <TenantErrorState message={getErrorMessage(feed.error, "Unable to load your tenant feed.")} onRetry={refresh} />;
  }

  const data = feed.data;
  const hasProperties = Boolean(data?.recommended.length || data?.affordableNearby.length || data?.recentlyAdded.length);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <TenantTopBar title={`Good morning, ${data?.user.name.split(" ")[0] ?? "there"}`} subtitle={data?.location ?? "Ghana"} userName={data?.user.name} />
      <ScrollView
        refreshControl={<RefreshControl refreshing={feed.isRefetching} tintColor={colors.primary} onRefresh={refresh} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-4 flex-row items-center gap-3 rounded-2xl px-4" style={{ height: 56, backgroundColor: colors.surface }}>
          <Search color={colors.outline} size={22} />
          <TextInput
            className="min-w-0 flex-1 text-base"
            placeholder="Search location, property or area"
            placeholderTextColor="#8a94a6"
            editable={false}
            onPress={() => router.push("/tenant/search")}
            style={{ color: colors.text, fontFamily: "Manrope_400Regular" }}
          />
          <Link href="/tenant/filters" asChild>
            <SlidersHorizontal color={colors.primary} size={22} />
          </Link>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-5" contentContainerStyle={{ gap: 10 }}>
          {(data?.categories ?? ["All", "Apartment", "House", "Room"]).map((category, index) => (
            <TenantChip
              key={category}
              label={category}
              active={index === 0}
              onPress={() => router.push({ pathname: "/tenant/search", params: { propertyType: category === "All" ? undefined : category.toUpperCase() } })}
            />
          ))}
        </ScrollView>

        <View className="mt-7 overflow-hidden rounded-2xl p-6" style={{ minHeight: 180, backgroundColor: colors.primaryContainer }}>
          <View className="absolute -right-8 -bottom-10 h-36 w-36 rounded-full bg-white/10" />
          <View className="max-w-[78%]">
            <AppText variant="headline" style={{ color: "#fff" }}>
              Find your next home without the stress
            </AppText>
            <View className="mt-5 self-start">
              <AppButton title="Start Searching" onPress={() => router.push("/tenant/search")} />
            </View>
          </View>
        </View>

        {!hasProperties ? (
          <TenantEmptyState
            title="No approved listings yet"
            message="Once landlords publish approved properties, your recommended homes and nearby affordable listings will appear here."
            actionTitle="Search anyway"
            onAction={() => router.push("/tenant/search")}
          />
        ) : null}

        <SectionPropertyRail title="Recommended for You" properties={data?.recommended ?? []} />

        {data?.popularLocations.length ? (
          <View className="mt-7">
            <TenantSectionHeader title="Popular Locations" />
            <View className="flex-row flex-wrap gap-3">
              {data.popularLocations.map((location) => (
                <View key={`${location.region}-${location.city}`} className="w-[47%] justify-center rounded-2xl p-4" style={{ minHeight: 92, backgroundColor: colors.primary }}>
                  <MapPin color={colors.gold} size={20} />
                  <AppText className="mt-2" style={{ color: "#fff", fontFamily: "Manrope_700Bold" }}>
                    {location.city}
                  </AppText>
                  <AppText variant="caption" style={{ color: colors.primaryMuted }}>
                    {location.count} listings
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View className="mt-7">
          <TenantSectionHeader title="Affordable Near You" />
          <View className="gap-3">
            {(data?.affordableNearby ?? []).map((property) => (
              <PropertyCard key={property.id} property={property} horizontal />
            ))}
          </View>
        </View>

        <SectionPropertyRail title="Recently Added" properties={data?.recentlyAdded ?? []} />
      </ScrollView>
    </View>
  );
}
