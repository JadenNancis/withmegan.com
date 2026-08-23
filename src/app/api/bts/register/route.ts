import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { btsGuardians, btsDependents } from "@/db/schema";
import { generateApplicationId } from "@/lib/tha-id";
import { logAudit } from "@/lib/audit";
import { normalizeTtPhone, isValidTtPhone } from "@/lib/tt-phone";
import { notifyRegistrationConfirmed } from "@/lib/notify";
import { findDuplicates } from "@/lib/dedup";
import { isInDistrictCommunity } from "@/lib/tobago-locations";

const dependentSchema = z.object({
  studentName: z.string().min(1, "Child/Student name is required"),
  schoolName: z.string().min(1, "School name is required"),
  schoolAddress: z.string().optional(),
  gradeLevel: z.string().min(1, "Grade level is required"),
  notes: z.string().optional(),
  bookListUrl: z.string().optional(),
});

const registrationSchema = z.object({
  guardian: z.object({
    fullName: z.string().min(1, "Full name is required"),
    nationalId: z.string().min(1, "National ID is required").max(50),
    contactNumber: z.string().refine(isValidTtPhone, "Enter a valid TT phone number, e.g. (868) 123-4567"),
    email: z.string().email("A valid email address is required").optional().or(z.literal("")),
    address: z.string().min(1, "Community is required"),
    consent: z.boolean().refine((v) => v === true, "Consent is required"),
  }),
  dependents: z.array(dependentSchema).min(1, "At least one dependent is required"),
});

type RegistrationInput = z.infer<typeof registrationSchema>;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const input: RegistrationInput = parsed.data;
  const { guardian } = input;
  const normalizedPhone = normalizeTtPhone(guardian.contactNumber) ?? guardian.contactNumber;
  // The programme only runs in the Mt. St. George/Goodwood district today.
  // Registrations from elsewhere are kept as expressions of interest: no
  // Application ID, no QR, no confirmation — just a thank-you on screen.
  const served = isInDistrictCommunity(guardian.address);
  const thaId = served ? generateApplicationId("bts") : null;

  const existingByEmail = guardian.email && guardian.email.trim()
    ? await db.select().from(btsGuardians).where(and(eq(btsGuardians.email, guardian.email), isNull(btsGuardians.deletedAt))).limit(1)
    : [];
  const existingByNationalId = guardian.nationalId?.trim()
    ? await db.select().from(btsGuardians).where(and(eq(btsGuardians.nationalId, guardian.nationalId.trim()), isNull(btsGuardians.deletedAt))).limit(1)
    : [];

  if (existingByEmail.length > 0) {
    return NextResponse.json(
      {
        error:
          "A registration already exists for this email. Contact an administrator if you need to update it.",
      },
      { status: 409 },
    );
  }
  if (existingByNationalId.length > 0) {
    return NextResponse.json(
      {
        error:
          "A registration already exists for this National ID. Contact an administrator if you need to update it.",
      },
      { status: 409 },
    );
  }

  let guardianId: string;
  try {
    const [created] = await db
      .insert(btsGuardians)
      .values({
        fullName: guardian.fullName,
        nationalId: guardian.nationalId.trim(),
        contactNumber: normalizedPhone,
        email: guardian.email || "",
        address: guardian.address,
        consent: guardian.consent,
        thaId,
      })
      .returning({ id: btsGuardians.id });

    guardianId = created.id;

    await db.insert(
      btsDependents,
    ).values(
      input.dependents.map((d) => ({
        guardianId,
        studentName: d.studentName,
        schoolName: d.schoolName,
        gradeLevel: d.gradeLevel,
        notes: d.notes || null,
        bookListUrl: d.bookListUrl || null,
      })),
    );
  } catch (err) {
    console.error("[bts/register] insert failed:", err);
    return NextResponse.json(
      { error: "Registration could not be saved. Please try again." },
      { status: 500 },
    );
  }

  void logAudit({
    actorId: "anonymous",
    action: served ? "registration.create" : "registration.interest",
    site: "bts",
    target: `registration:${thaId ?? guardianId}`,
    details: {
      guardianId,
      served,
      community: guardian.address,
      dependents: input.dependents.length,
      schoolNames: input.dependents.map((d) => d.schoolName),
    },
  });

  if (served && thaId) {
    void notifyRegistrationConfirmed({
      siteKey: "bts",
      applicationId: thaId,
      recipientName: guardian.fullName,
      phoneNumber: normalizedPhone,
      email: guardian.email || null,
    });
  }

  // Fuzzy duplicate check — warning only, registration still succeeds.
  // Admins can review flagged near-matches without blocking the submitter.
  let duplicateWarning: Awaited<ReturnType<typeof findDuplicates>> = [];
  try {
    duplicateWarning = await findDuplicates("bts", guardian.fullName, normalizedPhone, guardian.address);
    // Exclude the record we just created (exact phone self-match).
    duplicateWarning = duplicateWarning.filter((m) => m.id !== guardianId);
  } catch (err) {
    console.error("[bts/register] fuzzy dup check failed:", err);
  }

  return NextResponse.json({ success: true, served, thaId, duplicateWarning });
}