import { StateView } from "@/components/general/state-view";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { SafeAreaScreen } from "@/components/ui/safe-area-screen";
import { ScreenShell } from "@/components/ui/screen-shell";
import { router, useLocalSearchParams } from "expo-router";
import { Home, HousePlus, MapPinOff, TrendingUp } from "lucide-react-native";
import { View } from "react-native";

const suggestions = ["East Legon", "Kumasi", "Tema"];

const reasonMessages: Record<string, { title: string; message: string; badge: string }> = {
  rented: {
    title: "This property has been rented",
    message: "The listing is no longer accepting enquiries, but FinderZ can help you find similar available homes.",
    badge: "RENTED",
  },
  removed: {
    title: "Listing removed",
    message: "The landlord has removed this listing. Browse similar verified properties instead.",
    badge: "REMOVED",
  },
  rejected: {
    title: "Listing unavailable",
    message: "This listing is not currently approved for tenant viewing.",
    badge: "UNAVAILABLE",
  },
  suspended: {
    title: "Listing unavailable",
    message: "This listing is temporarily inaccessible. You can continue browsing other verified properties.",
    badge: "PAUSED",
  },
  deleted: {
    title: "Listing deleted",
    message: "This listing no longer exists on FinderZ.",
    badge: "DELETED",
  },
};

export default function PropertyUnavailableScreen() {
  const params = useLocalSearchParams<{ reason?: string }>();
  const reason = Array.isArray(params.reason) ? params.reason[0] : params.reason;
  const copy = reasonMessages[reason ?? ""] ?? {
    title: "Listing no longer available",
    message: "This home may have been rented, removed, or made unavailable by the landlord. FinderZ can still help you find similar properties.",
    badge: "UNAVAILABLE",
  };

  return (
    <SafeAreaScreen>
      <ScreenShell title="Listing">
      <StateView
        icon={<MapPinOff color={colors.primary} size={54} />}
        title={copy.title}
        message={copy.message}
        primaryAction={{
          title: "Explore Similar Properties",
          onPress: () => router.replace("/tenant/search"),
        }}
        secondaryAction={{
          title: "Back to Home Feed",
          onPress: () => router.replace("/tenant"),
          variant: "secondary",
        }}
      >
        <View
          className="rounded-2xl p-4"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <TrendingUp color={colors.primary} size={18} />
              <AppText style={{ fontFamily: "Manrope_700Bold" }}>
                Trending nearby
              </AppText>
            </View>
            <View
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: colors.errorSoft }}
            >
              <AppText
                variant="caption"
                style={{ color: colors.error, fontFamily: "Manrope_700Bold" }}
              >
                {copy.badge}
              </AppText>
            </View>
          </View>
          <View className="mt-4 gap-3">
            {suggestions.map((area) => (
              <View
                key={area}
                className="flex-row items-center gap-3 rounded-xl p-3"
                style={{ backgroundColor: colors.surfaceSoft }}
              >
                <View
                  className="h-10 w-10 items-center justify-center"
                  style={{
                    borderRadius: radius.lg,
                    backgroundColor: colors.surfaceBlue,
                  }}
                >
                  {area === "Tema" ? (
                    <HousePlus color={colors.primary} size={20} />
                  ) : (
                    <Home color={colors.primary} size={20} />
                  )}
                </View>
                <View className="min-w-0 flex-1">
                  <AppText style={{ fontFamily: "Manrope_700Bold" }}>
                    {area}
                  </AppText>
                  <AppText variant="caption" muted>
                    Similar verified listings available
                  </AppText>
                </View>
              </View>
            ))}
          </View>
        </View>
      </StateView>
      </ScreenShell>
    </SafeAreaScreen>
  );
}
