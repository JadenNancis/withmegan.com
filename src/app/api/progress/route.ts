import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { btsGuardians, btsDependents, mdRegistrants } from "@/db/schema";
import { count, sql } from "drizzle-orm";

export const runtime = "nodejs";

const BTS_GOAL = 200;
const MD_GOAL = 150;

/**
 * Shared progress endpoint.
 *
 * GET /api/progress?site=bts  → BTS book drive aggregates
 * GET /api/progress?site=md   → MD hamper distribution aggregates
 *
 * Returns:
 *   totalRegistrations, goal, byCommunity[], byCategory[]
 *   BTS category = grade level (dependents grouped); community = guardian address
 *   MD  category = product category; community = registrant address
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const site = searchParams.get("site");

  if (site === "bts") {
    return NextResponse.json(await fetchBtsProgress(BTS_GOAL));
  }
  if (site === "md") {
    return NextResponse.json(await fetchMdProgress(MD_GOAL));
  }
  return NextResponse.json(
    { error: "Missing or invalid `site` query param. Use ?site=bts or ?site=md." },
    { status: 400 },
  );
}

async function fetchBtsProgress(goal: number) {
  const [totalRow] = await db
    .select({ n: count() })
    .from(btsGuardians);

  const communityRows = await db
    .select({
      community: btsGuardians.address,
      count: count(),
    })
    .from(btsGuardians)
    .groupBy(btsGuardians.address)
    .orderBy(sql`count(*) DESC`);

  const categoryRows = await db
    .select({
      category: btsDependents.gradeLevel,
      count: count(),
    })
    .from(btsDependents)
    .groupBy(btsDependents.gradeLevel)
    .orderBy(sql`count(*) DESC`);

  return {
    totalRegistrations: totalRow?.n ?? 0,
    goal,
    byCommunity: communityRows.map((r) => ({ community: r.community, count: r.count })),
    byCategory: categoryRows.map((r) => ({ category: r.category, count: r.count })),
  };
}

async function fetchMdProgress(goal: number) {
  const [totalRow] = await db
    .select({ n: count() })
    .from(mdRegistrants);

  const communityRows = await db
    .select({
      community: mdRegistrants.address,
      count: count(),
    })
    .from(mdRegistrants)
    .groupBy(mdRegistrants.address)
    .orderBy(sql`count(*) DESC`);

  const categoryRows = await db
    .select({
      category: mdRegistrants.productCategory,
      count: count(),
    })
    .from(mdRegistrants)
    .where(sql`${mdRegistrants.productCategory} IS NOT NULL`)
    .groupBy(mdRegistrants.productCategory)
    .orderBy(sql`count(*) DESC`);

  return {
    totalRegistrations: totalRow?.n ?? 0,
    goal,
    byCommunity: communityRows.map((r) => ({ community: r.community, count: r.count })),
    byCategory: categoryRows.map((r) => ({
      category: r.category ?? "Unspecified",
      count: r.count,
    })),
  };
}