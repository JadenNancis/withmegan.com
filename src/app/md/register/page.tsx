"use client";

import { useState } from "react";
import Link from "next/link";
import { Field, TextInput, TextArea, Select, SubmitButton } from "@/components/form";
import { cn } from "@/lib/cn";

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
      <div className="space-y-6">
        <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white text-3xl font-bold">
            ✓
          </div>
          <h1 className="mt-4 text-2xl font-bold text-green-800">Registration successful</h1>
          <p className="mt-2 text-sm text-green-700">
            Thank you, {success.fullName}. Your registration has been recorded.
          </p>
          <div className="mt-6 rounded-lg bg-white p-4 border border-green-200">
            <p className="text-xs uppercase tracking-wide text-gray-500">Your THA ID</p>
            <p className="mt-1 text-2xl font-mono font-bold text-amber-700 select-all">{success.thaId}</p>
            <p className="mt-2 text-xs text-gray-500">
              Keep this ID safe &mdash; you&apos;ll need it for verification on event day.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/md"
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Back to home
          </Link>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            className="inline-flex justify-center rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
          >
            Register another person
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-6">
        <h1 className="text-2xl font-bold text-amber-900">Hamper Registration</h1>
        <p className="mt-2 text-sm text-amber-800">
          Register in advance for the Market Day community hamper distribution.
          Fields marked with <span className="text-red-500">*</span> are required.
        </p>
      </div>

      {submitError && (
        <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 space-y-0" noValidate>
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
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <span>
              I consent to the collection and use of my data for the purpose of this
              hamper distribution initiative. <span className="text-red-500">*</span>
            </span>
          </label>
          {errors.consent && <p className="mt-1 text-xs text-red-600">{errors.consent}</p>}
        </div>

        <div className="flex gap-3">
          <SubmitButton className={cn("bg-amber-500 hover:bg-amber-600")} >
            {submitting ? "Submitting…" : "Register"}
          </SubmitButton>
          <Link
            href="/md"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}