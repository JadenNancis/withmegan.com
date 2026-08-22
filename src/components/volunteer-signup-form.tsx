"use client";

import { useCallback, useEffect, useState } from "react";
import { formatTtPhone } from "@/lib/tt-phone";
import { cn } from "@/lib/cn";

interface Shift {
  id: string;
  label: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
}

interface VolunteerSignupFormProps {
  site: "bts" | "md";
  accent: "cyan" | "amber";
  cta: string;
}

const ACCENT = {
  cyan: {
    label: "text-cyan-700",
    input: "focus:border-cyan-500 focus:ring-cyan-200",
    button: "bg-cyan-600 hover:bg-cyan-700 shadow-cyan-600/25",
  },
  amber: {
    label: "text-amber-700",
    input: "focus:border-amber-500 focus:ring-amber-200",
    button: "bg-amber-600 hover:bg-amber-700 shadow-amber-600/25",
  },
} as const;

export function VolunteerSignupForm({ site, accent, cta }: VolunteerSignupFormProps) {
  const a = ACCENT[accent];
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [shiftId, setShiftId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/volunteers?site=${site}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { shifts?: Shift[] } | null) => {
        if (!cancelled && data?.shifts) setShifts(data.shifts);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [site]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSubmitting(true);
      try {
        const res = await fetch("/api/volunteers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            site,
            fullName: name,
            email,
            phone,
            shiftId: shiftId || undefined,
          }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(data.error ?? "Could not save your sign-up. Try again.");
          return;
        }
        setDone(true);
      } catch {
        setError("Network error. Check your connection and try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [site, name, email, phone, shiftId],
  );

  if (done) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-md">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-green-900">Thank you for volunteering</h3>
        <p className="mt-2 text-sm text-green-800">
          Your sign-up has been received. Our team will confirm your shift and share the
          event-day details with you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="v-name" className={cn("block text-sm font-semibold", a.label)}>
          Full name
        </label>
        <input
          id="v-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          placeholder="Your full name"
          className={cn(
            "mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 min-h-[48px]",
            a.input,
          )}
        />
      </div>

      <div>
        <label htmlFor="v-email" className={cn("block text-sm font-semibold", a.label)}>
          Email
        </label>
        <input
          id="v-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={cn(
            "mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 min-h-[48px]",
            a.input,
          )}
        />
      </div>

      <div>
        <label htmlFor="v-phone" className={cn("block text-sm font-semibold", a.label)}>
          Phone number
        </label>
        <input
          id="v-phone"
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(formatTtPhone(e.target.value))}
          required
          autoComplete="tel"
          placeholder="(868) 123-4567"
          className={cn(
            "mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 min-h-[48px]",
            a.input,
          )}
        />
      </div>

      <div>
        <label htmlFor="v-shift" className={cn("block text-sm font-semibold", a.label)}>
          Preferred shift
        </label>
        <select
          id="v-shift"
          value={shiftId}
          onChange={(e) => setShiftId(e.target.value)}
          className={cn(
            "mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 min-h-[48px]",
            a.input,
          )}
        >
          <option value="">Flexible — any shift works for me</option>
          {shifts.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          You can be reassigned to the shift that needs you most.
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={cn(
          "w-full inline-flex min-h-[56px] items-center justify-center gap-2 rounded-xl px-6 text-base font-bold text-white shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-60 disabled:pointer-events-none transition-all duration-150",
          a.button,
        )}
      >
        {submitting ? "Signing up…" : cta}
      </button>
    </form>
  );
}
