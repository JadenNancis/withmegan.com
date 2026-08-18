import { z } from "zod";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { volunteers, volunteerShifts } from "@/db/schema";
import { and, eq } from "drizzle-orm";

const SITES = ["bts", "md"] as const;

const createSchema = z.object({
  site: z.enum(SITES),
  fullName: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().min(7, "Enter a valid phone number"),
  shiftId: z.string().uuid("Choose a shift").optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { site, fullName, email, phone, shiftId } = parsed.data;

  // Guard against the same email double-signing-up for the same event.
  try {
    const [existing] = await db
      .select({ id: volunteers.id })
      .from(volunteers)
      .where(and(eq(volunteers.email, email.toLowerCase()), eq(volunteers.site, site)))
      .limit(1);
    if (existing) {
      return NextResponse.json(
        { error: "That email has already signed up to volunteer." },
        { status: 409 },
      );
    }
  } catch (err) {
    console.error("[volunteers] duplicate check failed:", err);
  }

  try {
    const [created] = await db
      .insert(volunteers)
      .values({
        site,
        fullName,
        email: email.toLowerCase(),
        phone,
        status: "pending",
        shiftId,
      })
      .returning({ id: volunteers.id });

    return NextResponse.json({ success: true, id: created.id }, { status: 201 });
  } catch (err) {
    console.error("[volunteers] create failed:", err);
    return NextResponse.json({ error: "Could not save your sign-up. Try again." }, { status: 500 });
  }
}

/** Public read of available shifts for a site (used by the signup forms). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const site = searchParams.get("site");
  if (site !== "bts" && site !== "md") {
    return NextResponse.json({ error: "Invalid site." }, { status: 400 });
  }

  try {
    const shifts = await db
      .select({
        id: volunteerShifts.id,
        label: volunteerShifts.label,
        startsAt: volunteerShifts.startsAt,
        endsAt: volunteerShifts.endsAt,
        capacity: volunteerShifts.capacity,
      })
      .from(volunteerShifts)
      .where(eq(volunteerShifts.site, site))
      .orderBy(volunteerShifts.startsAt);

    return NextResponse.json({ shifts });
  } catch (err) {
    console.error("[volunteers] list shifts failed:", err);
    return NextResponse.json({ error: "Could not load shifts." }, { status: 500 });
  }
}
