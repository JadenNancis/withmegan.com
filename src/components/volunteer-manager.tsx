"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/cn";

interface Volunteer {
  id: string;
  site: "bts" | "md";
  fullName: string;
  email: string;
  phone: string;
  status: "pending" | "approved" | "declined";
  shiftId: string | null;
  createdAt: string;
}

interface Shift {
  id: string;
  label: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  signedUp: number;
}

interface VolunteerManagerProps {
  site: "bts" | "md";
  accent: "cyan" | "amber";
}

const ACCENT = {
  cyan: {
    bar: "bg-cyan-600",
    activeTab: "bg-white text-cyan-800 shadow-sm",
    approve: "bg-cyan-600 hover:bg-cyan-700",
    chip: "bg-cyan-50 text-cyan-700 ring-cyan-200",
    head: "bg-gradient-to-r from-cyan-50 to-cyan-50/50",
  },
  amber: {
    bar: "bg-amber-600",
    activeTab: "bg-white text-amber-800 shadow-sm",
    approve: "bg-amber-600 hover:bg-amber-700",
    chip: "bg-amber-50 text-amber-700 ring-amber-200",
    head: "bg-gradient-to-r from-amber-50 to-amber-50/50",
  },
} as const;

const STATUS_STYLES: Record<Volunteer["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  declined: "bg-gray-100 text-gray-600",
};

type Tab = "pending" | "roster";

export function VolunteerManager({ site, accent }: VolunteerManagerProps) {
  const a = ACCENT[accent];
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [tab, setTab] = useState<Tab>("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/volunteers?site=${site}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { volunteers: Volunteer[]; shifts: Shift[] };
      setVolunteers(data.volunteers);
      setShifts(data.shifts);
      setError(null);
    } catch {
      setError("Could not load volunteers. The database may be waking up.");
    } finally {
      setLoading(false);
    }
  }, [site]);

  useEffect(() => {
    load();
  }, [load]);

  async function update(id: string, patch: Record<string, unknown>) {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/volunteers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      if (!res.ok) throw new Error();
      setVolunteers((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
      // Refresh so shift capacity counts stay in sync.
      load();
    } catch {
      setError("Could not save that change. Try again.");
    } finally {
      setBusyId(null);
    }
  }

  const pendingList = volunteers.filter((v) => v.status === "pending");
  const roster = volunteers.filter((v) => v.status !== "pending");

  const shiftLabel = (id: string | null) =>
    shifts.find((s) => s.id === id)?.label ?? "No shift assigned";

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              load();
            }}
            className="shrink-0 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary strip */}
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Pending approvals" value={pendingList.length} accent={a.chip} />
        <SummaryCard label="Approved volunteers" value={roster.filter((v) => v.status === "approved").length} accent={a.chip} />
        <SummaryCard label="Open shifts" value={shifts.length} accent={a.chip} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar rounded-xl bg-white/10 backdrop-blur-sm p-1 w-fit">
        <TabButton active={tab === "pending"} onClick={() => setTab("pending")} activeClass={a.activeTab}>
          Pending ({pendingList.length})
        </TabButton>
        <TabButton active={tab === "roster"} onClick={() => setTab("roster")} activeClass={a.activeTab}>
          Roster ({roster.length})
        </TabButton>
      </div>

      {tab === "pending" ? (
        pendingList.length === 0 ? (
          <EmptyState text="No volunteers waiting for approval." />
        ) : (
          <div className="space-y-3">
            {pendingList.map((v) => (
              <div
                key={v.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">{v.fullName}</p>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {v.email} · {v.phone}
                    </p>
                    <p className="mt-1.5 text-xs text-gray-400">
                      Preferred: <span className="text-gray-600">{shiftLabel(v.shiftId)}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => update(v.id, { status: "approved" })}
                      disabled={busyId === v.id}
                      className={cn(
                        "inline-flex min-h-[44px] items-center justify-center rounded-lg px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors disabled:opacity-60",
                        a.approve,
                      )}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => update(v.id, { status: "declined" })}
                      disabled={busyId === v.id}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="space-y-6">
          {shifts.map((s) => {
            const shiftVolunteers = roster.filter((v) => v.shiftId === s.id);
            const full = s.signedUp >= s.capacity;
            return (
              <div key={s.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className={cn("flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between", a.head)}>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{s.label}</p>
                    <p className="text-xs text-gray-500">
                      {s.signedUp} of {s.capacity} filled
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                      full ? "bg-red-50 text-red-700 ring-red-200" : "bg-green-50 text-green-700 ring-green-200",
                    )}
                  >
                    {full ? "Shift full" : "Spaces available"}
                  </span>
                </div>
                {shiftVolunteers.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-gray-400">No volunteers assigned yet.</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {shiftVolunteers.map((v) => (
                      <li key={v.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900">{v.fullName}</p>
                          <p className="text-xs text-gray-500">{v.phone} · {v.email}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <select
                            value={v.shiftId ?? ""}
                            onChange={(e) => update(v.id, { shiftId: e.target.value || null })}
                            className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-700"
                          >
                            <option value="">No shift</option>
                            {shifts.map((sh) => (
                              <option key={sh.id} value={sh.id}>{sh.label}</option>
                            ))}
                          </select>
                          <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", STATUS_STYLES[v.status])}>
                            {v.status}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
          {roster.length === 0 && <EmptyState text="No approved volunteers yet." />}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  activeClass,
  children,
}: {
  active: boolean;
  onClick: () => void;
  activeClass: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-all min-h-[40px]",
        active ? activeClass : "text-white/85 hover:text-white hover:bg-white/10",
      )}
    >
      {children}
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/25 bg-white/5 px-6 py-10 text-center">
      <p className="text-sm text-white/75">{text}</p>
    </div>
  );
}
