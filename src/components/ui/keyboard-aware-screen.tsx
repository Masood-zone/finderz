import type { ReactNode } from "react";
import type { ScrollViewProps } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaScreen } from "./safe-area-screen";

type KeyboardAwareScreenProps = {
  children: ReactNode;
  contentContainerStyle?: ScrollViewProps["contentContainerStyle"];
  bottomOffset?: number;
};

export function KeyboardAwareScreen({
  children,
  contentContainerStyle,
  bottomOffset = 32,
}: KeyboardAwareScreenProps) {
  return (
    <SafeAreaScreen edges={["top", "left", "right"]}>
      <KeyboardAwareScrollView
        bottomOffset={bottomOffset}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          {
            flexGrow: 1,
            paddingBottom: 32,
          },
          contentContainerStyle,
        ]}
      >
        {children}
      </KeyboardAwareScrollView>
    </SafeAreaScreen>
  );
}
