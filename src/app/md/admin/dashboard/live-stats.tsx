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

  const accentText = "text-amber-300";
  const accentBarFrom = "from-amber-400";
  const accentBarTo = "to-orange-500";
  const accentRing = "ring-amber-500/40";
  const communityHeader = "text-amber-400";
  const label = "Redeemed";

  return (
    <div className="space-y-8">
      {/* Clock */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatTile label="Registered" value={total} accentText={accentText} accentRing={accentRing} />
        <StatTile label={label} value={collected} accentText={accentText} accentRing={accentRing} />
        <StatTile label="Remaining" value={Math.max(0, total - collected)} accentText={accentText} accentRing={accentRing} />
      </div>

      {/* Progress bar */}
      <section className={`rounded-2xl border border-slate-700 bg-slate-800/60 p-6 shadow-xl ring-2 ${accentRing}`}>
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-semibold text-white">{label} progress</h2>
          <p className={`text-3xl font-bold ${accentText}`}>{pct}%</p>
        </div>
        <div className="mt-4 h-8 w-full overflow-hidden rounded-full bg-slate-900">
          <div
            className={`h-full bg-gradient-to-r ${accentBarFrom} ${accentBarTo} transition-all duration-700 ease-out`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-slate-400">
          {collected} of {total} households {label.toLowerCase()}
        </p>
      </section>

      {/* Community breakdown */}
      <section className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6 shadow-xl">
        <h2 className={`text-xl font-semibold ${communityHeader}`}>Community breakdown</h2>
        {stats && stats.byCommunity.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="px-3 py-2 font-medium">Community</th>
                  <th className="px-3 py-2 font-medium text-right">Registered</th>
                  <th className="px-3 py-2 font-medium text-right">{label}</th>
                  <th className="px-3 py-2 font-medium text-right">Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {stats.byCommunity.map((c) => {
                  const remaining = Math.max(0, c.registered - c.collected);
                  return (
                    <tr key={c.community} className="hover:bg-slate-800/80">
                      <td className="px-3 py-3 font-medium text-white">{c.community}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-slate-200">{c.registered}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-slate-200">{c.collected}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-slate-400">{remaining}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
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
    <div className={`rounded-2xl border border-slate-700 bg-slate-800/60 p-6 shadow-xl ring-2 ${accentRing}`}>
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-2 text-5xl font-bold tabular-nums ${accentText}`}>{value}</p>
    </div>
  );
}