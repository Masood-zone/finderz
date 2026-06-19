import { RefreshControl, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { SafeAreaScreen } from "@/components/ui/safe-area-screen";
import { PropertyCard } from "@/components/tenant/property-card";
import { TenantTopBar } from "@/components/tenant/tenant-shell";
import { TenantEmptyState, TenantErrorState, TenantSkeleton } from "@/components/tenant/tenant-state";
import { getErrorMessage } from "@/lib/get-error-message";
import { useTenantFavourites, useToggleTenantFavourite } from "@/services/queries/hooks";

export default function TenantFavouritesScreen() {
  const favourites = useTenantFavourites();
  const toggleFavourite = useToggleTenantFavourite();

  if (favourites.isLoading) {
    return <TenantSkeleton rows={4} />;
  }

  if (favourites.isError) {
    return <TenantErrorState message={getErrorMessage(favourites.error, "Unable to load saved properties.")} onRetry={() => void favourites.refetch()} />;
  }

  return (
    <SafeAreaScreen edges={["right", "bottom", "left"]}>
      <TenantTopBar />
      <ScrollView
        refreshControl={<RefreshControl refreshing={favourites.isRefetching} tintColor={colors.primary} onRefresh={() => void favourites.refetch()} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6">
          <AppText variant="headline">Favourites ({favourites.data?.favourites.length ?? 0})</AppText>
          <AppText muted className="mt-1">
            Your curated list of FinderZ properties.
          </AppText>
        </View>

        {!favourites.data?.favourites.length ? (
          <TenantEmptyState title="No saved properties yet" message="Start exploring and save homes you love." actionTitle="Explore Properties" onAction={() => router.push("/tenant/search")} />
        ) : (
          <View className="gap-4">
            {favourites.data.favourites.map((property) => (
              <View key={property.id} style={{ borderRadius: radius.xl, overflow: "hidden" }}>
                <PropertyCard property={property} onToggleFavourite={(item) => toggleFavourite.mutate({ propertyId: item.id, favourite: false })} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaScreen>
  );
}
