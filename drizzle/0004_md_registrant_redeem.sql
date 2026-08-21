ALTER TABLE "md_registrants" ADD COLUMN "redeemed_at" timestamp;--> statement-breakpoint
ALTER TABLE "md_registrants" ADD COLUMN "redeemed_by" text;--> statement-breakpoint
ALTER TABLE "md_registrants" ADD CONSTRAINT "md_registrants_redeemed_by_users_id_fk" FOREIGN KEY ("redeemed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;