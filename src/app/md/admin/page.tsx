import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin-nav";
import { SearchBar } from "@/components/search-bar";
import {
  getDashboardStats,
  getRecentRegistrations,
  searchRegistrants,
  getDeletedRegistrants,
  countDeletedRegistrants,
} from "@/lib/md-queries";
import { ClickableTableRow } from "@/components/clickable-table-row";
import { DeletedRowActions } from "@/components/registrant-actions";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

const statusBadge: Record<string, string> = {
  registered: "bg-gray-100 text-gray-700",
  redeemed: "bg-green-100 text-green-800",
};

export default async function MdAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireAdmin("/md/admin");
  const isAdmin = user.role === "admin";

  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const tab = sp.tab === "deleted" ? "deleted" : "active";

  const [stats, recent, searchResults, deleted, deletedCount] = await Promise.all([
    getDashboardStats(),
    getRecentRegistrations(15),
    q ? searchRegistrants(q, 50) : Promise.resolve(null),
    tab === "deleted" ? getDeletedRegistrants() : Promise.resolve([]),
    countDeletedRegistrants(),
  ]);

  const rows = searchResults ?? recent;

  return (
    <div className="space-y-6">
      <AdminNav current="/md/admin" />

      <div className="px-5 py-4 md-animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">
          {tab === "deleted" ? "Deleted Registrations" : "Admin Dashboard"}
        </h1>
      </div>

      {tab === "active" && (
        <section className="grid grid-cols-3 gap-2 sm:gap-3">
          <StatCard label="Registrations" value={stats.totalRegistrations} accent />
          <StatCard label="Collected" value={stats.totalRedeemed} />
          <StatCard label="Pending" value={stats.pending} />
        </section>
      )}

      {tab === "active" && (
        <section className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Link href="/md/admin/verify" className="md-animate-pulse-warm min-h-[48px] flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 active:scale-95 text-center transition-all">
            Check-in counter
          </Link>
          <Link href="/md/admin/reports" className="min-h-[48px] flex items-center justify-center rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-100 active:scale-95 text-center transition-all">
            Reports
          </Link>
          {tab === "active" && (
            <Link
              href="/md/admin?tab=deleted"
              className="inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white/80 backdrop-blur-sm hover:bg-white/20 hover:text-white transition-colors"
              title="Review soft-deleted registrations"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              </svg>
              Deleted{deletedCount > 0 ? ` (${deletedCount})` : ""}
            </Link>
          )}
        </section>
      )}

      {tab === "deleted" && (
        <Link
          href="/md/admin"
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-800 hover:bg-amber-100 active:scale-95 transition-all"
        >
          &larr; Back to active
        </Link>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white drop-shadow-md break-words">
          {tab === "deleted"
            ? "Soft-deleted registrations"
            : q
              ? `Search results for "${q}"`
              : "Recent registrations"}
        </h2>
        {tab === "active" && (
          <Suspense fallback={<div className="text-sm text-white/90 [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]">Loading search…</div>}>
            <SearchBar placeholder="Search by name, ID, or phone…" />
          </Suspense>
        )}

        {tab === "deleted" ? (
          deleted.length === 0 ? (
            <p className="text-sm text-amber-100/85 [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]">
              Nothing deleted yet.
            </p>
          ) : (
            <>
              {/* Mobile: card list */}
              <div className="sm:hidden space-y-3">
                {deleted.map((r) => (
                  <div key={r.id} className="rounded-xl border border-red-200/50 bg-red-50/40 backdrop-blur-sm p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 truncate">{r.fullName}</p>
                        <p className="text-xs font-mono text-gray-600 mt-0.5 truncate">{r.thaId ?? "N/A"}</p>
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                      {new Date(r.createdAt).toLocaleDateString("en-TT")}
                    </div>
                    <div className="mt-3 border-t border-red-100 pt-3">
                      <DeletedRowActions site="md" id={r.id} isAdmin={isAdmin} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden sm:block overflow-x-auto rounded-lg border border-amber-200">
                <table className="min-w-full divide-y divide-amber-100 text-sm">
                  <thead className="bg-gradient-to-r from-amber-50 to-orange-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-amber-800">Application ID</th>
                      <th className="px-3 py-2 text-left font-semibold text-amber-800">Name</th>
                      <th className="px-3 py-2 text-left font-semibold text-amber-800">Phone</th>
                      <th className="px-3 py-2 text-left font-semibold text-amber-800">Community</th>
                      <th className="px-3 py-2 text-left font-semibold text-amber-800">Registered</th>
                      <th className="px-3 py-2 text-left font-semibold text-amber-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-50 bg-white">
                    {deleted.map((r) => (
                      <tr key={r.id} className="bg-red-50/30 hover:bg-red-50/60 transition-colors">
                        <td className="px-3 py-2 font-mono text-xs text-gray-700">{r.thaId ?? "N/A"}</td>
                        <td className="px-3 py-2 text-gray-900">{r.fullName}</td>
                        <td className="px-3 py-2 text-gray-700">{r.phoneNumber}</td>
                        <td className="px-3 py-2 text-gray-700">{r.address}</td>
                        <td className="px-3 py-2 text-gray-500">
                          {new Date(r.createdAt).toLocaleDateString("en-TT")}
                        </td>
                        <td className="px-3 py-2">
                          <DeletedRowActions site="md" id={r.id} isAdmin={isAdmin} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )
        ) : rows.length === 0 ? (
          <p className="text-sm text-amber-100/85 [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]">
            {q ? "No matching records found." : "No registrations yet."}
          </p>
        ) : (
          <>
            {/* Mobile: card list */}
            <div className="sm:hidden space-y-3">
              {rows.map((r) => (
                <Link
                  key={r.id}
                  href={`/md/admin/${r.id}`}
                  className="block rounded-xl border border-amber-200/40 bg-white/95 backdrop-blur-sm p-4 shadow-sm active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">{r.fullName}</p>
                      <p className="text-xs font-mono text-gray-600 mt-0.5 truncate">{r.thaId ?? "N/A"}</p>
                    </div>
                    <span className={cn("shrink-0 inline-block rounded-full px-2.5 py-1 text-xs font-medium", statusBadge[r.status])}>
                      {r.status}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
                    {new Date(r.createdAt).toLocaleDateString("en-TT")}
                  </div>
                  <p className="mt-1.5 text-xs font-semibold text-amber-700">View details &rarr;</p>
                </Link>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block overflow-x-auto rounded-lg border border-amber-200">
              <table className="min-w-full divide-y divide-amber-100 text-sm">
                <thead className="bg-gradient-to-r from-amber-50 to-orange-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-amber-800">Application ID</th>
                    <th className="px-3 py-2 text-left font-semibold text-amber-800">Name</th>
                    <th className="px-3 py-2 text-left font-semibold text-amber-800">Status</th>
                    <th className="px-3 py-2 text-left font-semibold text-amber-800">Registered</th>
                    <th className="px-3 py-2 text-left font-semibold text-amber-800">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-50 bg-white">
                  {rows.map((r) => (
                    <ClickableTableRow
                      key={r.id}
                      href={`/md/admin/${r.id}`}
                      label={`View application ${r.thaId ?? r.fullName}`}
                      className="hover:bg-amber-50/50"
                    >
                      <td className="px-3 py-2 font-mono text-xs text-gray-700">{r.thaId ?? "N/A"}</td>
                      <td className="px-3 py-2 text-gray-900">{r.fullName}</td>
                      <td className="px-3 py-2">
                        <span className={cn("inline-block rounded-full px-2 py-0.5 text-xs font-medium", statusBadge[r.status])}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-500">
                        {new Date(r.createdAt).toLocaleDateString("en-TT")}
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center font-bold text-amber-600">
                          Details &rarr;
                        </span>
                      </td>
                    </ClickableTableRow>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={cn(
      "rounded-xl border p-4 md-animate-glow",
      accent ? "border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50" : "border-gray-200 bg-white"
    )}>
      <p className={cn("text-2xl font-bold", accent ? "text-amber-700" : "text-gray-900")}>{value}</p>
      <p className="mt-0.5 text-xs text-gray-500">{label}</p>
    </div>
  );
}
