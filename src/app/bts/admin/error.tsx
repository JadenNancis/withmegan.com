"use client";

import { useEffect } from "react";
import Link from "next/link";
import { DatabaseSyncButton } from "@/components/database-sync-button";

export default function BtsAdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[bts-admin-error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
          <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-white">Admin page error</h1>
        <p className="mt-2 text-sm text-white/70">
          This section could not be loaded. The live database may be missing
          the latest updates. Try again, or sync the database below.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-white/15 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/25 active:scale-95"
          >
            Try again
          </button>
          <Link
            href="/bts/admin"
            className="rounded-lg border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 active:scale-95"
          >
            Admin dashboard
          </Link>
        </div>
        <div className="text-left">
          <DatabaseSyncButton onSynced={reset} />
        </div>
      </div>
    </div>
  );
}