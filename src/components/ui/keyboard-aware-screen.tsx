import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type ScrollViewProps,
} from "react-native";
import { SafeAreaScreen } from "./safe-area-screen";

type KeyboardAwareScreenProps = {
  children: ReactNode;
  contentContainerStyle?: ScrollViewProps["contentContainerStyle"];
};

export function KeyboardAwareScreen({
  children,
  contentContainerStyle,
}: KeyboardAwareScreenProps) {
  const content = (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[
        {
          flexGrow: 1,
          paddingBottom: 24,
        },
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="always"
      keyboardDismissMode="none"
      nestedScrollEnabled
      overScrollMode="never"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );

  return (
    <SafeAreaScreen edges={["top", "left", "right"]}>
      {Platform.OS === "ios" ? (
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          {content}
        </KeyboardAvoidingView>
      ) : (
        <View style={{ flex: 1 }}>{content}</View>
      )}
    </SafeAreaScreen>
  );
}
