import { SafeAreaView } from "react-native-safe-area-context";
import type { ReactNode } from "react";
import { ScrollView, View, type ViewProps } from "react-native";
import { colors } from "./design-system";

type SafeAreaScreenProps = ViewProps & {
  scroll?: boolean;
  children: ReactNode;
};

export function SafeAreaScreen({ scroll, children, className = "", style, ...props }: SafeAreaScreenProps) {
  if (scroll) {
    return (
      <SafeAreaView className={`flex-1 ${className}`} style={[{ backgroundColor: colors.background }, style]} {...props}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          <View className="flex-1" style={style}>
            {children}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${className}`} style={[{ backgroundColor: colors.background }, style]} {...props}>
      {children}
    </SafeAreaView>
  );
}
