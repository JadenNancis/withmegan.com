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
          setError("Unauthorized — please sign in.");
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

  const accentText = site === "bts" ? "text-cyan-300" : "text-amber-300";
  const accentBarFrom = site === "bts" ? "from-cyan-500" : "from-amber-500";
  const accentBarTo = site === "bts" ? "to-cyan-400" : "to-amber-400";
  const accentRing = site === "bts" ? "ring-cyan-500/30" : "ring-amber-500/30";
  const communityHeader =
    site === "bts" ? "text-cyan-400" : "text-amber-400";
  const label = site === "bts" ? "Collected" : "Redeemed";

  return (
    <div className="space-y-6">
      {/* Clock */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-400">
          {lastUpdated
            ? `Updated ${lastUpdated.toLocaleTimeString("en-TT")}`
            : "Loading…"}
          {error && <span className="ml-2 text-red-400">· {error}</span>}
        </p>
        <p className="text-2xl font-mono font-semibold tabular-nums text-white">
          {now.toLocaleTimeString("en-TT", { hour12: false })}
        </p>
      </div>

      {/* Big numbers */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatTile
          label="Registered"
          value={total}
          accentText={accentText}
          accentRing={accentRing}
        />
        <StatTile
          label={label}
          value={collected}
          accentText={accentText}
          accentRing={accentRing}
        />
        <StatTile
          label="Remaining"
          value={Math.max(0, total - collected)}
          accentText={accentText}
          accentRing={accentRing}
        />
      </div>

      {/* Progress bar */}
      <section
        className={`rounded-2xl border border-neutral-700 bg-neutral-900 p-6 shadow-xl ring-2 ${accentRing}`}
      >
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-semibold text-white">
            {label} progress
          </h2>
          <p className={`text-3xl font-bold ${accentText}`}>{pct}%</p>
        </div>
        <div className="mt-4 h-8 w-full overflow-hidden rounded-full bg-neutral-800">
          <div
            className={`h-full bg-gradient-to-r ${accentBarFrom} ${accentBarTo} transition-all duration-700 ease-out`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-neutral-400">
          {collected} of {total} {site === "bts" ? "guardians" : "households"} {label.toLowerCase()}
        </p>
      </section>

      {/* Community breakdown */}
      <section className="rounded-2xl border border-neutral-700 bg-neutral-900 p-6 shadow-xl">
        <h2 className={`text-xl font-semibold ${communityHeader}`}>
          Community breakdown
        </h2>
        {stats && stats.byCommunity.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-700 text-neutral-400">
                  <th className="px-3 py-2 font-medium">Community</th>
                  <th className="px-3 py-2 font-medium text-right">Registered</th>
                  <th className="px-3 py-2 font-medium text-right">{label}</th>
                  <th className="px-3 py-2 font-medium text-right">Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {stats.byCommunity.map((c) => {
                  const remaining = Math.max(0, c.registered - c.collected);
                  return (
                    <tr key={c.community} className="hover:bg-neutral-800/60 transition-colors">
                      <td className="px-3 py-3 font-medium text-white">
                        {c.community}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-neutral-100">
                        {c.registered}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-neutral-100">
                        {c.collected}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-neutral-400">
                        {remaining}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-sm text-neutral-500">
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
    <div
      className={`rounded-2xl border border-neutral-700 bg-neutral-900 p-6 shadow-xl ring-2 ${accentRing} hover:shadow-2xl transition-shadow`}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
        {label}
      </p>
      <p className={`mt-3 text-5xl font-bold tabular-nums ${accentText}`}>
        {value}
      </p>
    </div>
  );
}