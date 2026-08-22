"use client";

import { useState } from "react";

interface MigrateResult {
  applied?: number;
  skipped?: number;
  errors?: number;
  results?: Array<{ status: string; migration: string; preview: string; detail?: string }>;
  error?: string;
}

/**
 * One-click fix for the "database may need a sync" admin error.
 *
 * The production DATABASE_URL is a Vercel-sensitive env var, so schema
 * updates can only be applied from inside the Vercel runtime via the
 * admin-only /api/admin/migrate endpoint. This button triggers it and then
 * reloads the page. Only an authenticated admin may run it.
 */
export function DatabaseSyncButton({ onSynced }: { onSynced?: () => void }) {
  const [state, setState] = useState<"idle" | "running" | "done" | "denied" | "failed">("idle");
  const [detail, setDetail] = useState("");

  async function sync() {
    setState("running");
    setDetail("");
    try {
      const res = await fetch("/api/admin/migrate", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as MigrateResult;
      if (res.status === 401) {
        setState("denied");
        setDetail(data.error ?? "Unauthorized");
        return;
      }
      if (!res.ok || (data.errors ?? 0) > 0) {
        const errs = (data.results ?? []).filter((r) => r.status === "error");
        setState("failed");
        setDetail(
          errs[0]?.detail ??
            data.error ??
            `Sync failed (HTTP ${res.status}).`,
        );
        return;
      }
      setState("done");
      setDetail(
        `${data.applied ?? 0} update${(data.applied ?? 0) === 1 ? "" : "s"} applied, ${data.skipped ?? 0} already current.`,
      );
      // Give the UI a beat to show the result, then reload the page.
      setTimeout(() => onSynced?.(), 600);
    } catch {
      setState("failed");
      setDetail("Could not reach the sync endpoint. Check your connection and try again.");
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-white/15 bg-white/10 p-4 text-left backdrop-blur-sm">
      <p className="text-sm font-semibold text-white">Need a hand?</p>
      <p className="mt-1 text-sm text-white/70">
        This page queries fields that may not be on the live database yet. If
        you are an administrator, one tap applies the pending schema updates
        and reloads.
      </p>

      {state === "idle" && (
        <button
          type="button"
          onClick={sync}
          className="mt-3 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-brand-900 transition-all hover:bg-white/90 active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
          </svg>
          Sync database
        </button>
      )}

      {state === "running" && (
        <p className="mt-3 inline-flex items-center gap-2 text-sm text-white/85">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
          Applying updates…
        </p>
      )}

      {state === "done" && (
        <p className="mt-3 rounded-lg bg-green-500/20 px-3 py-2 text-sm font-medium text-green-100">
          Database synced — {detail}
        </p>
      )}

      {state === "denied" && (
        <p className="mt-3 rounded-lg bg-amber-500/20 px-3 py-2 text-sm text-amber-100">
          Only an administrator can sync the database. Sign in as an admin and try again.
        </p>
      )}

      {state === "failed" && (
        <p className="mt-3 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-100">{detail}</p>
      )}
    </div>
  );
}
