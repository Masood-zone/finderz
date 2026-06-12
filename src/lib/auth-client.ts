import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { getApiBaseUrl } from "./env";
import type { AuthSessionUser } from "@/types/auth";

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

export const useSession = authClient.useSession;
export const getSession = authClient.getSession;
export const getCookie = authClient.getCookie;

export type SignUpInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

export type SignInInput = {
  email: string;
  password: string;
};

export function signUp(input: SignUpInput) {
  return authClient.signUp.email(input);
}

export function signIn(input: SignInInput) {
  return authClient.signIn.email(input);
}

export function signOut() {
  return authClient.signOut();
}

export function useTypedSession() {
  return useSession() as ReturnType<typeof useSession> & {
    data?: {
      user: AuthSessionUser;
      session: unknown;
    } | null;
  };
}
