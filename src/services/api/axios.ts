import { create } from "axios";
import { authClient } from "@/lib/auth-client";
import { getApiBaseUrl } from "@/lib/env";

export const apiClient = create({
  baseURL: getApiBaseUrl(),
  timeout: 15_000,
});

apiClient.interceptors.request.use((config) => {
  const cookies = authClient.getCookie();

  if (cookies) {
    config.headers.Cookie = cookies;
  }

  return config;
});
