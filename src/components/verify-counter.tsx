"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { cn } from "@/lib/cn";

interface SearchResult {
  id: string;
  thaId: string | null;
  fullName: string;
  nationalId: string | null;
  dateOfBirth: string | null;
  address: string;
  phoneNumber: string;
  status: "registered" | "redeemed";
  redeemedAt: string | null;
  redeemedBy: string | null;
}

interface RedeemResponse {
  success?: boolean;
  error?: string;
  redeemedAt?: string | null;
  redeemedBy?: string | null;
  registrant?: {
    id: string;
    thaId: string | null;
    fullName: string;
    redeemedAt: string | null;
    redeemedBy: string | null;
  };
}

type Feedback =
  | { kind: "idle" }
  | { kind: "success"; message: string; detail?: string }
  | { kind: "blocked"; message: string; detail?: string }
  | { kind: "error"; message: string; detail?: string };

export function VerifyCounter() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({ kind: "idle" });
  const [pending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  async function runSearch(q: string) {
    if (!q.trim()) {
      setResults([]);
      setSelected(null);
      setFeedback({ kind: "idle" });
      return;
    }
    setSearching(true);
    try {
      const res = await fetch("/api/md/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q.trim() }),
      });
      const json = (await res.json()) as { results?: SearchResult[]; error?: string };
      if (res.ok && json.results) {
        setResults(json.results);
        if (json.results.length === 1) {
          setSelected(json.results[0]);
          setFeedback({ kind: "idle" });
        } else {
          setSelected(null);
        }
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  function onQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(value), 300);
  }

  function clearAll() {
    setQuery("");
    setResults([]);
    setSelected(null);
    setFeedback({ kind: "idle" });
  }

  function redeem(registrantId: string) {
    setFeedback({ kind: "idle" });
    startTransition(async () => {
      try {
        const res = await fetch("/api/md/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ registrantId }),
        });
        const json = (await res.json()) as RedeemResponse;
        if (res.ok && json.success) {
          const when = json.registrant?.redeemedAt
            ? new Date(json.registrant.redeemedAt).toLocaleString("en-TT")
            : "";
          setFeedback({
            kind: "success",
            message: "HAMPER AUTHORIZED",
            detail: `${json.registrant?.thaId ?? ""} · ${when}`,
          });
          setSelected((prev) =>
            prev
              ? { ...prev, status: "redeemed", redeemedAt: json.registrant?.redeemedAt ?? null, redeemedBy: json.registrant?.redeemedBy ?? null }
              : prev,
          );
        } else if (res.status === 409) {
          const when = json.redeemedAt ? new Date(json.redeemedAt).toLocaleString("en-TT") : "previously";
          setFeedback({
            kind: "blocked",
            message: "ALREADY REDEEMED",
            detail: `Redeemed ${when}`,
          });
          setSelected((prev) =>
            prev
              ? { ...prev, status: "redeemed", redeemedAt: json.redeemedAt ?? null, redeemedBy: json.redeemedBy ?? null }
              : prev,
          );
        } else if (res.status === 401) {
          setFeedback({ kind: "error", message: "You must be signed in to redeem." });
        } else {
          setFeedback({ kind: "error", message: json.error ?? "Redemption failed" });
        }
      } catch {
        setFeedback({ kind: "error", message: "Network error" });
      }
    });
  }

  const canRedeem = selected && selected.status !== "redeemed";

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="md-animate-fade-in-up rounded-xl border-2 border-amber-200 bg-white p-4 sm:p-6 shadow-sm">
        <label htmlFor="verify-search" className="block text-sm font-semibold text-amber-800 mb-2">
          Search by name, Application ID, or phone
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="verify-search"
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Scan barcode or type name / ID…"
            autoFocus
            className="flex-1 rounded-lg border-2 border-amber-200 px-4 py-3 text-lg focus:border-transparent focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={clearAll}
            className="rounded-lg border border-amber-300 bg-amber-50 px-5 py-3 text-base font-semibold text-amber-800 hover:bg-amber-100 transition-colors"
          >
            Clear
          </button>
        </div>
        {searching && <p className="mt-2 text-sm text-amber-600">Searching…</p>}
      </div>

      {/* Results list (when multiple) */}
      {results.length > 1 && !selected && (
        <div className="md-animate-fade-in-up rounded-xl border border-amber-200 bg-white divide-y divide-amber-50 shadow-sm">
          {results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setSelected(r);
                setFeedback({ kind: "idle" });
              }}
              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left hover:bg-amber-50 active:bg-amber-50 transition-colors min-h-[56px]"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">{r.fullName}</p>
                <p className="text-xs font-mono text-amber-700 mt-0.5">{r.thaId ?? "N/A"}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                  r.status === "redeemed"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600",
                )}
              >
                {r.status}
              </span>
            </button>
          ))}
        </div>
      )}

      {results.length === 0 && query.trim() && !searching && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">No matches for &ldquo;{query}&rdquo;</p>
        </div>
      )}

      {/* Selected registrant card */}
      {selected && (
        <div className="md-animate-fade-in-up rounded-xl border-2 border-amber-200 bg-white p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <div className="space-y-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 break-words">{selected.fullName}</h2>
              <p className="font-mono text-sm text-amber-700 break-all">{selected.thaId ?? "No Application ID"}</p>
            </div>
            <span
              className={cn(
                "inline-block self-start rounded-full px-3 py-1 text-sm font-semibold",
                selected.status === "redeemed"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600",
              )}
            >
              {selected.status}
            </span>
          </div>

          <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div>
              <dt className="text-xs uppercase text-gray-400">National ID</dt>
              <dd className="text-gray-700">{selected.nationalId ?? "N/A"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-gray-400">Date of birth</dt>
              <dd className="text-gray-700">{selected.dateOfBirth ?? "N/A"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-gray-400">Phone</dt>
              <dd className="text-gray-700">{selected.phoneNumber}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-gray-400">Address</dt>
              <dd className="text-gray-700">{selected.address}</dd>
            </div>
          </dl>

          {/* Already redeemed warning */}
          {selected.status === "redeemed" && (
            <div className="mt-4 rounded-lg border-2 border-green-400 bg-green-50 p-4">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-green-600 flex-none" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-base font-bold text-green-700">
                  Hamper already collected
                </p>
              </div>
              <p className="mt-1 text-sm text-green-600">
                Collected {selected.redeemedAt ? new Date(selected.redeemedAt).toLocaleString("en-TT") : "previously"}
                {selected.redeemedBy ? ` by ${selected.redeemedBy}` : ""}
              </p>
            </div>
          )}

          {/* Authorize button */}
          {canRedeem && (
            <button
              type="button"
              onClick={() => redeem(selected.id)}
              disabled={pending}
              className={cn(
                "mt-6 w-full rounded-xl px-6 py-5 text-xl font-bold text-white shadow-lg transition-all",
                "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 active:scale-95",
                "disabled:opacity-50",
              )}
            >
              {pending ? "Authorizing…" : "✓ Authorize Hamper"}
            </button>
          )}
        </div>
      )}

      {/* Big feedback banner with animated icons */}
      {feedback.kind !== "idle" && (
        <div
          className={cn(
            "md-animate-fade-in-up rounded-xl p-5 sm:p-6 text-center shadow-lg",
            feedback.kind === "success" && "border-2 border-green-500 bg-gradient-to-br from-green-50 to-amber-50",
            feedback.kind === "blocked" && "border-2 border-red-500 bg-red-50",
            feedback.kind === "error" && "border-2 border-gray-400 bg-gray-100",
          )}
        >
          <p
            className={cn(
              "text-xl sm:text-3xl font-bold flex items-center justify-center gap-2 sm:gap-3",
              feedback.kind === "success" && "text-green-700",
              feedback.kind === "blocked" && "text-red-700",
              feedback.kind === "error" && "text-gray-800",
            )}
          >
            {feedback.kind === "success" && (
              <svg viewBox="0 0 40 40" className="w-8 h-8 sm:w-10 sm:h-10 flex-none md-animate-celebrate" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M 10 20 L 17 27 L 30 13" />
              </svg>
            )}
            {feedback.kind === "blocked" && (
              <svg viewBox="0 0 40 40" className="w-8 h-8 sm:w-10 sm:h-10 flex-none md-animate-celebrate" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
                <path d="M 10 10 L 30 30 M 30 10 L 10 30" />
              </svg>
            )}
            {feedback.kind === "error" && (
              <span className="flex-none">⚠</span>
            )}
            <span className="break-words">{feedback.message}</span>
          </p>
          {feedback.detail && (
            <p
              className={cn(
                "mt-2 text-sm sm:text-base break-words",
                feedback.kind === "success" && "text-green-700",
                feedback.kind === "blocked" && "text-red-700",
                feedback.kind === "error" && "text-gray-700",
              )}
            >
              {feedback.detail}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
