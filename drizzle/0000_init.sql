CREATE TYPE "public"."bts_assignment_status" AS ENUM('pending', 'partial', 'full', 'collected');--> statement-breakpoint
CREATE TYPE "public"."md_hamper_status" AS ENUM('unassigned', 'assigned', 'redeemed');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" text NOT NULL,
	"actor_email" text,
	"action" text NOT NULL,
	"site" text NOT NULL,
	"target" text,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bts_dependents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guardian_id" uuid NOT NULL,
	"student_name" text NOT NULL,
	"school_name" text NOT NULL,
	"grade_level" text NOT NULL,
	"notes" text,
	"book_list_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bts_guardians" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"contact_number" text NOT NULL,
	"email" text NOT NULL,
	"address" text NOT NULL,
	"consent" boolean DEFAULT false NOT NULL,
	"tha_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bts_guardians_tha_id_unique" UNIQUE("tha_id")
);
--> statement-breakpoint
CREATE TABLE "bts_resource_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dependent_id" uuid NOT NULL,
	"item_name" text NOT NULL,
	"quantity_assigned" integer DEFAULT 0 NOT NULL,
	"quantity_collected" integer DEFAULT 0 NOT NULL,
	"status" "bts_assignment_status" DEFAULT 'pending' NOT NULL,
	"assigned_by" text,
	"collected_by_name" text,
	"collected_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "md_households" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text NOT NULL,
	"hamper_status" "md_hamper_status" DEFAULT 'unassigned' NOT NULL,
	"redeemed_at" timestamp,
	"redeemed_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "md_households_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "md_registrants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"national_id" text,
	"date_of_birth" text,
	"address" text NOT NULL,
	"phone_number" text NOT NULL,
	"email" text,
	"product_category" text,
	"consent" boolean DEFAULT false NOT NULL,
	"tha_id" text,
	"household_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "md_registrants_tha_id_unique" UNIQUE("tha_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"role" text DEFAULT 'staff' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bts_dependents" ADD CONSTRAINT "bts_dependents_guardian_id_bts_guardians_id_fk" FOREIGN KEY ("guardian_id") REFERENCES "public"."bts_guardians"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bts_resource_assignments" ADD CONSTRAINT "bts_resource_assignments_dependent_id_bts_dependents_id_fk" FOREIGN KEY ("dependent_id") REFERENCES "public"."bts_dependents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bts_resource_assignments" ADD CONSTRAINT "bts_resource_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_households" ADD CONSTRAINT "md_households_redeemed_by_users_id_fk" FOREIGN KEY ("redeemed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_registrants" ADD CONSTRAINT "md_registrants_household_id_md_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."md_households"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;