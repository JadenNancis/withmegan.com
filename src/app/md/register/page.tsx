"use client";

import { useState } from "react";
import Link from "next/link";
import { Field, TextInput, TextArea, Select, SubmitButton } from "@/components/form";
import { cn } from "@/lib/cn";
import { BasketIcon, FloatingProduce, SunsetWaveDivider } from "@/components/md-illustrations";

type Errors = Partial<Record<string, string>>;

interface SuccessResult {
  thaId: string;
  fullName: string;
}

export default function MdRegisterPage() {
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<SuccessResult | null>(null);

  function validate(data: FormData): Errors {
    const e: Errors = {};
    if (!String(data.get("fullName") ?? "").trim()) e.fullName = "Full name is required";
    if (!String(data.get("dateOfBirth") ?? "").trim()) e.dateOfBirth = "Date of birth is required";
    if (!String(data.get("address") ?? "").trim()) e.address = "Address is required";
    if (!String(data.get("phoneNumber") ?? "").trim()) e.phoneNumber = "Phone number is required";
    const email = String(data.get("email") ?? "").trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email address";
    if (data.get("consent") !== "on") e.consent = "You must consent to data collection to register";
    return e;
  }

  async function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setSubmitError(null);
    const form = ev.currentTarget;
    const data = new FormData(form);
    const e = validate(data);
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/md/register", {
        method: "POST",
        body: data,
      });
      const json = (await res.json()) as { success?: boolean; thaId?: string; error?: string };
      if (res.ok && json.success && json.thaId) {
        setSuccess({ thaId: json.thaId, fullName: String(data.get("fullName")) });
      } else {
        setSubmitError(json.error ?? "Registration failed. Please try again.");
      }
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="relative space-y-6 overflow-hidden">
        {/* Floating celebration elements */}
        <FloatingProduce className="absolute top-20 left-4 w-12 h-12 opacity-30 md-animate-float" />
        <FloatingProduce className="absolute top-32 right-8 w-10 h-10 opacity-25 md-animate-float-slow" />
        <FloatingProduce className="absolute top-48 left-12 w-8 h-8 opacity-20 md-animate-float" />

        <div className="relative rounded-2xl border-2 border-green-300 bg-gradient-to-br from-green-50 to-amber-50 p-6 sm:p-8 text-center shadow-lg overflow-hidden">
          <div className="md-animate-celebrate mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-white shadow-lg">
            <svg viewBox="0 0 40 40" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 10 20 L 17 27 L 30 13" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-green-800 md-animate-fade-in-up md-delay-1">Registration successful</h1>
          <p className="mt-2 text-sm text-green-700 md-animate-fade-in-up md-delay-2">
            Thank you, {success.fullName}. Your registration has been recorded.
          </p>
          <div className="mt-6 rounded-xl bg-white p-5 border border-green-200 shadow-sm md-animate-fade-in-up md-delay-3">
            <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Your THA ID</p>
            <p className="mt-1 text-2xl sm:text-3xl font-mono font-bold text-amber-700 select-all break-all">{success.thaId}</p>
            <p className="mt-2 text-xs text-gray-500">
              Keep this ID safe &mdash; you&apos;ll need it for verification on event day.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center md-animate-fade-in-up md-delay-4">
          <Link
            href="/md"
            className="inline-flex justify-center min-h-[44px] items-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to home
          </Link>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            className="md-animate-pulse-warm inline-flex justify-center min-h-[44px] items-center rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
          >
            Register another person
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Animated header */}
      <div className="relative overflow-hidden rounded-2xl md-hero-shimmer shadow-lg">
        <div className="flex items-center gap-4 px-6 py-6">
          <BasketIcon className="w-14 h-14 flex-none drop-shadow-lg md-animate-basket-sway" />
          <div className="text-white">
            <h1 className="text-2xl font-bold drop-shadow md-animate-fade-in-up">Hamper Registration</h1>
            <p className="mt-1 text-sm text-amber-50 drop-shadow md-animate-fade-in-up md-delay-1">
              Register in advance for the Market Day community hamper distribution.
              Fields marked with <span className="text-red-100 font-bold">*</span> are required.
            </p>
          </div>
        </div>
        <SunsetWaveDivider className="w-full h-[24px] block opacity-70" />
      </div>

      {submitError && (
        <div className="md-animate-fade-in-up rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="md-animate-fade-in-up md-delay-1 rounded-2xl border border-amber-200 bg-white p-6 space-y-0 shadow-sm" noValidate>
        <Field label="Full name" htmlFor="fullName" required error={errors.fullName}>
          <TextInput id="fullName" name="fullName" autoComplete="name" placeholder="Jane Doe" />
        </Field>

        <Field label="National ID or other identifier" htmlFor="nationalId" error={errors.nationalId}>
          <TextInput id="nationalId" name="nationalId" placeholder="Optional" />
        </Field>

        <Field label="Date of birth" htmlFor="dateOfBirth" required error={errors.dateOfBirth}>
          <TextInput id="dateOfBirth" name="dateOfBirth" type="date" />
        </Field>

        <Field label="Address / community" htmlFor="address" required error={errors.address}>
          <TextArea id="address" name="address" rows={2} placeholder="Mount St. George / Goodwood" />
        </Field>

        <Field label="Phone number" htmlFor="phoneNumber" required error={errors.phoneNumber}>
          <TextInput id="phoneNumber" name="phoneNumber" type="tel" autoComplete="tel" placeholder="1-868-xxx-xxxx" />
        </Field>

        <Field label="Email address" htmlFor="email" error={errors.email}>
          <TextInput id="email" name="email" type="email" autoComplete="email" placeholder="Optional" />
        </Field>

        <Field label="Market-related category / product type" htmlFor="productCategory">
          <Select id="productCategory" name="productCategory" defaultValue="">
            <option value="">— None selected —</option>
            <option value="produce">Fresh produce</option>
            <option value="dry-goods">Dry goods</option>
            <option value="household">Household essentials</option>
            <option value="other">Other</option>
          </Select>
        </Field>

        <Field label="Household reference" htmlFor="householdReference">
          <TextInput id="householdReference" name="householdReference" placeholder="e.g. HH-0001 (if you already have one)" />
        </Field>

        <div className="mb-6 mt-4">
          <label className="flex items-start gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              name="consent"
              className="mt-1 h-5 w-5 flex-none rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <span>
              I consent to the collection and use of my data for the purpose of this
              hamper distribution initiative. <span className="text-red-500">*</span>
            </span>
          </label>
          {errors.consent && <p className="mt-1 text-xs text-red-600">{errors.consent}</p>}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <SubmitButton className={cn("min-h-[44px] bg-amber-500 hover:bg-amber-600 md-animate-pulse-warm")} >
            {submitting ? "Submitting…" : "Register"}
          </SubmitButton>
          <Link
            href="/md"
            className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}