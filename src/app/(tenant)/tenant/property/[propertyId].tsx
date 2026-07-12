import { useState } from "react";
import { Alert, Image, Linking, Pressable, RefreshControl, ScrollView, Share, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Bath, BedDouble, ExternalLink, Flag, Heart, MapPin, MessageCircle, Phone, Share2, ShieldAlert, ShieldCheck } from "lucide-react-native";
import { PropertyMap } from "@/components/maps/property-map";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { TenantChip, TenantSectionHeader } from "@/components/tenant/tenant-shell";
import { TenantErrorState, TenantSkeleton } from "@/components/tenant/tenant-state";
import { formatEnumLabel, formatGhanaCedi, formatPaymentPeriod } from "@/lib/tenant/format";
import { getErrorMessage } from "@/lib/get-error-message";
import { useCreateTenantEnquiry, useTenantProperty, useToggleTenantFavourite } from "@/services/queries/hooks";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function TenantPropertyDetailScreen() {
  const params = useLocalSearchParams<{ propertyId?: string }>();
  const propertyId = firstParam(params.propertyId) ?? "";
  const propertyQuery = useTenantProperty(propertyId);
  const toggleFavourite = useToggleTenantFavourite();
  const createEnquiry = useCreateTenantEnquiry();
  const [mapFailed, setMapFailed] = useState(false);
  const [message, setMessage] = useState("Hello, I’m interested in this FinderZ listing. Is it still available?");

  if (propertyQuery.isLoading) {
    return <TenantSkeleton variant="property" />;
  }

  if (propertyQuery.isError || !propertyQuery.data?.property) {
    return <TenantErrorState title="Property unavailable" message={getErrorMessage(propertyQuery.error, "This listing could not be loaded.")} onRetry={() => void propertyQuery.refetch()} />;
  }

  const property = propertyQuery.data.property;
  const cover = property.coverImage;
  const unavailable = !property.isAvailable || property.approvalStatus !== "APPROVED";
  const existingEnquiry = property.tenantEnquiry;
  const hasSentEnquiry = Boolean(existingEnquiry);
  const landlordPhone = property.landlord?.phone?.trim() ?? "";
  const canCallLandlord = Boolean(landlordPhone);
  const latitude = Number(property.latitude);
  const longitude = Number(property.longitude);
  const propertyCoordinates = property.latitude && property.longitude && Number.isFinite(latitude) && Number.isFinite(longitude)
    ? { latitude, longitude }
    : null;

  const startEnquiry = async () => {
    if (existingEnquiry) {
      router.push({ pathname: "/tenant/enquiry/[enquiryId]", params: { enquiryId: existingEnquiry.id } });
      return;
    }

    try {
      const result = await createEnquiry.mutateAsync({ propertyId: property.id, message, preferredContactMethod: "IN_APP" });
      router.push({ pathname: "/tenant/enquiry/[enquiryId]", params: { enquiryId: result.enquiryId } });
    } catch (error) {
      Alert.alert("Unable to start enquiry", getErrorMessage(error, "Please try again."));
    }
  };

  const shareProperty = async () => {
    await Share.share({
      title: property.title,
      message: `${property.title} in ${property.area}, ${property.city} - ${formatGhanaCedi(property.rentAmount)}`,
    });
  };

  const callLandlord = async () => {
    if (!canCallLandlord) {
      Alert.alert("Phone unavailable", "This landlord has not added a phone number yet.");
      return;
    }

    const dialNumber = landlordPhone.replace(/[^+\d]/g, "");
    if (!dialNumber) {
      Alert.alert("Phone unavailable", "This landlord phone number is not valid for calling.");
      return;
    }

    try {
      await Linking.openURL(`tel:${dialNumber}`);
    } catch {
      Alert.alert("Unable to place call", "Your phone could not open the dialer right now.");
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={propertyQuery.isRefetching} tintColor={colors.primary} onRefresh={() => void propertyQuery.refetch()} />}
        contentContainerStyle={{ paddingBottom: 188 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="relative" style={{ height: 360, backgroundColor: colors.surfaceBlue }}>
          {cover ? <Image source={{ uri: cover }} resizeMode="cover" style={{ width: "100%", height: "100%" }} /> : null}
          <View className="absolute left-4 right-4 top-12 flex-row items-center justify-between">
            <Pressable className="h-10 w-10 items-center justify-center bg-white/90" style={{ borderRadius: 999 }} onPress={() => router.back()}>
              <ArrowLeft color={colors.primary} size={20} />
            </Pressable>
            <View className="flex-row gap-2">
              <Pressable className="h-10 w-10 items-center justify-center bg-white/90" style={{ borderRadius: 999 }} onPress={shareProperty}>
                <Share2 color={colors.primary} size={20} />
              </Pressable>
              <Pressable className="h-10 w-10 items-center justify-center bg-white/90" style={{ borderRadius: 999 }} onPress={() => toggleFavourite.mutate({ propertyId: property.id, favourite: !property.isFavourite })}>
                <Heart color={property.isFavourite ? colors.error : colors.primary} fill={property.isFavourite ? colors.error : "transparent"} size={20} />
              </Pressable>
            </View>
          </View>
          <Pressable className="absolute bottom-4 right-4 rounded-full bg-black/70 px-4 py-2" onPress={() => router.push({ pathname: "/tenant/gallery/[propertyId]", params: { propertyId: property.id } })}>
            <AppText variant="caption" style={{ color: "#fff", fontFamily: "Manrope_700Bold" }}>
              1/{Math.max(property.images.length, 1)}
            </AppText>
          </Pressable>
        </View>

        <View className="-mt-6 mx-4 rounded-2xl p-4" style={{ backgroundColor: colors.surface }}>
          <View className="flex-row flex-wrap gap-2">
            <TenantChip label={unavailable ? "Unavailable" : "Available"} active={!unavailable} />
            {property.landlord?.verified ? <TenantChip label="Verified" /> : null}
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
              {formatGhanaCedi(property.rentAmount)}
            </AppText>
          </View>
        </View>

        <View className="mt-6 flex-row gap-2 px-4">
          {[
            { icon: BedDouble, label: `${property.bedrooms} Beds` },
            { icon: Bath, label: `${property.bathrooms} Baths` },
            { icon: ShieldCheck, label: formatEnumLabel(property.furnishingStatus) },
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
          <TenantSectionHeader title="Overview" />
          <AppText muted>{property.description}</AppText>
        </View>

        <View className="mt-7 px-4">
          <TenantSectionHeader title="Amenities" />
          <View className="flex-row flex-wrap gap-2">
            {property.amenities.length ? property.amenities.map((amenity) => <TenantChip key={amenity.id} label={amenity.name} />) : <TenantChip label="No amenities listed" />}
          </View>
        </View>

        <View className="mt-7 px-4">
          <TenantSectionHeader title="Neighborhood" />
          {propertyCoordinates && !mapFailed ? (
            <PropertyMap coordinates={propertyCoordinates} height={230} onMapError={() => setMapFailed(true)} />
          ) : (
            <View className="h-44 items-center justify-center overflow-hidden rounded-2xl px-5" style={{ backgroundColor: colors.surfaceBlue, borderWidth: 1, borderColor: colors.border }}>
              <MapPin color={colors.goldDark} size={36} />
              <AppText className="mt-2 text-center" style={{ color: colors.primary, fontFamily: "Manrope_700Bold" }}>{property.address}</AppText>
              <AppText variant="caption" muted className="mt-1 text-center">
                {mapFailed ? "The map could not be loaded. The saved address is still available." : "This legacy listing does not have an exact map pin yet."}
              </AppText>
            </View>
          )}

          <View className="mt-3 rounded-2xl p-4" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
            <AppText style={{ fontFamily: "Manrope_700Bold" }}>{property.address}</AppText>
            <AppText variant="caption" muted className="mt-1">{[property.landmark, property.area, property.city, property.region].filter(Boolean).join(" · ")}</AppText>
          </View>

          {propertyCoordinates ? (
            <View className="mt-3">
              <AppButton
                title="Open in Maps"
                variant="secondary"
                icon={<ExternalLink color={colors.primary} size={18} />}
                onPress={() => void Linking.openURL(`https://www.openstreetmap.org/?mlat=${propertyCoordinates.latitude}&mlon=${propertyCoordinates.longitude}#map=18/${propertyCoordinates.latitude}/${propertyCoordinates.longitude}`)}
              />
            </View>
          ) : null}
        </View>

        <View className="mt-7 px-4">
          <TenantSectionHeader title="Listed by" />
          <View className="flex-row items-center gap-4 rounded-2xl p-4" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
            <View className="h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: colors.surfaceBlue }}>
              <AppText style={{ color: colors.primary, fontFamily: "Manrope_800ExtraBold" }}>{property.landlord?.name?.slice(0, 2).toUpperCase() ?? "L"}</AppText>
            </View>
            <View className="min-w-0 flex-1">
              <AppText style={{ fontFamily: "Manrope_700Bold" }}>{property.landlord?.name ?? "FinderZ Landlord"}</AppText>
              <AppText variant="caption" muted>
                {property.landlord?.activeListings ?? 0} active listings
              </AppText>
              {landlordPhone ? (
                <AppText variant="caption" className="mt-1" style={{ color: colors.primary, fontFamily: "Manrope_700Bold" }}>
                  {landlordPhone}
                </AppText>
              ) : null}
            </View>
            {property.landlord?.verified ? <ShieldCheck color={colors.primary} size={22} /> : null}
          </View>
          <View className="mt-4">
            <AppButton title={canCallLandlord ? "Call Landlord" : "Phone Unavailable"} variant="secondary" icon={<Phone color={colors.primary} size={18} />} disabled={!canCallLandlord} onPress={() => void callLandlord()} />
          </View>
        </View>

        <View className="mx-4 mt-7 flex-row gap-3 rounded-2xl p-4" style={{ backgroundColor: colors.errorSoft }}>
          <ShieldAlert color={colors.error} size={22} />
          <AppText className="min-w-0 flex-1" style={{ color: colors.error }}>
            Never pay upfront fees before viewing a property and verifying documentation. Report suspicious listings immediately.
          </AppText>
        </View>

        <View className="mt-7 px-4">
          <TenantSectionHeader title={hasSentEnquiry ? "Enquiry Sent" : "Start Enquiry"} />
          {hasSentEnquiry ? (
            <View className="rounded-2xl p-4" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
              <AppText style={{ fontFamily: "Manrope_700Bold" }}>You have already contacted this landlord.</AppText>
              <AppText className="mt-1" muted>
                Open the conversation to continue chatting about this property.
              </AppText>
            </View>
          ) : (
            <TextInput
              multiline
              value={message}
              onChangeText={setMessage}
              style={{
                minHeight: 96,
                borderRadius: radius.xl,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 14,
                color: colors.text,
                fontFamily: "Manrope_400Regular",
                textAlignVertical: "top",
              }}
            />
          )}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 gap-3 border-t p-4" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <View className="flex-row gap-3">
          <View style={{ width: 132 }}>
            <AppButton title={canCallLandlord ? "Call" : "No Phone"} variant="secondary" icon={<Phone color={colors.primary} size={18} />} disabled={!canCallLandlord} onPress={() => void callLandlord()} />
          </View>
          <View className="flex-1">
            <AppButton
              title={unavailable ? "Unavailable" : hasSentEnquiry ? "Enquiry Sent" : "Send Enquiry"}
              loading={createEnquiry.isPending}
              disabled={unavailable}
              icon={<MessageCircle color={colors.goldDark} size={18} />}
              onPress={startEnquiry}
            />
          </View>
        </View>
        <View>
          <AppButton title="Report" variant="secondary" icon={<Flag color={colors.primary} size={18} />} onPress={() => Alert.alert("Report listing", "Reporting workflow will be connected in a later moderation slice.")} />
        </View>
      </View>
    </View>
  );
}
