import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, inArray, and, ne, or } from "drizzle-orm";
import { db } from "@/db/client";
import { btsGuardians, btsDependents } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { logAudit } from "@/lib/audit";
import { normalizeTtPhone, isValidTtPhone } from "@/lib/tt-phone";
import { isInDistrictCommunity } from "@/lib/tobago-locations";

const dependentSchema = z.object({
  /** Present on existing dependents; omitted for newly added ones. */
  id: z.string().uuid().optional(),
  studentName: z.string().min(1, "Child/Student name is required"),
  schoolName: z.string().min(1, "School name is required"),
  gradeLevel: z.string().min(1, "Grade level is required"),
  notes: z.string().max(2000, "Notes are too long").optional().default(""),
});

const guardianSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(200),
  nationalId: z.string().min(1, "National ID is required").max(50),
  contactNumber: z.string().refine(isValidTtPhone, "Enter a valid TT phone number, e.g. (868) 123-4567"),
  email: z.string().email("A valid email address is required").optional().or(z.literal("")),
  address: z.string().min(1, "Community is required"),
  consent: z.boolean(),
});

const updateSchema = z.object({
  guardian: guardianSchema,
  dependents: z.array(dependentSchema).min(1, "At least one dependent is required"),
});

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ guardianId: string }> },
) {
  const user = await requireAdmin(undefined, "staff");
  const { guardianId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const existing = await db
    .select()
    .from(btsGuardians)
    .where(eq(btsGuardians.id, guardianId))
    .limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ error: "Registration not found." }, { status: 404 });
  }

  const guardian = existing[0];
  const input = parsed.data;

  // Duplicate guard against other registrations (email + National ID).
  const dupChecks = [];
  if (input.guardian.email && input.guardian.email.trim()) {
    dupChecks.push(
      and(
        eq(btsGuardians.email, input.guardian.email.trim().toLowerCase()),
        ne(btsGuardians.id, guardianId),
      ),
    );
  }
  if (input.guardian.nationalId.trim()) {
    dupChecks.push(
      and(
        eq(btsGuardians.nationalId, input.guardian.nationalId.trim()),
        ne(btsGuardians.id, guardianId),
      ),
    );
  }
  if (dupChecks.length > 0) {
    const dupes = await db
      .select({ id: btsGuardians.id, email: btsGuardians.email, nationalId: btsGuardians.nationalId })
      .from(btsGuardians)
      .where(dupChecks.length === 1 ? dupChecks[0] : or(...dupChecks));
    if (dupes.length > 0) {
      return NextResponse.json(
        {
          error:
            "Another registration already uses this email or National ID. Revert those fields or choose different values.",
        },
        { status: 409 },
      );
    }
  }

  const normalizedPhone = normalizeTtPhone(input.guardian.contactNumber) ?? input.guardian.contactNumber;
  const guardianEmail = (input.guardian.email ?? "").trim().toLowerCase();

  try {
    await db
      .update(btsGuardians)
      .set({
        fullName: input.guardian.fullName.trim(),
        nationalId: input.guardian.nationalId.trim(),
        contactNumber: normalizedPhone,
        email: guardianEmail,
        address: input.guardian.address,
        consent: input.guardian.consent,
        updatedAt: new Date(),
      })
      .where(eq(btsGuardians.id, guardianId));

    const existingDependents = await db
      .select({ id: btsDependents.id })
      .from(btsDependents)
      .where(eq(btsDependents.guardianId, guardianId));

    const existingIds = new Set(existingDependents.map((d) => d.id));
    const incomingIds = new Set(input.dependents.flatMap((d) => (d.id ? [d.id] : [])));

    // Update kept dependents, insert new ones.
    for (const dep of input.dependents) {
      const values = {
        studentName: dep.studentName.trim(),
        schoolName: dep.schoolName.trim(),
        gradeLevel: dep.gradeLevel.trim(),
        notes: dep.notes?.trim() || null,
      };
      if (dep.id && existingIds.has(dep.id)) {
        await db.update(btsDependents).set(values).where(eq(btsDependents.id, dep.id));
      } else {
        await db
          .insert(btsDependents)
          .values({ ...values, guardianId });
      }
    }

    // Remove dependents deleted from the form.
    const removedIds = [...existingIds].filter((id) => !incomingIds.has(id));
    if (removedIds.length > 0) {
      await db.delete(btsDependents).where(inArray(btsDependents.id, removedIds));
    }

    void logAudit({
      actorId: user.id,
      actorEmail: user.email ?? undefined,
      action: "registration.update",
      site: "bts",
      target: `registration:${guardian.thaId ?? guardianId}`,
      details: {
        guardianId,
        community: input.guardian.address,
        dependents: input.dependents.length,
        removedDependents: removedIds.length,
        served: isInDistrictCommunity(input.guardian.address),
      },
    });
  } catch (err) {
    console.error("[api/bts/admin/registrations] update failed:", err);
    return NextResponse.json(
      { error: "Could not save changes. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
