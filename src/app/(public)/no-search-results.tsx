import { StateView } from "@/components/general/state-view";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { SafeAreaScreen } from "@/components/ui/safe-area-screen";
import { ScreenShell } from "@/components/ui/screen-shell";
import { router, useLocalSearchParams } from "expo-router";
import { SearchX, SlidersHorizontal, X } from "lucide-react-native";
import { Pressable, View } from "react-native";

function toList(value: string | string[] | undefined) {
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join(",") : value;
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function NoSearchResultsScreen() {
  const params = useLocalSearchParams<{ q?: string; filters?: string }>();
  const searchTerm = Array.isArray(params.q) ? params.q[0] : params.q;
  const filters = toList(params.filters);

  return (
    <SafeAreaScreen>
      <ScreenShell
        title="Search"
        right={<SlidersHorizontal color={colors.primary} size={22} />}
      >
      <StateView
        icon={<SearchX color={colors.primary} size={54} />}
        title="No matches found"
        message={searchTerm ? `No verified listings matched "${searchTerm}". Try adjusting your filters or browse popular areas.` : "Try adjusting your filters or browse popular areas where FinderZ has active verified listings."}
        primaryAction={{
          title: "Clear All Filters",
          onPress: () => router.replace("/tenant/search"),
        }}
        secondaryAction={{
          title: searchTerm ? "Modify Search" : "Return to Discovery",
          onPress: () => router.replace("/tenant/search"),
          variant: "secondary",
        }}
      >
        {filters.length ? (
          <View className="flex-row flex-wrap justify-center gap-2">
            {filters.map((filter) => (
              <Pressable
                key={filter}
                className="flex-row items-center gap-2 px-3 py-2"
                style={{
                  borderRadius: radius.xl,
                  backgroundColor: colors.surfaceBlue,
                }}
              >
                <AppText
                  variant="caption"
                  style={{ color: colors.primary, fontFamily: "Manrope_700Bold" }}
                >
                  {filter}
                </AppText>
                <X color={colors.primary} size={14} />
              </Pressable>
            ))}
          </View>
        ) : null}
      </StateView>
      </ScreenShell>
    </SafeAreaScreen>
  );
}
