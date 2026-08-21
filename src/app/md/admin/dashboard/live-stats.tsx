"use client";

import { useEffect, useState, useCallback } from "react";

type Site = "bts" | "md";

interface CommunityStat {
  community: string;
  registered: number;
  collected: number;
}

interface Stats {
  totalRegistered: number;
  totalCollected: number;
  byCommunity: CommunityStat[];
}

interface Props {
  site: Site;
}

const REFRESH_MS = 10_000;

export function LiveStats({ site }: Props) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [now, setNow] = useState<Date>(new Date());

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/dashboard?site=${site}`, { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 401) {
          setError("Unauthorized. Please sign in.");
        } else {
          setError(`Failed to load (HTTP ${res.status}).`);
        }
        return;
      }
      const data = (await res.json()) as Stats;
      setStats(data);
      setError(null);
      setLastUpdated(new Date());
    } catch {
      setError("Network error while fetching stats.");
    }
  }, [site]);

  useEffect(() => {
    void fetchStats();
    const id = setInterval(() => void fetchStats(), REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchStats]);

  useEffect(() => {
    const clockId = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(clockId);
  }, []);

  const total = stats?.totalRegistered ?? 0;
  const collected = stats?.totalCollected ?? 0;
  const pct = total > 0 ? Math.round((collected / total) * 100) : 0;

  const accentText = "text-amber-300";
  const accentBarFrom = "from-amber-400";
  const accentBarTo = "to-orange-500";
  const accentRing = "ring-amber-500/40";
  const communityHeader = "text-amber-400";
  const label = "Redeemed";

  return (
    <div className="space-y-8">
      {/* Clock */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="inline-flex items-center rounded-full border border-white/20 bg-amber-950/40 backdrop-blur px-3 py-1.5 text-sm text-neutral-100">
          {lastUpdated
            ? `Updated ${lastUpdated.toLocaleTimeString("en-TT")}`
            : "Loading…"}
          {error && <span className="ml-2 text-red-400">· {error}</span>}
        </p>
        <p className="inline-flex items-center rounded-full border border-white/20 bg-amber-950/40 backdrop-blur px-3 py-1.5 text-2xl font-mono font-semibold tabular-nums text-white">
          {now.toLocaleTimeString("en-TT", { hour12: false })}
        </p>
      </div>

      {/* Big numbers — horizontal snap-scroll on mobile, 3-col grid on desktop */}
      <div className="space-y-2">
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto snap-x snap-mandatory scroll-smooth sm:overflow-x-visible sm:snap-none">
          <div className="flex gap-4 sm:grid sm:grid-cols-3 sm:gap-6">
            <div className="min-w-[85%] snap-center sm:min-w-0">
              <StatTile label="Registered" value={total} accentText={accentText} accentRing={accentRing} />
            </div>
            <div className="min-w-[85%] snap-center sm:min-w-0">
              <StatTile label={label} value={collected} accentText={accentText} accentRing={accentRing} />
            </div>
            <div className="min-w-[85%] snap-center sm:min-w-0">
              <StatTile label="Remaining" value={Math.max(0, total - collected)} accentText={accentText} accentRing={accentRing} />
            </div>
          </div>
        </div>
        <p className="text-center text-[10px] uppercase tracking-widest text-neutral-300 sm:hidden [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
          ← Swipe to see more →
        </p>
      </div>

      {/* Progress bar */}
      <section className={`rounded-2xl border border-white/25 bg-amber-950/50 backdrop-blur-md p-6 shadow-xl ring-2 ${accentRing}`}>
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-semibold text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]">{label} progress</h2>
          <p className={`text-3xl font-bold ${accentText} [text-shadow:0_1px_4px_rgba(0,0,0,0.4)]`}>{pct}%</p>
        </div>
        <div className="mt-4 h-8 w-full overflow-hidden rounded-full bg-white/15 backdrop-blur-sm">
          <div
            className={`h-full bg-gradient-to-r ${accentBarFrom} ${accentBarTo} transition-all duration-700 ease-out shadow-[0_0_12px_rgba(251,191,36,0.5)]`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-neutral-200 [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]">
          {collected} of {total} hampers {label.toLowerCase()}
        </p>
      </section>

      {/* Community breakdown */}
      <section className="rounded-2xl border border-white/25 bg-amber-950/50 backdrop-blur-md p-6 shadow-xl">
        <h2 className={`text-xl font-semibold ${communityHeader} [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]`}>Community breakdown</h2>
        {stats && stats.byCommunity.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/20 text-neutral-200">
                  <th className="px-3 py-2 font-medium">Community</th>
                  <th className="px-3 py-2 font-medium text-right">Registered</th>
                  <th className="px-3 py-2 font-medium text-right">{label}</th>
                  <th className="px-3 py-2 font-medium text-right">Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {stats.byCommunity.map((c) => {
                  const remaining = Math.max(0, c.registered - c.collected);
                  return (
                    <tr key={c.community} className="hover:bg-white/[0.08]">
                      <td className="px-3 py-3 font-medium text-white">{c.community}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-neutral-100">{c.registered}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-neutral-100">{c.collected}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-neutral-300">{remaining}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-sm text-neutral-200 [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]">
            {error ? "No data available." : "Loading community breakdown…"}
          </p>
        )}
      </section>
    </div>
  );
}

function StatTile({
  label,
  value,
  accentText,
  accentRing,
}: {
  label: string;
  value: number;
  accentText: string;
  accentRing: string;
}) {
  return (
    <div className={`rounded-2xl border border-white/25 bg-amber-950/50 backdrop-blur-md p-6 shadow-xl ring-2 ${accentRing}`}>
      <p className="text-sm font-semibold uppercase tracking-wide text-neutral-200">{label}</p>
      <p className={`mt-2 text-5xl font-bold tabular-nums ${accentText} [text-shadow:0_2px_8px_rgba(0,0,0,0.4)]`}>{value}</p>
    </div>
  );
}