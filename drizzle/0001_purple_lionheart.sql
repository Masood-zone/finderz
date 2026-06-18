ALTER TYPE "public"."approval_status" ADD VALUE 'DRAFT' BEFORE 'PENDING';--> statement-breakpoint
ALTER TYPE "public"."approval_status" ADD VALUE 'RENTED';--> statement-breakpoint
ALTER TYPE "public"."verification_status" ADD VALUE 'NOT_SUBMITTED' BEFORE 'PENDING';--> statement-breakpoint
ALTER TYPE "public"."verification_status" ADD VALUE 'CHANGES_REQUESTED';--> statement-breakpoint
ALTER TABLE "landlord_profiles" ALTER COLUMN "verification_status" SET DEFAULT 'NOT_SUBMITTED';--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "approval_status" SET DEFAULT 'DRAFT';--> statement-breakpoint
ALTER TABLE "landlord_profiles" ADD COLUMN "legal_name" text;--> statement-breakpoint
ALTER TABLE "landlord_profiles" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "landlord_profiles" ADD COLUMN "preferred_contact_method" text;--> statement-breakpoint
ALTER TABLE "landlord_profiles" ADD COLUMN "identity_document_public_id" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "advance_period_months" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "additional_charges" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "contact_preferences" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "inspection_availability" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "house_rules" text;