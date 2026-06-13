import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { SearchX, SlidersHorizontal, X } from "lucide-react-native";
import { StateView } from "@/components/general/state-view";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { SafeAreaScreen } from "@/components/ui/safe-area-screen";
import { ScreenShell } from "@/components/ui/screen-shell";

const filters = ["Accra", "2 Bedrooms", "Under GHS 2,500"];

export default function NoSearchResultsScreen() {
  return (
    <SafeAreaScreen>
      <ScreenShell title="Search" right={<SlidersHorizontal color={colors.primary} size={22} />}>
        <StateView
          icon={<SearchX color={colors.primary} size={54} />}
          title="No matches found"
          message="Try adjusting your filters or browse popular areas where FinderZ has active verified listings."
          primaryAction={{ title: "Clear All Filters", onPress: () => router.replace("/") }}
          secondaryAction={{ title: "Browse Popular Areas", onPress: () => router.replace("/tenant/dashboard"), variant: "secondary" }}
        >
          <View className="flex-row flex-wrap justify-center gap-2">
            {filters.map((filter) => (
              <Pressable key={filter} className="flex-row items-center gap-2 px-3 py-2" style={{ borderRadius: radius.xl, backgroundColor: colors.surfaceBlue }}>
                <AppText variant="caption" style={{ color: colors.primary, fontFamily: "Manrope_700Bold" }}>
                  {filter}
                </AppText>
                <X color={colors.primary} size={14} />
              </Pressable>
            ))}
          </View>
        </StateView>
      </ScreenShell>
    </SafeAreaScreen>
  );
}
