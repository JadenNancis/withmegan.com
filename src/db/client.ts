import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Single Neon Postgres connection shared by both sites.
 * The connection is lazy and reused across hot requests on Vercel.
 */
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. Add it to your .env or Vercel env vars.");
}

const sql = neon(databaseUrl);

export const db = drizzle(sql, { schema });
export type Database = typeof db;