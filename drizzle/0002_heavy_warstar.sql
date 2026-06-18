CREATE TABLE "ghana_cities" (
	"id" text PRIMARY KEY NOT NULL,
	"region_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ghana_regions" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"capital" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ghana_regions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "ghana_cities" ADD CONSTRAINT "ghana_cities_region_id_ghana_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."ghana_regions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ghana_cities_region_id_idx" ON "ghana_cities" USING btree ("region_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ghana_cities_region_slug_idx" ON "ghana_cities" USING btree ("region_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "ghana_regions_name_idx" ON "ghana_regions" USING btree ("name");