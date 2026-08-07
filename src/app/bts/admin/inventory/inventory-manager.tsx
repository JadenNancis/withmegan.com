"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import { Field, TextInput, Select, SubmitButton } from "@/components/form";
import { SchoolBookIcon } from "@/components/bts-illustrations";

interface InventoryItem {
  id: string;
  itemName: string;
  category: "Books" | "Stationery" | "Uniforms" | "Backpacks" | "Other";
  quantityReceived: number;
  quantityAssigned: number;
  quantityAvailable: number;
  condition: string | null;
  donorName: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface InventoryManagerProps {
  initialItems: InventoryItem[];
}

const CATEGORIES = ["Books", "Stationery", "Uniforms", "Backpacks", "Other"] as const;

const CATEGORY_COLORS: Record<string, string> = {
  Books: "bg-cyan-100 text-cyan-800",
  Stationery: "bg-blue-100 text-blue-800",
  Uniforms: "bg-purple-100 text-purple-800",
  Backpacks: "bg-amber-100 text-amber-800",
  Other: "bg-gray-100 text-gray-700",
};

type AddFormState = {
  itemName: string;
  category: string;
  quantityReceived: string;
  condition: string;
  donorName: string;
  notes: string;
};

function emptyForm(): AddFormState {
  return {
    itemName: "",
    category: "Books",
    quantityReceived: "0",
    condition: "",
    donorName: "",
    notes: "",
  };
}

export function InventoryManager({ initialItems }: InventoryManagerProps) {
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<AddFormState>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AddFormState>(emptyForm());
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.itemName.trim()) {
      setError("Item name is required");
      return;
    }
    const qty = parseInt(addForm.quantityReceived, 10);
    if (isNaN(qty) || qty < 0) {
      setError("Quantity must be a non-negative number");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/bts/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemName: addForm.itemName.trim(),
            category: addForm.category,
            quantityReceived: qty,
            condition: addForm.condition || undefined,
            donorName: addForm.donorName || undefined,
            notes: addForm.notes || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error((data as { error?: string }).error ?? "Failed to add item");

        const newId = (data as { id: string }).id;
        setItems((prev) => [
          {
            id: newId,
            itemName: addForm.itemName.trim(),
            category: addForm.category as InventoryItem["category"],
            quantityReceived: qty,
            quantityAssigned: 0,
            quantityAvailable: qty,
            condition: addForm.condition || null,
            donorName: addForm.donorName || null,
            notes: addForm.notes || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          ...prev,
        ]);
        setAddForm(emptyForm());
        setShowAddForm(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add item");
      }
    });
  }

  function startEdit(item: InventoryItem) {
    setEditingId(item.id);
    setEditForm({
      itemName: item.itemName,
      category: item.category,
      quantityReceived: String(item.quantityReceived),
      condition: item.condition ?? "",
      donorName: item.donorName ?? "",
      notes: item.notes ?? "",
    });
  }

  async function handleEditSave(id: string) {
    if (!editForm.itemName.trim()) {
      setError("Item name is required");
      return;
    }
    const qty = parseInt(editForm.quantityReceived, 10);
    if (isNaN(qty) || qty < 0) {
      setError("Quantity must be a non-negative number");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/bts/inventory", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            itemName: editForm.itemName.trim(),
            category: editForm.category,
            quantityReceived: qty,
            condition: editForm.condition || null,
            donorName: editForm.donorName || null,
            notes: editForm.notes || null,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error((data as { error?: string }).error ?? "Failed to update item");

        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  itemName: editForm.itemName.trim(),
                  category: editForm.category as InventoryItem["category"],
                  quantityReceived: qty,
                  quantityAvailable: Math.max(0, qty - item.quantityAssigned),
                  condition: editForm.condition || null,
                  donorName: editForm.donorName || null,
                  notes: editForm.notes || null,
                  updatedAt: new Date(),
                }
              : item,
          ),
        );
        setEditingId(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update item");
      }
    });
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      try {
        const res = await fetch("/api/bts/inventory", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error((data as { error?: string }).error ?? "Failed to delete item");

        setItems((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete item");
      }
    });
  }

  return (
    <div className="bts-fade-in-up bts-stagger-5 space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800 shadow-sm">
          {error}
        </div>
      )}

      {/* Add item toggle + form */}
      <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
        {!showAddForm ? (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="w-full rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100/50 px-4 py-3 text-sm font-bold text-cyan-700 transition-all hover:from-cyan-100 hover:to-cyan-100 min-h-[44px]"
          >
            + Add donation item
          </button>
        ) : (
          <form onSubmit={handleAdd} className="space-y-4">
            <h3 className="text-sm font-bold text-cyan-900">New Donation Item</h3>
            <div className="grid gap-1 sm:grid-cols-2">
              <Field label="Item name" required>
                <TextInput
                  value={addForm.itemName}
                  onChange={(e) => setAddForm({ ...addForm, itemName: e.target.value })}
                  placeholder="e.g. Mathematics textbook, pencils, backpack"
                />
              </Field>
              <Field label="Category">
                <Select
                  value={addForm.category}
                  onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Quantity received">
                <TextInput
                  type="number"
                  min={0}
                  value={addForm.quantityReceived}
                  onChange={(e) => setAddForm({ ...addForm, quantityReceived: e.target.value })}
                />
              </Field>
              <Field label="Donor name (optional)">
                <TextInput
                  value={addForm.donorName}
                  onChange={(e) => setAddForm({ ...addForm, donorName: e.target.value })}
                  placeholder="Person or organisation"
                />
              </Field>
              <Field label="Condition (optional)">
                <TextInput
                  value={addForm.condition}
                  onChange={(e) => setAddForm({ ...addForm, condition: e.target.value })}
                  placeholder="e.g. Brand new, slightly worn"
                />
              </Field>
              <Field label="Notes (optional)">
                <TextInput
                  value={addForm.notes}
                  onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                  placeholder="Any extra details"
                />
              </Field>
            </div>
            <div className="flex gap-3">
              <SubmitButton className={cn(pending && "opacity-60 cursor-not-allowed")}>
                {pending ? "Adding…" : "Add to inventory"}
              </SubmitButton>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setAddForm(emptyForm());
                }}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Inventory table */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-cyan-300 bg-cyan-50/30 p-12 text-center">
          <div className="mx-auto mb-4 opacity-30">
            <SchoolBookIcon className="h-16 w-16" />
          </div>
          <p className="text-sm text-gray-500">
            No inventory items yet. Add donated items to track what&rsquo;s available for distribution.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <p className="px-4 py-2 text-xs text-gray-400 border-b border-gray-100 sm:hidden">
            &larr; Swipe to see more columns &rarr;
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-cyan-50 to-cyan-50/50">
                <tr>
                  <Th>Item</Th>
                  <Th>Category</Th>
                  <Th>Received</Th>
                  <Th>Assigned</Th>
                  <Th>Available</Th>
                  <Th>Donor</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-cyan-50/40 transition-colors">
                    {editingId === item.id ? (
                      <EditRow
                        item={item}
                        form={editForm}
                        onFormChange={setEditForm}
                        onSave={() => handleEditSave(item.id)}
                        onCancel={() => setEditingId(null)}
                        pending={pending}
                      />
                    ) : (
                      <>
                        <td className="px-4 py-3 text-sm">
                          <div className="font-medium text-gray-900">{item.itemName}</div>
                          {item.condition && (
                            <div className="text-xs text-gray-400">{item.condition}</div>
                          )}
                          {item.notes && (
                            <div className="text-xs text-gray-400 mt-0.5">{item.notes}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={cn(
                            "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold",
                            CATEGORY_COLORS[item.category],
                          )}>
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {item.quantityReceived}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {item.quantityAssigned}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={cn(
                            "font-bold",
                            item.quantityAvailable > 0 ? "text-cyan-700" : "text-gray-400",
                          )}>
                            {item.quantityAvailable}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {item.donorName ?? "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(item)}
                              className="font-bold text-cyan-600 hover:text-cyan-800 transition-colors"
                            >
                              Edit
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              disabled={pending}
                              className={cn(
                                "font-bold text-red-500 hover:text-red-700 transition-colors",
                                pending && "opacity-60",
                              )}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-cyan-700">
      {children}
    </th>
  );
}

function EditRow({
  item,
  form,
  onFormChange,
  onSave,
  onCancel,
  pending,
}: {
  item: InventoryItem;
  form: AddFormState;
  onFormChange: (form: AddFormState) => void;
  onSave: () => void;
  onCancel: () => void;
  pending: boolean;
}) {
  return (
    <td colSpan={7} className="px-4 py-4 bg-cyan-50/30">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Item name" required>
          <TextInput
            value={form.itemName}
            onChange={(e) => onFormChange({ ...form, itemName: e.target.value })}
          />
        </Field>
        <Field label="Category">
          <Select
            value={form.category}
            onChange={(e) => onFormChange({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
        </Field>
        <Field label="Quantity received">
          <TextInput
            type="number"
            min={0}
            value={form.quantityReceived}
            onChange={(e) => onFormChange({ ...form, quantityReceived: e.target.value })}
          />
        </Field>
        <Field label="Condition (optional)">
          <TextInput
            value={form.condition}
            onChange={(e) => onFormChange({ ...form, condition: e.target.value })}
          />
        </Field>
        <Field label="Donor name (optional)">
          <TextInput
            value={form.donorName}
            onChange={(e) => onFormChange({ ...form, donorName: e.target.value })}
          />
        </Field>
        <Field label="Notes (optional)">
          <TextInput
            value={form.notes}
            onChange={(e) => onFormChange({ ...form, notes: e.target.value })}
          />
        </Field>
      </div>
      <div className="mt-3 flex gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={pending}
          className={cn(
            "rounded-md bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-cyan-700 transition-colors min-h-[44px]",
            pending && "opacity-60 cursor-not-allowed",
          )}
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
        >
          Cancel
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-400">
        {item.quantityAssigned} already assigned. Reducing below this will show negative availability.
      </p>
    </td>
  );
}