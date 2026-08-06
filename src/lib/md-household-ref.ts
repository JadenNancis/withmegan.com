import { db } from "@/db/client";
import { mdHouseholds } from "@/db/schema";
import { sql } from "drizzle-orm";

/**
 * Generate the next sequential household reference (HH-0001, HH-0002, ...).
 * Race-safe on insert: the `reference` column has a UNIQUE constraint, so a
 * collision will throw and the caller can retry. The count is only a hint.
 */
export async function generateHouseholdReference(): Promise<string> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(mdHouseholds);
  const next = (count ?? 0) + 1;
  return `HH-${String(next).padStart(4, "0")}`;
}