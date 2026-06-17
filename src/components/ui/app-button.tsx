import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, type PressableProps, Text, View } from "react-native";
import { colors, radius, shadows } from "./design-system";

type AppButtonProps = PressableProps & {
  title: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  icon?: ReactNode;
};

export function AppButton({ title, variant = "primary", loading, icon, disabled, style, ...props }: AppButtonProps) {
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";
  const isSecondary = variant === "secondary";
  const isGhost = variant === "ghost";
  const foreground = isPrimary || isDanger ? colors.surface : colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      className="h-12 flex-row items-center justify-center gap-2 px-5"
      style={({ pressed }) => [
        {
          borderRadius: radius.lg,
          backgroundColor: isPrimary
            ? pressed
              ? colors.primaryPressed
              : colors.primary
            : isDanger
              ? pressed
                ? colors.errorPressed
                : colors.error
              : isSecondary
                ? colors.surfaceBlue
                : "transparent",
          borderWidth: isGhost ? 0 : 1,
          borderColor: isPrimary ? colors.primary : isDanger ? colors.error : colors.borderStrong,
          ...(isPrimary || isDanger ? shadows.sm : {}),
          opacity: disabled || loading ? 0.55 : pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        typeof style === "function" ? style({ pressed, hovered: false }) : style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {icon}
          <Text
            className="font-bold"
            style={{
              color: foreground,
              fontFamily: "Manrope_700Bold",
            }}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
