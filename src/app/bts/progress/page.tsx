import { db } from "@/db/client";
import { btsGuardians, btsDependents } from "@/db/schema";
import { count, sql } from "drizzle-orm";
import { WaveDivider, TobagoMapBadge } from "@/components/bts-illustrations";

export const runtime = "nodejs";

const GOAL = 200;

export default async function BtsProgressPage() {
  const [totalRow] = await db.select({ n: count() }).from(btsGuardians);
  const total = totalRow?.n ?? 0;

  const communityRows = await db
    .select({ community: btsGuardians.address, count: count() })
    .from(btsGuardians)
    .groupBy(btsGuardians.address)
    .orderBy(sql`count(*) DESC`);

  const categoryRows = await db
    .select({ category: btsDependents.gradeLevel, count: count() })
    .from(btsDependents)
    .groupBy(btsDependents.gradeLevel)
    .orderBy(sql`count(*) DESC`);

  const byCommunity = communityRows.map((r) => ({ community: r.community, count: r.count }));
  const byCategory = categoryRows.map((r) => ({ category: r.category, count: r.count }));

  const pct = Math.min(100, Math.round((total / GOAL) * 100));
  const maxCommunity = byCommunity.reduce((m, c) => Math.max(m, c.count), 1);
  const maxCategory = byCategory.reduce((m, c) => Math.max(m, c.count), 1);

  return (
    <div className="space-y-0">
      {/* ===== Hero ===== */}
      <section className="relative -mx-4 -mt-8 mb-0 overflow-hidden bg-gradient-to-br from-cyan-900 via-blue-900 to-cyan-700">
        <div className="bts-ocean-shimmer absolute inset-0 opacity-15 pointer-events-none" />
        <div className="relative mx-auto max-w-4xl px-4 py-12 text-center text-white">
          <div className="bts-fade-in-up bts-stagger-1 mx-auto mb-4 bts-float">
            <TobagoMapBadge className="h-20 w-20 drop-shadow-lg" />
          </div>
          <h1 className="bts-fade-in-up bts-stagger-2 text-3xl sm:text-4xl font-bold tracking-tight drop-shadow-lg">
            Community Progress
          </h1>
          <p className="bts-fade-in-up bts-stagger-3 mt-3 text-base sm:text-lg text-cyan-50 max-w-2xl mx-auto leading-relaxed">
            See how the Back to School book drive is reaching families across
            the Electoral District of Mt. St. George/Goodwood, Tobago.
          </p>
        </div>
        <div className="-mt-2 h-16 overflow-hidden">
          <WaveDivider className="h-16 w-full" preserveAspectRatio="none" />
        </div>
      </section>

      {/* ===== Total + Progress bar ===== */}
      <section className="mx-auto max-w-4xl px-4 py-10">
        <div className="bts-fade-in-up bts-stagger-1 rounded-2xl border border-cyan-200 bg-white p-6 sm:p-8 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-cyan-700">
                Families registered
              </p>
              <p className="mt-1 text-5xl sm:text-6xl font-bold text-cyan-900">
                {total}
                <span className="text-2xl sm:text-3xl text-cyan-400"> / {GOAL}</span>
              </p>
            </div>
            <p className="text-sm text-cyan-700">
              {pct}% of community goal
            </p>
          </div>

          <div className="mt-6 h-6 w-full overflow-hidden rounded-full bg-cyan-100 ring-1 ring-inset ring-cyan-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-cyan-600">
            Goal: {GOAL} families served across Tobago communities.
            {total >= GOAL ? " Goal reached — thank you, Tobago!" : ` ${GOAL - total} to go.`}
          </p>
        </div>
      </section>

      {/* ===== Breakdown cards ===== */}
      <section className="mx-auto max-w-4xl px-4 pb-12">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* By community */}
          <div className="bts-fade-in-up bts-stagger-2 rounded-2xl border border-cyan-100 bg-white p-6 shadow-md">
            <h2 className="text-lg font-bold text-cyan-900">By Community</h2>
            <p className="mt-1 text-xs text-cyan-600">Registrations grouped by guardian address</p>
            {byCommunity.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">No registrations yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {byCommunity.map((c) => (
                  <li key={c.community}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-800 truncate pr-2">{c.community}</span>
                      <span className="font-bold text-cyan-700">{c.count}</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-cyan-50">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                        style={{ width: `${Math.max(4, (c.count / maxCommunity) * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* By grade level */}
          <div className="bts-fade-in-up bts-stagger-3 rounded-2xl border border-cyan-100 bg-white p-6 shadow-md">
            <h2 className="text-lg font-bold text-cyan-900">Dependents by Grade Level</h2>
            <p className="mt-1 text-xs text-cyan-600">Students grouped by grade</p>
            {byCategory.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">No dependents registered yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {byCategory.map((c) => (
                  <li key={c.category}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-800 truncate pr-2">{c.category}</span>
                      <span className="font-bold text-cyan-700">{c.count}</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-cyan-50">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-500"
                        style={{ width: `${Math.max(4, (c.count / maxCategory) * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}