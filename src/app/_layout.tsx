import { AppProviders } from "@/providers/app-providers";
import { useAppUpdates } from "@/hooks/use-app-updates";
import {
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/manrope";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import "../../global.css";
import { PushNotificationManager } from "@/components/notifications/push-notification-manager";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const updatePromptShownRef = useRef(false);
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useAppUpdates(fontsLoaded, updatePromptShownRef);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppProviders>
      <PushNotificationManager />
      <Stack screenOptions={{ headerShown: false }} />
    </AppProviders>
  );
}
