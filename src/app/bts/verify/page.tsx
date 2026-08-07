import { Suspense } from "react";
import Link from "next/link";
import { db } from "@/db/client";
import {
  btsGuardians,
  btsDependents,
  btsResourceAssignments,
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function BtsVerifyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const aid = typeof sp.aid === "string" ? sp.aid.trim() : "";

  return (
    <div className="space-y-5 py-2">
      <header className="text-center">
        <h1 className="text-title text-brand-900">Verify a Registration</h1>
        <p className="mt-1 text-sm text-brand-700">
          Back to School with Megan · show this at the distribution counter.
        </p>
      </header>

      <Suspense
        fallback={
          <div className="rounded-2xl border border-brand-100 bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
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
    <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
      <RedX />
      <h2 className="mt-4 text-lg font-bold text-red-800">No Application ID provided</h2>
      <p className="mt-2 text-sm text-red-700">
        This link needs an <code className="font-mono">?aid=</code> parameter. Scan your
        registration QR code, or{" "}
        <Link href="/bts/recover" className="font-semibold underline">
          recover your ID
        </Link>
        .
      </p>
    </section>
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
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
        <RedX />
        <h2 className="mt-4 text-lg font-bold text-red-800">Registration not found</h2>
        <p className="mt-2 text-sm text-red-700">
          Nothing matches <code className="font-mono font-semibold">{aid}</code>. Double-check
          the ID, or{" "}
          <Link href="/bts/recover" className="font-semibold underline">
            recover by phone number
          </Link>
          .
        </p>
      </section>
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
      {/* Collected banner — the volunteer glance test */}
      {collected && (
        <div className="rounded-2xl bg-green-600 p-5 text-center shadow-md">
          <p className="text-lg font-bold text-white sm:text-xl">
            ✓ Resources collected
          </p>
          <p className="mt-1 text-sm text-green-100">All assignments on this ID are collected.</p>
        </div>
      )}

      <section className="bts-card-enter rounded-2xl border border-green-200 bg-green-50/60 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <GreenCheck />
          <div>
            <h2 className="text-base font-bold text-green-800">Registration verified</h2>
            <p className="text-sm text-green-700">Valid Back to School registration.</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50/50 p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
          Application ID
        </p>
        <p className="mt-1.5 break-all font-mono text-2xl font-bold tracking-wider text-brand-900">
          {guardian.thaId ?? aid}
        </p>
      </section>

      <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm">
        <h3 className="border-b border-brand-100 pb-3 text-base font-bold text-brand-900">
          Guardian
        </h3>
        <dl className="mt-3 space-y-3">
          <Detail label="Full name" value={guardian.fullName} />
          <Detail label="Community" value={guardian.address} />
          <Detail label="Contact" value={guardian.contactNumber} />
          {guardian.email && <Detail label="Email" value={guardian.email} />}
        </dl>
      </section>

      <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm">
        <h3 className="border-b border-brand-100 pb-3 text-base font-bold text-brand-900">
          Students ({dependents.length})
        </h3>
        {dependents.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">None on file.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {dependents.map((d, i) => (
              <li
                key={d.id}
                className="rounded-lg border border-brand-100 bg-brand-50/40 p-3"
              >
                <p className="text-sm font-bold text-brand-900">
                  {i + 1}. {d.studentName}
                </p>
                <p className="mt-0.5 text-xs text-gray-600">
                  {d.schoolName} · {d.gradeLevel}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
      <dt className="w-28 shrink-0 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </dt>
      <dd className="text-sm font-medium text-gray-900">{value}</dd>
    </div>
  );
}

function GreenCheck() {
  return (
    <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-green-500 text-white shadow-sm">
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
}

function RedX() {
  return (
    <div className="mx-auto flex h-14 w-14 w-fit items-center justify-center rounded-full bg-red-500 text-white shadow-md">
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </div>
  );
}
