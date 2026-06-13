import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, type PressableProps, Text, View } from "react-native";
import { colors, radius } from "./design-system";

type AppButtonProps = PressableProps & {
  title: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  icon?: ReactNode;
};

export function AppButton({ title, variant = "primary", loading, icon, disabled, style, ...props }: AppButtonProps) {
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      className="h-12 flex-row items-center justify-center gap-2"
      style={({ pressed }) => [
        {
          borderRadius: radius.lg,
          backgroundColor: isPrimary ? colors.gold : isDanger ? colors.errorSoft : variant === "secondary" ? colors.surface : "transparent",
          borderWidth: variant === "secondary" ? 1.5 : 0,
          borderColor: variant === "secondary" ? colors.primary : "transparent",
          opacity: disabled ? 0.5 : pressed ? 0.86 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        typeof style === "function" ? style({ pressed }) : style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.goldDark : colors.primary} />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {icon}
          <Text
            className="font-bold"
            style={{
              color: isPrimary ? colors.goldDark : isDanger ? colors.error : colors.primary,
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
