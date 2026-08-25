"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Collection-counter lookup. Unlike the QR scan flow (exact Application ID),
 * this accepts any search term — a family can be found by guardian name,
 * phone, email, National ID, Application ID, address, or even a child's name
 * or school. The server resolves an exact Application ID first, then falls
 * back to the any-field search.
 */
export function CollectionLookup({ initial }: { initial?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial ?? "");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) {
      setError("Enter a name, phone, email, National ID, Application ID, or school.");
      return;
    }
    setError(null);
    router.push(`/bts/admin/collection?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search name, phone, email, National ID, Application ID, or school…"
        autoFocus
        className="min-h-[48px] flex-1 rounded-xl border border-white/30 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 shadow-md focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-shadow"
      />
      <button
        type="submit"
        className="rounded-xl bg-cyan-600 px-6 py-3 text-base font-bold text-white shadow-md hover:bg-cyan-700 active:scale-95 transition-all min-h-[48px]"
      >
        Search
      </button>
      {error && <p className="text-sm text-red-300 sm:col-span-2">{error}</p>}
    </form>
  );
}
