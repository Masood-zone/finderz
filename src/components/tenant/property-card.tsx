import { Image, Pressable, View } from "react-native";
import { Bath, BedDouble, Heart, MapPin, ShieldCheck } from "lucide-react-native";
import { router } from "expo-router";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { formatEnumLabel, formatGhanaCedi, formatPaymentPeriod } from "@/lib/tenant/format";
import type { TenantProperty } from "@/types/tenant";

type PropertyCardProps = {
  property: TenantProperty;
  horizontal?: boolean;
  onToggleFavourite?: (property: TenantProperty) => void;
};

function PropertyImage({ property, height = 176 }: { property: TenantProperty; height?: number }) {
  if (!property.coverImage) {
    return (
      <View className="items-center justify-center" style={{ height, backgroundColor: colors.surfaceBlue }}>
        <AppText style={{ color: colors.primary, fontFamily: "Manrope_800ExtraBold" }}>FinderZ</AppText>
      </View>
    );
  }

  return <Image source={{ uri: property.coverImage }} resizeMode="cover" style={{ height, width: "100%" }} />;
}

export function PropertyCard({ property, horizontal = false, onToggleFavourite }: PropertyCardProps) {
  const openProperty = () => router.push({ pathname: "/tenant/property/[propertyId]", params: { propertyId: property.id } });

  if (horizontal) {
    return (
      <Pressable onPress={openProperty} className="flex-row gap-3 p-3" style={{ borderRadius: radius.xl, backgroundColor: colors.surface }}>
        <View className="h-28 w-28 overflow-hidden" style={{ borderRadius: radius.lg }}>
          <PropertyImage property={property} height={112} />
        </View>
        <View className="min-w-0 flex-1 justify-between py-1">
          <View>
            <AppText style={{ fontFamily: "Manrope_700Bold" }} numberOfLines={1}>
              {property.title}
            </AppText>
            <View className="mt-1 flex-row items-center gap-1">
              <MapPin color={colors.outline} size={14} />
              <AppText variant="caption" muted numberOfLines={1}>
                {property.area}, {property.city}
              </AppText>
            </View>
          </View>
          <View className="flex-row items-end justify-between gap-2">
            <AppText style={{ color: colors.primary, fontFamily: "Manrope_800ExtraBold" }}>
              {formatGhanaCedi(property.rentAmount)}
            </AppText>
            <View className="rounded-md px-2 py-1" style={{ backgroundColor: colors.surfaceBlue }}>
              <AppText variant="caption" style={{ color: colors.primary, fontFamily: "Manrope_700Bold" }}>
                {property.isAvailable ? "Available" : "Unavailable"}
              </AppText>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={openProperty} className="overflow-hidden" style={{ width: 280, borderRadius: radius.xl, backgroundColor: colors.surface }}>
      <View>
        <PropertyImage property={property} />
        <View className="absolute left-3 top-3 flex-row gap-2">
          <View className="rounded-full px-3 py-1" style={{ backgroundColor: colors.gold }}>
            <AppText variant="caption" style={{ color: colors.goldDark, fontFamily: "Manrope_700Bold" }}>
              {property.isAvailable ? "Available" : "Unavailable"}
            </AppText>
          </View>
          {property.landlord?.verified ? <ShieldCheck color={colors.primary} size={20} /> : null}
        </View>
        <Pressable
          className="absolute right-3 top-3 h-9 w-9 items-center justify-center bg-white/90"
          style={{ borderRadius: 999 }}
          onPress={(event) => {
            event.stopPropagation();
            onToggleFavourite?.(property);
          }}
        >
          <Heart color={property.isFavourite ? colors.error : colors.outline} fill={property.isFavourite ? colors.error : "transparent"} size={20} />
        </Pressable>
      </View>
      <View className="gap-3 p-4">
        <View className="gap-2">
          <AppText style={{ fontFamily: "Manrope_700Bold" }} numberOfLines={2}>
            {property.title}
          </AppText>
          <View className="flex-row items-center gap-1">
            <MapPin color={colors.outline} size={16} />
            <AppText variant="caption" muted numberOfLines={1} className="flex-1">
              {property.area}, {property.city}
            </AppText>
          </View>
        </View>
        <View className="gap-3 border-t pt-3" style={{ borderColor: colors.border }}>
          <View className="flex-row flex-wrap items-center gap-x-4 gap-y-2">
            <View className="flex-row items-center gap-1">
              <BedDouble color={colors.primary} size={16} />
              <AppText variant="caption">{property.bedrooms} Beds</AppText>
            </View>
            <View className="flex-row items-center gap-1">
              <Bath color={colors.primary} size={16} />
              <AppText variant="caption">{property.bathrooms} Baths</AppText>
            </View>
            <AppText variant="caption" muted>
              {formatEnumLabel(property.propertyType)}
            </AppText>
          </View>
          <View className="flex-row items-end justify-end gap-3">
            <View className="items-end">
              <AppText style={{ color: colors.primary, fontFamily: "Manrope_800ExtraBold" }}>
                {formatGhanaCedi(property.rentAmount)}
              </AppText>
              <AppText variant="caption" muted>
                {formatPaymentPeriod(property.paymentPeriod)}
              </AppText>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
