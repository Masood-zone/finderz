import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";

export function KeyboardAwareScreen({ children }: { children: ReactNode }) {
  return (
    //<SafeAreaScreen scroll>
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
    >
      {children}
    </KeyboardAvoidingView>
    //<SafeAreaScreen scroll>
  );
}
