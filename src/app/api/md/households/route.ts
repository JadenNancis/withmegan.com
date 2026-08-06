import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { mdHouseholds, mdRegistrants } from "@/db/schema";
import { eq, ilike, or } from "drizzle-orm";
import { auth } from "@/auth";
import { logAudit } from "@/lib/audit";
import { generateHouseholdReference } from "@/lib/md-household-ref";
import {
  createHouseholdSchema,
  assignRegistrantSchema,
  updateHamperStatusSchema,
} from "@/lib/md-schemas";

export const runtime = "nodejs";

type AuthUser = { id: string; email: string | null; name: string | null; role: string };

async function getAuthUser(): Promise<AuthUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  const u = session.user as unknown as { id?: string; email?: string | null; name?: string | null; role?: string };
  if (!u.id || (u.role !== "admin" && u.role !== "staff")) return null;
  return { id: u.id, email: u.email ?? null, name: u.name ?? null, role: u.role };
}

export async function GET(req: Request): Promise<Response> {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const q = url.searchParams.get("q")?.trim();

  const baseSelect = {
    id: mdHouseholds.id,
    reference: mdHouseholds.reference,
    hamperStatus: mdHouseholds.hamperStatus,
    redeemedAt: mdHouseholds.redeemedAt,
    redeemedBy: mdHouseholds.redeemedBy,
    createdAt: mdHouseholds.createdAt,
  };

  const validStatus =
    status === "unassigned" || status === "assigned" || status === "redeemed" ? status : null;

  const rows = validStatus
    ? await db.select(baseSelect).from(mdHouseholds).where(eq(mdHouseholds.hamperStatus, validStatus))
    : q
      ? await db
          .select(baseSelect)
          .from(mdHouseholds)
          .where(
            or(
              ilike(mdHouseholds.reference, `%${q}%`),
              ilike(mdHouseholds.redeemedBy, `%${q}%`),
            ),
          )
      : await db.select(baseSelect).from(mdHouseholds);

  return NextResponse.json({ households: rows });
}

export async function POST(req: Request): Promise<Response> {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = createHouseholdSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const data = parsed.data;

  const reference = data.reference?.trim() || (await generateHouseholdReference());

  const [existing] = await db
    .select({ id: mdHouseholds.id })
    .from(mdHouseholds)
    .where(eq(mdHouseholds.reference, reference))
    .limit(1);

  if (existing) {
    return NextResponse.json({ error: "Household reference already exists" }, { status: 409 });
  }

  const [household] = await db
    .insert(mdHouseholds)
    .values({
      reference,
      hamperStatus: data.hamperStatus ?? "unassigned",
    })
    .returning({ id: mdHouseholds.id, reference: mdHouseholds.reference });

  if (!household) {
    return NextResponse.json({ error: "Failed to create household" }, { status: 500 });
  }

  void logAudit({
    actorId: user.id,
    actorEmail: user.email ?? undefined,
    action: "household.create",
    site: "md",
    target: `household:${household.id}`,
    details: { reference: household.reference },
  });

  return NextResponse.json({ success: true, household });
}

export async function PATCH(req: Request): Promise<Response> {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = (
    "registrantId" in (body as Record<string, unknown>)
      ? assignRegistrantSchema
      : updateHamperStatusSchema
  ).safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const data = parsed.data;

  if ("registrantId" in data) {
    const [updated] = await db
      .update(mdRegistrants)
      .set({ householdId: data.householdId, updatedAt: new Date() })
      .where(eq(mdRegistrants.id, data.registrantId))
      .returning({ id: mdRegistrants.id, householdId: mdRegistrants.householdId });

    if (!updated) {
      return NextResponse.json({ error: "Registrant not found" }, { status: 404 });
    }

    void logAudit({
      actorId: user.id,
      actorEmail: user.email ?? undefined,
      action: "household.assign",
      site: "md",
      target: `registrant:${data.registrantId}`,
      details: { householdId: data.householdId },
    });

    return NextResponse.json({ success: true, registrant: updated });
  }

  const { householdId, hamperStatus } = data;
  const [hh] = await db
    .update(mdHouseholds)
    .set({ hamperStatus, updatedAt: new Date() })
    .where(eq(mdHouseholds.id, householdId))
    .returning({ id: mdHouseholds.id, reference: mdHouseholds.reference, hamperStatus: mdHouseholds.hamperStatus });

  if (!hh) {
    return NextResponse.json({ error: "Household not found" }, { status: 404 });
  }

  void logAudit({
    actorId: user.id,
    actorEmail: user.email ?? undefined,
    action: "household.status",
    site: "md",
    target: `household:${householdId}`,
    details: { reference: hh.reference, hamperStatus },
  });

  return NextResponse.json({ success: true, household: hh });
}