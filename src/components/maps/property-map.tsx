import { View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import type { PropertyMapProps } from "./property-map.types";

// TypeScript resolves this fallback while Metro selects the .native or .web
// implementation for supported application platforms.
export function PropertyMap({ height = 260 }: PropertyMapProps) {
  return (
    <View style={{ height, alignItems: "center", justifyContent: "center", borderRadius: radius.xl, backgroundColor: colors.surfaceBlue }}>
      <AppText muted>Map preview is unavailable on this platform.</AppText>
    </View>
  );
}
