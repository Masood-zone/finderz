import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  SUPER_ADMIN_NAME: z.string().min(1),
  SUPER_ADMIN_EMAIL: z.string().email(),
  SUPER_ADMIN_PASSWORD: z.string().min(8),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_SECURE: z.enum(["true", "false"]).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  UELLOSEND_API_URL: z.string().url().optional(),
  UELLOSEND_SENDER_ID: z.string().optional(),
  UELLOSEND_API_KEY: z.string().optional(),
  UELLOSEND_API_SECRET: z.string().optional(),
  EXPO_ACCESS_TOKEN: z.string().optional(),
  NOTIFICATION_DELIVERY_ENABLED: z.enum(["true", "false"]).default("false"),
  NOTIFICATION_DRY_RUN: z.enum(["true", "false"]).default("true"),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv() {
  return serverEnvSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    SUPER_ADMIN_NAME: process.env.SUPER_ADMIN_NAME,
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
    UELLOSEND_API_URL: process.env.UELLOSEND_API_URL,
    UELLOSEND_SENDER_ID: process.env.UELLOSEND_SENDER_ID,
    UELLOSEND_API_KEY: process.env.UELLOSEND_API_KEY,
    UELLOSEND_API_SECRET: process.env.UELLOSEND_API_SECRET,
    EXPO_ACCESS_TOKEN: process.env.EXPO_ACCESS_TOKEN,
    NOTIFICATION_DELIVERY_ENABLED: process.env.NOTIFICATION_DELIVERY_ENABLED,
    NOTIFICATION_DRY_RUN: process.env.NOTIFICATION_DRY_RUN,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  });
}
