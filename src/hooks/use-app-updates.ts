import { captureHandledError } from "@/lib/monitoring";
import * as Updates from "expo-updates";
import { useEffect } from "react";
import { Alert } from "react-native";

export function useAppUpdates(isReady: boolean, promptShownRef: { current: boolean }) {
  useEffect(() => {
    if (!isReady || promptShownRef.current || !Updates.isEnabled) {
      return;
    }

    promptShownRef.current = true;

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
                  captureHandledError(error, {
                    name: "expo-update-fetch",
                    tags: { channel: Updates.channel },
                  });
                  Alert.alert(
                    "Update failed",
                    error instanceof Error ? error.message : "Please try again later.",
                  );
                }
              },
            },
          ],
        );
      } catch (error) {
        promptShownRef.current = false;
        captureHandledError(error, {
          name: "expo-update-check",
          level: "warning",
          tags: { channel: Updates.channel },
        });
      }
    }

    void checkForUpdates();
  }, [isReady, promptShownRef]);
}
