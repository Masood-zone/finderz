import assert from "node:assert/strict";
import test from "node:test";
import {
  FULL_NAME_ERROR_MESSAGE,
  fullNameSchema,
} from "../src/lib/validation/full-name";
import { propertyReportSubmissionSchema } from "../src/lib/validation/property-report";

test("accepts and normalizes alphabetic full names", () => {
  assert.equal(fullNameSchema.parse("  Ama    Osei  "), "Ama Osei");
  assert.equal(fullNameSchema.parse("Kwame Mensah Boateng"), "Kwame Mensah Boateng");
  assert.equal(fullNameSchema.parse("Ési Amankwah"), "Ési Amankwah");
});

test("rejects numeric, single-word, punctuation, and symbol names", () => {
  for (const value of [
    "1234",
    "Masood",
    "Jean-Pierre Doe",
    "O'Neil Mensah",
    "@@ ##",
    "Ama 123",
  ]) {
    const result = fullNameSchema.safeParse(value);
    assert.equal(result.success, false, `${value} should be rejected`);
    assert.equal(result.error?.issues[0]?.message, FULL_NAME_ERROR_MESSAGE);
  }
});

test("rejects names longer than the supported account display length", () => {
  const result = fullNameSchema.safeParse(`${"A".repeat(40)} ${"B".repeat(41)}`);
  assert.equal(result.success, false);
  assert.match(result.error?.issues[0]?.message ?? "", /80 characters/);
});

test("accepts every supported property report reason", () => {
  for (const reason of [
    "SCAM",
    "MISLEADING",
    "UNAVAILABLE",
    "DUPLICATE",
  ] as const) {
    assert.equal(
      propertyReportSubmissionSchema.safeParse({ propertyId: "property-1", reason }).success,
      true,
    );
  }

  assert.equal(
    propertyReportSubmissionSchema.safeParse({
      propertyId: "property-1",
      reason: "OTHER",
      description: "The issue is not covered by the listed reasons.",
    }).success,
    true,
  );
});

test("requires details for Other and enforces the description limit", () => {
  assert.equal(
    propertyReportSubmissionSchema.safeParse({
      propertyId: "property-1",
      reason: "OTHER",
      description: "   ",
    }).success,
    false,
  );
  assert.equal(
    propertyReportSubmissionSchema.safeParse({
      propertyId: "property-1",
      reason: "SCAM",
      description: "x".repeat(1001),
    }).success,
    false,
  );
});
