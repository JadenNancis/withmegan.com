-- Soft delete: mark registrations as removed without destroying the rows,
-- so test data can be cleaned up safely and restored from the deleted tab.
ALTER TABLE "bts_guardians" ADD COLUMN "deleted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "md_registrants" ADD COLUMN "deleted_at" timestamp;
