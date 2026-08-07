import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db/client";
import {
  btsGuardians,
  btsDependents,
  btsResourceAssignments,
  mdRegistrants,
  mdHouseholds,
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
 * MD: "collected" = a household whose hamperStatus is "redeemed". Registered
 * is counted per household so the progress bar compares like units. Community
 * is not stored on households, so it is derived from the address of the
 * registrants linked to each household.
 */
async function mdStats(): Promise<DashboardPayload> {
  const [households, registrants] = await Promise.all([
    db.select({
      id: mdHouseholds.id,
      hamperStatus: mdHouseholds.hamperStatus,
    }).from(mdHouseholds),
    db.select({
      householdId: mdRegistrants.householdId,
      address: mdRegistrants.address,
    }).from(mdRegistrants),
  ]);

  // householdId -> set of communities (via registrant addresses)
  const householdCommunities = new Map<string, Set<string>>();
  for (const r of registrants) {
    if (!r.householdId) continue;
    const set = householdCommunities.get(r.householdId) ?? new Set<string>();
    set.add(r.address || "Unknown");
    householdCommunities.set(r.householdId, set);
  }

  const byCommunityMap = new Map<string, CommunityStat>();
  for (const h of households) {
    const communities = householdCommunities.get(h.id);
    const communityList = communities ? [...communities] : ["Unknown"];
    for (const community of communityList) {
      const entry = byCommunityMap.get(community) ?? { community, registered: 0, collected: 0 };
      entry.registered += 1;
      if (h.hamperStatus === "redeemed") entry.collected += 1;
      byCommunityMap.set(community, entry);
    }
  }

  const byCommunity = [...byCommunityMap.values()].sort((a, b) => b.registered - a.registered);

  const totalCollected = households.filter((h) => h.hamperStatus === "redeemed").length;

  return {
    totalRegistered: households.length,
    totalCollected,
    byCommunity,
  };
}