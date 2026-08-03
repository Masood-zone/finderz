import { z } from "zod";

export const PROPERTY_REPORT_REASONS = [
  "SCAM",
  "MISLEADING",
  "UNAVAILABLE",
  "DUPLICATE",
  "OTHER",
] as const;

export type PropertyReportReason = (typeof PROPERTY_REPORT_REASONS)[number];

export const propertyReportSubmissionSchema = z
  .object({
    propertyId: z.string().min(1),
    reason: z.enum(PROPERTY_REPORT_REASONS),
    description: z
      .string()
      .trim()
      .max(1000, "Use 1,000 characters or fewer.")
      .optional()
      .transform((value) => value || undefined),
  })
  .superRefine((value, context) => {
    if (value.reason === "OTHER" && !value.description) {
      context.addIssue({
        code: "custom",
        path: ["description"],
        message: "Describe what is wrong with this listing.",
      });
    }
  });
