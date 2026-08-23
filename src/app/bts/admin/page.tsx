import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin-nav";
import { getAllGuardians, getDeletedGuardians, countDeletedGuardians } from "@/lib/bts-queries";
import { ClickableTableRow } from "@/components/clickable-table-row";
import { DeletedRowActions } from "@/components/registrant-actions";
import { SchoolBookIcon } from "@/components/bts-illustrations";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

export default async function BtsAdminDashboard({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireAdmin("/bts/admin");
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const tab = params.tab === "deleted" ? "deleted" : "active";
  const isAdmin = user.role === "admin";

  const guardians = tab === "deleted" ? await getDeletedGuardians(search) : await getAllGuardians(search);
  const deletedCount = await countDeletedGuardians();

  // Compute summary stats
  const totalDependents = guardians.reduce((sum, g) => sum + g.dependents.length, 0);

  return (
    <div className="space-y-6">
      <AdminNav current="/bts/admin" site="bts" />

      {/* Header */}
      <div className="bts-fade-in-up bts-stagger-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-cyan-50 shadow-sm shrink-0">
            <SchoolBookIcon className="h-8 w-8" />
          </div>
          <div className="min-w-0 px-5 py-4">
            <h1 className="text-xl sm:text-2xl font-bold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.55)] truncate">
              {tab === "deleted" ? "Deleted Registrations" : "Admin Dashboard"}
            </h1>
            <p className="mt-0.5 text-sm text-brand-100/90 [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]">
              {tab === "deleted"
                ? `${guardians.length} soft-deleted registration${guardians.length === 1 ? "" : "s"}`
                : `${guardians.length} registration${guardians.length === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {tab === "deleted" ? (
            <Link
              href="/bts/admin"
              className="inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 py-2.5 text-sm font-bold text-cyan-700 shadow-sm hover:bg-cyan-50 active:scale-95 transition-all min-h-[44px]"
            >
              &larr; Back to active
            </Link>
          ) : (
            <>
              <Link
                href="/bts/admin/inventory"
                className="inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 py-2.5 text-sm font-bold text-cyan-700 shadow-sm hover:bg-cyan-50 active:scale-95 transition-all min-h-[44px]"
              >
                Inventory &rarr;
              </Link>
              <Link
                href="/bts/admin/reports"
                className="inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 py-2.5 text-sm font-bold text-cyan-700 shadow-sm hover:bg-cyan-50 active:scale-95 transition-all min-h-[44px]"
              >
                Reports &rarr;
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Stats summary cards */}
      {tab === "active" && (
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          <div className="bts-card-enter bts-count-up bts-stagger-2 rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600">Total Registrations</p>
            <p className="mt-2 text-4xl font-bold text-cyan-900">{guardians.length}</p>
            <p className="mt-1 text-xs text-gray-500">Guardian families registered</p>
          </div>
          <div className="bts-card-enter bts-count-up bts-stagger-3 rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600">Total Dependents</p>
            <p className="mt-2 text-4xl font-bold text-cyan-900">{totalDependents}</p>
            <p className="mt-1 text-xs text-gray-500">Children/Students awaiting resources</p>
          </div>
        </div>
      )}

      {/* Search bar + hidden deleted toggle */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <form method="get" className="bts-fade-in-up bts-stagger-3 flex flex-col gap-2 sm:flex-row flex-1">
          <input
            name="search"
            defaultValue={search ?? ""}
            placeholder="Search by name, email, or Application ID…"
            className="flex-1 rounded-xl border border-white/30 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 shadow-md focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-shadow min-h-[48px]"
          />
          <button
            type="submit"
            className="rounded-xl bg-cyan-600 px-5 py-3 text-base font-bold text-white shadow-md hover:bg-cyan-700 active:scale-95 transition-all min-h-[48px] sm:w-auto"
          >
            Search
          </button>
        </form>
        {tab === "active" && (
          <Link
            href="/bts/admin?tab=deleted"
            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white/80 backdrop-blur-sm hover:bg-white/20 hover:text-white transition-colors min-h-[40px]"
            title="Review soft-deleted registrations"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
            Deleted{deletedCount > 0 ? ` (${deletedCount})` : ""}
          </Link>
        )}
      </div>

      {/* Registrations — cards on mobile, table on desktop */}
      {guardians.length === 0 ? (
        <div className="bts-fade-in-up bts-stagger-4 rounded-2xl border border-dashed border-brand-400/50 bg-brand-950/60 backdrop-blur-md p-12 text-center shadow-xl">
          <div className="mx-auto mb-4 opacity-50">
            <SchoolBookIcon className="h-16 w-16 text-brand-300" />
          </div>
          <p className="text-sm font-medium text-brand-100/85">
            {tab === "deleted"
              ? search
                ? "No deleted registrations match your search."
                : "Nothing deleted yet."
              : search
                ? "No registrations match your search."
                : "No registrations yet."}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="sm:hidden space-y-3">
            {guardians.map((g, i) => (
              <div
                key={g.id}
                className={cn(
                  "block rounded-xl border bg-white p-4 shadow-sm",
                  tab === "deleted" ? "border-red-200 bg-red-50/40" : "border-gray-200",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate">{g.fullName}</p>
                    <p className="text-xs font-mono text-cyan-700 mt-0.5 truncate">{g.thaId ?? "N/A"}</p>
                  </div>
                  {tab === "active" && (
                    <Link
                      href={`/bts/admin/${g.id}`}
                      className="shrink-0 text-cyan-600 font-bold text-sm"
                    >
                      Details &rarr;
                    </Link>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                  <span>{g.dependents.length} {g.dependents.length === 1 ? "child/student" : "children/students"}</span>
                  <span>&middot;</span>
                  <span className="truncate">{g.contactNumber}</span>
                </div>
                {tab === "deleted" && (
                  <div className="mt-3 border-t border-red-100 pt-3">
                    <DeletedRowActions site="bts" id={g.id} isAdmin={isAdmin} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block bts-fade-in-up bts-stagger-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-cyan-50 to-cyan-50/50">
                  <tr>
                    <Th>Application ID</Th>
                    <Th>Guardian</Th>
                    <Th>National ID</Th>
                    <Th>Contact</Th>
                    <Th>Dependents</Th>
                    <Th>Registered</Th>
                    {tab === "deleted" ? <Th>Actions</Th> : <Th>View</Th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {guardians.map((g, i) =>
                    tab === "deleted" ? (
                      <tr key={g.id} className="bg-red-50/30 hover:bg-red-50/60 transition-colors">
                        <td className="px-4 py-3 text-sm font-mono font-medium text-cyan-700">
                          {g.thaId ?? "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="font-medium text-gray-900">{g.fullName}</div>
                          <div className="text-xs text-gray-500">{g.email ?? "No email"}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">{g.nationalId ?? "N/A"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{g.contactNumber}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {g.dependents.length} {g.dependents.length === 1 ? "child/student" : "children/students"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {g.createdAt.toLocaleDateString("en-TT", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <DeletedRowActions site="bts" id={g.id} isAdmin={isAdmin} />
                        </td>
                      </tr>
                    ) : (
                      <ClickableTableRow
                        key={g.id}
                        href={`/bts/admin/${g.id}`}
                        label={`View application ${g.thaId ?? g.fullName}`}
                        className={`hover:bg-cyan-50/40 bts-fade-in-up bts-stagger-${Math.min(i + 1, 7)}`}
                      >
                        <td className="px-4 py-3 text-sm font-mono font-medium text-cyan-700">
                          {g.thaId ?? "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="font-medium text-gray-900">{g.fullName}</div>
                          <div className="text-xs text-gray-500">{g.email ?? "No email"}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">{g.nationalId ?? "N/A"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{g.contactNumber}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {g.dependents.length} {g.dependents.length === 1 ? "child/student" : "children/students"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {g.createdAt.toLocaleDateString("en-TT", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-flex items-center font-bold text-cyan-600">
                            Details &rarr;
                          </span>
                        </td>
                      </ClickableTableRow>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-cyan-700">
      {children}
    </th>
  );
}