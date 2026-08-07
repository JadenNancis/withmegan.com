import { NextResponse } from "next/server";
import { db } from "@/db/client";
import {
  btsGuardians,
  btsDependents,
  btsResourceAssignments,
  mdRegistrants,
  mdHouseholds,
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import type { SiteKey } from "@/sites/site-registry";

export const runtime = "nodejs";

/**
 * Public verify endpoint — reached by scanning a QR code that encodes
 *   /api/verify?aid=BTS-260806-ABC123&site=bts
 *
 * Lookup is by Application ID (thaId). Possession of the Application ID
 * is the trust token: it contains a cryptographically-random suffix, so
 * it is not guessable. No session is required.
 */

interface BtsDependentDto {
  studentName: string;
  schoolName: string;
  gradeLevel: string;
}

interface BtsRegistrantDto {
  applicationId: string;
  fullName: string;
  community: string;
  phone: string;
  email: string;
  dependents: BtsDependentDto[];
  collected: boolean;
}

interface MdRegistrantDto {
  applicationId: string;
  fullName: string;
  community: string;
  phone: string;
  email: string | null;
  householdReference: string | null;
  hamperStatus: "unassigned" | "assigned" | "redeemed" | null;
  collected: boolean;
}

function isValidSite(s: string | null): s is SiteKey {
  return s === "bts" || s === "md";
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const aid = url.searchParams.get("aid")?.trim();
  const site = url.searchParams.get("site");

  if (!aid) {
    return NextResponse.json(
      { found: false, error: "Missing 'aid' parameter" },
      { status: 400 },
    );
  }
  if (!isValidSite(site)) {
    return NextResponse.json(
      { found: false, error: "Missing or invalid 'site' parameter (must be 'bts' or 'md')" },
      { status: 400 },
    );
  }

  if (site === "bts") {
    return lookupBts(aid);
  }
  return lookupMd(aid);
}

async function lookupBts(aid: string): Promise<Response> {
  const [guardian] = await db
    .select()
    .from(btsGuardians)
    .where(eq(btsGuardians.thaId, aid))
    .limit(1);

  if (!guardian) {
    return NextResponse.json({ found: false, site: "bts" });
  }

  const dependents = await db
    .select()
    .from(btsDependents)
    .where(eq(btsDependents.guardianId, guardian.id));

  const dependentIds = dependents.map((d) => d.id);
  const assignments =
    dependentIds.length > 0
      ? await db
          .select({ status: btsResourceAssignments.status })
          .from(btsResourceAssignments)
          .where(inArray(btsResourceAssignments.dependentId, dependentIds))
      : [];

  // "collected" = every assigned item has been collected.
  // No assignments yet → not collected.
  const collected =
    assignments.length > 0 &&
    assignments.every((a) => a.status === "collected");

  const registrant: BtsRegistrantDto = {
    applicationId: guardian.thaId ?? aid,
    fullName: guardian.fullName,
    community: guardian.address,
    phone: guardian.contactNumber,
    email: guardian.email,
    dependents: dependents.map((d) => ({
      studentName: d.studentName,
      schoolName: d.schoolName,
      gradeLevel: d.gradeLevel,
    })),
    collected,
  };

  return NextResponse.json({ found: true, site: "bts", registrant });
}

async function lookupMd(aid: string): Promise<Response> {
  const [row] = await db
    .select({
      id: mdRegistrants.id,
      thaId: mdRegistrants.thaId,
      fullName: mdRegistrants.fullName,
      address: mdRegistrants.address,
      phoneNumber: mdRegistrants.phoneNumber,
      email: mdRegistrants.email,
      householdId: mdRegistrants.householdId,
      householdReference: mdHouseholds.reference,
      hamperStatus: mdHouseholds.hamperStatus,
    })
    .from(mdRegistrants)
    .leftJoin(mdHouseholds, eq(mdRegistrants.householdId, mdHouseholds.id))
    .where(eq(mdRegistrants.thaId, aid))
    .limit(1);

  if (!row) {
    return NextResponse.json({ found: false, site: "md" });
  }

  const registrant: MdRegistrantDto = {
    applicationId: row.thaId ?? aid,
    fullName: row.fullName,
    community: row.address,
    phone: row.phoneNumber,
    email: row.email,
    householdReference: row.householdReference,
    hamperStatus: row.hamperStatus,
    collected: row.hamperStatus === "redeemed",
  };

  return NextResponse.json({ found: true, site: "md", registrant });
}