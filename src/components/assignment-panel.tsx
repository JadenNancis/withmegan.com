"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { cn } from "@/lib/cn";

interface Household {
  id: string;
  reference: string;
  hamperStatus: "unassigned" | "assigned" | "redeemed";
  memberCount: number;
}

interface Applicant {
  id: string;
  thaId: string | null;
  fullName: string;
  address: string | null;
  createdAt: string;
}

const statusDot: Record<string, string> = {
  unassigned: "bg-gray-400",
  assigned: "bg-amber-500",
  redeemed: "bg-green-500",
};

export function AssignmentPanel({
  applicants: initialApplicants,
  households: initialHouseholds,
}: {
  applicants: Applicant[];
  households: Household[];
}) {
  const [applicants, setApplicants] = useState(initialApplicants);
  const [households, setHouseholds] = useState(initialHouseholds);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function flash(message: string) {
    setMsg(message);
    setTimeout(() => setMsg(null), 3000);
  }

  function assign(applicant: Applicant, householdId: string) {
    const household = households.find((h) => h.id === householdId);
    if (!household) return;

    // Optimistic update
    setApplicants((prev) => prev.filter((a) => a.id !== applicant.id));
    setHouseholds((prev) =>
      prev.map((h) =>
        h.id === householdId
          ? {
              ...h,
              memberCount: h.memberCount + 1,
              hamperStatus: h.hamperStatus === "unassigned" ? "assigned" : h.hamperStatus,
            }
          : h,
      ),
    );

    startTransition(async () => {
      try {
        const res = await fetch("/api/md/households", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ registrantId: applicant.id, householdId }),
        });
        const json = (await res.json()) as { success?: boolean; error?: string };
        if (!res.ok || !json.success) {
          // Revert
          setApplicants((prev) => [...prev, applicant]);
          setHouseholds((prev) =>
            prev.map((h) =>
              h.id === householdId
                ? {
                    ...h,
                    memberCount: Math.max(0, h.memberCount - 1),
                    hamperStatus: h.memberCount === 0 ? "unassigned" : h.hamperStatus,
                  }
                : h,
            ),
          );
          setError(json.error ?? "Failed to assign");
        } else {
          flash(`${applicant.fullName} → ${household.reference}`);
        }
      } catch {
        // Revert
        setApplicants((prev) => [...prev, applicant]);
        setHouseholds((prev) =>
          prev.map((h) =>
            h.id === householdId
              ? {
                  ...h,
                  memberCount: Math.max(0, h.memberCount - 1),
                  hamperStatus: h.memberCount === 0 ? "unassigned" : h.hamperStatus,
                }
              : h,
          ),
        );
        setError("Network error");
      }
    });
  }

  if (applicants.length === 0) {
    return (
      <div className="md-animate-fade-in-up rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/50 to-white p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-600">All applicants assigned</p>
        <p className="mt-1 text-xs text-amber-700">Every registrant has a household.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {msg && (
        <div className="md-animate-fade-in-up rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-amber-50 px-3 py-2 text-sm font-medium text-green-700">
          {msg}
        </div>
      )}

      <div className="space-y-2.5">
        {applicants.map((a) => (
          <ApplicantCard
            key={a.id}
            applicant={a}
            households={households}
            disabled={pending}
            onAssign={(hid) => assign(a, hid)}
          />
        ))}
      </div>
    </div>
  );
}

function ApplicantCard({
  applicant,
  households,
  disabled,
  onAssign,
}: {
  applicant: Applicant;
  households: Household[];
  disabled: boolean;
  onAssign: (householdId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setExpanded(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered = query.trim()
    ? households.filter((h) =>
        h.reference.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : households;

  // Sort: unassigned households first (available), then by reference
  const sorted = [...filtered].sort((a, b) => {
    if (a.hamperStatus === "redeemed" && b.hamperStatus !== "redeemed") return 1;
    if (b.hamperStatus === "redeemed" && a.hamperStatus !== "redeemed") return -1;
    return a.reference.localeCompare(b.reference);
  });

  return (
    <div
      ref={ref}
      className="md-animate-fade-in-up rounded-xl border border-amber-200/70 bg-white shadow-sm transition-all hover:shadow-md"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Avatar circle */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 text-sm font-bold text-amber-700">
          {applicant.fullName.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900">{applicant.fullName}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-xs text-amber-600">{applicant.thaId ?? "No ID"}</span>
            {applicant.address && (
              <>
                <span className="text-gray-300 text-xs">·</span>
                <span className="truncate text-xs text-gray-500">{applicant.address}</span>
              </>
            )}
          </div>
        </div>

        {/* Assign button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setExpanded((v) => !v)}
          className={cn(
            "shrink-0 inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-all",
            expanded
              ? "bg-amber-600 text-white"
              : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100",
            disabled && "opacity-50",
          )}
        >
          {expanded ? "Cancel" : "Assign"}
        </button>
      </div>

      {/* Household picker — slides down */}
      {expanded && (
        <div className="border-t border-amber-100 px-4 pb-4 pt-3 md-animate-fade-in-up">
          {/* Search */}
          <div className="relative mb-2.5">
            <svg
              viewBox="0 0 24 24"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search household reference…"
              className="w-full rounded-lg border border-amber-200 bg-amber-50/30 py-2 pl-9 pr-3 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none"
              autoFocus
            />
          </div>

          {/* Household list — max height with scroll */}
          <div className="max-h-48 overflow-y-auto rounded-lg border border-amber-100 bg-white">
            {sorted.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-gray-400">No households found.</p>
            ) : (
              sorted.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onAssign(h.id);
                    setExpanded(false);
                    setQuery("");
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-amber-50 disabled:opacity-50 border-b border-amber-50 last:border-0"
                >
                  {/* Status dot */}
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", statusDot[h.hamperStatus])} />

                  {/* Reference */}
                  <span className="flex-1 font-mono text-sm font-medium text-gray-800">
                    {h.reference}
                  </span>

                  {/* Member count badge */}
                  <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                    {h.memberCount} {h.memberCount === 1 ? "member" : "members"}
                  </span>

                  {/* Arrow */}
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 shrink-0 text-amber-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              ))
            )}
          </div>

          <p className="mt-2 text-center text-xs text-gray-400">
            Tap a household to assign instantly
          </p>
        </div>
      )}
    </div>
  );
}