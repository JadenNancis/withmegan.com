import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import {
  getGuardianByApplicationId,
  getGuardianWithDependents,
  searchGuardiansForCollection,
} from "@/lib/bts-queries";
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
  const id = typeof sp.id === "string" ? sp.id.trim() : "";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  // Direct hit (Application ID or uuid from a result card) opens the family.
  const guardian = aid
    ? await getGuardianByApplicationId(aid)
    : id
      ? await getGuardianWithDependents(id)
      : null;
  // Otherwise the query is a search: list every matching family.
  const results = !guardian && q ? await searchGuardiansForCollection(q) : [];

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
            Search any field to find a family, view each child&rsquo;s book list, and mark resources collected.
          </p>
        </div>
      </div>

      {/* Lookup */}
      <div className="bts-fade-in-up rounded-2xl border border-cyan-100 bg-white/90 backdrop-blur-sm p-5 shadow-sm">
        <CollectionLookup initial={aid || q} />
      </div>

      {!q && !aid && !id && (
        <p className="bts-fade-in-up text-sm text-white/90 [text-shadow:0_2px_6px_rgba(0,0,0,0.7)]">
          Tip: use the{" "}
          <Link href="/bts/admin/scan" className="font-semibold text-cyan-200 underline">
            Scan
          </Link>{" "}
          page to read a family&rsquo;s QR code and jump straight here.
        </p>
      )}

      {/* Search results */}
      {!guardian && q && (
        <div className="space-y-3">
          {results.length > 0 ? (
            <>
              <p className="bts-fade-in-up text-sm font-semibold text-white/95 [text-shadow:0_2px_6px_rgba(0,0,0,0.7)]">
                {results.length} matching famil{results.length === 1 ? "y" : "ies"}
              </p>
              {results.map((g, i) => (
                <Link
                  key={g.id}
                  href={`/bts/admin/collection?id=${encodeURIComponent(g.id)}&q=${encodeURIComponent(q)}`}
                  className={`bts-fade-in-up bts-stagger-${Math.min(i + 1, 6)} block rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{g.fullName}</h3>
                      <p className="mt-0.5 font-mono text-xs font-medium text-cyan-700 truncate">
                        {g.thaId ?? "No Application ID"}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-cyan-600">Collect &rarr;</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
                    <span>📍 {g.address}</span>
                    <span>📞 {g.contactNumber}</span>
                    <span>
                      {g.dependentCount} {g.dependentCount === 1 ? "child/student" : "children/students"}
                    </span>
                  </div>
                </Link>
              ))}
            </>
          ) : (
            <div className="bts-fade-in-up rounded-2xl border border-dashed border-brand-400/50 bg-brand-950/60 backdrop-blur-md p-10 text-center shadow-xl">
              <h2 className="text-lg font-bold text-white">No registrations found</h2>
              <p className="mt-1 text-sm text-brand-100/85">
                Nothing matches <span className="font-mono font-semibold">&ldquo;{q}&rdquo;</span>. Try a
                name, phone number, email, address, or Application ID.
              </p>
            </div>
          )}
        </div>
      )}

      {q && aid && !guardian && (
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
          {q && (
            <Link
              href={`/bts/admin/collection?q=${encodeURIComponent(q)}`}
              className="bts-fade-in-up inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white/90 backdrop-blur-sm hover:bg-white/20 hover:text-white transition-colors"
            >
              &larr; Back to results
            </Link>
          )}

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
