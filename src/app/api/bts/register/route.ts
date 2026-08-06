import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { btsGuardians, btsDependents } from "@/db/schema";
import { generateThaId } from "@/lib/tha-id";
import { logAudit } from "@/lib/audit";
import { sendEmail, btsRegistrationConfirmationHtml } from "@/lib/email";
import { SITES } from "@/sites/site-registry";

const dependentSchema = z.object({
  studentName: z.string().min(1, "Student name is required"),
  schoolName: z.string().min(1, "School name is required"),
  schoolAddress: z.string().optional(),
  gradeLevel: z.string().min(1, "Grade level is required"),
  notes: z.string().optional(),
  bookListUrl: z.string().optional(),
});

const registrationSchema = z.object({
  guardian: z.object({
    fullName: z.string().min(1, "Full name is required"),
    contactNumber: z.string().min(1, "Contact number is required"),
    email: z.string().email("A valid email address is required"),
    address: z.string().min(1, "Home address is required"),
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
  const thaId = generateThaId("bts");
  const { guardian } = input;

  const existingByEmail = guardian.email
    ? await db.select().from(btsGuardians).where(eq(btsGuardians.email, guardian.email)).limit(1)
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

  let guardianId: string;
  try {
    const [created] = await db
      .insert(btsGuardians)
      .values({
        fullName: guardian.fullName,
        contactNumber: guardian.contactNumber,
        email: guardian.email,
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
    action: "registration.create",
    site: "bts",
    target: `registration:${thaId}`,
    details: {
      guardianId,
      dependents: input.dependents.length,
      schoolNames: input.dependents.map((d) => d.schoolName),
    },
  });

  const eventDate = new Date(SITES.bts.eventDate).toLocaleDateString("en-TT", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  void sendEmail({
    to: guardian.email,
    subject: `Registration Confirmation — ${thaId}`,
    html: btsRegistrationConfirmationHtml({
      guardianName: guardian.fullName,
      thaId,
      dependents: input.dependents.map((d) => ({
        studentName: d.studentName,
        schoolName: d.schoolName,
      })),
      eventDate,
    }),
  });

  return NextResponse.json({ success: true, thaId });
}