"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { extractApplicationId } from "@/lib/application-id";

export function CollectionLookup({ initial }: { initial?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial ?? "");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const aid = extractApplicationId(value);
    if (!aid) {
      setError("Enter a valid Application ID, e.g. BTS-260806-ABC123.");
      return;
    }
    setError(null);
    router.push(`/bts/admin/collection?aid=${encodeURIComponent(aid)}`);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type or scan an Application ID…"
        autoFocus
        className="min-h-[48px] flex-1 rounded-xl border border-white/30 bg-white px-4 py-3 text-base font-mono text-gray-900 placeholder:text-gray-500 shadow-md focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-shadow"
      />
      <button
        type="submit"
        className="rounded-xl bg-cyan-600 px-6 py-3 text-base font-bold text-white shadow-md hover:bg-cyan-700 active:scale-95 transition-all min-h-[48px]"
      >
        Look up
      </button>
      {error && <p className="text-sm text-red-300 sm:col-span-2">{error}</p>}
    </form>
  );
}
