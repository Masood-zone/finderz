import { PropsWithChildren } from "react";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { QueryProvider } from "./query-provider";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <QueryProvider>{children}</QueryProvider>
    </SafeAreaProvider>
  );
}
