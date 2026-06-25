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
export const getCookie = authClient.getCookie;

type AuthClientResult<TData = unknown> = {
  data?: TData;
  error?: { message?: string } | null;
};

function unwrapAuthResult<TData>(result: AuthClientResult<TData>) {
  if (result.error) {
    throw result.error;
  }

  return result.data;
}

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

export async function getSession() {
  return unwrapAuthResult(await authClient.getSession());
}

export async function signUp(input: SignUpInput) {
  return unwrapAuthResult(await authClient.signUp.email(input));
}

export async function signIn(input: SignInInput) {
  return unwrapAuthResult(await authClient.signIn.email(input));
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
