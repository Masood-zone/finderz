import { useState, type ReactNode } from "react";
import { ActivityIndicator, Pressable, type PressableProps, Text, View } from "react-native";
import { colors, radius, shadows } from "./design-system";

type AppButtonProps = PressableProps & {
  title: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  icon?: ReactNode;
};

export function AppButton({
  title,
  variant = "primary",
  loading,
  icon,
  disabled,
  style,
  onPressIn,
  onPressOut,
  ...props
}: AppButtonProps) {
  const [pressed, setPressed] = useState(false);
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";
  const isSecondary = variant === "secondary";
  const isGhost = variant === "ghost";
  const foreground = isPrimary || isDanger ? colors.surface : colors.primary;
  const backgroundColor = isPrimary
    ? pressed
      ? colors.primaryPressed
      : colors.primary
    : isDanger
      ? pressed
        ? colors.errorPressed
        : colors.error
      : isSecondary
        ? colors.surfaceBlue
        : "transparent";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPressIn={(event) => {
        setPressed(true);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        onPressOut?.(event);
      }}
      style={[
        {
          alignItems: "center",
          alignSelf: "stretch",
          backgroundColor,
          borderRadius: radius.lg,
          borderWidth: isGhost ? 0 : 1,
          borderColor: isPrimary ? colors.primary : isDanger ? colors.error : colors.borderStrong,
          flexDirection: "row",
          gap: 8,
          justifyContent: "center",
          minHeight: 52,
          paddingHorizontal: 20,
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
        <View style={{ alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "center" }}>
          {icon}
          <Text
            style={{
              color: foreground,
              fontSize: 16,
              fontFamily: "Manrope_700Bold",
              lineHeight: 22,
              textAlign: "center",
            }}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
