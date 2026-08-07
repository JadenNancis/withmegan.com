import { Suspense } from "react";
import Link from "next/link";
import { db } from "@/db/client";
import {
  btsGuardians,
  btsDependents,
  btsResourceAssignments,
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { WaveDivider } from "@/components/bts-illustrations";

export const dynamic = "force-dynamic";

/**
 * Public BTS verify page — reached by scanning the QR code on a
 * registration confirmation. No auth required: possession of the
 * Application ID (which contains a cryptographically-random suffix) is
 * the trust token.
 *
 * Looks up the guardian by thaId and renders a read-only view of the
 * registration. Shows a green checkmark when found, red X when not.
 */
export default async function BtsVerifyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const aid = typeof sp.aid === "string" ? sp.aid.trim() : "";

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-700 to-cyan-500 p-6 shadow-lg">
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Registration Verification
          </h1>
          <p className="mt-2 text-sm text-cyan-50">
            Back to School with Megan &mdash; scan-to-verify. Present this screen at the
            distribution counter on event day.
          </p>
        </div>
        <WaveDivider className="w-full h-[24px] block opacity-70 -mb-6" />
      </div>

      <Suspense
        fallback={
          <div className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-sm text-sm text-gray-500">
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
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
      <RedX />
      <h2 className="mt-4 text-lg font-bold text-red-800">No Application ID provided</h2>
      <p className="mt-2 text-sm text-red-700">
        This link is missing the <code className="font-mono">?aid=</code> parameter. Scan the
        QR code on your registration confirmation to view your details.
      </p>
      <Link
        href="/bts"
        className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-cyan-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-cyan-700 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}

async function VerifyResult({ aid }: { aid: string }) {
  const [guardian] = await db
    .select()
    .from(btsGuardians)
    .where(eq(btsGuardians.thaId, aid))
    .limit(1);

  if (!guardian) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
        <RedX />
        <h2 className="mt-4 text-lg font-bold text-red-800">Registration not found</h2>
        <p className="mt-2 text-sm text-red-700">
          No BTS registration matches Application ID{" "}
          <code className="font-mono font-semibold">{aid}</code>. Check the ID and try again,
          or ask a volunteer for help.
        </p>
        <Link
          href="/bts"
          className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const dependents = await db
    .select()
    .from(btsDependents)
    .where(eq(btsDependents.guardianId, guardian.id));

  const dependentIds = dependents.map((d) => d.id);
  const assignments =
    dependentIds.length > 0
      ? await db
          .select({ status: btsResourceAssignments.status })
          .from(btsResourceAssignments)
          .where(inArray(btsResourceAssignments.dependentId, dependentIds))
      : [];

  const collected =
    assignments.length > 0 && assignments.every((a) => a.status === "collected");

  return (
    <div className="space-y-4">
      {/* Found banner */}
      <div className="bts-fade-in-up rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-cyan-50 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <GreenCheck />
          <div>
            <h2 className="text-lg font-bold text-green-800">Registration verified</h2>
            <p className="text-sm text-green-700">
              This is a valid Back to School registration.
            </p>
          </div>
        </div>
      </div>

      {/* Application ID */}
      <div className="bts-fade-in-up rounded-2xl border-2 border-dashed border-cyan-300 bg-gradient-to-br from-cyan-50 to-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-600">
          Application ID
        </p>
        <p className="mt-1 break-all font-mono text-2xl font-bold tracking-wider text-cyan-900">
          {guardian.thaId ?? aid}
        </p>
        {collected && (
          <p className="mt-3 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
            ✓ Resources collected
          </p>
        )}
      </div>

      {/* Guardian details */}
      <section className="bts-fade-in-up rounded-2xl border border-cyan-100 bg-white p-6 shadow-sm">
        <h3 className="border-b border-cyan-100 pb-3 text-lg font-bold text-cyan-900">
          Guardian
        </h3>
        <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <Detail label="Full name" value={guardian.fullName} />
          <Detail label="Community" value={guardian.address} />
          <Detail label="Contact number" value={guardian.contactNumber} />
          <Detail label="Email" value={guardian.email} />
        </dl>
      </section>

      {/* Dependents */}
      <section className="bts-fade-in-up rounded-2xl border border-cyan-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-cyan-100 pb-3">
          <h3 className="text-lg font-bold text-cyan-900">
            Dependents ({dependents.length})
          </h3>
        </div>
        {dependents.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">No dependents on file.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {dependents.map((d, i) => (
              <li
                key={d.id}
                className="rounded-xl border border-gray-200 bg-gradient-to-br from-cyan-50/30 to-gray-50/30 p-4"
              >
                <p className="text-sm font-bold text-cyan-800">
                  {i + 1}. {d.studentName}
                </p>
                <dl className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2">
                  <Detail label="School" value={d.schoolName} compact />
                  <Detail label="Grade" value={d.gradeLevel} compact />
                </dl>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="bts-fade-in-up flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/bts"
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-cyan-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-cyan-700 transition-colors"
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
  compact = false,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div>
      <dt className={compact ? "text-xs text-gray-500" : "text-xs font-semibold uppercase tracking-wide text-gray-500"}>
        {label}
      </dt>
      <dd className={compact ? "text-sm text-gray-900" : "mt-0.5 text-sm font-medium text-gray-900"}>
        {value || "—"}
      </dd>
    </div>
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