import { AppProviders } from "@/providers/app-providers";
import {
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/manrope";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Updates from "expo-updates";
import { useEffect, useRef } from "react";
import { Alert } from "react-native";
import "../../global.css";

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

  useEffect(() => {
    if (!fontsLoaded || updatePromptShownRef.current || !Updates.isEnabled) {
      return;
    }

    updatePromptShownRef.current = true;

    async function checkForUpdates() {
      try {
        const update = await Updates.checkForUpdateAsync();

        if (!update.isAvailable) {
          return;
        }

        Alert.alert(
          "Update available",
          "A new FinderZ preview update is ready to download and install.",
          [
            { text: "Not now", style: "cancel" },
            {
              text: "Download and install",
              onPress: async () => {
                try {
                  await Updates.fetchUpdateAsync();
                  await Updates.reloadAsync();
                } catch (error) {
                  Alert.alert(
                    "Update failed",
                    error instanceof Error ? error.message : "Please try again later.",
                  );
                }
              },
            },
          ],
        );
      } catch {
        updatePromptShownRef.current = false;
      }
    }

    void checkForUpdates();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }} />
    </AppProviders>
  );
}
