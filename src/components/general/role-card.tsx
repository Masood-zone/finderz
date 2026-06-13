import { Pressable, View } from "react-native";
import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react-native";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";

type RoleCardProps = {
  title: string;
  subtitle: string;
  selected: boolean;
  icon: ReactNode;
  onPress: () => void;
};

export function RoleCard({ title, subtitle, selected, icon, onPress }: RoleCardProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      className="flex-row items-center gap-4 p-4"
      style={{
        minHeight: 116,
        borderRadius: radius.xl,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? colors.surfaceBlue : colors.surface,
      }}
    >
      <View className="h-14 w-14 items-center justify-center" style={{ borderRadius: radius.xl, backgroundColor: selected ? colors.primary : colors.surfaceSoft }}>
        {icon}
      </View>
      <View className="min-w-0 flex-1">
        <AppText variant="title">{title}</AppText>
        <AppText muted className="mt-1">
          {subtitle}
        </AppText>
      </View>
      {selected ? <CheckCircle2 color={colors.primary} size={24} /> : null}
    </Pressable>
  );
}
