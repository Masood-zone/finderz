import Constants from "expo-constants";
import { z } from "zod";

const publicEnvSchema = z.object({
  EXPO_PUBLIC_API_URL: z.preprocess((value) => (value === "" ? undefined : value), z.string().url().optional()),
  EXPO_PUBLIC_APP_ENV: z.enum(["development", "preview", "production", "test"]).optional(),
  EXPO_PUBLIC_SENTRY_DSN: z.preprocess((value) => (value === "" ? undefined : value), z.string().url().optional()),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

const parsedPublicEnv = publicEnvSchema.safeParse({
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
  EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
});

export const publicEnv = parsedPublicEnv.success ? parsedPublicEnv.data : {};

function isLoopbackHost(url: string) {
  try {
    const host = new URL(url).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return false;
  }
}

function getExpoDevServerOrigin() {
  const hostUri = Constants.expoConfig?.hostUri;

  if (!hostUri) {
    return null;
  }

  const normalizedHostUri = hostUri.replace(/^exp(s)?:\/\//, "").replace(/^https?:\/\//, "");

  try {
    return new URL(`http://${normalizedHostUri}`).origin;
  } catch {
    return null;
  }
}

function getExpoRouterOrigin() {
  const routerOrigin = Constants.expoConfig?.extra?.router?.origin;

  if (typeof routerOrigin !== "string" || routerOrigin.length === 0) {
    return null;
  }

  try {
    return new URL(routerOrigin).origin;
  } catch {
    return null;
  }
}

export function getApiBaseUrl() {
  const configuredUrl = publicEnv.EXPO_PUBLIC_API_URL;
  const expoRouterOrigin = getExpoRouterOrigin();
  const expoDevServerOrigin = getExpoDevServerOrigin();
  if (expoRouterOrigin && publicEnv.EXPO_PUBLIC_APP_ENV !== "development") {
    return expoRouterOrigin;
  }

  if (configuredUrl && (!isLoopbackHost(configuredUrl) || !expoDevServerOrigin)) {
    return configuredUrl;
  }

  return expoRouterOrigin ?? expoDevServerOrigin ?? configuredUrl ?? "http://localhost:8081";
}
