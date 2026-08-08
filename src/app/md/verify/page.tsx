import { Suspense } from "react";
import Link from "next/link";
import { db } from "@/db/client";
import { mdRegistrants, mdHouseholds } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SunsetWaveDivider } from "@/components/md-illustrations";

export const dynamic = "force-dynamic";

/**
 * Public MD verify page — reached by scanning the QR code on a
 * registration confirmation. No auth required: possession of the
 * Application ID (which contains a cryptographically-random suffix) is
 * the trust token.
 *
 * Looks up the registrant by thaId and renders a read-only view of the
 * registration, including household/hamper status if assigned.
 * Shows a green checkmark when found, red X when not.
 */
export default async function MdVerifyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const aid = typeof sp.aid === "string" ? sp.aid.trim() : "";

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-700 to-amber-500 shadow-lg">
        <div className="md-hero-shimmer absolute inset-0 opacity-20 pointer-events-none" />
        <div className="relative px-6 py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow">
            Registration Verification
          </h1>
          <p className="mt-2 text-sm text-amber-50 drop-shadow">
            Market Day with Megan · scan-to-verify. Present this screen at the
            hamper distribution counter on event day.
          </p>
        </div>
        <SunsetWaveDivider className="w-full h-[24px] block opacity-70" />
      </div>

      <Suspense
        fallback={
          <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm text-sm text-gray-500">
            Looking up registration…
          </div>
        }
      >
        {aid ? <VerifyResult aid={aid} /> : <MissingAid />}
      </Suspense>
    </div>
  );
}

function MissingAid() {
  return (
    <div className="rounded-2xl border border-red-300 bg-red-50 p-6 text-center shadow-sm">
      <RedX />
      <h2 className="mt-4 text-lg font-bold text-red-800">No Application ID provided</h2>
      <p className="mt-2 text-sm text-red-700">
        This link is missing the <code className="font-mono">?aid=</code> parameter. Scan the
        QR code on your registration confirmation to view your details.
      </p>
      <Link
        href="/md"
        className="mt-6 inline-flex min-h-[52px] items-center justify-center rounded-xl bg-amber-500 px-6 py-3 text-base font-bold text-white shadow-md hover:bg-amber-600 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}

async function VerifyResult({ aid }: { aid: string }) {
  const [row] = await db
    .select({
      id: mdRegistrants.id,
      thaId: mdRegistrants.thaId,
      fullName: mdRegistrants.fullName,
      nationalId: mdRegistrants.nationalId,
      dateOfBirth: mdRegistrants.dateOfBirth,
      address: mdRegistrants.address,
      phoneNumber: mdRegistrants.phoneNumber,
      email: mdRegistrants.email,
      productCategory: mdRegistrants.productCategory,
      householdReference: mdHouseholds.reference,
      hamperStatus: mdHouseholds.hamperStatus,
    })
    .from(mdRegistrants)
    .leftJoin(mdHouseholds, eq(mdRegistrants.householdId, mdHouseholds.id))
    .where(eq(mdRegistrants.thaId, aid))
    .limit(1);

  if (!row) {
    return (
      <div className="rounded-2xl border border-red-300 bg-red-50 p-6 text-center shadow-sm">
        <RedX />
        <h2 className="mt-4 text-lg font-bold text-red-800">Registration not found</h2>
        <p className="mt-2 text-sm text-red-700">
          No Market Day registration matches Application ID{" "}
          <code className="font-mono font-semibold">{aid}</code>. Check the ID and try again,
          or ask a volunteer for help.
        </p>
        <Link
          href="/md"
          className="mt-6 inline-flex min-h-[52px] items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-base font-bold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const collected = row.hamperStatus === "redeemed";

  return (
    <div className="space-y-4">
      {/* Found banner */}
      <div className="motion-safe:md-animate-fade-in-up rounded-2xl border border-green-300 bg-gradient-to-br from-green-50 to-amber-50 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <GreenCheck />
          <div>
            <h2 className="text-lg font-bold text-green-800">Registration verified</h2>
            <p className="text-sm text-green-700">
              This is a valid Market Day registration.
            </p>
          </div>
        </div>
      </div>

      {/* Application ID */}
      <div className="motion-safe:md-animate-fade-in-up rounded-2xl border-2 border-dashed border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
          Application ID
        </p>
        <p className="mt-1 break-all font-mono text-2xl font-bold tracking-wider text-amber-700">
          {row.thaId ?? aid}
        </p>
        {collected && (
          <p className="mt-3 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
            ✓ Hamper collected
          </p>
        )}
      </div>

      {/* Registrant details */}
      <section className="motion-safe:md-animate-fade-in-up rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
        <h3 className="border-b border-amber-100 pb-3 text-lg font-bold text-amber-800">
          Registrant
        </h3>
        <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <Detail label="Full name" value={row.fullName} />
          <Detail label="Community" value={row.address} />
          <Detail label="Phone number" value={row.phoneNumber} />
          <Detail label="Email" value={row.email ?? ""} />
          <Detail label="National ID" value={row.nationalId ?? ""} />
          <Detail label="Date of birth" value={row.dateOfBirth ?? ""} />
          <Detail label="Product category" value={row.productCategory ?? ""} />
        </dl>
      </section>

      {/* Household info */}
      <section className="motion-safe:md-animate-fade-in-up rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
        <h3 className="border-b border-amber-100 pb-3 text-lg font-bold text-amber-800">
          Household & Hamper
        </h3>
        <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <Detail label="Household reference" value={row.householdReference ?? ""} />
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Hamper status
            </dt>
            <dd className="mt-0.5">
              <HamperStatusBadge status={row.hamperStatus} />
            </dd>
          </div>
        </dl>
      </section>

      <div className="motion-safe:md-animate-fade-in-up flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/md"
          className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-amber-500 px-6 py-3 text-base font-bold text-white shadow-md hover:bg-amber-600 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-gray-900">
        {value || "N/A"}
      </dd>
    </div>
  );
}

function HamperStatusBadge({ status }: { status: "unassigned" | "assigned" | "redeemed" | null }) {
  const styles: Record<string, string> = {
    unassigned: "bg-gray-100 text-gray-700",
    assigned: "bg-amber-100 text-amber-800",
    redeemed: "bg-green-100 text-green-800",
  };
  const label = status ?? "unassigned";
  return (
    <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-medium ${styles[label] ?? styles.unassigned}`}>
      {label}
    </span>
  );
}

function GreenCheck() {
  return (
    <div className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-green-500 text-white shadow-md">
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
}

function RedX() {
  return (
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-md">
      <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </div>
  );
}