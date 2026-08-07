import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function main() {
  // Check if survey_responses exists
  const [{ exists: surveyExists }] = await sql`SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'survey_responses'
  ) as exists`;

  if (!surveyExists) {
    console.log("Creating survey_responses table...");
    await sql`CREATE TABLE "survey_responses" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "application_id" text NOT NULL,
      "site" text NOT NULL,
      "received_needed" text NOT NULL,
      "rating" integer NOT NULL,
      "comments" text,
      "created_at" timestamp DEFAULT now() NOT NULL
    )`;
    console.log("survey_responses table created.");
  } else {
    console.log("survey_responses table already exists.");
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});