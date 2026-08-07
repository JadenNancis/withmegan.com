"use client";

import { useState } from "react";
import Link from "next/link";
import { Field, TextInput, Select, SubmitButton } from "@/components/form";
import { cn } from "@/lib/cn";
import { formatTtPhone, isValidTtPhone } from "@/lib/tt-phone";
import { TOBAGO_LOCATIONS, OTHER_LOCATION_VALUE } from "@/lib/tobago-locations";

type Errors = Partial<Record<string, string>>;

interface SuccessResult {
  thaId: string;
  fullName: string;
}

export function WalkInForm() {
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [consent, setConsent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessResult | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);

  function validate(): Errors {
    const e: Errors = {};
    if (!fullName.trim()) e.fullName = "Full name is required";
    if (!dateOfBirth.trim()) e.dateOfBirth = "Date of birth is required";
    if (!address) e.address = "Select a community";
    else if (address === OTHER_LOCATION_VALUE && !manualAddress.trim()) e.address = "Enter your community";
    if (!phoneNumber.trim()) e.phoneNumber = "Phone number is required";
    else if (!isValidTtPhone(phoneNumber)) e.phoneNumber = "Enter a valid TT number, e.g. (868) 123-4567";
    if (!consent) e.consent = "Consent is required to register";
    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setSubmitError(null);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setSubmitError("Please fix the highlighted fields.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName,
        dateOfBirth,
        address: address === OTHER_LOCATION_VALUE ? manualAddress : address,
        phoneNumber,
        consent,
      };
      const res = await fetch("/api/md/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { success?: boolean; thaId?: string; error?: string };
      if (res.ok && json.success && json.thaId) {
        setSuccess({ thaId: json.thaId, fullName });
        try {
          const qrRes = await fetch(`/api/qr?aid=${encodeURIComponent(json.thaId)}&site=md`);
          if (qrRes.ok) {
            const qrData = (await qrRes.json()) as { dataUrl?: string };
            if (qrData.dataUrl) setQrCode(qrData.dataUrl);
          }
        } catch {
          /* QR is nice-to-have */
        }
      } else {
        setSubmitError(json.error ?? "Registration failed. Please try again.");
      }
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setSuccess(null);
    setQrCode(null);
    setFullName("");
    setDateOfBirth("");
    setAddress("");
    setManualAddress("");
    setPhoneNumber("");
    setConsent(false);
    setErrors({});
    setSubmitError(null);
  }

  if (success) {
    return (
      <div className="rounded-2xl border-2 border-green-300 bg-gradient-to-br from-green-50 to-amber-50 p-6 shadow-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-lg">
          <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 10 20 L 17 27 L 30 13" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-green-800">Walk-In Registered</h2>
        <p className="mt-2 text-sm text-green-700">
          Thank you, {success.fullName}. Save this Application ID for hamper collection.
        </p>

        <div className="mt-5 rounded-xl bg-white p-5 border border-green-200 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Application ID</p>
          <p className="mt-1 text-2xl sm:text-3xl font-mono font-bold text-amber-700 select-all break-all">
            {success.thaId}
          </p>
          {qrCode && (
            <div className="mt-3 flex flex-col items-center gap-2">
              <img src={qrCode} alt="QR code for verification" className="rounded-lg shadow-sm" width={200} height={200} />
              <p className="text-xs text-gray-500">Scan at the distribution counter</p>
            </div>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Keep this ID safe. You&rsquo;ll need it for verification on event day.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={resetForm}
            className="md-animate-pulse-warm inline-flex items-center justify-center rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-amber-600 transition-colors min-h-[44px]"
          >
            Register Another Walk-In
          </button>
          <Link
            href="/md/admin"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
          >
            Back to Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <section className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-amber-900 border-b border-amber-100 pb-3 mb-4">
          Registrant
        </h2>
        <div className="grid gap-1 sm:grid-cols-2">
          <Field label="Full name" htmlFor="fullName" required error={errors.fullName}>
            <TextInput
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              placeholder="Jane Doe"
              className="text-lg"
            />
          </Field>
          <Field label="Date of birth" htmlFor="dateOfBirth" required error={errors.dateOfBirth}>
            <TextInput
              id="dateOfBirth"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              type="date"
              className="text-lg"
            />
          </Field>
          <Field label="Phone number" htmlFor="phoneNumber" required error={errors.phoneNumber}>
            <TextInput
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(formatTtPhone(e.target.value))}
              type="tel"
              autoComplete="tel"
              placeholder="(868) 123-4567"
              className="text-lg"
            />
          </Field>
          <Field label="Community" htmlFor="address" required error={errors.address}>
            <Select
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="text-lg"
            >
              <option value="">Select community…</option>
              {TOBAGO_LOCATIONS.filter((l) => l !== OTHER_LOCATION_VALUE).map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
              <option value={OTHER_LOCATION_VALUE}>{OTHER_LOCATION_VALUE}</option>
            </Select>
          </Field>
          {address === OTHER_LOCATION_VALUE && (
            <Field label="Specify community" htmlFor="manualAddress" required error={errors.address}>
              <TextInput
                id="manualAddress"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                placeholder="Enter community name"
                className="text-lg"
              />
            </Field>
          )}
        </div>
      </section>

      {/* Consent */}
      <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
        <label className="flex items-start gap-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-5 w-5 flex-none rounded border-gray-300 text-amber-600 focus:ring-amber-500"
          />
          <span>
            I confirm the registrant consents to data collection for the Market Day hamper distribution.{" "}
            <span className="text-red-500">*</span>
          </span>
        </label>
        {errors.consent && <p className="mt-1 text-xs text-red-600">{errors.consent}</p>}
      </div>

      {submitError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <SubmitButton
          className={cn(
            "min-h-[56px] px-8 text-lg bg-amber-500 hover:bg-amber-600 md-animate-pulse-warm",
            submitting && "opacity-60 cursor-not-allowed",
          )}
        >
          {submitting ? "Submitting…" : "Register Walk-In"}
        </SubmitButton>
        <Link
          href="/md/admin"
          className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}