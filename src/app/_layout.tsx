import { AppProviders } from "@/providers/app-providers";
import { SentrySessionContext } from "@/components/shared/sentry-session-context";
import { useAppUpdates } from "@/hooks/use-app-updates";
import { initializeMonitoring } from "@/lib/monitoring";
import {
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/manrope";
import * as Sentry from "@sentry/react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import "../../global.css";

void SplashScreen.preventAutoHideAsync();
initializeMonitoring();

function RootLayout() {
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
      <SentrySessionContext />
      <Stack screenOptions={{ headerShown: false }} />
    </AppProviders>
  );
}

export default Sentry.wrap(RootLayout);
