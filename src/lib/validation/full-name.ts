import { z } from "zod";

export const FULL_NAME_MAX_LENGTH = 80;
export const FULL_NAME_ERROR_MESSAGE =
  "Enter at least two names using letters and spaces only.";

export function normalizeFullName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export const fullNameSchema = z
  .string()
  .transform(normalizeFullName)
  .pipe(
    z
      .string()
      .min(3, FULL_NAME_ERROR_MESSAGE)
      .max(
        FULL_NAME_MAX_LENGTH,
        `Use ${FULL_NAME_MAX_LENGTH} characters or fewer.`,
      )
      .regex(/^\p{L}+(?: \p{L}+)+$/u, FULL_NAME_ERROR_MESSAGE),
  );

