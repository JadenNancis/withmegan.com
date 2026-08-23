import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { mdRegistrants } from "@/db/schema";
import { eq, ilike, or, and, sql, isNull } from "drizzle-orm";
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
  status: "registered" | "redeemed";
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
        redeemedAt: mdRegistrants.redeemedAt,
        redeemedBy: mdRegistrants.redeemedBy,
      })
      .from(mdRegistrants)
      .where(
        and(
          isNull(mdRegistrants.deletedAt),
          or(
            ilike(mdRegistrants.fullName, pattern),
            ilike(mdRegistrants.thaId, pattern),
            ilike(mdRegistrants.nationalId, pattern),
            ilike(mdRegistrants.phoneNumber, pattern),
          ),
        ),
      )
      .orderBy(mdRegistrants.createdAt)
      .limit(20);

    const results: SearchResult[] = rows.map((r) => ({
      ...r,
      status: r.redeemedAt ? "redeemed" : "registered",
      redeemedAt: r.redeemedAt ? r.redeemedAt.toISOString() : null,
    }));

    return NextResponse.json({ results });
  }

  if (typeof body === "object" && body !== null && "registrantId" in body) {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parsed = redeemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { registrantId } = parsed.data;

    // Atomic conditional update — only succeeds if the registrant has NOT
    // already been redeemed. Two concurrent staff members can't both flip
    // the same registrant; Postgres evaluates the WHERE atomically.
    const now = new Date();
    const [updated] = await db
      .update(mdRegistrants)
      .set({
        redeemedAt: now,
        redeemedBy: user.id,
        updatedAt: now,
      })
      .where(
        and(
          eq(mdRegistrants.id, registrantId),
          isNull(mdRegistrants.redeemedAt),
          isNull(mdRegistrants.deletedAt),
        ),
      )
      .returning({
        id: mdRegistrants.id,
        thaId: mdRegistrants.thaId,
        fullName: mdRegistrants.fullName,
        redeemedAt: mdRegistrants.redeemedAt,
        redeemedBy: mdRegistrants.redeemedBy,
      });

    if (!updated) {
      // Either the record is missing or it was already redeemed — re-read to report.
      const [current] = await db
        .select({
          id: mdRegistrants.id,
          thaId: mdRegistrants.thaId,
          fullName: mdRegistrants.fullName,
          redeemedAt: mdRegistrants.redeemedAt,
          redeemedBy: mdRegistrants.redeemedBy,
        })
        .from(mdRegistrants)
        .where(eq(mdRegistrants.id, registrantId))
        .limit(1);

      if (!current) {
        void logAudit({
          actorId: user.id,
          actorEmail: user.email ?? undefined,
          action: "hamper.redeem.blocked",
          site: "md",
          target: `registrant:${registrantId}`,
          details: { reason: "not_found" },
        });
        return NextResponse.json({ error: "Registrant not found" }, { status: 404 });
      }

      void logAudit({
        actorId: user.id,
        actorEmail: user.email ?? undefined,
        action: "hamper.redeem.blocked",
        site: "md",
        target: `registrant:${registrantId}`,
        details: {
          reason: "already_redeemed",
          redeemedAt: current.redeemedAt,
          redeemedBy: current.redeemedBy,
        },
      });

      return NextResponse.json(
        {
          error: "Already redeemed",
          redeemedAt: current.redeemedAt,
          redeemedBy: current.redeemedBy,
        },
        { status: 409 },
      );
    }

    void logAudit({
      actorId: user.id,
      actorEmail: user.email ?? undefined,
      action: "hamper.redeem.success",
      site: "md",
      target: `registrant:${registrantId}`,
      details: { thaId: updated.thaId, redeemedAt: updated.redeemedAt },
    });

    return NextResponse.json({
      success: true,
      registrant: {
        ...updated,
        redeemedAt: updated.redeemedAt ? updated.redeemedAt.toISOString() : null,
      },
    });
  }

  return NextResponse.json({ error: "Unknown request shape" }, { status: 400 });
}
