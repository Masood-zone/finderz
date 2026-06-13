import { Image, ImageProps, View } from "react-native";
import { AppText } from "./app-text";
import { colors, radius } from "./design-system";

type FinderzLogoProps = {
  variant?: "mark" | "text" | "lockup";
  size?: "sm" | "md" | "lg";
  light?: boolean;
};

const sizeMap = {
  sm: 32,
  md: 56,
  lg: 104,
};

export function FinderzLogo({ variant = "lockup", size = "md", light = false }: FinderzLogoProps) {
  const imageSize = sizeMap[size];
  const imageProps: Partial<ImageProps> = {
    resizeMode: "contain",
  };

  if (variant === "text") {
    return <Image source={require("../../../assets/images/finderz-logo-text.png")} style={{ width: imageSize * 3.4, height: imageSize }} {...imageProps} />;
  }

  if (variant === "mark") {
    return <Image source={require("../../../assets/images/finderz-logo.png")} style={{ width: imageSize, height: imageSize }} {...imageProps} />;
  }

  return (
    <View className="flex-row items-center gap-2">
      <View className="items-center justify-center overflow-hidden" style={{ width: imageSize, height: imageSize, borderRadius: radius.md }}>
        <Image source={require("../../../assets/images/finderz-logo.png")} style={{ width: imageSize, height: imageSize }} {...imageProps} />
      </View>
      <AppText variant={size === "sm" ? "title" : "display"} style={{ color: light ? "#fff" : colors.primary, fontFamily: "Manrope_800ExtraBold" }}>
        FinderZ
      </AppText>
    </View>
  );
}
