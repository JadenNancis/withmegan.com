"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      {/* This boundary renders outside SiteShell, so there is no background
          photo or legibility scrim behind it. The card supplies its own
          opaque surface so the copy is readable on any backdrop. */}
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 text-center shadow-xl">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Something went wrong</h1>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
          We hit an unexpected error loading this page. Try again, or return to the home page.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-gray-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 active:scale-95"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-gray-300 px-5 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50 active:scale-95"
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
}