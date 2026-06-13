import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaScreen } from "./safe-area-screen";

export function KeyboardAwareScreen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaScreen scroll>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        {children}
      </KeyboardAvoidingView>
    </SafeAreaScreen>
  );
}
