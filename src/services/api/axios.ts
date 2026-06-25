import { AxiosError, create } from "axios";
import { authClient } from "@/lib/auth-client";
import { getStoredSessionToken } from "@/lib/auth-session-token";
import { getApiBaseUrl } from "@/lib/env";
import { captureHandledError } from "@/lib/monitoring";
import type { ApiErrorBody } from "@/types/api";

export const apiClient = create({
  baseURL: getApiBaseUrl(),
  timeout: 15_000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const cookies = authClient.getCookie();

  if (cookies) {
    config.headers.Cookie = cookies;
    config.headers["x-finderz-auth-cookie"] = cookies;
  }

  const token = getStoredSessionToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    captureHandledError(error, {
      name: "api-response",
      tags: {
        method: error.config?.method,
        status: error.response?.status,
        code: error.response?.data?.error?.code,
      },
      extra: {
        url: error.config?.url,
        message: error.message,
      },
    });

    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }

    return Promise.reject({
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: error.message || "Unable to reach FinderZ services.",
      },
    } satisfies ApiErrorBody);
  },
);
