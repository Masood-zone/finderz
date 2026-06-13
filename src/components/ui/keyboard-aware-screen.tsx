import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { SafeAreaScreen } from "./safe-area-screen";

export function KeyboardAwareScreen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaScreen scroll>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <View className="flex-1">{children}</View>
      </KeyboardAvoidingView>
    </SafeAreaScreen>
  );
}
