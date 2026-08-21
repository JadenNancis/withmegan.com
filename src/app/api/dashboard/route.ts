import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db/client";
import {
  btsGuardians,
  btsDependents,
  btsResourceAssignments,
  mdRegistrants,
} from "@/db/schema";

export const runtime = "nodejs";

type SiteKey = "bts" | "md";

interface CommunityStat {
  community: string;
  registered: number;
  collected: number;
}

interface DashboardPayload {
  totalRegistered: number;
  totalCollected: number;
  byCommunity: CommunityStat[];
}

async function getAuthUser(): Promise<{ id: string; role: string } | null> {
  const session = await auth();
  if (!session?.user) return null;
  const u = session.user as unknown as { id?: string; role?: string };
  if (!u.id || (u.role !== "admin" && u.role !== "staff")) return null;
  return { id: u.id, role: u.role };
}

export async function GET(req: Request): Promise<Response> {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const siteParam = url.searchParams.get("site");
  const site: SiteKey | null =
    siteParam === "bts" || siteParam === "md" ? siteParam : null;

  if (!site) {
    return NextResponse.json(
      { error: "Missing or invalid 'site' parameter (expected 'bts' or 'md')" },
      { status: 400 },
    );
  }

  if (site === "bts") {
    return NextResponse.json(await btsStats());
  }
  return NextResponse.json(await mdStats());
}

/**
 * BTS: "collected" = a guardian who has at least one dependent with an
 * assignment whose status is "collected". Registered is counted per guardian
 * (family), and community is read from the guardian's address.
 */
async function btsStats(): Promise<DashboardPayload> {
  const [guardians, dependents, assignments] = await Promise.all([
    db.select({
      id: btsGuardians.id,
      address: btsGuardians.address,
    }).from(btsGuardians),
    db.select({
      id: btsDependents.id,
      guardianId: btsDependents.guardianId,
    }).from(btsDependents),
    db.select({
      dependentId: btsResourceAssignments.dependentId,
      status: btsResourceAssignments.status,
    }).from(btsResourceAssignments),
  ]);

  // Dependents that have at least one collected assignment.
  const collectedDependentIds = new Set<string>();
  for (const a of assignments) {
    if (a.status === "collected") collectedDependentIds.add(a.dependentId);
  }

  // Guardian ids that count as collected.
  const collectedGuardianIds = new Set<string>();
  for (const d of dependents) {
    if (collectedDependentIds.has(d.id)) {
      collectedGuardianIds.add(d.guardianId);
    }
  }

  const byCommunityMap = new Map<string, CommunityStat>();
  for (const g of guardians) {
    const community = g.address || "Unknown";
    const entry = byCommunityMap.get(community) ?? { community, registered: 0, collected: 0 };
    entry.registered += 1;
    if (collectedGuardianIds.has(g.id)) entry.collected += 1;
    byCommunityMap.set(community, entry);
  }

  const byCommunity = [...byCommunityMap.values()].sort((a, b) => b.registered - a.registered);

  return {
    totalRegistered: guardians.length,
    totalCollected: collectedGuardianIds.size,
    byCommunity,
  };
}

/**
 * MD: "collected" = a registrant whose hamper has been redeemed (redeemedAt
 * set). Registered is counted per registrant, so each resident is an
 * individual hamper recipient. Community is read from the registrant's
 * address.
 */
async function mdStats(): Promise<DashboardPayload> {
  const registrants = await db
    .select({
      id: mdRegistrants.id,
      address: mdRegistrants.address,
      redeemedAt: mdRegistrants.redeemedAt,
    })
    .from(mdRegistrants);

  const byCommunityMap = new Map<string, CommunityStat>();
  for (const r of registrants) {
    const community = r.address || "Unknown";
    const entry = byCommunityMap.get(community) ?? { community, registered: 0, collected: 0 };
    entry.registered += 1;
    if (r.redeemedAt) entry.collected += 1;
    byCommunityMap.set(community, entry);
  }

  const byCommunity = [...byCommunityMap.values()].sort((a, b) => b.registered - a.registered);

  return {
    totalRegistered: registrants.length,
    totalCollected: registrants.filter((r) => r.redeemedAt !== null).length,
    byCommunity,
  };
}