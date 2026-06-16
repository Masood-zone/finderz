import { StateView } from "@/components/general/state-view";
import { colors } from "@/components/ui/design-system";
import * as Network from "expo-network";
import { router } from "expo-router";
import { CloudOff, WifiOff } from "lucide-react-native";
import { useState } from "react";
import { Linking, Platform } from "react-native";

export default function NoInternetScreen() {
  const [isChecking, setIsChecking] = useState(false);

  const retry = async () => {
    setIsChecking(true);
    const state = await Network.getNetworkStateAsync();
    setIsChecking(false);

    if (state.isConnected && state.isInternetReachable !== false) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/");
      }
    }
  };

  const openSettings = () => {
    if (Platform.OS === "ios") {
      void Linking.openURL("app-settings:");
      return;
    }

    void Linking.openSettings();
  };

  return (
    // <SafeAreaScreen>
    <StateView
      icon={<CloudOff color={colors.primary} size={52} />}
      title="You’re Offline"
      message="FinderZ needs an internet connection to refresh listings, messages, and saved homes."
      primaryAction={{
        title: isChecking ? "Checking..." : "Retry Connection",
        onPress: retry,
      }}
      secondaryAction={{
        title: "Check Settings",
        onPress: openSettings,
        variant: "secondary",
      }}
    >
      <WifiOff color={colors.outline} size={26} />
    </StateView>
    //<SafeAreaScreen>
  );
}
