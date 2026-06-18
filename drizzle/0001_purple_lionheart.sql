ALTER TYPE "public"."approval_status" ADD VALUE IF NOT EXISTS 'DRAFT';--> statement-breakpoint
ALTER TYPE "public"."approval_status" ADD VALUE IF NOT EXISTS 'RENTED';--> statement-breakpoint
ALTER TYPE "public"."verification_status" ADD VALUE IF NOT EXISTS 'NOT_SUBMITTED';--> statement-breakpoint
ALTER TYPE "public"."verification_status" ADD VALUE IF NOT EXISTS 'CHANGES_REQUESTED';--> statement-breakpoint
ALTER TABLE "landlord_profiles" ALTER COLUMN "verification_status" SET DEFAULT 'NOT_SUBMITTED';--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "approval_status" SET DEFAULT 'DRAFT';--> statement-breakpoint
ALTER TABLE "landlord_profiles" ADD COLUMN IF NOT EXISTS "legal_name" text;--> statement-breakpoint
ALTER TABLE "landlord_profiles" ADD COLUMN IF NOT EXISTS "address" text;--> statement-breakpoint
ALTER TABLE "landlord_profiles" ADD COLUMN IF NOT EXISTS "preferred_contact_method" text;--> statement-breakpoint
ALTER TABLE "landlord_profiles" ADD COLUMN IF NOT EXISTS "identity_document_public_id" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "advance_period_months" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "additional_charges" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "contact_preferences" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "inspection_availability" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "house_rules" text;
