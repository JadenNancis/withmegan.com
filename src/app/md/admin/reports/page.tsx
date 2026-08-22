import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin-nav";
import { SearchBar } from "@/components/search-bar";
import { ClickableTableRow } from "@/components/clickable-table-row";
import { cn } from "@/lib/cn";
import { db } from "@/db/client";
import { mdRegistrants } from "@/db/schema";
import { count, isNotNull } from "drizzle-orm";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const statusBadge: Record<string, string> = {
  registered: "bg-gray-100 text-gray-700",
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

  const [regCount, redeemedCount] = await Promise.all([
    db.select({ n: count() }).from(mdRegistrants).then((rows) => rows[0]),
    db.select({ n: count() }).from(mdRegistrants).where(isNotNull(mdRegistrants.redeemedAt)).then((rows) => rows[0]),
  ]);

  const total = regCount?.n ?? 0;
  const redeemedN = redeemedCount?.n ?? 0;
  const pendingN = total - redeemedN;

  const rows = await db
    .select({
      id: mdRegistrants.id,
      thaId: mdRegistrants.thaId,
      fullName: mdRegistrants.fullName,
      nationalId: mdRegistrants.nationalId,
      phoneNumber: mdRegistrants.phoneNumber,
      address: mdRegistrants.address,
      redeemedAt: mdRegistrants.redeemedAt,
      createdAt: mdRegistrants.createdAt,
    })
    .from(mdRegistrants)
    .orderBy(mdRegistrants.createdAt)
    .limit(500);

  const filtered = q
    ? rows.filter(
        (r) =>
          r.fullName.toLowerCase().includes(q.toLowerCase()) ||
          (r.thaId ?? "").toLowerCase().includes(q.toLowerCase()) ||
          (r.nationalId ?? "").toLowerCase().includes(q.toLowerCase()) ||
          r.phoneNumber.toLowerCase().includes(q.toLowerCase()),
      )
    : rows;

  const redemptionRate = total > 0 ? Math.round((redeemedN / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <AdminNav current="/md/admin/reports" />
      <div className="flex items-center justify-between gap-4">
        <div className="px-5 py-4 md-animate-fade-in-up">
          <h1 className="text-2xl font-bold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">Reports</h1>
        </div>
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
        <ReportCard label="Individual registrations" value={total} />
        <ReportCard label="Hampers collected" value={redeemedN} accent />
        <ReportCard label="Pending collection" value={pendingN} />
        <ReportCard label="Redemption rate" value={redemptionRate} accent suffix="%" />
      </section>

      <section className="grid sm:grid-cols-2 gap-3">
        <div className="md-animate-fade-in-up md-delay-1 rounded-xl border border-amber-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-amber-700 font-medium">Collected vs pending</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {redeemedN} <span className="text-gray-400 text-xl">/</span> {pendingN}
          </p>
          {total > 0 && (
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
          <p className="text-sm text-amber-700 font-medium">Total registrations</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{total}</p>
          <p className="mt-2 text-xs text-gray-500">
            {redeemedN} hampers collected · {pendingN} still pending
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white drop-shadow-md md-animate-fade-in-up break-words">
          Registrations {q && `· filtered by "${q}"`}
        </h2>
        <Suspense fallback={<div className="text-sm text-white/90 [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]">Loading search…</div>}>
          <SearchBar placeholder="Search by name, ID, or phone…" />
        </Suspense>

        {filtered.length === 0 ? (
          <p className="text-sm text-amber-100/85 [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]">
            {q ? "No matching records." : "No registrations yet."}
          </p>
        ) : (
          <>
            {/* Mobile: card list */}
            <div className="sm:hidden space-y-3">
              {filtered.map((r) => (
                <Link
                  key={r.id}
                  href={`/md/admin/${r.id}`}
                  className="block rounded-xl border border-amber-200 bg-white p-4 shadow-sm active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">{r.fullName}</p>
                      <p className="text-xs font-mono text-gray-600 mt-0.5 truncate">{r.thaId ?? "N/A"}</p>
                    </div>
                    <span className={cn("shrink-0 inline-block rounded-full px-2.5 py-1 text-xs font-medium", statusBadge[r.redeemedAt ? "redeemed" : "registered"])}>
                      {r.redeemedAt ? "redeemed" : "registered"}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-gray-500">
                    <p>National ID: <span className="font-medium text-gray-700">{r.nationalId ?? "N/A"}</span></p>
                    <p>Collected: <span className="font-medium text-gray-700">{r.redeemedAt ? new Date(r.redeemedAt).toLocaleDateString("en-TT") : "N/A"}</span></p>
                    <p>Registered: <span className="font-medium text-gray-700">{new Date(r.createdAt).toLocaleDateString("en-TT")}</span></p>
                  </div>
                  <p className="mt-1.5 text-xs font-semibold text-amber-700">View details &rarr;</p>
                </Link>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block md-animate-fade-in-up md-delay-1 overflow-x-auto rounded-lg border border-amber-200 shadow-sm">
              <table className="min-w-full divide-y divide-amber-100 text-sm">
                <thead className="bg-gradient-to-r from-amber-50 to-orange-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-amber-800">Application ID</th>
                    <th className="px-3 py-2 text-left font-semibold text-amber-800">Name</th>
                    <th className="px-3 py-2 text-left font-semibold text-amber-800">National ID</th>
                    <th className="px-3 py-2 text-left font-semibold text-amber-800">Status</th>
                    <th className="px-3 py-2 text-left font-semibold text-amber-800">Collected</th>
                    <th className="px-3 py-2 text-left font-semibold text-amber-800">Registered</th>
                    <th className="px-3 py-2 text-left font-semibold text-amber-800">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-50 bg-white">
                  {filtered.map((r) => (
                    <ClickableTableRow
                      key={r.id}
                      href={`/md/admin/${r.id}`}
                      label={`View application ${r.thaId ?? r.fullName}`}
                      className="hover:bg-amber-50/50"
                    >
                      <td className="px-3 py-2 font-mono text-xs text-gray-700">{r.thaId ?? "N/A"}</td>
                      <td className="px-3 py-2 text-gray-900">{r.fullName}</td>
                      <td className="px-3 py-2 text-gray-600">{r.nationalId ?? "N/A"}</td>
                      <td className="px-3 py-2">
                        <span className={cn("inline-block rounded-full px-2 py-0.5 text-xs font-medium", statusBadge[r.redeemedAt ? "redeemed" : "registered"])}>
                          {r.redeemedAt ? "redeemed" : "registered"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500">
                        {r.redeemedAt ? new Date(r.redeemedAt).toLocaleDateString("en-TT") : "N/A"}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500">
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

      <p className="text-xs text-white/90 [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]">
        Showing {filtered.length} of {total} registrations (max 500).
      </p>
    </div>
  );
}

function ReportCard({ label, value, accent, suffix }: { label: string; value: number; accent?: boolean; suffix?: string }) {
  return (
    <div className={cn(
      "rounded-xl border p-4 md-animate-glow",
      accent ? "border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50" : "border-gray-200 bg-white"
    )}>
      <p className={cn("text-2xl font-bold", accent ? "text-amber-700" : "text-gray-900")}>
        {value}{suffix ?? ""}
      </p>
      <p className="mt-0.5 text-xs text-gray-500">{label}</p>
    </div>
  );
}
