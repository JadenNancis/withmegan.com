import { z } from "zod";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { btsGuardians, mdRegistrants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logAudit } from "@/lib/audit";
import type { SiteKey } from "@/sites/site-registry";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  site: z.enum(["bts", "md"]),
  id: z.string().uuid(),
  action: z.enum(["delete", "restore", "purge"]),
});

/**
 * Registrant lifecycle for the admin area.
 *  - delete:  soft-delete (row moves to the hidden deleted tab)
 *  - restore: bring a soft-deleted row back to the active list
 *  - purge:   permanently erase the row (admin only; BTS dependents cascade)
 */
export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user as
    | { id: string; email: string | null; role?: string }
    | undefined;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (user.role !== "admin" && user.role !== "staff") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  let parsed;
  try {
    parsed = bodySchema.safeParse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { site, id, action } = parsed.data;

  // Purge permanently destroys a row — admins only, and only from the deleted tab.
  if (action === "purge" && user.role !== "admin") {
    return NextResponse.json({ error: "Only administrators can permanently delete registrations." }, { status: 403 });
  }

  const table = site === "bts" ? btsGuardians : mdRegistrants;
  const siteLabel = site === "bts" ? "Back to School" : "Market Day";

  try {
    const existing = await db
      .select({ id: table.id, thaId: table.thaId })
      .from(table)
      .where(eq(table.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Registration not found." }, { status: 404 });
    }
    const thaId = existing[0].thaId ?? id;

    if (action === "delete") {
      await db.update(table).set({ deletedAt: new Date() }).where(eq(table.id, id));
      await logAudit({
        actorId: user.id,
        actorEmail: user.email ?? undefined,
        action: "registration.soft-delete",
        site,
        target: `registration:${thaId}`,
        details: { id },
      });
      return NextResponse.json({ ok: true, message: `${siteLabel} registration moved to deleted.` });
    }

    if (action === "restore") {
      await db.update(table).set({ deletedAt: null }).where(eq(table.id, id));
      await logAudit({
        actorId: user.id,
        actorEmail: user.email ?? undefined,
        action: "registration.restore",
        site,
        target: `registration:${thaId}`,
        details: { id },
      });
      return NextResponse.json({ ok: true, message: "Registration restored." });
    }

    // purge — dependents cascade via the FK on bts_dependents.
    await db.delete(table).where(eq(table.id, id));
    await logAudit({
      actorId: user.id,
      actorEmail: user.email ?? undefined,
      action: "registration.purge",
      site,
      target: `registration:${thaId}`,
      details: { id },
    });
    return NextResponse.json({ ok: true, message: "Registration permanently deleted." });
  } catch (err) {
    console.error(`[api/admin/registrants] ${action} failed:`, err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export type RegistrantActionSite = SiteKey;
