import { addNetworkStateListener, getNetworkStateAsync, type NetworkState } from "expo-network";
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

    const syncNetworkState = (state: NetworkState) => {
      if (isMounted) {
        onlineManager.setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
      }
    };

    const networkSubscription = addNetworkStateListener(syncNetworkState);
    void getNetworkStateAsync().then(syncNetworkState).catch(() => {
      // Keep the last known state when the native network module cannot respond.
    });

    return () => {
      isMounted = false;
      appStateSubscription.remove();
      networkSubscription.remove();
    };
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
