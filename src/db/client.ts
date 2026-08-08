import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Single Neon Postgres connection shared by both sites.
 * The connection is lazy and reused across hot requests on Vercel.
 *
 * Lazy initialization avoids evaluating the Neon URL at module load time,
 * which breaks `next build` page-data collection when the env var is not
 * available (e.g. CI builds that don't inject secrets at collection time).
 */

let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (_db) return _db;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Add it to your .env or Vercel env vars.",
    );
  }

  const sql = neon(databaseUrl);
  _db = drizzle(sql, { schema });
  return _db;
}

/**
 * Proxy that lazily creates the Drizzle instance on first property access.
 * This lets `next build` collect page data without a live DATABASE_URL,
 * while runtime requests get the real connection.
 */
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    const instance = getDb();
    const value = Reflect.get(instance, prop);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export type Database = ReturnType<typeof drizzle>;