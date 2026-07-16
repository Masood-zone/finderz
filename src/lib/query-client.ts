import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 5 * 60_000,
        staleTime: 30_000,
        retry: 1,
        refetchIntervalInBackground: false,
        refetchOnReconnect: true,
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
