import Constants from "expo-constants";
import * as Updates from "expo-updates";
import * as Sentry from "@sentry/react-native";
import { publicEnv } from "./env";

type CaptureContext = {
  name: string;
  level?: "error" | "warning" | "info";
  tags?: Record<string, string | number | boolean | null | undefined>;
  extra?: Record<string, unknown>;
};

const appVersion = Constants.expoConfig?.version ?? "unknown";
const appSlug = Constants.expoConfig?.slug ?? "finderz";
const appOwner = Constants.expoConfig?.owner ?? "finderzs-team";
const environment = publicEnv.EXPO_PUBLIC_APP_ENV ?? (__DEV__ ? "development" : "production");
let monitoringInitialized = false;
const nativeBuildVersion =
  Constants.nativeBuildVersion ??
  String(
    Constants.expoConfig?.ios?.buildNumber ??
      Constants.expoConfig?.android?.versionCode ??
      "unknown",
  );

function getUpdateGroup() {
  const manifest = Updates.manifest;

  if (!manifest || typeof manifest !== "object") {
    return undefined;
  }

  const metadata = "metadata" in manifest ? manifest.metadata : undefined;

  if (metadata && typeof metadata === "object" && "updateGroup" in metadata) {
    const updateGroup = metadata.updateGroup;
    return typeof updateGroup === "string" ? updateGroup : undefined;
  }

  return undefined;
}

function scrubSensitiveEventData(event: Sentry.ErrorEvent) {
  if (event.request?.cookies) {
    delete event.request.cookies;
  }

  const headers = event.request?.headers;

  if (headers) {
    for (const key of Object.keys(headers)) {
      const normalizedKey = key.toLowerCase();

      if (normalizedKey.includes("authorization") || normalizedKey.includes("cookie")) {
        delete headers[key];
      }
    }
  }

  return event;
}

export function initializeMonitoring() {
  if (!publicEnv.EXPO_PUBLIC_SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: publicEnv.EXPO_PUBLIC_SENTRY_DSN,
    environment,
    release: `${appSlug}@${appVersion}`,
    dist: nativeBuildVersion,
    sendDefaultPii: false,
    tracesSampleRate: environment === "production" ? 0.1 : 0.25,
    beforeSend: scrubSensitiveEventData,
  });

  monitoringInitialized = true;
  setExpoUpdateTags();
}

export function setExpoUpdateTags() {
  if (!monitoringInitialized) {
    return;
  }

  const updateGroup = getUpdateGroup();
  const scope = Sentry.getGlobalScope();

  scope.setTag("app.version", appVersion);
  scope.setTag("app.slug", appSlug);
  scope.setTag("expo.runtimeVersion", Updates.runtimeVersion ?? "unknown");
  scope.setTag("expo.channel", Updates.channel ?? "unknown");
  scope.setTag("expo.updateId", Updates.updateId ?? "embedded");
  scope.setTag("expo.isEmbeddedUpdate", String(Updates.isEmbeddedLaunch));

  if (updateGroup) {
    scope.setTag("expo.updateGroup", updateGroup);
    scope.setTag(
      "expo.updateDebugUrl",
      `https://expo.dev/accounts/${appOwner}/projects/${appSlug}/updates/${updateGroup}`,
    );
  }
}

export function setMonitoringUserId(userId: string | null | undefined) {
  if (!monitoringInitialized) {
    return;
  }

  Sentry.setUser(userId ? { id: userId } : null);
}

export function captureHandledError(error: unknown, context: CaptureContext) {
  if (!monitoringInitialized) {
    return undefined;
  }

  return Sentry.withScope((scope) => {
    scope.setLevel(context.level ?? "error");
    scope.setTag("handled", "true");
    scope.setTag("error.context", context.name);

    for (const [key, value] of Object.entries(context.tags ?? {})) {
      if (value !== undefined && value !== null) {
        scope.setTag(key, String(value));
      }
    }

    for (const [key, value] of Object.entries(context.extra ?? {})) {
      scope.setExtra(key, value);
    }

    return Sentry.captureException(error);
  });
}

export function appendMonitoringReference(message: string, eventId?: string) {
  if (!eventId || environment === "production") {
    return message;
  }

  return `${message}\nReference: ${eventId}`;
}
