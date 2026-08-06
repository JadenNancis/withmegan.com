import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL not set");
const sql = neon(url);

async function main() {
  const migrationSql = readFileSync("./drizzle/0000_init.sql", "utf-8");
  const statements = migrationSql.split("--> statement-breakpoint").map((s) => s.trim()).filter(Boolean);

  for (const stmt of statements) {
    try {
      await sql(stmt);
      const preview = stmt.slice(0, 60).replace(/\n/g, " ");
      console.log(`✓ ${preview}...`);
    } catch (err) {
      const msg = err && err.message ? err.message : String(err);
      if (msg.includes("already exists")) {
        console.log(`⊘ Already exists: ${stmt.slice(0, 40).replace(/\n/g, " ")}...`);
      } else {
        console.error(`✗ Error: ${msg}`);
        console.error(`  Statement: ${stmt.slice(0, 100)}`);
      }
    }
  }
  console.log("\n✅ Migration complete.");
}

main().catch(console.error);