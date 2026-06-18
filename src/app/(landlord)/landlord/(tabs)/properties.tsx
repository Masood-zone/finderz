import { router, type Href } from "expo-router";
import { Copy, Edit3, Eye, Home, Plus, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, View } from "react-native";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { StateView } from "@/components/general/state-view";
import { LandlordCard, LandlordTopBar, StatusPill } from "@/components/landlord/landlord-shell";
import { getErrorMessage } from "@/lib/get-error-message";
import { useLandlordProperties, useLandlordPropertyAction } from "@/services/queries/hooks";
import type { LandlordProperty, LandlordPropertyStatus } from "@/types/landlord";

const filters: LandlordPropertyStatus[] = ["all", "draft", "pending", "approved", "rejected", "rented"];

function formatCedis(pesewas: number) {
  return `GH₵${(pesewas / 100).toLocaleString("en-GH", { maximumFractionDigits: 0 })}`;
}

function toneFor(status: LandlordProperty["approvalStatus"]) {
  if (status === "approved") return "success";
  if (status === "pending" || status === "draft") return "warning";
  if (status === "rejected") return "danger";
  return "neutral";
}

export default function MyPropertiesScreen() {
  const [status, setStatus] = useState<LandlordPropertyStatus>("all");
  const properties = useLandlordProperties(status);
  const action = useLandlordPropertyAction();

  const runAction = (propertyId: string, actionName: "mark-rented" | "duplicate" | "delete") => {
    if (actionName === "delete") {
      Alert.alert("Delete property", "This removes the listing and its images from FinderZ.", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => action.mutate({ propertyId, action: actionName }) },
      ]);
      return;
    }

    action.mutate({ propertyId, action: actionName });
  };

  if (properties.isError) {
    return (
      <StateView
        icon={<Home color={colors.primary} size={34} />}
        title="Properties unavailable"
        message={getErrorMessage(properties.error, "Unable to load your properties.")}
        primaryAction={{ title: "Try Again", onPress: () => void properties.refetch() }}
      />
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <LandlordTopBar title="My Properties" subtitle="Manage your listings" />
      <ScrollView
        refreshControl={<RefreshControl refreshing={properties.isRefetching} tintColor={colors.primary} onRefresh={() => void properties.refetch()} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 14 }}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {filters.map((filter) => (
            <Pressable
              key={filter}
              className="h-10 flex-row items-center justify-center gap-2 rounded-full px-4"
              style={{ backgroundColor: status === filter ? colors.primary : colors.surfaceBlue }}
              onPress={() => setStatus(filter)}
            >
              <AppText variant="caption" style={{ color: status === filter ? "#fff" : colors.primary, fontFamily: "Manrope_700Bold", textTransform: "capitalize" }}>
                {filter} {properties.data?.counts[filter] !== undefined ? `(${properties.data.counts[filter]})` : ""}
              </AppText>
            </Pressable>
          ))}
        </ScrollView>

        <AppButton title="Add Property" icon={<Plus color="#fff" size={18} />} onPress={() => router.push("/landlord/properties/create/basics" as Href)} />

        {(properties.data?.properties ?? []).map((property) => (
          <LandlordCard key={property.id}>
            <View className="flex-row items-start justify-between gap-3">
              <View className="min-w-0 flex-1">
                <StatusPill label={property.approvalStatus} tone={toneFor(property.approvalStatus)} />
                <AppText variant="title" className="mt-3" numberOfLines={1}>
                  {property.title}
                </AppText>
                <AppText muted numberOfLines={1}>
                  {property.area}, {property.city}
                </AppText>
                <AppText className="mt-2" style={{ color: colors.primary, fontFamily: "Manrope_800ExtraBold" }}>
                  {formatCedis(property.rentAmount)} / {property.paymentPeriod.toLowerCase()}
                </AppText>
                {property.rejectionReason ? (
                  <AppText variant="caption" className="mt-2" style={{ color: colors.error }}>
                    {property.rejectionReason}
                  </AppText>
                ) : null}
              </View>
              <View className="items-end gap-2">
                <AppText variant="caption" muted>
                  {property.enquiryCount} enquiries
                </AppText>
                <StatusPill label={property.isAvailable ? "Available" : "Unavailable"} tone={property.isAvailable ? "success" : "neutral"} />
              </View>
            </View>

            <View className="mt-4 flex-row flex-wrap gap-2">
              <AppButton title="View" variant="secondary" icon={<Eye color={colors.primary} size={16} />} style={{ flex: 1, minHeight: 42 }} onPress={() => router.push(`/tenant/property/${property.id}`)} />
              <AppButton title="Edit" variant="secondary" icon={<Edit3 color={colors.primary} size={16} />} style={{ flex: 1, minHeight: 42 }} onPress={() => router.push(`/landlord/properties/${property.id}/edit` as Href)} />
            </View>
            <View className="mt-2 flex-row flex-wrap gap-2">
              <AppButton title="Rented" variant="ghost" style={{ flex: 1, minHeight: 42 }} onPress={() => runAction(property.id, "mark-rented")} />
              <AppButton title="Copy" variant="ghost" icon={<Copy color={colors.primary} size={16} />} style={{ flex: 1, minHeight: 42 }} onPress={() => runAction(property.id, "duplicate")} />
              <AppButton title="Delete" variant="ghost" icon={<Trash2 color={colors.primary} size={16} />} style={{ flex: 1, minHeight: 42 }} onPress={() => runAction(property.id, "delete")} />
            </View>
          </LandlordCard>
        ))}

        {!properties.isLoading && !properties.data?.properties.length ? (
          <LandlordCard>
            <AppText variant="title">No properties here yet</AppText>
            <AppText muted className="mt-1">
              Listings matching this filter will appear here.
            </AppText>
          </LandlordCard>
        ) : null}
      </ScrollView>
    </View>
  );
}
