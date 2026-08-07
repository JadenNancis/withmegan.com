"use client";

import { useState } from "react";
import Link from "next/link";
import { Field, TextInput } from "@/components/form";
import { formatTtPhone } from "@/lib/tt-phone";

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
      <div className="space-y-5 py-6 max-w-md mx-auto text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-white shadow-md">
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-title text-brand-900">Check your messages</h1>
        <p className="text-body text-gray-600">
          If a registration exists for{" "}
          <span className="font-semibold text-brand-900">{phone}</span>, we&rsquo;ve sent
          your Application ID by SMS{""} and email (if you gave us one).
        </p>
        <p className="text-sm text-gray-500">
          Still nothing after a few minutes?{" "}
          <Link href="/bts/register" className="font-semibold text-brand-700 underline">
            Register again
          </Link>{" "}
          or ask a volunteer on event day.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md mx-auto py-4">
      <header className="text-center">
        <h1 className="text-title text-brand-900">Find my Application ID</h1>
        <p className="mt-2 text-body text-gray-600">
          Enter the phone number you registered with. If we have it on file, we&rsquo;ll
          text your ID and QR code.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="rounded-card border border-brand-100 bg-white p-5 shadow-sm space-y-4"
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
          className="w-full inline-flex min-h-[52px] items-center justify-center rounded-xl bg-brand-600 px-6 text-base font-bold text-white shadow-sm hover:bg-brand-700 transition-colors disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Text me my ID"}
        </button>
      </form>

      <p className="text-center text-xs text-gray-500">
        Haven&rsquo;t registered yet?{" "}
        <Link href="/bts/register" className="font-semibold text-brand-700 underline">
          Start registration
        </Link>
      </p>
    </div>
  );
}
