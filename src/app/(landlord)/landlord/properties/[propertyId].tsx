import { Image, Pressable, RefreshControl, ScrollView, View } from "react-native";
import { router, type Href, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Bath, BedDouble, Edit3, Home, MapPin } from "lucide-react-native";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { LandlordCard, StatusPill } from "@/components/landlord/landlord-shell";
import { TenantChip, TenantSectionHeader } from "@/components/tenant/tenant-shell";
import { TenantErrorState, TenantSkeleton } from "@/components/tenant/tenant-state";
import { formatEnumLabel, formatPaymentPeriod } from "@/lib/tenant/format";
import { getErrorMessage } from "@/lib/get-error-message";
import { useLandlordProperty } from "@/services/queries/hooks";
import type { LandlordProperty } from "@/types/landlord";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatCedis(pesewas: number) {
  return `GHS ${(pesewas / 100).toLocaleString("en-GH", { maximumFractionDigits: 0 })}`;
}

function toneFor(status: LandlordProperty["approvalStatus"]) {
  if (status === "approved") return "success";
  if (status === "pending" || status === "draft") return "warning";
  if (status === "rejected") return "danger";
  return "neutral";
}

export default function LandlordPropertyDetailScreen() {
  const params = useLocalSearchParams<{ propertyId?: string }>();
  const propertyId = firstParam(params.propertyId) ?? "";
  const propertyQuery = useLandlordProperty(propertyId);

  if (propertyQuery.isLoading) {
    return <TenantSkeleton variant="property" />;
  }

  if (propertyQuery.isError || !propertyQuery.data?.property) {
    return <TenantErrorState title="Property unavailable" message={getErrorMessage(propertyQuery.error, "Unable to load this property.")} onRetry={() => void propertyQuery.refetch()} />;
  }

  const property = propertyQuery.data.property;
  const cover = property.images.find((image) => image.isCover)?.imageUrl ?? property.images[0]?.imageUrl;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={propertyQuery.isRefetching} tintColor={colors.primary} onRefresh={() => void propertyQuery.refetch()} />}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="relative" style={{ height: 320, backgroundColor: colors.surfaceBlue }}>
          {cover ? <Image source={{ uri: cover }} resizeMode="cover" style={{ height: "100%", width: "100%" }} /> : null}
          <View className="absolute left-4 right-4 top-12 flex-row items-center justify-between">
            <Pressable className="h-10 w-10 items-center justify-center bg-white/90" style={{ borderRadius: 999 }} onPress={() => router.back()}>
              <ArrowLeft color={colors.primary} size={20} />
            </Pressable>
            <Pressable className="h-10 w-10 items-center justify-center bg-white/90" style={{ borderRadius: 999 }} onPress={() => router.push(`/landlord/properties/${property.id}/edit` as Href)}>
              <Edit3 color={colors.primary} size={20} />
            </Pressable>
          </View>
        </View>

        <View className="-mt-6 mx-4 rounded-2xl p-4" style={{ backgroundColor: colors.surface }}>
          <View className="flex-row flex-wrap gap-2">
            <StatusPill label={property.approvalStatus} tone={toneFor(property.approvalStatus)} />
            <TenantChip label={property.isAvailable ? "Available" : "Unavailable"} active={property.isAvailable} />
          </View>
          <AppText variant="headline" className="mt-4">
            {property.title}
          </AppText>
          <View className="mt-2 flex-row items-center gap-1">
            <MapPin color={colors.outline} size={16} />
            <AppText muted>
              {property.area}, {property.city}
            </AppText>
          </View>
          <View className="mt-4 border-t pt-4" style={{ borderColor: colors.border }}>
            <AppText variant="caption" muted>
              {formatPaymentPeriod(property.paymentPeriod)}
            </AppText>
            <AppText variant="headline" style={{ color: colors.primary }}>
              {formatCedis(property.rentAmount)}
            </AppText>
          </View>
        </View>

        <View className="mt-6 flex-row gap-2 px-4">
          {[
            { icon: BedDouble, label: `${property.bedrooms} Beds` },
            { icon: Bath, label: `${property.bathrooms} Baths` },
            { icon: Home, label: formatEnumLabel(property.propertyType) },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <View key={item.label} className="flex-1 items-center justify-center rounded-xl p-3" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                <Icon color={colors.primary} size={20} />
                <AppText variant="caption" className="mt-1 text-center" style={{ fontFamily: "Manrope_700Bold" }}>
                  {item.label}
                </AppText>
              </View>
            );
          })}
        </View>

        <View className="mt-7 px-4">
          <TenantSectionHeader title="Listing Overview" />
          <AppText muted>{property.description}</AppText>
        </View>

        <View className="mt-7 px-4">
          <TenantSectionHeader title="Property Details" />
          <LandlordCard>
            {[
              ["Furnishing", formatEnumLabel(property.furnishingStatus)],
              ["Advance", `${property.advancePeriodMonths} months`],
              ["Negotiable", property.isNegotiable ? "Yes" : "No"],
              ["Enquiries", `${property.enquiryCount}`],
              ["Address", property.address],
            ].map(([label, value]) => (
              <View key={label} className="flex-row justify-between gap-4 border-b py-3 last:border-b-0" style={{ borderColor: colors.border }}>
                <AppText muted>{label}</AppText>
                <AppText className="min-w-0 flex-1 text-right" style={{ fontFamily: "Manrope_700Bold" }}>
                  {value}
                </AppText>
              </View>
            ))}
          </LandlordCard>
        </View>

        <View className="mt-7 px-4">
          <TenantSectionHeader title="Amenities" />
          <View className="flex-row flex-wrap gap-2">
            {property.amenities.length ? property.amenities.map((amenity) => <TenantChip key={amenity} label={amenity} />) : <TenantChip label="No amenities listed" />}
          </View>
        </View>

        <View className="mt-7 px-4">
          <TenantSectionHeader title="Landlord Notes" />
          <View className="gap-3">
            {[
              ["Contact Preferences", property.contactPreferences],
              ["Inspection Availability", property.inspectionAvailability],
              ["House Rules", property.houseRules],
              ["Additional Charges", property.additionalCharges],
            ].map(([label, value]) => (
              <LandlordCard key={label}>
                <AppText variant="label" muted>
                  {label}
                </AppText>
                <AppText className="mt-1">{value || "Not specified"}</AppText>
              </LandlordCard>
            ))}
          </View>
        </View>

        {property.rejectionReason ? (
          <View className="mt-7 px-4">
            <LandlordCard>
              <AppText variant="label" style={{ color: colors.error }}>
                Rejection Reason
              </AppText>
              <AppText className="mt-1" style={{ color: colors.error }}>
                {property.rejectionReason}
              </AppText>
            </LandlordCard>
          </View>
        ) : null}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t p-4" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <AppButton title="Edit Property" icon={<Edit3 color="#fff" size={18} />} onPress={() => router.push(`/landlord/properties/${property.id}/edit` as Href)} />
      </View>
    </View>
  );
}
