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
      <div className="space-y-5 py-6">
        <div className="bts-fade-in-up flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-cyan-50 shadow-sm">
            <TobagoMapBadge className="h-9 w-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-cyan-900">Check your messages</h1>
          <p className="mt-2 max-w-md text-sm text-gray-600">
            If a registration exists for{" "}
            <span className="font-semibold text-cyan-900">{phone}</span>, we&rsquo;ve sent
            your Application ID by SMS{""} and email (if you gave us one).
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Still nothing after a few minutes?{" "}
            <Link href="/bts/register" className="font-semibold text-cyan-700 underline">
              Register again
            </Link>{" "}
            or ask a volunteer on event day.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header — coherent with other BTS subpages */}
      <div className="bts-fade-in-up flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-cyan-50 shadow-sm">
          <TobagoMapBadge className="h-9 w-9" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-cyan-900">Find my Application ID</h1>
        <p className="mt-2 max-w-md text-sm text-gray-600">
          Enter the phone number you registered with. If we have it on file, we&rsquo;ll
          text your ID and QR code.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bts-fade-in-up mx-auto max-w-md rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm space-y-4"
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
          className="w-full inline-flex min-h-[52px] items-center justify-center rounded-xl bg-cyan-600 px-6 text-base font-bold text-white shadow-sm hover:bg-cyan-700 transition-colors disabled:opacity-60"
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
