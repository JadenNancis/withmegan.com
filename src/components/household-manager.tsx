"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/cn";

interface Household {
  id: string;
  reference: string;
  hamperStatus: "unassigned" | "assigned" | "redeemed";
  redeemedAt: string | null;
  redeemedBy: string | null;
  createdAt: string;
  memberCount: number;
}

interface Registrant {
  id: string;
  thaId: string | null;
  fullName: string;
  householdReference: string | null;
}

interface AuditEntry {
  id: string;
  actorId: string;
  actorEmail: string | null;
  action: string;
  target: string | null;
  createdAt: string;
}

const statusBadge: Record<string, string> = {
  unassigned: "bg-gray-100 text-gray-700",
  assigned: "bg-amber-100 text-amber-800",
  redeemed: "bg-green-100 text-green-800",
};

export function HouseholdManager({
  households: initialHouseholds,
  unassigned: initialUnassigned,
  audit: initialAudit,
}: {
  households: Household[];
  unassigned: Registrant[];
  audit: AuditEntry[];
}) {
  const [households, setHouseholds] = useState(initialHouseholds);
  const [unassigned, setUnassigned] = useState(initialUnassigned);
  const [audit, setAudit] = useState(initialAudit);
  const [creating, setCreating] = useState(false);
  const [newRef, setNewRef] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function flash(message: string) {
    setMsg(message);
    setTimeout(() => setMsg(null), 3000);
  }

  function createHousehold() {
    setCreating(true);
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/md/households", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: newRef.trim() || undefined }),
        });
        const json = (await res.json()) as { success?: boolean; household?: Household; error?: string };
        if (res.ok && json.success && json.household) {
          setHouseholds((prev) =>
            [...prev, { ...json.household!, memberCount: 0 }].sort((a, b) =>
              a.reference.localeCompare(b.reference),
            ),
          );
          setNewRef("");
          flash(`Created ${json.household.reference}`);
        } else {
          setError(json.error ?? "Failed to create household");
        }
      } catch {
        setError("Network error");
      } finally {
        setCreating(false);
      }
    });
  }

  function assign(registrantId: string, householdId: string) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/md/households", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ registrantId, householdId }),
        });
        const json = (await res.json()) as { success?: boolean; error?: string };
        if (res.ok && json.success) {
          const moved = unassigned.find((r) => r.id === registrantId);
          setUnassigned((prev) => prev.filter((r) => r.id !== registrantId));
          setHouseholds((prev) =>
            prev.map((h) =>
              h.id === householdId
                ? { ...h, memberCount: h.memberCount + 1, hamperStatus: h.hamperStatus === "unassigned" ? "assigned" : h.hamperStatus }
                : h,
            ),
          );
          flash(`Assigned ${moved?.fullName ?? "registrant"}`);
        } else {
          setError(json.error ?? "Failed to assign");
        }
      } catch {
        setError("Network error");
      }
    });
  }

  function setStatus(householdId: string, hamperStatus: "unassigned" | "assigned" | "redeemed") {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/md/households", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ householdId, hamperStatus }),
        });
        const json = (await res.json()) as { success?: boolean; error?: string };
        if (res.ok && json.success) {
          setHouseholds((prev) => prev.map((h) => (h.id === householdId ? { ...h, hamperStatus } : h)));
          flash(`Status set to ${hamperStatus}`);
        } else {
          setError(json.error ?? "Failed to update status");
        }
      } catch {
        setError("Network error");
      }
    });
  }

  return (
    <div className="space-y-6">
      {error && <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {msg && <div className="md-animate-fade-in-up rounded-lg border border-green-300 bg-gradient-to-r from-green-50 to-amber-50 p-3 text-sm text-green-700 font-medium">{msg}</div>}

      <section className="md-animate-fade-in-up rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-amber-900">Create household</h2>
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newRef}
            onChange={(e) => setNewRef(e.target.value)}
            placeholder="Leave blank for auto-generated (HH-0001)"
            className="min-h-[44px] flex-1 rounded-md border border-amber-200 px-3 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={createHousehold}
            disabled={creating || pending}
            className="min-h-[44px] rounded-md bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
          >
            {creating ? "Creating…" : "Create"}
          </button>
        </div>
      </section>

      {unassigned.length > 0 && (
        <section className="md-animate-fade-in-up md-delay-1 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4">
          <h2 className="text-sm font-semibold text-amber-900">
            Unassigned registrants ({unassigned.length})
          </h2>
          <div className="mt-3 space-y-2">
            {unassigned.map((r) => (
              <div key={r.id} className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-lg bg-white p-3 border border-amber-100 shadow-sm">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{r.fullName}</p>
                  <p className="text-xs font-mono text-amber-700 mt-0.5">{r.thaId ?? "N/A"}</p>
                </div>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) assign(r.id, e.target.value);
                    e.target.value = "";
                  }}
                  className="min-h-[44px] w-full sm:w-auto rounded-md border border-amber-200 px-3 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="">Assign to household…</option>
                  {households.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.reference} ({h.memberCount})
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="md-animate-fade-in-up md-delay-2">
        <h2 className="text-lg font-semibold text-white drop-shadow-md">All households</h2>
        {households.length === 0 ? (
          <p className="mt-2 text-sm text-amber-100/85">No households yet. Create one above.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-lg border border-amber-200 shadow-sm">
            <table className="min-w-full divide-y divide-amber-100 text-sm">
              <thead className="bg-gradient-to-r from-amber-50 to-orange-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-amber-800">Reference</th>
                  <th className="px-3 py-2 text-left font-semibold text-amber-800">Members</th>
                  <th className="px-3 py-2 text-left font-semibold text-amber-800">Status</th>
                  <th className="px-3 py-2 text-left font-semibold text-amber-800">Redeemed</th>
                  <th className="px-3 py-2 text-left font-semibold text-amber-800">Set status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50 bg-white">
                {households.map((h) => (
                  <tr key={h.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="px-3 py-2 font-mono font-medium text-gray-900">{h.reference}</td>
                    <td className="px-3 py-2 text-gray-700">{h.memberCount}</td>
                    <td className="px-3 py-2">
                      <span className={cn("inline-block rounded-full px-2 py-0.5 text-xs font-medium", statusBadge[h.hamperStatus])}>
                        {h.hamperStatus}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500">
                      {h.redeemedAt ? new Date(h.redeemedAt).toLocaleString("en-TT") : "N/A"}
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={h.hamperStatus}
                        onChange={(e) => setStatus(h.id, e.target.value as "unassigned" | "assigned" | "redeemed")}
                        disabled={pending}
                        className="min-h-[44px] rounded-md border border-amber-200 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:opacity-50"
                      >
                        <option value="unassigned">unassigned</option>
                        <option value="assigned">assigned</option>
                        <option value="redeemed">redeemed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="md-animate-fade-in-up md-delay-3">
        <h2 className="text-lg font-semibold text-white drop-shadow-md">Recent audit trail</h2>
        {audit.length === 0 ? (
          <p className="mt-2 text-sm text-amber-100/85">No audit entries yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-lg border border-amber-200 shadow-sm">
            <table className="min-w-full divide-y divide-amber-100 text-sm">
              <thead className="bg-gradient-to-r from-amber-50 to-orange-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-amber-800">When</th>
                  <th className="px-3 py-2 text-left font-semibold text-amber-800">Actor</th>
                  <th className="px-3 py-2 text-left font-semibold text-amber-800">Action</th>
                  <th className="px-3 py-2 text-left font-semibold text-amber-800">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50 bg-white">
                {audit.map((a) => (
                  <tr key={a.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="px-3 py-2 text-xs text-gray-500">{new Date(a.createdAt).toLocaleString("en-TT")}</td>
                    <td className="px-3 py-2 text-gray-700">{a.actorEmail ?? a.actorId}</td>
                    <td className="px-3 py-2 font-mono text-xs text-gray-700">{a.action}</td>
                    <td className="px-3 py-2 font-mono text-xs text-gray-500">{a.target ?? "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}