import { WifiOff } from "lucide-react-native";
import { View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";

export function NetworkStatusBanner({ visible }: { visible: boolean }) {
  if (!visible) {
    return null;
  }

  return (
    <View className="mx-6 mt-3 flex-row items-center gap-2 px-3 py-2" style={{ borderRadius: radius.lg, backgroundColor: colors.errorSoft }}>
      <WifiOff color={colors.error} size={18} />
      <AppText variant="caption" style={{ color: colors.error, fontFamily: "Manrope_700Bold" }}>
        No internet connection
      </AppText>
    </View>
  );
}
