"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/cn";

interface Assignment {
  id: string;
  itemName: string;
  quantityAssigned: number;
  quantityCollected: number;
  status: "pending" | "partial" | "full" | "collected";
  collectedByName: string | null;
  collectedAt: Date | null;
}

interface AssignmentPanelProps {
  dependentId: string;
  assignments: Assignment[];
  actorEmail?: string;
}

const STATUS_COLORS: Record<Assignment["status"], string> = {
  pending: "bg-gray-100 text-gray-700",
  partial: "bg-amber-100 text-amber-800",
  full: "bg-blue-100 text-blue-800",
  collected: "bg-green-100 text-green-800",
};

export function AssignmentPanel({ dependentId, assignments, actorEmail }: AssignmentPanelProps) {
  const [items, setItems] = useState<Assignment[]>(assignments);
  const [newItem, setNewItem] = useState("");
  const [newQty, setNewQty] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function addAssignment() {
    if (!newItem.trim()) {
      setError("Item name is required");
      return;
    }
    const qty = parseInt(newQty, 10);
    if (isNaN(qty) || qty < 0) {
      setError("Quantity must be a non-negative number");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/bts/assignments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dependentId,
            itemName: newItem.trim(),
            quantityAssigned: qty,
            quantityCollected: 0,
            status: qty > 0 ? "partial" : "pending",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error((data as { error?: string }).error ?? "Failed");
        setItems((prev) => [
          ...prev,
          {
            id: (data as { id: string }).id,
            itemName: newItem.trim(),
            quantityAssigned: qty,
            quantityCollected: 0,
            status: qty > 0 ? "partial" : "pending",
            collectedByName: null,
            collectedAt: null,
          },
        ]);
        setNewItem("");
        setNewQty("0");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add assignment");
      }
    });
  }

  async function updateAssignment(id: string, patch: Partial<Assignment>) {
    startTransition(async () => {
      try {
        const res = await fetch("/api/bts/assignments", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...patch }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error((data as { error?: string }).error ?? "Failed");
        setItems((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update assignment");
      }
    });
  }

  return (
    <div className="border-t border-gray-100 pt-4">
      <h4 className="text-sm font-semibold text-gray-700">Resource Assignments</h4>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      {items.length > 0 ? (
        <div className="mt-2">
          <p className="mb-1 text-xs text-gray-400 sm:hidden">
            ← Swipe to see more columns →
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-400">
                <th className="py-1 pr-3 font-medium">Item</th>
                <th className="py-1 pr-3 font-medium">Assigned</th>
                <th className="py-1 pr-3 font-medium">Collected</th>
                <th className="py-1 pr-3 font-medium">Status</th>
                <th className="py-1 pr-3 font-medium">Collected by</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} className="border-t border-gray-100">
                  <td className="py-2 pr-3">{a.itemName}</td>
                  <td className="py-2 pr-3">
                    <QtyInput
                      value={a.quantityAssigned}
                      onChange={(v) =>
                        updateAssignment(a.id, {
                          quantityAssigned: v,
                          status: deriveStatus(v, a.quantityCollected),
                        })
                      }
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <QtyInput
                      value={a.quantityCollected}
                      onChange={(v) =>
                        updateAssignment(a.id, {
                          quantityCollected: v,
                          status: deriveStatus(a.quantityAssigned, v),
                          collectedAt: v > 0 ? new Date() : null,
                        })
                      }
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <select
                      value={a.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as Assignment["status"];
                        updateAssignment(a.id, {
                          status: newStatus,
                          collectedByName:
                            newStatus === "collected"
                              ? a.collectedByName ?? ""
                              : null,
                        });
                      }}
                      className={cn(
                        "rounded px-2 py-0.5 text-xs font-medium",
                        STATUS_COLORS[a.status],
                      )}
                    >
                      <option value="pending">pending</option>
                      <option value="partial">partial</option>
                      <option value="full">full</option>
                      <option value="collected">collected</option>
                    </select>
                  </td>
                  <td className="py-2 pr-3">
                    {a.status === "collected" ? (
                      <input
                        type="text"
                        value={a.collectedByName ?? ""}
                        onChange={(e) =>
                          updateAssignment(a.id, { collectedByName: e.target.value })
                        }
                        placeholder="Name of person who collected"
                        className="w-32 sm:w-40 rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                      />
                    ) : (
                      <span className="text-xs text-gray-300">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      ) : (
        <p className="mt-1 text-xs text-gray-400">No resources assigned yet.</p>
      )}

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-2">
        <div className="flex-1">
          <label className="block text-xs text-gray-500">New item</label>
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="e.g. Mathematics textbook"
            className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm min-h-[44px]"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Qty assigned</label>
          <input
            type="number"
            min={0}
            value={newQty}
            onChange={(e) => setNewQty(e.target.value)}
            className="w-full sm:w-20 rounded-md border border-gray-300 px-2 py-2 text-sm min-h-[44px]"
          />
        </div>
        <button
          type="button"
          onClick={addAssignment}
          disabled={pending}
          className={cn(
            "rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 min-h-[44px] sm:self-end",
            pending && "opacity-60",
          )}
        >
          Add item
        </button>
      </div>
      {actorEmail && (
        <p className="mt-2 text-xs text-gray-400">Changes recorded by {actorEmail}</p>
      )}
    </div>
  );
}

function deriveStatus(assigned: number, collected: number): Assignment["status"] {
  if (assigned > 0 && collected >= assigned) return "collected";
  if (assigned > 0) return assigned >= collected ? "partial" : "full";
  return "pending";
}

function QtyInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      min={0}
      value={value}
      onChange={(e) => {
        const v = parseInt(e.target.value, 10);
        onChange(isNaN(v) ? 0 : Math.max(0, v));
      }}
      className="w-16 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
    />
  );
}