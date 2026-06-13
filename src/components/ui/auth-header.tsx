import { View } from "react-native";
import { AppText } from "./app-text";
import { FinderzLogo } from "./finderz-logo";

export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View className="gap-6">
      <View className="items-center">
        <FinderzLogo variant="text" size="md" />
      </View>
      <View>
        <AppText variant="headline">{title}</AppText>
        <AppText muted className="mt-1">
          {subtitle}
        </AppText>
      </View>
    </View>
  );
}
