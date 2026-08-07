"use client";

import { useState } from "react";
import Link from "next/link";
import { Field, TextInput } from "@/components/form";
import { formatTtPhone } from "@/lib/tt-phone";
import { TobagoMapBadge } from "@/components/bts-illustrations";

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
      <div className="space-y-5">
        <div className="-mx-4 -mt-6 sm:-mt-8 px-4 pt-8 pb-6 bg-gradient-to-b from-brand-800 to-transparent">
          <div className="bts-fade-in-up flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-cyan-50 shadow-sm">
              <TobagoMapBadge className="h-9 w-9" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Check your messages</h1>
            <p className="mt-2 max-w-md text-sm text-brand-100">
              If a registration exists for{" "}
              <span className="font-semibold text-white">{phone}</span>, we&rsquo;ve sent
              your Application ID by SMS{""} and email (if you gave us one).
            </p>
            <p className="mt-3 text-sm text-brand-200">
              Still nothing after a few minutes?{" "}
              <Link href="/bts/register" className="font-semibold text-white underline">
                Register again
              </Link>{" "}
              or ask a volunteer on event day.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header — photo + gradient, coherent with other BTS subpages */}
      <div
        className="-mx-4 -mt-6 sm:-mt-8 overflow-hidden bg-cover bg-center bg-no-repeat opacity-90"
        style={{ backgroundImage: "url('/images/tobago/bts-child-reading.jpg')" }}
      >
        <div className="bg-brand-900/50 backdrop-blur-sm px-4 pt-10 pb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-cyan-50 shadow-sm">
            <TobagoMapBadge className="h-9 w-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Find my Application ID</h1>
          <p className="mt-3 max-w-md text-sm text-brand-100">
            Enter the phone number you registered with. If we have it on file, we&rsquo;ll
            text your ID and QR code.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bts-fade-in-up mx-auto max-w-md rounded-2xl border border-brand-100 bg-white p-6 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] space-y-4"
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
          className="w-full inline-flex min-h-[56px] items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 text-base font-bold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/30 hover:-translate-y-px active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none disabled:shadow-sm transition-all duration-150"
        >
          {submitting ? "Sending…" : "Text me my ID"}
        </button>
      </form>

      <p className="text-center text-xs text-gray-500">
        Haven&rsquo;t registered yet?{" "}
        <Link href="/bts/register" className="font-semibold text-cyan-700 underline">
          Start registration
        </Link>
      </p>
    </div>
  );
}
