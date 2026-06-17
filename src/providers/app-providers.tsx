import { PropsWithChildren } from "react";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";

import { KeyboardProvider } from "react-native-keyboard-controller";
import { QueryProvider } from "./query-provider";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <KeyboardProvider>
        <QueryProvider>{children}</QueryProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
