import { z } from "zod";

const publicEnvSchema = z.object({
  EXPO_PUBLIC_API_URL: z.preprocess((value) => (value === "" ? undefined : value), z.string().url().optional()),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

const parsedPublicEnv = publicEnvSchema.safeParse({
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
});

export const publicEnv = parsedPublicEnv.success ? parsedPublicEnv.data : {};

export function getApiBaseUrl() {
  return publicEnv.EXPO_PUBLIC_API_URL ?? "http://localhost:8081";
}
