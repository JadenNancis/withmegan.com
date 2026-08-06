"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

interface SearchBarProps {
  placeholder?: string;
  paramName?: string;
}

export function SearchBar({ placeholder = "Search…", paramName = "q" }: SearchBarProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(params.get(paramName) ?? "");
  }, [params, paramName]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    const url = q ? `?${paramName}=${encodeURIComponent(q)}` : "?";
    router.push(url);
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoFocus
        className="min-h-[44px] flex-1 rounded-md border border-gray-300 px-3 py-2.5 text-base sm:text-sm shadow-sm focus:border-transparent focus:ring-2 focus:ring-amber-500 focus:outline-none"
      />
      <button
        type="submit"
        className="min-h-[44px] rounded-md bg-amber-500 px-5 py-2.5 text-base sm:text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
      >
        Search
      </button>
    </form>
  );
}