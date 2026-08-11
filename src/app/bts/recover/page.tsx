"use client";

import { useState } from "react";
import Link from "next/link";
import { Field, TextInput } from "@/components/form";
import { formatTtPhone } from "@/lib/tt-phone";
import { TobagoMapBadge } from "@/components/bts-illustrations";
import { StaffOnlyBanner } from "@/components/staff-only-banner";

export default function BtsRecoverPage() {
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/bts/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not send right now. Try again shortly.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="-mx-4 -my-5 sm:-my-8 space-y-0">
        {/* Hero band — photo + glass veil, same rhythm as the progress page */}
        <section
          className="overflow-hidden bg-cover bg-center bg-no-repeat border-b border-white/10"
          style={{ backgroundImage: "url('/images/tobago/bts-child-reading.jpg')" }}
        >
          <div className="motion-safe:bts-fade-in-up bg-brand-950/70 backdrop-blur-md px-5 py-10 sm:py-12 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-cyan-50 shadow-sm">
              <TobagoMapBadge className="h-9 w-9" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">Check your messages</h1>
            <p className="mt-2 max-w-md text-sm text-brand-100 [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]">
              If a registration exists for{" "}
              <span className="font-semibold text-white">{phone}</span>, we&rsquo;ve sent
              your Application ID by SMS{""} and email (if you gave us one).
            </p>
          </div>
        </section>

        {/* Spacer — the page photo breathes here, like the progress page */}
        <section className="mx-auto max-w-md px-4 py-10 sm:py-12 text-center">
          <p className="text-sm text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]">
            Still nothing after a few minutes?{" "}
            <Link href="/bts/register" className="font-semibold text-white underline underline-offset-2 hover:text-brand-100 transition-colors min-h-[44px] inline-flex items-center">
              Register again
            </Link>{" "}
            or ask a volunteer on event day.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="-mx-4 -my-5 sm:-my-8 space-y-0">
      {/* Hero band — photo + glass veil, same rhythm as the progress page */}
      <section
        className="overflow-hidden bg-cover bg-center bg-no-repeat border-b border-white/10"
        style={{ backgroundImage: "url('/images/tobago/bts-child-reading.jpg')" }}
      >
        <div className="bg-brand-950/70 backdrop-blur-md px-5 py-10 sm:py-12 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-cyan-50 shadow-sm">
            <TobagoMapBadge className="h-9 w-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">Find my Application ID</h1>
          <p className="mt-3 max-w-md text-sm text-brand-100 [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]">
            Enter the phone number you registered with. If we have it on file, we&rsquo;ll
            text your ID and QR code.
          </p>
        </div>
      </section>

      {/* Spacer band — the Tobago photo shows through before the form */}
      <div className="h-12 sm:h-16" aria-hidden="true" />
      <section className="mx-auto max-w-md px-4 pb-10 sm:pb-12 space-y-6">
        <StaffOnlyBanner />
        <form
          onSubmit={handleSubmit}
          className="motion-safe:bts-fade-in-up rounded-2xl border border-brand-100 bg-white p-5 sm:p-6 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] space-y-4"
        >
          <Field label="Registered phone number" required>
            <TextInput
              value={phone}
              onChange={(e) => setPhone(formatTtPhone(e.target.value))}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(868) 123-4567"
              autoFocus
            />
          </Field>

          {error && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || phone.replace(/\D/g, "").length < 7}
            className="w-full inline-flex min-h-[56px] items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 text-base font-bold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/30 active:scale-95 disabled:opacity-60 disabled:pointer-events-none disabled:shadow-sm transition-all duration-150"
          >
            {submitting ? "Sending…" : "Text me my ID"}
          </button>
        </form>

        <p className="text-center">
          <Link
            href="/bts/register"
            className="text-xs font-semibold text-white underline underline-offset-2 [text-shadow:0_2px_8px_rgba(0,0,0,0.55)] hover:text-brand-100 transition-colors min-h-[44px] inline-flex items-center"
          >
            Haven&rsquo;t registered yet? Start registration
          </Link>
        </p>
      </section>
    </div>
  );
}
