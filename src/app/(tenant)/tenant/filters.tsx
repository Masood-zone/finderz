import { Pressable, ScrollView, TextInput, View } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, Check, MapPin } from "lucide-react-native";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { Checkbox } from "@/components/ui/checkbox";
import { colors, radius } from "@/components/ui/design-system";
import { TenantChip, TenantSectionHeader } from "@/components/tenant/tenant-shell";
import { useTenantFilterStore } from "@/store/tenant-filter-store";
import type { TenantFilters } from "@/types/tenant";

const regions = ["Greater Accra", "Ashanti", "Western", "Central"];
const propertyTypes = ["APARTMENT", "HOUSE", "ROOM", "STUDIO", "HOSTEL", "COMMERCIAL"];
const paymentPeriods = ["MONTHLY", "QUARTERLY", "BIANNUALLY", "YEARLY"];
const furnishingStatuses = ["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"];
const amenities = ["air-conditioning", "water-supply", "parking", "security", "wifi", "backup-generator"];

function cleanFilters(filters: TenantFilters) {
  const params: Record<string, string> = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === "any") return;
    if (Array.isArray(value)) {
      if (value.length) params[key] = value.join(",");
      return;
    }
    params[key] = String(value);
  });

  return params;
}

function FilterInput({ label, value, onChangeText, keyboardType = "default" }: { label: string; value?: string; onChangeText: (value: string) => void; keyboardType?: "default" | "numeric" }) {
  return (
    <View className="flex-1">
      <AppText variant="label" muted className="mb-2">
        {label}
      </AppText>
      <TextInput
        className="h-12 rounded-xl px-4 text-base"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, color: colors.text, fontFamily: "Manrope_400Regular" }}
      />
    </View>
  );
}

export default function TenantFiltersScreen() {
  const filters = useTenantFilterStore((state) => state.filters);
  const updateFilter = useTenantFilterStore((state) => state.updateFilter);
  const resetFilters = useTenantFilterStore((state) => state.resetFilters);

  const toggleAmenity = (slug: string) => {
    const current = filters.amenities ?? [];
    updateFilter("amenities", current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]);
  };

  const apply = () => {
    router.push({ pathname: "/tenant/results", params: cleanFilters(filters) });
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="flex-row items-center justify-between px-4 py-4" style={{ backgroundColor: colors.background }}>
        <Pressable className="h-10 w-10 items-center justify-center" style={{ borderRadius: radius.lg, backgroundColor: colors.surface }} onPress={() => router.back()}>
          <ArrowLeft color={colors.primary} size={20} />
        </Pressable>
        <AppText variant="title" style={{ color: colors.primary }}>
          Filters
        </AppText>
        <Pressable onPress={resetFilters}>
          <AppText variant="caption" style={{ color: colors.primary, fontFamily: "Manrope_700Bold" }}>
            Reset
          </AppText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View className="gap-7">
          <View>
            <TenantSectionHeader title="Location" />
            <View className="gap-3">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {regions.map((region) => (
                  <TenantChip key={region} label={region} active={filters.region === region} onPress={() => updateFilter("region", filters.region === region ? undefined : region)} />
                ))}
              </ScrollView>
              <View className="flex-row gap-3">
                <FilterInput label="City" value={filters.city} onChangeText={(value) => updateFilter("city", value)} />
                <FilterInput label="Area" value={filters.area} onChangeText={(value) => updateFilter("area", value)} />
              </View>
            </View>
          </View>

          <View>
            <TenantSectionHeader title="Price Range" />
            <View className="flex-row gap-3">
              <FilterInput label="Min Rent" value={filters.minRent ? String(filters.minRent) : ""} keyboardType="numeric" onChangeText={(value) => updateFilter("minRent", value ? Number(value) : undefined)} />
              <FilterInput label="Max Rent" value={filters.maxRent ? String(filters.maxRent) : ""} keyboardType="numeric" onChangeText={(value) => updateFilter("maxRent", value ? Number(value) : undefined)} />
            </View>
          </View>

          <View>
            <TenantSectionHeader title="Payment Period" />
            <View className="flex-row flex-wrap gap-2">
              {paymentPeriods.map((period) => (
                <TenantChip key={period} label={period.replace("_", " ")} active={filters.paymentPeriod === period} onPress={() => updateFilter("paymentPeriod", filters.paymentPeriod === period ? undefined : period)} />
              ))}
            </View>
          </View>

          <View>
            <TenantSectionHeader title="Property Type" />
            <View className="flex-row flex-wrap gap-2">
              {propertyTypes.map((type) => (
                <TenantChip key={type} label={type.replace("_", " ")} active={filters.propertyType === type} onPress={() => updateFilter("propertyType", filters.propertyType === type ? undefined : type)} />
              ))}
            </View>
          </View>

          <View>
            <TenantSectionHeader title="Bedrooms and Bathrooms" />
            <View className="gap-4">
              <View>
                <AppText variant="label" muted className="mb-2">
                  Bedrooms
                </AppText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                  {[undefined, 1, 2, 3, 4].map((value) => (
                    <TenantChip key={value ?? "any"} label={value ? `${value}+` : "Any"} active={filters.bedrooms === value} onPress={() => updateFilter("bedrooms", value)} />
                  ))}
                </ScrollView>
              </View>
              <View>
                <AppText variant="label" muted className="mb-2">
                  Bathrooms
                </AppText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                  {[undefined, 1, 2, 3, 4].map((value) => (
                    <TenantChip key={value ?? "any"} label={value ? `${value}+` : "Any"} active={filters.bathrooms === value} onPress={() => updateFilter("bathrooms", value)} />
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>

          <View>
            <TenantSectionHeader title="Furnishing" />
            <View className="flex-row flex-wrap gap-2">
              {furnishingStatuses.map((status) => (
                <TenantChip key={status} label={status.replace("_", " ")} active={filters.furnishingStatus === status} onPress={() => updateFilter("furnishingStatus", filters.furnishingStatus === status ? undefined : status)} />
              ))}
            </View>
          </View>

          <View>
            <TenantSectionHeader title="Availability" />
            <View className="flex-row gap-2">
              {(["available", "any", "unavailable"] as const).map((availability) => (
                <TenantChip key={availability} label={availability} active={(filters.availability ?? "available") === availability} onPress={() => updateFilter("availability", availability)} />
              ))}
            </View>
          </View>

          <View>
            <TenantSectionHeader title="Amenities" />
            <View className="flex-row flex-wrap gap-2">
              {amenities.map((amenity) => {
                const active = filters.amenities?.includes(amenity) ?? false;
                return (
                  <Pressable
                    key={amenity}
                    className="h-10 flex-row items-center gap-2 rounded-lg px-3"
                    style={{ backgroundColor: active ? colors.surfaceBlue : colors.surface, borderWidth: 1, borderColor: active ? colors.primary : colors.border }}
                    onPress={() => toggleAmenity(amenity)}
                  >
                    {active ? <Check color={colors.primary} size={16} /> : <MapPin color={colors.outline} size={16} />}
                    <AppText variant="caption" style={{ color: active ? colors.primary : colors.text, fontFamily: "Manrope_700Bold" }}>
                      {amenity.replace("-", " ")}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Checkbox checked={Boolean(filters.verifiedOnly)} onChange={(value) => updateFilter("verifiedOnly", value)} label={<AppText muted>Verified listings only</AppText>} />
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 gap-3 border-t p-4" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <AppButton title="Apply Filters" onPress={apply} />
        <AppButton title="Show Results" variant="secondary" onPress={apply} />
      </View>
    </View>
  );
}
