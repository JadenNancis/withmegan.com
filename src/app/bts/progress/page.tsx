import Link from "next/link";
import { db } from "@/db/client";
import { btsGuardians, btsDependents } from "@/db/schema";
import { count, sql } from "drizzle-orm";
import { TobagoMapBadge } from "@/components/bts-illustrations";
import { SITES } from "@/sites/site-registry";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GOAL = SITES.bts.goalFamilies;

export default async function BtsProgressPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!role || (role !== "admin" && role !== "staff")) {
    redirect("/bts");
  }

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
    <div className="-mx-4 -my-5 sm:-my-8 space-y-0">
      {/* ===== Hero ===== */}
      <section className="bg-gradient-to-b from-brand-950/85 to-brand-900/80 backdrop-blur-md text-white border-b border-white/10">
        <div className="mx-auto max-w-4xl px-5 py-10 sm:py-14 text-center">
          <div className="mx-auto mb-4 w-fit">
            <TobagoMapBadge className="h-16 w-16 drop-shadow-lg" />
          </div>
          <h1 className="text-title text-white">Community Progress</h1>
          <p className="mt-2 text-body text-brand-100 max-w-2xl mx-auto">
            How the Back to School book drive is reaching families across
            Mt. St. George/Goodwood, Tobago.
          </p>
        </div>
      </section>

      {/* ===== Total + Progress bar ===== */}
      <section className="mx-auto max-w-4xl px-4 py-8">
        <div className="motion-safe:bts-card-enter rounded-2xl border border-brand-200 bg-white p-6 sm:p-8 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                Families registered
              </p>
              <p className="mt-1 text-5xl sm:text-6xl font-bold text-brand-900 tabular-nums">
                {total}
                <span className="text-2xl sm:text-3xl text-brand-400 font-semibold"> / {GOAL}</span>
              </p>
            </div>
            <p className="text-sm font-semibold text-brand-700">
              {pct}% of community goal
            </p>
          </div>

          <div className="mt-6 h-4 w-full overflow-hidden rounded-full bg-brand-100 ring-1 ring-inset ring-brand-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-700"
              style={{ width: `${Math.max(3, pct)}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-brand-600">
            Goal: {GOAL} families served.
            {total >= GOAL
              ? " Goal reached. Thank you, Tobago!"
              : ` ${GOAL - total} to go.`}
          </p>
        </div>
      </section>

      {/* ===== Breakdown cards ===== */}
      <section className="mx-auto max-w-4xl px-4 pb-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="motion-safe:bts-card-enter rounded-2xl border border-brand-100 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-brand-900">By community</h2>
            <p className="mt-1 text-xs text-brand-600">Registrations per area</p>
            {byCommunity.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-brand-200 bg-brand-50/60 px-4 py-6 text-center text-sm text-gray-500">
                No registrations yet. Be the first.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {byCommunity.slice(0, 10).map((c) => (
                  <li key={c.community}>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="font-medium text-gray-800 truncate pr-2">{c.community}</span>
                      <span className="font-bold text-brand-700 tabular-nums">{c.count}</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-brand-50">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
                        style={{ width: `${Math.max(4, (c.count / maxCommunity) * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="motion-safe:bts-card-enter rounded-2xl border border-brand-100 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-brand-900">By grade level</h2>
            <p className="mt-1 text-xs text-brand-600">Students grouped by grade</p>
            {byCategory.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-brand-200 bg-brand-50/60 px-4 py-6 text-center text-sm text-gray-500">
                No dependents registered yet.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {byCategory.slice(0, 10).map((c) => (
                  <li key={c.category}>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="font-medium text-gray-800 truncate pr-2">{c.category}</span>
                      <span className="font-bold text-brand-700 tabular-nums">{c.count}</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-brand-50">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600"
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

      {/* ===== CTA ===== */}
      <section className="bg-gradient-to-b from-brand-900/85 to-brand-950/90 backdrop-blur-md text-white border-t border-white/10">
        <div className="mx-auto max-w-4xl px-4 py-10 text-center">
          <h2 className="text-xl sm:text-2xl font-bold">Be one of the {GOAL}</h2>
          <p className="mt-2 text-sm text-brand-100">
            Every registration counts toward reaching every family.
          </p>
          <Link
            href="/bts/register"
            className="mt-5 inline-flex min-h-[52px] items-center justify-center rounded-xl bg-white px-8 text-base font-bold text-brand-800 shadow-lg active:scale-95 hover:bg-brand-50 transition-all"
          >
            Register your family
          </Link>
        </div>
      </section>
    </div>
  );
}
