import { z } from "zod";

const publicEnvSchema = z.object({
  EXPO_PUBLIC_API_URL: z.string().url().optional(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

export const publicEnv = publicEnvSchema.parse({
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
});

export function getApiBaseUrl() {
  return publicEnv.EXPO_PUBLIC_API_URL ?? "http://localhost:8081";
}
