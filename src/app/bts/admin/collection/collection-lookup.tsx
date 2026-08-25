"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { extractApplicationId } from "@/lib/application-id";

/**
 * Collection-counter lookup. Mirrors the admin dashboard search: any field
 * is fair game (name, phone, email, address, National ID, child/school).
 * Scanning or pasting an Application ID still jumps straight to that family.
 */
export function CollectionLookup({ initial }: { initial?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial ?? "");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) {
      setError("Type a name, phone, email, address, National ID, or Application ID.");
      return;
    }
    setError(null);
    const aid = extractApplicationId(q);
    const query = aid ? `aid=${encodeURIComponent(aid)}` : `q=${encodeURIComponent(q)}`;
    router.push(`/bts/admin/collection?${query}`);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search any field — name, phone, email, address, National ID…"
          autoFocus
          className="min-h-[48px] flex-1 rounded-xl border border-white/30 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 shadow-md focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-shadow"
        />
        <button
          type="submit"
          className="rounded-xl bg-cyan-600 px-6 py-3 text-base font-bold text-white shadow-md hover:bg-cyan-700 active:scale-95 transition-all min-h-[48px]"
        >
          Search
        </button>
      </div>
      <p className="text-xs text-gray-500">
        Tip: scan or paste an Application ID to jump straight to that family.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
