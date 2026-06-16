import { StateView } from "@/components/general/state-view";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { ScreenShell } from "@/components/ui/screen-shell";
import { router } from "expo-router";
import { Home, HousePlus, MapPinOff, TrendingUp } from "lucide-react-native";
import { View } from "react-native";

const suggestions = ["East Legon", "Kumasi", "Tema"];

export default function PropertyUnavailableScreen() {
  return (
    // <SafeAreaScreen>
    <ScreenShell title="Listing">
      <StateView
        icon={<MapPinOff color={colors.primary} size={54} />}
        title="Listing No Longer Available"
        message="This home may have been rented, sold, or removed by the landlord. FinderZ can still help you find similar properties."
        primaryAction={{
          title: "Explore Similar Properties",
          onPress: () => router.replace("/tenant/dashboard"),
        }}
        secondaryAction={{
          title: "Back to Home Feed",
          onPress: () => router.replace("/"),
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
                SOLD
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
    //<SafeAreaScreen scroll>
  );
}
