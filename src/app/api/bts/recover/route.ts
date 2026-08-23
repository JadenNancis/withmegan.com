import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, desc, and, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { btsGuardians } from "@/db/schema";
import { normalizeTtPhone } from "@/lib/tt-phone";
import { notifyRegistrationConfirmed } from "@/lib/notify";
import { logAudit } from "@/lib/audit";

const bodySchema = z.object({
  phoneNumber: z.string().min(7, "Phone number is required"),
});

/**
 * Public ID-recovery endpoint. Trust model: we accept any phone number,
 * look up registrations, and ALWAYS respond the same way regardless of
 * whether one exists — so this endpoint cannot be used to enumerate
 * registered phone numbers. The ID itself is only ever sent to the
 * phone on file; it never renders on screen.
 *
 * Rate limit: in-memory bucket, 3 attempts per normalized phone per hour.
 * Sufficient at community-event scale; monitoring hooks into the
 * audit log for abuse review.
 */
const bucket = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 3;
const WINDOW_MS = 60 * 60 * 1000;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = bucket.get(key);
  if (!entry || entry.resetAt < now) {
    bucket.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= LIMIT) return true;
  entry.count += 1;
  return false;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid phone number." },
      { status: 422 },
    );
  }

  const normalized = normalizeTtPhone(parsed.data.phoneNumber);
  if (!normalized) {
    return NextResponse.json(
      { error: "Enter a valid Trinidad & Tobago phone number, e.g. (868) 123-4567." },
      { status: 422 },
    );
  }

  if (rateLimited(normalized)) {
    // Deliberately vague — don't confirm whether the number is registered.
    return NextResponse.json(
      { error: "Too many attempts. Please try again in about an hour." },
      { status: 429 },
    );
  }

  try {
    const rows = await db
      .select()
      .from(btsGuardians)
      .where(and(eq(btsGuardians.contactNumber, normalized), isNull(btsGuardians.deletedAt)))
      .orderBy(desc(btsGuardians.createdAt))
      .limit(1);

    const guardian = rows[0];

    if (guardian && guardian.thaId) {
      void notifyRegistrationConfirmed({
        siteKey: "bts",
        applicationId: guardian.thaId,
        recipientName: guardian.fullName,
        phoneNumber: normalized,
        email: guardian.email || null,
      }).catch((e: unknown) => console.error("[bts/recover] notify failed:", e));

      void logAudit({
        actorId: "anonymous",
        action: "registration.recover",
        site: "bts",
        target: `registration:${guardian.thaId}`,
        details: { guardianId: guardian.id },
      });
    }
  } catch (err) {
    console.error("[bts/recover] lookup failed:", err);
    // Fall through to the uniform response — a DB error is indistinguishable
    // from "not found" from the caller's perspective.
  }

  return NextResponse.json({
    success: true,
    message:
      "If a registration exists for this number, we've emailed the Application ID to the address on file.",
  });
}
