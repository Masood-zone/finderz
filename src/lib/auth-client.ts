import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { getApiBaseUrl } from "./env";

export const authClient = createAuthClient({
  baseURL: `${getApiBaseUrl()}/api/auth`,
  plugins: [
    expoClient({
      scheme: "finderz",
      storagePrefix: "finderz",
      storage: SecureStore,
    }),
  ],
});
