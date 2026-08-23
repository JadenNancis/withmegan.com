"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

type Site = "bts" | "md";

async function postAction(site: Site, id: string, action: "delete" | "restore" | "purge") {
  const res = await fetch("/api/admin/registrants", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ site, id, action }),
  });
  const data = (await res.json()) as { ok?: boolean; message?: string; error?: string };
  if (!res.ok || !data.ok) throw new Error(data.error ?? "Action failed. Please try again.");
  return data.message ?? "Done.";
}

/**
 * Two-step destructive action: first tap arms the button ("Tap to confirm"),
 * second tap executes. Reduces accidental deletes on touch screens while
 * keeping the confirmation inline instead of a blocking browser dialog.
 */
function ConfirmButton({
  label,
  confirmLabel,
  onConfirm,
  className,
  busyText = "Working…",
}: {
  label: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
  className?: string;
  busyText?: string;
}) {
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (busy) return;
    if (!armed) {
      setArmed(true);
      setError(null);
      return;
    }
    setBusy(true);
    try {
      await onConfirm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed.");
      setArmed(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className={cn(
          "inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold transition-all active:scale-95 disabled:opacity-60",
          armed ? confirmClassName : className,
        )}
      >
        {busy ? busyText : armed ? confirmLabel : label}
      </button>
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </span>
  );
}

const confirmClassName =
  "bg-red-600 text-white shadow-md hover:bg-red-700";

/**
 * "Delete registration" — shown on registrant detail pages. Soft-deletes and
 * returns the staff member to the admin list.
 */
export function DeleteRegistrantButton({
  site,
  id,
  redirectTo,
  className,
}: {
  site: Site;
  id: string;
  redirectTo: string;
  className?: string;
}) {
  const router = useRouter();
  return (
    <ConfirmButton
      label="Delete registration"
      confirmLabel="Confirm delete?"
      busyText="Deleting…"
      className={cn(
        "border border-red-200 bg-white text-red-700 hover:bg-red-50",
        className,
      )}
      onConfirm={async () => {
        await postAction(site, id, "delete");
        router.push(redirectTo);
      }}
    />
  );
}

/**
 * Actions inside the hidden deleted tab: restore to active, or permanently
 * purge (admins only).
 */
export function DeletedRowActions({
  site,
  id,
  isAdmin,
}: {
  site: Site;
  id: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <ConfirmButton
        label="Restore"
        confirmLabel="Confirm restore?"
        className="border border-green-200 bg-white text-green-700 hover:bg-green-50"
        onConfirm={async () => {
          await postAction(site, id, "restore");
          router.refresh();
        }}
      />
      {isAdmin && (
        <ConfirmButton
          label="Delete forever"
          confirmLabel="Confirm erase?"
          busyText="Erasing…"
          className="border border-red-200 bg-white text-red-700 hover:bg-red-50"
          onConfirm={async () => {
            await postAction(site, id, "purge");
            router.refresh();
          }}
        />
      )}
    </span>
  );
}
