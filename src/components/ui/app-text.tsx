import { Text, type TextProps } from "react-native";
import { colors } from "./design-system";

type AppTextProps = TextProps & {
  variant?: "display" | "headline" | "title" | "body" | "label" | "caption";
  muted?: boolean;
};

const variantClassNames = {
  display: "text-[32px] leading-[40px] font-bold",
  headline: "text-[24px] leading-[32px] font-bold",
  title: "text-[20px] leading-[28px] font-semibold",
  body: "text-[16px] leading-[24px]",
  label: "text-[12px] leading-[16px] font-semibold uppercase",
  caption: "text-[12px] leading-[16px]",
};

const variantFonts = {
  display: "Manrope_800ExtraBold",
  headline: "Manrope_800ExtraBold",
  title: "Manrope_700Bold",
  body: "Manrope_400Regular",
  label: "Manrope_700Bold",
  caption: "Manrope_400Regular",
};

export function AppText({ variant = "body", muted = false, className = "", style, ...props }: AppTextProps) {
  return (
    <Text
      className={`${variantClassNames[variant]} ${className}`}
      style={[{ color: muted ? colors.muted : colors.text, fontFamily: variantFonts[variant] }, style]}
      {...props}
    />
  );
}
