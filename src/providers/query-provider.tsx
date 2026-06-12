import { getNetworkStateAsync } from "expo-network";
import { focusManager, onlineManager, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, useEffect, useState } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import { createQueryClient } from "@/lib/query-client";

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

export function QueryProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => createQueryClient());

  useEffect(() => {
    const appStateSubscription = AppState.addEventListener("change", onAppStateChange);
    let isMounted = true;

    const syncNetworkState = async () => {
      const state = await getNetworkStateAsync();

      if (isMounted) {
        onlineManager.setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
      }
    };

    const interval = setInterval(syncNetworkState, 15_000);
    syncNetworkState();

    return () => {
      isMounted = false;
      appStateSubscription.remove();
      clearInterval(interval);
    };
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
