import { Pressable, View } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { AppText } from "./app-text";
import { FinderzLogo } from "./finderz-logo";
import { colors, radius } from "./design-system";

type ScreenShellProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  showBack?: boolean;
  right?: ReactNode;
};

export function ScreenShell({ title, subtitle, children, showBack = false, right }: ScreenShellProps) {
  return (
    <View className="flex-1 px-6 py-5">
      <View className="h-12 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          {showBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              className="h-10 w-10 items-center justify-center"
              style={{ borderRadius: radius.lg, backgroundColor: colors.surface }}
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
            >
              <ArrowLeft color={colors.primary} size={20} />
            </Pressable>
          ) : (
            <FinderzLogo variant="mark" size="sm" />
          )}
          {title ? <AppText variant="title">{title}</AppText> : null}
        </View>
        {right}
      </View>

      {subtitle ? (
        <AppText muted className="mt-2">
          {subtitle}
        </AppText>
      ) : null}

      {children}
    </View>
  );
}
