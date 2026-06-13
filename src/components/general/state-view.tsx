import { View } from "react-native";
import type { ReactNode } from "react";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";

type StateAction = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

type StateViewProps = {
  icon: ReactNode;
  title: string;
  message: string;
  primaryAction?: StateAction;
  secondaryAction?: StateAction;
  children?: ReactNode;
};

export function StateView({ icon, title, message, primaryAction, secondaryAction, children }: StateViewProps) {
  return (
    <View className="flex-1 justify-center px-6 py-8">
      <View className="items-center">
        <View className="h-24 w-24 items-center justify-center" style={{ borderRadius: radius.xxl, backgroundColor: colors.surfaceBlue }}>
          {icon}
        </View>
        <AppText variant="headline" className="mt-6 text-center">
          {title}
        </AppText>
        <AppText muted className="mt-3 text-center">
          {message}
        </AppText>
      </View>

      {children ? <View className="mt-8">{children}</View> : null}

      <View className="mt-8 gap-3">
        {primaryAction ? <AppButton title={primaryAction.title} variant={primaryAction.variant} onPress={primaryAction.onPress} /> : null}
        {secondaryAction ? <AppButton title={secondaryAction.title} variant={secondaryAction.variant ?? "secondary"} onPress={secondaryAction.onPress} /> : null}
      </View>
    </View>
  );
}
