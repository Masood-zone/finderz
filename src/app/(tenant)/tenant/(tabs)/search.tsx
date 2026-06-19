import { useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Building2, History, Home, MapPin, Search, X } from "lucide-react-native";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { FinderzLogo } from "@/components/ui/finderz-logo";
import { TenantChip, TenantSectionHeader } from "@/components/tenant/tenant-shell";

const suggestedLocations = [
  { city: "Accra", count: "1.2k+ Properties" },
  { city: "Kumasi", count: "840 Properties" },
  { city: "Cape Coast", count: "450 Properties" },
];

const categories = [
  { label: "Full House", value: "HOUSE", icon: Home },
  { label: "Apartments", value: "APARTMENT", icon: Building2 },
  { label: "Studio Rooms", value: "STUDIO", icon: Home },
  { label: "Hostels", value: "HOSTEL", icon: Building2 },
];

export default function TenantSearchScreen() {
  const params = useLocalSearchParams<{
    region?: string;
    city?: string;
    area?: string;
    latitude?: string;
    longitude?: string;
    radiusKm?: string;
  }>();
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState(["Modern Apartments in East Legon", "Land Plots in Prampram"]);

  const canSearch = useMemo(() => query.trim().length > 0, [query]);
  const locationParams = {
    region: params.region,
    city: params.city,
    area: params.area,
    latitude: params.latitude,
    longitude: params.longitude,
    radiusKm: params.radiusKm,
  };

  const submitSearch = (value = query) => {
    const next = value.trim();
    if (!next) return;
    setHistory((items) => [next, ...items.filter((item) => item !== next)].slice(0, 5));
    router.push({ pathname: "/tenant/results", params: { ...locationParams, q: next } });
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center gap-2">
          <FinderzLogo variant="mark" size="sm" />
          <AppText variant="title" style={{ color: colors.primary }}>
            FinderZ
          </AppText>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View className="mt-4 flex-row items-center gap-3 rounded-2xl px-4" style={{ height: 56, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
          <Search color={colors.outline} size={22} />
          <TextInput
            className="min-w-0 flex-1 text-base"
            placeholder="Search location, property or area"
            placeholderTextColor="#8a94a6"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => submitSearch()}
            returnKeyType="search"
            style={{ color: colors.text, fontFamily: "Manrope_400Regular" }}
          />
        </View>

        {canSearch ? (
          <Pressable className="mt-3 rounded-xl p-4" style={{ backgroundColor: colors.primary }} onPress={() => submitSearch()}>
            <AppText style={{ color: "#fff", fontFamily: "Manrope_700Bold" }}>Search for “{query.trim()}”</AppText>
          </Pressable>
        ) : null}

        <View className="mt-8">
          <TenantSectionHeader
            title="Recent Searches"
            action={
              <Pressable onPress={() => setHistory([])}>
                <AppText variant="caption" style={{ color: colors.primary, fontFamily: "Manrope_700Bold" }}>
                  Clear History
                </AppText>
              </Pressable>
            }
          />
          <View className="gap-3">
            {history.map((item) => (
              <Pressable key={item} className="flex-row items-center gap-3 rounded-2xl p-4" style={{ backgroundColor: colors.surface }} onPress={() => submitSearch(item)}>
                <History color={colors.outline} size={20} />
                <AppText className="min-w-0 flex-1" numberOfLines={1}>
                  {item}
                </AppText>
                <Pressable
                  onPress={(event) => {
                    event.stopPropagation();
                    setHistory((items) => items.filter((historyItem) => historyItem !== item));
                  }}
                >
                  <X color={colors.outline} size={18} />
                </Pressable>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mt-8">
          <TenantSectionHeader title="Suggested Locations" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
            {suggestedLocations.map((location) => (
              <Pressable
                key={location.city}
                className="justify-end overflow-hidden p-4"
                style={{ width: 280, height: 180, borderRadius: radius.xl, backgroundColor: colors.primary }}
                onPress={() => submitSearch(location.city)}
              >
                <View className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
                <MapPin color={colors.gold} size={28} />
                <AppText variant="headline" className="mt-3" style={{ color: "#fff" }}>
                  {location.city}
                </AppText>
                <AppText variant="caption" style={{ color: colors.gold }}>
                  {location.count}
                </AppText>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View className="mt-8">
          <TenantSectionHeader title="Housing Categories" />
          <View className="flex-row flex-wrap gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Pressable
                  key={category.value}
                  className="w-[47%] items-center gap-3 rounded-2xl p-5"
                  style={{ backgroundColor: colors.surfaceBlue }}
                  onPress={() => router.push({ pathname: "/tenant/results", params: { ...locationParams, propertyType: category.value } })}
                >
                  <View className="h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: colors.gold }}>
                    <Icon color={colors.goldDark} size={26} />
                  </View>
                  <AppText style={{ color: colors.primary, fontFamily: "Manrope_700Bold" }}>{category.label}</AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="mt-8 rounded-2xl p-5" style={{ backgroundColor: colors.primaryContainer }}>
          <AppText variant="title" style={{ color: "#fff" }}>
            Search with Filters
          </AppText>
          <AppText className="mt-2" style={{ color: colors.primaryMuted }}>
            Narrow down by price range, bedrooms, furnishing, amenities, and verified listings.
          </AppText>
          <View className="mt-4 self-start">
            <TenantChip label="Open Filters" active onPress={() => router.push("/tenant/filters")} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
