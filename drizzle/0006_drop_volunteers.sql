-- Volunteer feature removed (per user request). Drops the shared volunteer tables.
DROP TABLE IF EXISTS "volunteers";
--> statement-breakpoint
DROP TABLE IF EXISTS "volunteer_shifts";
--> statement-breakpoint
DROP TYPE IF EXISTS "volunteer_status";
