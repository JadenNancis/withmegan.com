import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin-nav";
import { db } from "@/db/client";
import { btsGuardians, btsDependents, btsResourceAssignments, btsInventory } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function BtsReportsPage() {
  await requireAdmin("/bts/admin/reports");

  const [guardians, dependents, assignments, inventory] = await Promise.all([
    db.select().from(btsGuardians),
    db.select().from(btsDependents),
    db.select().from(btsResourceAssignments),
    db.select().from(btsInventory),
  ]);

  const totalGuardians = guardians.length;
  const totalDependents = dependents.length;

  const schoolCounts = new Map<string, number>();
  for (const d of dependents) {
    schoolCounts.set(d.schoolName, (schoolCounts.get(d.schoolName) ?? 0) + 1);
  }
  const bySchool = [...schoolCounts.entries()].sort((a, b) => b[1] - a[1]);

  const statusCounts = new Map<string, number>();
  for (const a of assignments) {
    statusCounts.set(a.status, (statusCounts.get(a.status) ?? 0) + 1);
  }
  const byStatus = [...statusCounts.entries()].sort((a, b) => b[1] - a[1]);

  const totalAssigned = assignments.reduce((sum, a) => sum + a.quantityAssigned, 0);
  const totalCollected = assignments.reduce((sum, a) => sum + a.quantityCollected, 0);
  const totalItems = assignments.length;

  return (
    <div className="space-y-6">
      <AdminNav current="/bts/admin/reports" site="bts" />

      <div className="flex items-center justify-between gap-3">
        <div className="px-5 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">Reports</h1>
          <p className="mt-1 text-sm text-brand-100/90 [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]">Summary of all BTS book drive registrations.</p>
        </div>
        <a
          href="/api/export?site=bts&format=pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 active:scale-95 min-h-[44px]"
        >
          Export PDF
        </a>
      </div>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
        <StatCard label="Total Registrations" value={totalGuardians} accent="blue" />
        <StatCard label="Total Dependents" value={totalDependents} accent="blue" />
        <StatCard label="Resource Items Tracked" value={totalItems} accent="amber" />
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Dependents by School</h2>
        {bySchool.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No dependents registered.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-400">
                  <th className="py-2 pr-4 font-medium">School</th>
                  <th className="py-2 pr-4 font-medium">Students</th>
                </tr>
              </thead>
              <tbody>
                {bySchool.map(([school, count]) => (
                  <tr key={school} className="border-b border-gray-100">
                    <td className="py-2 pr-4 text-gray-900">{school}</td>
                    <td className="py-2 pr-4 text-gray-700">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Assignments by Status</h2>
        {byStatus.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No resource assignments yet.</p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {byStatus.map(([status, count]) => (
              <div
                key={status}
                className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
              >
                <span className="text-sm font-medium capitalize text-gray-700">{status}</span>
                <span className="text-lg font-bold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Requested vs Allocated</h2>
        <div className="mt-3 grid gap-3 sm:gap-4 sm:grid-cols-3">
          <StatCard label="Items Assigned" value={totalAssigned} accent="blue" />
          <StatCard label="Items Collected" value={totalCollected} accent="green" />
          <StatCard
            label="Outstanding"
            value={Math.max(0, totalAssigned - totalCollected)}
            accent="amber"
          />
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-gray-900">Inventory Summary</h2>
          <Link
            href="/bts/admin/inventory"
            className="text-sm font-bold text-cyan-600 hover:text-cyan-800 transition-colors min-h-[44px] flex items-center"
          >
            Manage inventory &rarr;
          </Link>
        </div>
        {inventory.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No inventory items recorded yet.</p>
        ) : (
          <div className="mt-3 grid gap-3 sm:gap-4 sm:grid-cols-3">
            <StatCard
              label="Items Received"
              value={inventory.reduce((sum, i) => sum + i.quantityReceived, 0)}
              accent="blue"
            />
            <StatCard
              label="Inventory Entries"
              value={inventory.length}
              accent="amber"
            />
            <StatCard
              label="Categories"
              value={new Set(inventory.map((i) => i.category)).size}
              accent="green"
            />
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "blue" | "amber" | "green";
}) {
  const colors = {
    blue: "border-blue-200 bg-blue-50 text-blue-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    green: "border-green-200 bg-green-50 text-green-900",
  };
  return (
    <div className={`rounded-xl border p-5 ${colors[accent]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}