import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { mdRegistrants, mdHouseholds } from "@/db/schema";
import { eq, ilike, or, and, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { logAudit } from "@/lib/audit";
import { searchSchema, redeemSchema } from "@/lib/md-schemas";

export const runtime = "nodejs";

type AuthUser = { id: string; email: string | null; name: string | null; role: string };

async function getAuthUser(): Promise<AuthUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  const u = session.user as unknown as { id?: string; email?: string | null; name?: string | null; role?: string };
  if (!u.id || (u.role !== "admin" && u.role !== "staff")) return null;
  return { id: u.id, email: u.email ?? null, name: u.name ?? null, role: u.role };
}

interface SearchResult {
  id: string;
  thaId: string | null;
  fullName: string;
  nationalId: string | null;
  dateOfBirth: string | null;
  address: string;
  phoneNumber: string;
  householdId: string | null;
  householdReference: string | null;
  hamperStatus: "unassigned" | "assigned" | "redeemed" | null;
  redeemedAt: string | null;
  redeemedBy: string | null;
}

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (typeof body === "object" && body !== null && "query" in body) {
    const parsed = searchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const q = parsed.data.query.trim();
    const pattern = `%${q}%`;

    const rows = await db
      .select({
        id: mdRegistrants.id,
        thaId: mdRegistrants.thaId,
        fullName: mdRegistrants.fullName,
        nationalId: mdRegistrants.nationalId,
        dateOfBirth: mdRegistrants.dateOfBirth,
        address: mdRegistrants.address,
        phoneNumber: mdRegistrants.phoneNumber,
        householdId: mdRegistrants.householdId,
        householdReference: mdHouseholds.reference,
        hamperStatus: mdHouseholds.hamperStatus,
        redeemedAt: mdHouseholds.redeemedAt,
        redeemedBy: mdHouseholds.redeemedBy,
      })
      .from(mdRegistrants)
      .leftJoin(mdHouseholds, eq(mdRegistrants.householdId, mdHouseholds.id))
      .where(
        or(
          ilike(mdRegistrants.fullName, pattern),
          ilike(mdRegistrants.thaId, pattern),
          ilike(mdRegistrants.nationalId, pattern),
          ilike(mdHouseholds.reference, pattern),
          ilike(mdRegistrants.phoneNumber, pattern),
        ),
      )
      .limit(20);

    const results: SearchResult[] = rows.map((r) => ({
      ...r,
      redeemedAt: r.redeemedAt ? r.redeemedAt.toISOString() : null,
    }));

    return NextResponse.json({ results });
  }

  if (typeof body === "object" && body !== null && "householdId" in body) {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parsed = redeemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { householdId } = parsed.data;

    const [current] = await db
      .select({
        id: mdHouseholds.id,
        reference: mdHouseholds.reference,
        hamperStatus: mdHouseholds.hamperStatus,
        redeemedAt: mdHouseholds.redeemedAt,
        redeemedBy: mdHouseholds.redeemedBy,
      })
      .from(mdHouseholds)
      .where(eq(mdHouseholds.id, householdId))
      .limit(1);

    if (!current) {
      void logAudit({
        actorId: user.id,
        actorEmail: user.email ?? undefined,
        action: "hamper.redeem.blocked",
        site: "md",
        target: `household:${householdId}`,
        details: { reason: "not_found" },
      });
      return NextResponse.json({ error: "Household not found" }, { status: 404 });
    }

    if (current.hamperStatus === "redeemed") {
      void logAudit({
        actorId: user.id,
        actorEmail: user.email ?? undefined,
        action: "hamper.redeem.blocked",
        site: "md",
        target: `household:${householdId}`,
        details: {
          reference: current.reference,
          reason: "already_redeemed",
          redeemedAt: current.redeemedAt,
          redeemedBy: current.redeemedBy,
        },
      });
      return NextResponse.json(
        {
          error: "Household already redeemed",
          redeemedAt: current.redeemedAt,
          redeemedBy: current.redeemedBy,
          reference: current.reference,
        },
        { status: 409 },
      );
    }

    // Atomic conditional update — only succeeds if status is NOT 'redeemed'.
    // This is the race-condition guard: two concurrent staff members can't
    // both flip the same household. The WHERE clause is evaluated and applied
    // as a single atomic row-level operation by Postgres.
    const now = new Date();
    const [updated] = await db
      .update(mdHouseholds)
      .set({
        hamperStatus: "redeemed",
        redeemedAt: now,
        redeemedBy: user.id,
        updatedAt: now,
      })
      .where(
        and(
          eq(mdHouseholds.id, householdId),
          sql`${mdHouseholds.hamperStatus} != 'redeemed'`,
        ),
      )
      .returning({
        id: mdHouseholds.id,
        reference: mdHouseholds.reference,
        hamperStatus: mdHouseholds.hamperStatus,
        redeemedAt: mdHouseholds.redeemedAt,
        redeemedBy: mdHouseholds.redeemedBy,
      });

    if (!updated) {
      // Someone redeemed between our read and write — re-read to report.
      const [refetched] = await db
        .select({
          id: mdHouseholds.id,
          reference: mdHouseholds.reference,
          hamperStatus: mdHouseholds.hamperStatus,
          redeemedAt: mdHouseholds.redeemedAt,
          redeemedBy: mdHouseholds.redeemedBy,
        })
        .from(mdHouseholds)
        .where(eq(mdHouseholds.id, householdId))
        .limit(1);

      void logAudit({
        actorId: user.id,
        actorEmail: user.email ?? undefined,
        action: "hamper.redeem.blocked",
        site: "md",
        target: `household:${householdId}`,
        details: {
          reference: refetched?.reference,
          reason: "race_already_redeemed",
          redeemedAt: refetched?.redeemedAt,
          redeemedBy: refetched?.redeemedBy,
        },
      });

      return NextResponse.json(
        {
          error: "Household already redeemed",
          redeemedAt: refetched?.redeemedAt ?? null,
          redeemedBy: refetched?.redeemedBy ?? null,
          reference: refetched?.reference ?? null,
        },
        { status: 409 },
      );
    }

    void logAudit({
      actorId: user.id,
      actorEmail: user.email ?? undefined,
      action: "hamper.redeem.success",
      site: "md",
      target: `household:${householdId}`,
      details: { reference: updated.reference, redeemedAt: updated.redeemedAt },
    });

    return NextResponse.json({
      success: true,
      household: {
        ...updated,
        redeemedAt: updated.redeemedAt ? updated.redeemedAt.toISOString() : null,
      },
    });
  }

  return NextResponse.json({ error: "Unknown request shape" }, { status: 400 });
}