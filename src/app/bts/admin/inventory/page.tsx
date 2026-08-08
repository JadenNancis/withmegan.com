import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import { getAllInventory, getInventorySummary } from "@/lib/bts-inventory-queries";
import { AdminNav } from "@/components/admin-nav";
import { SchoolBookIcon } from "@/components/bts-illustrations";
import { InventoryManager } from "./inventory-manager";

export default async function BtsInventoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin("/bts/admin/inventory");
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;

  const [items, summary] = await Promise.all([
    getAllInventory(search),
    getInventorySummary(),
  ]);

  return (
    <div className="space-y-6">
      <AdminNav current="/bts/admin/inventory" site="bts" />

      {/* Header */}
      <div className="bts-fade-in-up bts-stagger-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-cyan-50 shadow-sm shrink-0">
            <SchoolBookIcon className="h-8 w-8" />
          </div>
          <div className="min-w-0 rounded-2xl border border-white/25 bg-brand-950/55 backdrop-blur-md px-5 py-4 shadow-lg">
            <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow-md truncate">Inventory</h1>
            <p className="mt-0.5 text-sm text-brand-100/90">
              {summary.totalItems} item{summary.totalItems === 1 ? "" : "s"} · {summary.totalAvailable} available
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/bts/admin"
            className="inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 py-2.5 text-sm font-bold text-cyan-700 shadow-sm hover:bg-cyan-50 active:scale-95 transition-all min-h-[44px]"
          >
            &larr; Dashboard
          </Link>
          <Link
            href="/bts/admin/reports"
            className="inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 py-2.5 text-sm font-bold text-cyan-700 shadow-sm hover:bg-cyan-50 active:scale-95 transition-all min-h-[44px]"
          >
            Reports &rarr;
          </Link>
        </div>
      </div>

      {/* Stats summary cards */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
        <div className="bts-card-enter bts-count-up bts-stagger-2 rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600">Total Received</p>
          <p className="mt-2 text-4xl font-bold text-cyan-900">{summary.totalReceived}</p>
          <p className="mt-1 text-xs text-gray-500">Items donated</p>
        </div>
        <div className="bts-card-enter bts-count-up bts-stagger-3 rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600">Assigned</p>
          <p className="mt-2 text-4xl font-bold text-cyan-900">{summary.totalAssigned}</p>
          <p className="mt-1 text-xs text-gray-500">Matched to students</p>
        </div>
        <div className="bts-card-enter bts-count-up bts-stagger-4 rounded-2xl border border-cyan-100 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Available</p>
          <p className="mt-2 text-4xl font-bold text-amber-900">{summary.totalAvailable}</p>
          <p className="mt-1 text-xs text-gray-500">Ready to assign</p>
        </div>
      </div>

      {/* By-category breakdown */}
      {summary.byCategory.length > 0 && (
        <div className="bts-fade-in-up bts-stagger-4 rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-cyan-700 mb-3">By Category</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {summary.byCategory.map((cat) => (
              <div
                key={cat.category}
                className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-4"
              >
                <p className="text-sm font-semibold text-gray-900">{cat.category}</p>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="rounded-md bg-cyan-50 px-2 py-0.5 font-medium text-cyan-700">
                    {cat.received} in
                  </span>
                  <span className="rounded-md bg-amber-50 px-2 py-0.5 font-medium text-amber-700">
                    {cat.available} left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive inventory manager */}
      <InventoryManager initialItems={items} />
    </div>
  );
}