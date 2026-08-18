import { z } from "zod";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { volunteers, volunteerShifts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logAudit } from "@/lib/audit";
import type { SiteKey } from "@/sites/site-registry";

const SITES = ["bts", "md"] as const;
const STATUSES = ["pending", "approved", "declined"] as const;

async function requireStaff() {
  const session = await auth();
  if (!session?.user) return null;
  const role = (session.user as { role?: string }).role;
  if (role !== "admin" && role !== "staff") return null;
  return session.user as { id: string; email: string | null; name: string | null; role: string };
}

export async function GET(req: Request) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const site = searchParams.get("site");
  if (site !== "bts" && site !== "md") {
    return NextResponse.json({ error: "Invalid site." }, { status: 400 });
  }

  try {
    const shiftRows = await db
      .select()
      .from(volunteerShifts)
      .where(eq(volunteerShifts.site, site))
      .orderBy(volunteerShifts.startsAt);

    const volunteerRows = await db
      .select()
      .from(volunteers)
      .where(eq(volunteers.site, site))
      .orderBy(volunteers.createdAt);

    const shifts = shiftRows.map((s) => ({
      id: s.id,
      label: s.label,
      startsAt: s.startsAt,
      endsAt: s.endsAt,
      capacity: s.capacity,
      signedUp: volunteerRows.filter((v) => v.shiftId === s.id && v.status === "approved").length,
    }));

    return NextResponse.json({ volunteers: volunteerRows, shifts });
  } catch (err) {
    console.error("[admin/volunteers] list failed:", err);
    return NextResponse.json({ error: "Could not load volunteers." }, { status: 500 });
  }
}

const patchSchema = z.object({
  id: z.string().uuid("Invalid volunteer ID"),
  status: z.enum(STATUSES).optional(),
  shiftId: z.string().uuid().nullable().optional(),
});

export async function PATCH(req: Request) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { id, status, shiftId } = parsed.data;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (status !== undefined) updates.status = status;
  if (shiftId !== undefined) updates.shiftId = shiftId;

  try {
    const [updated] = await db
      .update(volunteers)
      .set(updates)
      .where(eq(volunteers.id, id))
      .returning({ id: volunteers.id, site: volunteers.site });

    if (!updated) {
      return NextResponse.json({ error: "Volunteer not found." }, { status: 404 });
    }

    void logAudit({
      actorId: user.id,
      actorEmail: user.email ?? undefined,
      action: "volunteer.update",
      site: updated.site as SiteKey,
      target: `volunteer:${id}`,
      details: { updates },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/volunteers] update failed:", err);
    return NextResponse.json({ error: "Volunteer could not be updated." }, { status: 500 });
  }
}
