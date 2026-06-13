import { ActivityIndicator, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { FinderzLogo } from "@/components/ui/finderz-logo";

export function LoadingScreen({ label = "Loading FinderZ" }: { label?: string }) {
  return (
    <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: colors.background }}>
      <FinderzLogo variant="mark" size="lg" />
      <AppText className="mt-4 text-center" style={{ color: colors.primary, fontFamily: "Manrope_700Bold" }}>
        {label}
      </AppText>
      <ActivityIndicator className="mt-5" color={colors.goldDark} />
    </View>
  );
}
