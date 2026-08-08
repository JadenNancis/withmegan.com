import { db } from "@/db/client";
import { mdRegistrants } from "@/db/schema";
import { count, sql } from "drizzle-orm";
import { TobagoMapBadge, SunsetWaveDivider } from "@/components/md-illustrations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GOAL = 150;

export default async function MdProgressPage() {
  const [totalRow] = await db.select({ n: count() }).from(mdRegistrants);
  const total = totalRow?.n ?? 0;

  const communityRows = await db
    .select({ community: mdRegistrants.address, count: count() })
    .from(mdRegistrants)
    .groupBy(mdRegistrants.address)
    .orderBy(sql`count(*) DESC`);

  const categoryRows = await db
    .select({ category: mdRegistrants.productCategory, count: count() })
    .from(mdRegistrants)
    .where(sql`${mdRegistrants.productCategory} IS NOT NULL`)
    .groupBy(mdRegistrants.productCategory)
    .orderBy(sql`count(*) DESC`);

  const byCommunity = communityRows.map((r) => ({ community: r.community, count: r.count }));
  const byCategory = categoryRows.map((r) => ({
    category: r.category ?? "Unspecified",
    count: r.count,
  }));

  const pct = Math.min(100, Math.round((total / GOAL) * 100));
  const maxCommunity = byCommunity.reduce((m, c) => Math.max(m, c.count), 1);
  const maxCategory = byCategory.reduce((m, c) => Math.max(m, c.count), 1);

  return (
    <div className="space-y-0">
      {/* ===== Hero ===== */}
      <section className="relative -mx-4 -mt-8 mb-0 overflow-hidden bg-gradient-to-br from-amber-900 via-orange-900 to-amber-700">
        <div className="md-hero-shimmer absolute inset-0 opacity-20 pointer-events-none" />
        <div className="relative mx-auto max-w-4xl px-4 py-12 text-center text-white">
          <div className="motion-safe:md-animate-fade-in-up mx-auto mb-4">
            <TobagoMapBadge className="h-20 w-20 drop-shadow-lg" />
          </div>
          <h1 className="motion-safe:md-animate-fade-in-up motion-safe:md-delay-1 text-3xl sm:text-4xl font-bold tracking-tight drop-shadow-lg">
            Community Progress
          </h1>
          <p className="motion-safe:md-animate-fade-in-up motion-safe:md-delay-2 mt-3 text-base sm:text-lg text-amber-50 max-w-2xl mx-auto leading-relaxed">
            See how Market Day hamper distribution is reaching residents across
            Mt. St. George/Goodwood, Tobago.
          </p>
        </div>
        <SunsetWaveDivider className="w-full h-[40px] block -mt-1" />
      </section>

      {/* ===== Total + Progress bar ===== */}
      <section className="mx-auto max-w-4xl px-4 py-10">
        <div className="motion-safe:md-animate-fade-in-up rounded-2xl border border-amber-200 bg-white p-6 sm:p-8 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-amber-700">
                Residents registered
              </p>
              <p className="mt-1 text-5xl sm:text-6xl font-bold text-amber-900">
                {total}
                <span className="text-2xl sm:text-3xl text-amber-400"> / {GOAL}</span>
              </p>
            </div>
            <p className="text-sm text-amber-700">
              {pct}% of community goal
            </p>
          </div>

          <div className="mt-6 h-6 w-full overflow-hidden rounded-full bg-amber-100 ring-1 ring-inset ring-amber-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-amber-600">
            Goal: {GOAL} families served across Tobago communities.
            {total >= GOAL ? " Goal reached. Thank you, Tobago!" : ` ${GOAL - total} to go.`}
          </p>
        </div>
      </section>

      {/* ===== Breakdown cards ===== */}
      <section className="mx-auto max-w-4xl px-4 pb-12">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* By community */}
          <div className="motion-safe:md-animate-fade-in-up motion-safe:md-delay-1 rounded-2xl border border-amber-100 bg-white p-6 shadow-md">
            <h2 className="text-lg font-bold text-amber-900">By Community</h2>
            <p className="mt-1 text-xs text-amber-600">Registrations grouped by address</p>
            {byCommunity.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-amber-200 bg-amber-50/60 px-4 py-6 text-center text-sm text-gray-500">
                No registrations yet. Be the first.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {byCommunity.map((c) => (
                  <li key={c.community}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-800 truncate pr-2">{c.community}</span>
                      <span className="font-bold text-amber-700">{c.count}</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-amber-50">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                        style={{ width: `${Math.max(4, (c.count / maxCommunity) * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* By product category */}
          <div className="motion-safe:md-animate-fade-in-up motion-safe:md-delay-2 rounded-2xl border border-amber-100 bg-white p-6 shadow-md">
            <h2 className="text-lg font-bold text-amber-900">By Product Category</h2>
            <p className="mt-1 text-xs text-amber-600">Registrations grouped by requested category</p>
            {byCategory.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-amber-200 bg-amber-50/60 px-4 py-6 text-center text-sm text-gray-500">
                No categories specified yet.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {byCategory.map((c) => (
                  <li key={c.category}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-800 truncate pr-2">{c.category}</span>
                      <span className="font-bold text-amber-700">{c.count}</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-amber-50">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-500"
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