import { Suspense } from "react";
import { requireAdmin } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin-nav";
import { SearchBar } from "@/components/search-bar";
import { cn } from "@/lib/cn";
import { db } from "@/db/client";
import { mdRegistrants, mdHouseholds } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { SunsetWaveDivider } from "@/components/md-illustrations";

export const runtime = "nodejs";

const statusBadge: Record<string, string> = {
  unassigned: "bg-gray-100 text-gray-700",
  assigned: "bg-amber-100 text-amber-800",
  redeemed: "bg-green-100 text-green-800",
};

export default async function MdAdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireAdmin("/md/admin/reports");
  void user;

  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const [regCount] = await db.select({ n: count() }).from(mdRegistrants);
  const [hhCount] = await db.select({ n: count() }).from(mdHouseholds);
  const [assigned] = await db
    .select({ n: count() })
    .from(mdHouseholds)
    .where(eq(mdHouseholds.hamperStatus, "assigned"));
  const [unassigned] = await db
    .select({ n: count() })
    .from(mdHouseholds)
    .where(eq(mdHouseholds.hamperStatus, "unassigned"));
  const [redeemed] = await db
    .select({ n: count() })
    .from(mdHouseholds)
    .where(eq(mdHouseholds.hamperStatus, "redeemed"));

  const totalHh = hhCount?.n ?? 0;
  const redeemedN = redeemed?.n ?? 0;

  const rows = await db
    .select({
      id: mdRegistrants.id,
      thaId: mdRegistrants.thaId,
      fullName: mdRegistrants.fullName,
      nationalId: mdRegistrants.nationalId,
      phoneNumber: mdRegistrants.phoneNumber,
      address: mdRegistrants.address,
      householdReference: mdHouseholds.reference,
      hamperStatus: mdHouseholds.hamperStatus,
      redeemedAt: mdHouseholds.redeemedAt,
      createdAt: mdRegistrants.createdAt,
    })
    .from(mdRegistrants)
    .leftJoin(mdHouseholds, eq(mdRegistrants.householdId, mdHouseholds.id))
    .orderBy(mdRegistrants.createdAt)
    .limit(500);

  const filtered = q
    ? rows.filter(
        (r) =>
          r.fullName.toLowerCase().includes(q.toLowerCase()) ||
          (r.thaId ?? "").toLowerCase().includes(q.toLowerCase()) ||
          (r.nationalId ?? "").toLowerCase().includes(q.toLowerCase()) ||
          (r.householdReference ?? "").toLowerCase().includes(q.toLowerCase()),
      )
    : rows;

  const pendingHh = totalHh - redeemedN;
  const redemptionRate = totalHh > 0 ? Math.round((redeemedN / totalHh) * 100) : 0;

  return (
    <div className="space-y-6">
      <AdminNav current="/md/admin/reports" />
      <SunsetWaveDivider className="w-full h-[20px] block opacity-60 -mt-2" />
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 md-animate-fade-in-up">Reports</h1>
        <a
          href="/api/export?site=md&format=pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-700"
        >
          Export PDF
        </a>
      </div>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ReportCard label="Individual registrations" value={regCount?.n ?? 0} />
        <ReportCard label="Households assigned" value={assigned?.n ?? 0} accent />
        <ReportCard label="Households unassigned" value={unassigned?.n ?? 0} />
        <ReportCard label="Households redeemed" value={redeemedN} accent />
      </section>

      <section className="grid sm:grid-cols-2 gap-3">
        <div className="md-animate-fade-in-up md-delay-1 rounded-xl border border-amber-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-amber-700 font-medium">Redeemed vs pending</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {redeemedN} <span className="text-gray-400 text-xl">/</span> {pendingHh}
          </p>
          {totalHh > 0 && (
            <div className="mt-3 h-3 w-full rounded-full bg-amber-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-green-500 transition-all"
                style={{ width: `${redemptionRate}%` }}
              />
            </div>
          )}
          <p className="mt-2 text-xs text-gray-500">{redemptionRate}% redemption rate</p>
        </div>
        <div className="md-animate-fade-in-up md-delay-2 rounded-xl border border-amber-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-amber-700 font-medium">Total households</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{totalHh}</p>
          <p className="mt-2 text-xs text-gray-500">
            {regCount?.n ?? 0} registrations across {totalHh} households
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 md-animate-fade-in-up break-words">
          Registrations {q && `· filtered by "${q}"`}
        </h2>
        <Suspense fallback={<div className="text-sm text-gray-400">Loading search…</div>}>
          <SearchBar placeholder="Search by name, Application ID, national ID, or household" />
        </Suspense>

        {filtered.length === 0 ? (
          <p className="text-sm text-gray-500">
            {q ? "No matching records." : "No registrations yet."}
          </p>
        ) : (
          <div className="md-animate-fade-in-up md-delay-1 overflow-x-auto rounded-lg border border-amber-200 shadow-sm">
            <table className="min-w-full divide-y divide-amber-100 text-sm">
              <thead className="bg-gradient-to-r from-amber-50 to-orange-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-amber-800">Application ID</th>
                  <th className="px-3 py-2 text-left font-semibold text-amber-800">Name</th>
                  <th className="px-3 py-2 text-left font-semibold text-amber-800">National ID</th>
                  <th className="px-3 py-2 text-left font-semibold text-amber-800">Household</th>
                  <th className="px-3 py-2 text-left font-semibold text-amber-800">Status</th>
                  <th className="px-3 py-2 text-left font-semibold text-amber-800">Redeemed</th>
                  <th className="px-3 py-2 text-left font-semibold text-amber-800">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50 bg-white">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="px-3 py-2 font-mono text-xs text-gray-700">{r.thaId ?? "—"}</td>
                    <td className="px-3 py-2 text-gray-900">{r.fullName}</td>
                    <td className="px-3 py-2 text-gray-600">{r.nationalId ?? "—"}</td>
                    <td className="px-3 py-2 font-mono text-xs text-gray-600">{r.householdReference ?? "—"}</td>
                    <td className="px-3 py-2">
                      <span className={cn("inline-block rounded-full px-2 py-0.5 text-xs font-medium", statusBadge[r.hamperStatus ?? "unassigned"])}>
                        {r.hamperStatus ?? "unassigned"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500">
                      {r.redeemedAt ? new Date(r.redeemedAt).toLocaleDateString("en-TT") : "—"}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500">
                      {new Date(r.createdAt).toLocaleDateString("en-TT")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-xs text-gray-400">
        Showing {filtered.length} of {regCount?.n ?? 0} registrations (max 500).
      </p>
    </div>
  );
}

function ReportCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
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