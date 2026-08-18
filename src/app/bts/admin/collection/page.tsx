import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import { getGuardianByApplicationId } from "@/lib/bts-queries";
import { AdminNav } from "@/components/admin-nav";
import { BookListViewer } from "../[guardianId]/book-list-viewer";
import { CollectionActions } from "./collection-actions";
import { CollectionLookup } from "./collection-lookup";
import { SchoolBookIcon } from "@/components/bts-illustrations";

export const dynamic = "force-dynamic";

export default async function BtsAdminCollectionPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin("/bts/admin/collection");

  const sp = await searchParams;
  const aid = typeof sp.aid === "string" ? sp.aid.trim() : "";
  const guardian = aid ? await getGuardianByApplicationId(aid) : null;

  const dependents = guardian?.dependents ?? [];
  const allCollected =
    guardian != null &&
    dependents.length > 0 &&
    dependents.every((d) => d.assignments.length > 0 && d.assignments.every((a) => a.status === "collected"));

  return (
    <div className="space-y-6">
      <AdminNav current="/bts/admin/collection" site="bts" />

      {/* Header */}
      <div className="bts-fade-in-up flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-cyan-50 shadow-sm shrink-0">
          <SchoolBookIcon className="h-8 w-8" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">Collection Counter</h1>
          <p className="mt-0.5 text-sm text-brand-100/90 [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]">
            Look up a family at the counter, view each child&rsquo;s book list, and mark resources collected.
          </p>
        </div>
      </div>

      {/* Lookup */}
      <div className="bts-fade-in-up rounded-2xl border border-cyan-100 bg-white/90 backdrop-blur-sm p-5 shadow-sm">
        <CollectionLookup initial={aid} />
      </div>

      {!aid && (
        <p className="bts-fade-in-up text-sm text-white/70 [text-shadow:0_2px_6px_rgba(0,0,0,0.7)]">
          Tip: use the{" "}
          <Link href="/bts/admin/scan" className="font-semibold text-cyan-200 underline">
            Scan
          </Link>{" "}
          page to read a family&rsquo;s QR code and jump straight here.
        </p>
      )}

      {aid && !guardian && (
        <div className="bts-fade-in-up rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <h2 className="text-lg font-bold text-red-800">Registration not found</h2>
          <p className="mt-1 text-sm text-red-700">
            Nothing matches <code className="font-mono font-semibold">{aid}</code>. Check the
            Application ID and try again.
          </p>
        </div>
      )}

      {guardian && (
        <>
          {allCollected && (
            <div className="bts-fade-in-up rounded-2xl bg-green-600 p-5 text-center shadow-md">
              <p className="text-lg font-bold text-white sm:text-xl">✓ All resources collected</p>
              <p className="mt-1 text-sm text-green-100">
                Every child on this Application ID has received their books and supplies.
              </p>
            </div>
          )}

          {/* Guardian summary */}
          <section className="bts-fade-in-up rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-900 truncate">{guardian.fullName}</h2>
                <p className="mt-1 font-mono text-sm font-medium text-cyan-700 break-all">
                  {guardian.thaId ?? aid}
                </p>
              </div>
              <div className="text-sm text-gray-600 space-y-0.5">
                <p>📍 {guardian.address}</p>
                <p>📞 {guardian.contactNumber}</p>
                {guardian.email && <p>✉️ {guardian.email}</p>}
              </div>
            </div>
          </section>

          {/* Dependents with book lists */}
          <section className="space-y-4">
            <h2 className="bts-fade-in-up text-lg font-semibold text-white drop-shadow-md">
              Children/Students ({dependents.length})
            </h2>
            {dependents.map((dep) => (
              <div
                key={dep.id}
                className="bts-fade-in-up rounded-xl border border-cyan-100 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900">{dep.studentName}</h3>
                    <p className="text-sm text-gray-600">
                      {dep.schoolName} · {dep.gradeLevel}
                    </p>
                  </div>
                  {dep.bookListUrl && (
                    <span className="inline-flex shrink-0 items-center rounded-md bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700 ring-1 ring-inset ring-cyan-200">
                      {dep.bookListUrl.toLowerCase().endsWith(".pdf") ? "PDF" : "DOC"}
                    </span>
                  )}
                </div>

                {dep.bookListUrl && (
                  <div className="mt-4">
                    <BookListViewer bookListUrl={dep.bookListUrl} studentName={dep.studentName} />
                  </div>
                )}

                <div className="mt-4">
                  <CollectionActions
                    dependentId={dep.id}
                    studentName={dep.studentName}
                    assignments={dep.assignments}
                  />
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
