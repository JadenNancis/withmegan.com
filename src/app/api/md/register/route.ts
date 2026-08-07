import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { mdRegistrants, mdHouseholds } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { generateApplicationId } from "@/lib/tha-id";
import { logAudit } from "@/lib/audit";
import { registrationSchema } from "@/lib/md-schemas";
import { normalizeTtPhone } from "@/lib/tt-phone";
import { notifyRegistrationConfirmed } from "@/lib/notify";
import { findDuplicates } from "@/lib/dedup";

export const runtime = "nodejs";

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const trimmedName = data.fullName.trim().toLowerCase();
  const normalizedPhone = normalizeTtPhone(data.phoneNumber) ?? data.phoneNumber.trim();

  const dupConditions = [
    eq(mdRegistrants.fullName, data.fullName.trim()),
    eq(mdRegistrants.phoneNumber, normalizedPhone),
  ];
  if (data.nationalId && data.nationalId.trim()) {
    dupConditions.push(eq(mdRegistrants.nationalId, data.nationalId.trim()));
  }

  const existing = await db
    .select({ id: mdRegistrants.id })
    .from(mdRegistrants)
    .where(or(...dupConditions))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      { success: false, error: "A registration with this name and phone number, or national ID, already exists." },
      { status: 409 },
    );
  }

  let householdId: string | null = null;
  if (data.householdReference && data.householdReference.trim()) {
    const ref = data.householdReference.trim();
    const [household] = await db
      .select()
      .from(mdHouseholds)
      .where(eq(mdHouseholds.reference, ref))
      .limit(1);

    if (household) {
      householdId = household.id;
    }
  }

  const thaId = generateApplicationId("md");

  const [registrant] = await db
    .insert(mdRegistrants)
    .values({
      fullName: data.fullName.trim(),
      nationalId: data.nationalId?.trim() || null,
      dateOfBirth: data.dateOfBirth,
      address: data.address.trim(),
      phoneNumber: normalizedPhone,
      email: data.email?.trim() || null,
      productCategory: data.productCategory?.trim() || null,
      consent: data.consent,
      thaId,
      householdId,
    })
    .returning({ id: mdRegistrants.id, thaId: mdRegistrants.thaId });

  if (!registrant) {
    return NextResponse.json({ success: false, error: "Failed to create registration" }, { status: 500 });
  }

  void logAudit({
    actorId: "anonymous",
    action: "registration.create",
    site: "md",
    target: `registrant:${registrant.id}`,
    details: { thaId: registrant.thaId, householdId },
  });

  void notifyRegistrationConfirmed({
    siteKey: "md",
    applicationId: registrant.thaId ?? "",
    recipientName: data.fullName.trim(),
    phoneNumber: normalizedPhone,
    email: data.email ?? null,
  });

  // Fuzzy duplicate check — warning only, registration still succeeds.
  // Admins can review flagged near-matches without blocking the submitter.
  let duplicateWarning: Awaited<ReturnType<typeof findDuplicates>> = [];
  try {
    duplicateWarning = await findDuplicates("md", data.fullName.trim(), normalizedPhone, data.address.trim());
    // Exclude the record we just created (exact phone self-match).
    duplicateWarning = duplicateWarning.filter((m) => m.id !== registrant.id);
  } catch (err) {
    console.error("[md/register] fuzzy dup check failed:", err);
  }

  return NextResponse.json({ success: true, thaId: registrant.thaId, duplicateWarning });
}