import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { clearStoredSessionToken, getStoredSessionToken, setStoredSessionToken } from "./auth-session-token";
import { getApiBaseUrl } from "./env";
import type { AuthSessionUser } from "@/types/auth";

type AuthTokenResult = {
  token?: string | null;
};

type BetterFetchSuccessContext = {
  response: Response;
  data?: AuthTokenResult;
  request: {
    url: string | URL;
  };
};

type BetterFetchInitOptions = {
  headers?: Record<string, string | undefined> | Headers;
} & Record<string, unknown>;

type AuthClientWithCookie = ReturnType<typeof createAuthClient> & {
  getCookie: () => string;
};

function withBearerHeader(headers: BetterFetchInitOptions["headers"], token: string) {
  const nextHeaders =
    headers instanceof Headers
      ? Object.fromEntries(headers.entries())
      : Object.fromEntries(
          Object.entries(headers ?? {}).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
        );

  return {
    ...nextHeaders,
    Authorization: `Bearer ${token}`,
  };
}

function finderzBearerClient() {
  return {
    id: "finderz-bearer-session",
    fetchPlugins: [
      {
        id: "finderz-bearer-session",
        name: "FinderZ Bearer Session",
        hooks: {
          async onSuccess(context: BetterFetchSuccessContext) {
            const token = context.response.headers.get("set-auth-token") ?? context.data?.token;

            if (token) {
              await setStoredSessionToken(token);
            }

            if (context.request.url.toString().includes("/sign-out")) {
              await clearStoredSessionToken();
            }
          },
        },
        async init(url: string, options?: BetterFetchInitOptions) {
          const token = getStoredSessionToken();

          if (!token) {
            return { url, options };
          }

          return {
            url,
            options: {
              ...options,
              headers: withBearerHeader(options?.headers, token),
            },
          };
        },
      },
    ],
  };
}

export const authClient = createAuthClient({
  baseURL: `${getApiBaseUrl()}/api/auth`,
  plugins: [
    expoClient({
      scheme: "finderz",
      storagePrefix: "finderz",
      storage: SecureStore,
    }),
    finderzBearerClient(),
  ],
}) as AuthClientWithCookie;

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
  const data = unwrapAuthResult(await authClient.signUp.email(input));
  await setStoredSessionToken((data as AuthTokenResult | undefined)?.token);
  return data;
}

export async function signIn(input: SignInInput) {
  const data = unwrapAuthResult(await authClient.signIn.email(input));
  await setStoredSessionToken((data as AuthTokenResult | undefined)?.token);
  return data;
}

export function signOut() {
  void clearStoredSessionToken();
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
