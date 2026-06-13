import { useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, SlidersHorizontal, SortAsc } from "lucide-react-native";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { PropertyCard } from "@/components/tenant/property-card";
import { TenantChip } from "@/components/tenant/tenant-shell";
import { TenantEmptyState, TenantErrorState, TenantSkeleton } from "@/components/tenant/tenant-state";
import { getErrorMessage } from "@/lib/get-error-message";
import { useTenantProperties, useToggleTenantFavourite } from "@/services/queries/hooks";
import type { TenantFilters, TenantPropertySort } from "@/types/tenant";

const sortOptions: Array<{ label: string; value: TenantPropertySort }> = [
  { label: "Relevance", value: "relevance" },
  { label: "Newest", value: "newest" },
  { label: "Lowest Price", value: "lowest-price" },
  { label: "Highest Price", value: "highest-price" },
];

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function TenantResultsScreen() {
  const params = useLocalSearchParams();
  const [sort, setSort] = useState<TenantPropertySort>((getParam(params.sort) as TenantPropertySort) ?? "relevance");
  const filters = useMemo<TenantFilters>(
    () => ({
      q: getParam(params.q),
      region: getParam(params.region),
      city: getParam(params.city),
      area: getParam(params.area),
      propertyType: getParam(params.propertyType),
      minRent: getParam(params.minRent) ? Number(getParam(params.minRent)) : undefined,
      maxRent: getParam(params.maxRent) ? Number(getParam(params.maxRent)) : undefined,
      paymentPeriod: getParam(params.paymentPeriod),
      furnishingStatus: getParam(params.furnishingStatus),
      bedrooms: getParam(params.bedrooms) ? Number(getParam(params.bedrooms)) : undefined,
      bathrooms: getParam(params.bathrooms) ? Number(getParam(params.bathrooms)) : undefined,
      availability: (getParam(params.availability) as TenantFilters["availability"]) ?? "available",
      verifiedOnly: getParam(params.verifiedOnly) === "true",
      amenities: getParam(params.amenities)?.split(",").filter(Boolean),
      sort,
    }),
    [params, sort],
  );
  const results = useTenantProperties(filters);
  const toggleFavourite = useToggleTenantFavourite();

  if (results.isLoading) {
    return <TenantSkeleton rows={4} />;
  }

  if (results.isError) {
    return <TenantErrorState message={getErrorMessage(results.error, "Unable to load search results.")} onRetry={() => void results.refetch()} />;
  }

  const data = results.data;
  const title = filters.q ? `${filters.q}` : filters.propertyType ? `${filters.propertyType.toLowerCase()} listings` : "Search Results";

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="px-4 pb-3 pt-4" style={{ backgroundColor: colors.background }}>
        <View className="flex-row items-center gap-3">
          <Pressable className="h-10 w-10 items-center justify-center" style={{ borderRadius: radius.lg, backgroundColor: colors.surface }} onPress={() => router.back()}>
            <ArrowLeft color={colors.primary} size={20} />
          </Pressable>
          <View className="min-w-0 flex-1">
            <AppText variant="title" numberOfLines={1}>
              {title}
            </AppText>
            <AppText variant="caption" muted>
              {data?.total ?? 0} Results Found
            </AppText>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4" contentContainerStyle={{ gap: 10 }}>
          <TenantChip label="Filter" onPress={() => router.push({ pathname: "/tenant/filters", params })} />
          {sortOptions.map((option) => (
            <TenantChip key={option.value} label={option.label} active={sort === option.value} onPress={() => setSort(option.value)} />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={results.isRefetching} tintColor={colors.primary} onRefresh={() => void results.refetch()} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 36, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {!data?.properties.length ? (
          <TenantEmptyState title="No matches found" message="Try adjusting your filters or browsing popular areas for active FinderZ listings." actionTitle="Edit Filters" onAction={() => router.push("/tenant/filters")} />
        ) : (
          data.properties.map((property) => (
            <View key={property.id} style={{ borderRadius: radius.xl, overflow: "hidden" }}>
              <PropertyCard property={property} onToggleFavourite={(item) => toggleFavourite.mutate({ propertyId: item.id, favourite: !item.isFavourite })} />
            </View>
          ))
        )}
      </ScrollView>

      <Pressable className="absolute bottom-6 right-5 h-14 w-14 items-center justify-center" style={{ borderRadius: 999, backgroundColor: colors.primary }} onPress={() => router.push("/tenant/filters")}>
        <SlidersHorizontal color="#fff" size={24} />
      </Pressable>
      <View className="absolute bottom-6 left-5 h-10 flex-row items-center gap-2 rounded-full px-4" style={{ backgroundColor: colors.surface }}>
        <SortAsc color={colors.primary} size={18} />
        <AppText variant="caption" style={{ color: colors.primary, fontFamily: "Manrope_700Bold" }}>
          {sortOptions.find((option) => option.value === sort)?.label}
        </AppText>
      </View>
    </View>
  );
}
