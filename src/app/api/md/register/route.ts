import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { mdRegistrants } from "@/db/schema";
import { eq, or, and, isNull } from "drizzle-orm";
import { generateApplicationId } from "@/lib/tha-id";
import { logAudit } from "@/lib/audit";
import { registrationSchema } from "@/lib/md-schemas";
import { normalizeTtPhone } from "@/lib/tt-phone";
import { notifyRegistrationConfirmed } from "@/lib/notify";
import { findDuplicates } from "@/lib/dedup";
import { isInDistrictCommunity } from "@/lib/tobago-locations";

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
    .where(and(or(...dupConditions), isNull(mdRegistrants.deletedAt)))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      { success: false, error: "A registration with this name and phone number, or national ID, already exists." },
      { status: 409 },
    );
  }

  // The programme only runs in the Mt. St. George/Goodwood district today.
  // Registrations from elsewhere are kept as expressions of interest: no
  // Application ID, no QR, no confirmation — just a thank-you on screen.
  const served = isInDistrictCommunity(data.address);
  const thaId = served ? generateApplicationId("md") : null;

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
      productCategoryNote: data.productCategoryNote?.trim() || null,
      consent: data.consent,
      thaId,
    })
    .returning({ id: mdRegistrants.id, thaId: mdRegistrants.thaId });

  if (!registrant) {
    return NextResponse.json({ success: false, error: "Failed to create registration" }, { status: 500 });
  }

  void logAudit({
    actorId: "anonymous",
    action: served ? "registration.create" : "registration.interest",
    site: "md",
    target: `registrant:${registrant.id}`,
    details: { thaId: registrant.thaId, served, community: data.address.trim() },
  });

  if (served && registrant.thaId) {
    void notifyRegistrationConfirmed({
      siteKey: "md",
      applicationId: registrant.thaId,
      recipientName: data.fullName.trim(),
      phoneNumber: normalizedPhone,
      email: data.email ?? null,
    });
  }

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

  return NextResponse.json({ success: true, served, thaId: registrant.thaId, duplicateWarning });
}