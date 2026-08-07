CREATE TYPE "public"."bts_inventory_category" AS ENUM('Books', 'Stationery', 'Uniforms', 'Backpacks', 'Other');--> statement-breakpoint
CREATE TABLE "bts_inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_name" text NOT NULL,
	"category" "bts_inventory_category" DEFAULT 'Other' NOT NULL,
	"quantity_received" integer DEFAULT 0 NOT NULL,
	"condition" text,
	"donor_name" text,
	"received_by" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "survey_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" text NOT NULL,
	"site" text NOT NULL,
	"received_needed" text NOT NULL,
	"rating" integer NOT NULL,
	"comments" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bts_inventory" ADD CONSTRAINT "bts_inventory_received_by_users_id_fk" FOREIGN KEY ("received_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;