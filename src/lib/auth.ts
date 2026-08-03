import { expo } from "@better-auth/expo";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { bearer } from "better-auth/plugins";
import { db } from "@/db";
import * as relations from "@/db/relations";
import * as schema from "@/db/schema";
import { getServerEnv } from "./env.server";
import { sendPasswordResetOtp } from "./password-reset.server";
import { emailService } from "@/services/email/email-service";
import {
  FULL_NAME_ERROR_MESSAGE,
  fullNameSchema,
} from "@/lib/validation/full-name";

const serverEnv = getServerEnv();

export const auth = betterAuth({
  baseURL: serverEnv.BETTER_AUTH_URL,
  secret: serverEnv.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      ...relations,
    },
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (nextUser) => {
          const result = fullNameSchema.safeParse(nextUser.name);

          if (!result.success) {
            throw new APIError("BAD_REQUEST", {
              code: "INVALID_FULL_NAME",
              message: FULL_NAME_ERROR_MESSAGE,
            });
          }

          return { data: { ...nextUser, name: result.data } };
        },
      },
      update: {
        before: async (nextUser) => {
          if (typeof nextUser.name !== "string") {
            return;
          }

          const result = fullNameSchema.safeParse(nextUser.name);

          if (!result.success) {
            throw new APIError("BAD_REQUEST", {
              code: "INVALID_FULL_NAME",
              message: FULL_NAME_ERROR_MESSAGE,
            });
          }

          return { data: { ...nextUser, name: result.data } };
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    resetPasswordTokenExpiresIn: 60 * 15,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, token }) => {
      await sendPasswordResetOtp({ email: user.email, name: user.name, resetToken: token });
    },
    onPasswordReset: async ({ user }) => {
      try {
        await emailService.sendPasswordResetSuccessEmail({
          email: user.email,
          name: user.name,
          resetAt: new Date().toLocaleString("en-GH", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Accra" }),
        });
      } catch (error) {
        console.error("Password reset succeeded but the confirmation email failed:", error);
      }
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    freshAge: 60 * 5,
  },
  trustedOrigins: [
    serverEnv.BETTER_AUTH_URL,
    "finderz://",
    "finderz://*",
    ...(process.env.NODE_ENV === "development" ? ["exp://", "exp://**", "exp://192.168.*.*:*/**"] : []),
  ],
  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
      },
      role: {
        type: ["TENANT", "LANDLORD", "SUPER_ADMIN"],
        required: false,
        defaultValue: "TENANT",
        input: false,
      },
      onboardingCompleted: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      accountStatus: {
        type: ["ACTIVE", "SUSPENDED", "PENDING"],
        required: false,
        defaultValue: "ACTIVE",
        input: false,
      },
    },
  },
  experimental: {
    joins: true,
  },
  plugins: [expo(), bearer()],
});
