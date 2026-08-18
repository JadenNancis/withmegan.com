CREATE TYPE "public"."volunteer_status" AS ENUM('pending', 'approved', 'declined');--> statement-breakpoint
CREATE TABLE "volunteer_shifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site" text NOT NULL,
	"label" text NOT NULL,
	"starts_at" text NOT NULL,
	"ends_at" text NOT NULL,
	"capacity" integer DEFAULT 8 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "volunteers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site" text NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"status" "volunteer_status" DEFAULT 'pending' NOT NULL,
	"shift_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_shift_id_volunteer_shifts_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."volunteer_shifts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
INSERT INTO "volunteer_shifts" ("site", "label", "starts_at", "ends_at", "capacity") VALUES ('bts', 'Setup · Fri 29 Aug, 2:00–6:00pm', '14:00', '18:00', 8), ('bts', 'Morning · Sat 30 Aug, 6:00–11:00am', '06:00', '11:00', 10), ('bts', 'Main · Sat 30 Aug, 11:00am–4:00pm', '11:00', '16:00', 10), ('bts', 'Pack-down · Sat 30 Aug, 4:00–7:00pm', '16:00', '19:00', 6), ('md', 'Setup · Fri 5 Sep, 2:00–6:00pm', '14:00', '18:00', 8), ('md', 'Morning · Sun 6 Sep, 6:00–11:00am', '06:00', '11:00', 10), ('md', 'Main · Sun 6 Sep, 11:00am–4:00pm', '11:00', '16:00', 10), ('md', 'Pack-down · Sun 6 Sep, 4:00–7:00pm', '16:00', '19:00', 6);