import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { verification } from "@/db/schema";
import { emailService } from "@/services/email/email-service";
import { getServerEnv } from "./env.server";

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

type StoredResetOtp = {
  otpHash: string;
  resetToken: string;
  attempts: number;
};

function hmac(value: string) {
  return createHmac("sha256", getServerEnv().BETTER_AUTH_SECRET).update(value).digest("hex");
}

function otpIdentifier(email: string) {
  return `finderz-password-reset-otp:${hmac(email.trim().toLowerCase())}`;
}

function otpHash(email: string, otp: string) {
  return hmac(`${email.trim().toLowerCase()}:${otp}`);
}

function parseStoredOtp(value: string): StoredResetOtp | null {
  try {
    const parsed = JSON.parse(value) as Partial<StoredResetOtp>;
    return typeof parsed.otpHash === "string" && typeof parsed.resetToken === "string" && typeof parsed.attempts === "number"
      ? { otpHash: parsed.otpHash, resetToken: parsed.resetToken, attempts: parsed.attempts }
      : null;
  } catch {
    return null;
  }
}

export async function sendPasswordResetOtp(input: { email: string; name: string; resetToken: string }) {
  const email = input.email.trim().toLowerCase();
  const identifier = otpIdentifier(email);
  const existing = await db.query.verification.findFirst({ where: eq(verification.identifier, identifier) });

  if (existing && existing.expiresAt > new Date() && Date.now() - existing.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    await db.delete(verification).where(eq(verification.identifier, `reset-password:${input.resetToken}`));
    return;
  }

  const otp = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  const value = JSON.stringify({ otpHash: otpHash(email, otp), resetToken: input.resetToken, attempts: 0 } satisfies StoredResetOtp);

  const previousOtp = existing ? parseStoredOtp(existing.value) : null;
  if (previousOtp) {
    await db.delete(verification).where(eq(verification.identifier, `reset-password:${previousOtp.resetToken}`));
  }
  if (existing && existing.id !== identifier) {
    await db.delete(verification).where(eq(verification.id, existing.id));
  }

  await db.insert(verification).values({
    id: identifier,
    identifier,
    value,
    expiresAt,
  }).onConflictDoUpdate({
    target: verification.id,
    set: { value, expiresAt, createdAt: new Date(), updatedAt: new Date() },
  });

  try {
    await emailService.sendPasswordResetOtpEmail({ email, name: input.name, otp, expiresInMinutes: OTP_TTL_MS / 60_000 });
  } catch (error) {
    await db.delete(verification).where(eq(verification.id, identifier));
    await db.delete(verification).where(eq(verification.identifier, `reset-password:${input.resetToken}`));
    throw error;
  }
}

export async function verifyPasswordResetOtp(input: { email: string; otp: string }) {
  const email = input.email.trim().toLowerCase();
  const identifier = otpIdentifier(email);
  const record = await db.query.verification.findFirst({ where: eq(verification.identifier, identifier) });

  if (!record || record.expiresAt <= new Date()) {
    if (record) await db.delete(verification).where(eq(verification.id, record.id));
    return null;
  }

  const stored = parseStoredOtp(record.value);
  if (!stored) {
    await db.delete(verification).where(eq(verification.id, record.id));
    return null;
  }

  const suppliedHash = Buffer.from(otpHash(email, input.otp), "hex");
  const expectedHash = Buffer.from(stored.otpHash, "hex");
  const matches = suppliedHash.length === expectedHash.length && timingSafeEqual(suppliedHash, expectedHash);

  if (!matches) {
    const attempts = stored.attempts + 1;
    if (attempts >= MAX_OTP_ATTEMPTS) {
      await db.delete(verification).where(eq(verification.id, record.id));
    } else {
      await db.update(verification).set({ value: JSON.stringify({ ...stored, attempts }), updatedAt: new Date() }).where(eq(verification.id, record.id));
    }
    return null;
  }

  await db.delete(verification).where(eq(verification.id, record.id));
  return stored.resetToken;
}
