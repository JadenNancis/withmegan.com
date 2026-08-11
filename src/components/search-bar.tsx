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
      {/* Frosted-glass input: stays legible against any photo background
          while still letting the photo peek through. min-w-0 lets flexbox
          shrink it instead of letting the long placeholder clip the box. */}
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoFocus
        className="min-h-[44px] min-w-0 flex-1 rounded-xl border border-white/40 bg-white/85 backdrop-blur-sm px-3.5 py-2.5 text-base sm:text-sm text-gray-900 placeholder:text-gray-500 shadow-[0_2px_8px_rgba(0,0,0,0.18)] focus:border-transparent focus:bg-white/95 focus:ring-2 focus:ring-amber-400 focus:outline-none transition-colors"
      />
      <button
        type="submit"
        className="min-h-[44px] rounded-xl bg-amber-600 px-5 py-2.5 text-base sm:text-sm font-semibold text-white shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:bg-amber-700 active:scale-95 transition-all"
      >
        Search
      </button>
    </form>
  );
}