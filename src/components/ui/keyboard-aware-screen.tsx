import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaScreen } from "./safe-area-screen";

export function KeyboardAwareScreen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaScreen>
  );
}
