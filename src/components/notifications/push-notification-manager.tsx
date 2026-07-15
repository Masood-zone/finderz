import { useEffect } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router, type Href } from "expo-router";
import { useCurrentUser } from "@/services/queries/hooks";
import { registerPushToken } from "@/services/api/notifications";

Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: true }) });

export function PushNotificationManager() {
  const currentUser = useCurrentUser();
  useEffect(() => {
    if (!currentUser.data?.user?.id || !Device.isDevice || Platform.OS === "web") return;
    void (async () => {
      const existing = await Notifications.getPermissionsAsync();
      const permission = existing.status === "granted" ? existing : await Notifications.requestPermissionsAsync();
      if (permission.status !== "granted") return;
      if (Platform.OS === "android") await Notifications.setNotificationChannelAsync("default", { name: "FinderZ updates", importance: Notifications.AndroidImportance.HIGH });
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      await registerPushToken({ token, platform: Platform.OS as "android" | "ios" });
    })().catch(() => undefined);
  }, [currentUser.data?.user?.id]);
  useEffect(() => Notifications.addNotificationResponseReceivedListener((response) => { const deepLink = response.notification.request.content.data?.deepLink; if (typeof deepLink === "string" && deepLink.startsWith("/")) router.push(deepLink as Href); }).remove, []);
  return null;
}
