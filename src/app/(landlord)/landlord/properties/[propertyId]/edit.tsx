import { Redirect, useLocalSearchParams, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { colors } from "@/components/ui/design-system";
import { useLandlordProperty } from "@/services/queries/hooks";
import { useLandlordPropertyDraftStore } from "@/store/landlord-property-draft-store";

export default function EditPropertyScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();
  const property = useLandlordProperty(propertyId ?? "");
  const loadDraft = useLandlordPropertyDraftStore((state) => state.loadDraft);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!property.data?.property || loaded) return;
    const item = property.data.property;
    loadDraft({
      id: item.id,
      title: item.title,
      propertyType: item.propertyType,
      description: item.description,
      bedrooms: item.bedrooms,
      bathrooms: item.bathrooms,
      furnishingStatus: item.furnishingStatus,
      isAvailable: item.isAvailable,
      region: item.region,
      city: item.city,
      area: item.area,
      landmark: item.landmark,
      address: item.address,
      latitude: item.latitude,
      longitude: item.longitude,
      rentAmountCedis: item.rentAmount / 100,
      paymentPeriod: item.paymentPeriod,
      advancePeriodMonths: item.advancePeriodMonths,
      isNegotiable: item.isNegotiable,
      additionalCharges: item.additionalCharges,
      availableFrom: item.availableFrom?.slice(0, 10) ?? "",
      amenities: item.amenities,
      images: item.images,
      contactPreferences: item.contactPreferences,
      inspectionAvailability: item.inspectionAvailability,
      houseRules: item.houseRules,
    });
    setLoaded(true);
  }, [loadDraft, loaded, property.data?.property]);

  if (loaded) {
    return <Redirect href={"/landlord/properties/create/basics" as Href} />;
  }

  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}
