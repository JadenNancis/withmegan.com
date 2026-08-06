import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin-nav";
import { SearchBar } from "@/components/search-bar";
import { getDashboardStats, getRecentRegistrations, searchRegistrants } from "@/lib/md-queries";
import { cn } from "@/lib/cn";
import { SunsetWaveDivider } from "@/components/md-illustrations";

const statusBadge: Record<string, string> = {
  unassigned: "bg-gray-100 text-gray-700",
  assigned: "bg-amber-100 text-amber-800",
  redeemed: "bg-green-100 text-green-800",
};

export default async function MdAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireAdmin("/md/admin");
  void user;

  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const [stats, recent, searchResults] = await Promise.all([
    getDashboardStats(),
    getRecentRegistrations(15),
    q ? searchRegistrants(q, 50) : Promise.resolve(null),
  ]);

  const rows = searchResults ?? recent;

  return (
    <div className="space-y-6">
      <AdminNav current="/md/admin" />

      <SunsetWaveDivider className="w-full h-[20px] block opacity-60 -mt-2" />

      <h1 className="text-2xl font-bold text-gray-900 md-animate-fade-in-up">Admin Dashboard</h1>

      <section className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Registrations" value={stats.totalRegistrations} accent />
        <StatCard label="Households" value={stats.totalHouseholds} />
        <StatCard label="Assigned" value={stats.householdsAssigned} accent />
        <StatCard label="Redeemed" value={stats.householdsRedeemed} />
        <StatCard label="Pending" value={stats.householdsPending} />
      </section>

      <section className="flex flex-col sm:flex-row gap-3">
        <Link href="/md/admin/households" className="min-h-[44px] flex items-center justify-center rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-100 text-center transition-colors">
          Household management
        </Link>
        <Link href="/md/admin/verify" className="md-animate-pulse-warm min-h-[44px] flex items-center justify-center rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 text-center transition-colors">
          Verification counter
        </Link>
        <Link href="/md/admin/reports" className="min-h-[44px] flex items-center justify-center rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-100 text-center transition-colors">
          Reports
        </Link>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 break-words">
          {q ? `Search results for "${q}"` : "Recent registrations"}
        </h2>
        <Suspense fallback={<div className="text-sm text-gray-400">Loading search…</div>}>
          <SearchBar placeholder="Search by name, Application ID, phone, or household reference" />
        </Suspense>

        {rows.length === 0 ? (
          <p className="text-sm text-gray-500">
            {q ? "No matching records found." : "No registrations yet."}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-amber-200">
            <table className="min-w-full divide-y divide-amber-100 text-sm">
              <thead className="bg-gradient-to-r from-amber-50 to-orange-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-amber-800">Application ID</th>
                  <th className="px-3 py-2 text-left font-semibold text-amber-800">Name</th>
                  <th className="px-3 py-2 text-left font-semibold text-amber-800">Household</th>
                  <th className="px-3 py-2 text-left font-semibold text-amber-800">Status</th>
                  <th className="px-3 py-2 text-left font-semibold text-amber-800">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50 bg-white">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="px-3 py-2 font-mono text-xs text-gray-700">{r.thaId ?? "—"}</td>
                    <td className="px-3 py-2 text-gray-900">{r.fullName}</td>
                    <td className="px-3 py-2 text-gray-600">{r.householdReference ?? "—"}</td>
                    <td className="px-3 py-2">
                      <span className={cn("inline-block rounded-full px-2 py-0.5 text-xs font-medium", statusBadge[r.hamperStatus ?? "unassigned"])}>
                        {r.hamperStatus ?? "unassigned"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-500">
                      {new Date(r.createdAt).toLocaleDateString("en-TT")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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