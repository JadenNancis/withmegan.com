"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/cn";

interface CollectionActionProps {
  dependentId: string;
  studentName: string;
  assignments: Array<{
    id: string;
    itemName: string;
    quantityAssigned: number;
    quantityCollected: number;
    status: "pending" | "partial" | "full" | "collected";
    collectedByName: string | null;
    collectedAt: Date | null;
  }>;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  partial: "bg-amber-100 text-amber-800",
  full: "bg-blue-100 text-blue-800",
  collected: "bg-green-100 text-green-800",
};

export function CollectionActions({ dependentId, studentName, assignments }: CollectionActionProps) {
  const [items, setItems] = useState(assignments);
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const allCollected = items.length > 0 && items.every((a) => a.status === "collected");

  async function markCollected(assignmentId: string, collectedByName?: string) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/bts/assignments", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: assignmentId,
            status: "collected",
            collectedByName: collectedByName || null,
            collectedAt: new Date().toISOString(),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error((data as { error?: string }).error ?? "Failed");
        setItems((prev) =>
          prev.map((a) =>
            a.id === assignmentId
              ? {
                  ...a,
                  status: "collected" as const,
                  quantityCollected: a.quantityAssigned,
                  collectedByName: collectedByName || null,
                  collectedAt: new Date(),
                }
              : a,
          ),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not update collection status.");
      }
    });
  }

  async function markAllCollected() {
    setError(null);
    startTransition(async () => {
      try {
        await Promise.all(
          items.filter((a) => a.status !== "collected").map((a) => markCollected(a.id, name.trim() || undefined)),
        );
      } catch {
        setError("Some items could not be updated. Try again.");
      }
    });
  }

  return (
    <div className="border-t border-gray-100 pt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Collection status
          </p>
          {items.length === 0 ? (
            <p className="mt-1 text-sm text-gray-400">No items assigned for this child yet.</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {items.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium text-gray-800">{a.itemName}</span>
                  <span className="text-xs text-gray-400">
                    {a.quantityCollected}/{a.quantityAssigned}
                  </span>
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", STATUS_STYLES[a.status])}>
                    {a.status}
                  </span>
                  {a.status === "collected" ? (
                    <span className="text-xs text-green-700">
                      ✓ {a.collectedByName || "Collected"}
                    </span>
                  ) : (
                    <button
                      onClick={() => markCollected(a.id, name.trim() || undefined)}
                      disabled={pending}
                      className="rounded-md bg-cyan-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-cyan-700 disabled:opacity-60 transition-colors"
                    >
                      Mark collected
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Staff member / collector"
            className="w-full sm:w-48 rounded-md border border-gray-300 px-3 py-2 text-sm min-h-[44px]"
          />
          {!allCollected && items.length > 0 && (
            <button
              onClick={markAllCollected}
              disabled={pending}
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              Mark all collected
            </button>
          )}
        </div>
      </div>

      {allCollected && (
        <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-800">
          ✓ All resources for {studentName} collected.
        </p>
      )}
    </div>
  );
}
