"use client";

import { useState } from "react";
import Link from "next/link";
import { Field, TextInput, TextArea, Select, SubmitButton } from "@/components/form";
import { cn } from "@/lib/cn";
import { BasketIcon, FloatingProduce } from "@/components/md-illustrations";
import { TOBAGO_LOCATIONS, OTHER_LOCATION_VALUE } from "@/lib/tobago-locations";
import { formatTtPhone, isValidTtPhone } from "@/lib/tt-phone";

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
  const [qrCode, setQrCode] = useState<string | null>(null);

  // Controlled fields
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [householdReference, setHouseholdReference] = useState("");
  const [consent, setConsent] = useState(false);

  function validate(): Errors {
    const e: Errors = {};
    if (!fullName.trim()) e.fullName = "Full name is required";
    if (!dateOfBirth.trim()) e.dateOfBirth = "Date of birth is required";
    if (!address) e.address = "Select your community";
    else if (address === OTHER_LOCATION_VALUE && !manualAddress.trim())
      e.address = "Enter your community";
    if (!phoneNumber.trim()) e.phoneNumber = "Phone number is required";
    else if (!isValidTtPhone(phoneNumber)) e.phoneNumber = "Enter a valid TT number, e.g. (868) 123-4567";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email address";
    if (!consent) e.consent = "You must consent to data collection to register";
    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setSubmitError(null);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
        const payload = {
        fullName,
        nationalId: nationalId || undefined,
        dateOfBirth,
        address: address === OTHER_LOCATION_VALUE ? manualAddress : address,
        phoneNumber,
        email: email || undefined,
        productCategory: productCategory || undefined,
        householdReference: householdReference || undefined,
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
        // Fetch QR code
        try {
          const qrRes = await fetch(`/api/qr?aid=${encodeURIComponent(json.thaId)}&site=md`);
          if (qrRes.ok) {
            const qrData = await qrRes.json() as { dataUrl?: string };
            if (qrData.dataUrl) setQrCode(qrData.dataUrl);
          }
        } catch { /* QR is nice-to-have */ }
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
      <div className="relative space-y-5 overflow-hidden sm:space-y-6">
        {/* Floating celebration elements */}
        <FloatingProduce className="absolute top-20 left-4 w-12 h-12 opacity-30 motion-safe:md-animate-float" />
        <FloatingProduce className="absolute top-32 right-8 w-10 h-10 opacity-25 motion-safe:md-animate-float-slow" />
        <FloatingProduce className="absolute top-48 left-12 w-8 h-8 opacity-20 motion-safe:md-animate-float" />

        <div className="relative rounded-2xl border-2 border-green-300 bg-gradient-to-br from-green-50 to-amber-50 p-5 sm:p-8 text-center shadow-lg overflow-hidden">
          <div className="motion-safe:md-animate-celebrate mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-white shadow-lg">
            <svg viewBox="0 0 40 40" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 10 20 L 17 27 L 30 13" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-green-800 motion-safe:md-animate-fade-in-up motion-safe:md-delay-1">Registration successful</h1>
          <p className="mt-2 text-sm text-green-700 motion-safe:md-animate-fade-in-up motion-safe:md-delay-2">
            Thank you, {success.fullName}. Your registration has been recorded.
          </p>
          <div className="mt-6 rounded-xl bg-white p-5 border border-green-200 shadow-sm motion-safe:md-animate-fade-in-up motion-safe:md-delay-3">
            <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Your Application ID</p>
            <p className="mt-1 text-2xl sm:text-3xl font-mono font-bold text-amber-700 select-all break-all">{success.thaId}</p>
            {qrCode && (
              <div className="mt-3 flex flex-col items-center gap-2">
                <img src={qrCode} alt="QR code for verification" className="rounded-lg shadow-sm w-40 h-40 sm:w-[180px] sm:h-[180px]" width={180} height={180} />
                <p className="text-xs text-gray-500">Scan this at the distribution counter on event day</p>
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Keep this ID safe. You&apos;ll need it for verification on event day.
            </p>
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-center motion-safe:md-animate-fade-in-up motion-safe:md-delay-4">
          <Link
            href="/md"
            className="inline-flex justify-center min-h-[52px] items-center rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
          >
            Back to home
          </Link>
          <button
            type="button"
            onClick={() => {
              setSuccess(null);
              setFullName("");
              setNationalId("");
              setDateOfBirth("");
              setAddress("");
              setManualAddress("");
              setPhoneNumber("");
              setEmail("");
              setProductCategory("");
              setHouseholdReference("");
              setConsent(false);
            }}
            className="motion-safe:md-animate-pulse-warm inline-flex justify-center min-h-[52px] items-center rounded-xl bg-amber-500 px-5 text-sm font-semibold text-white hover:bg-amber-600 active:scale-95 transition-all"
          >
            Register another person
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Animated header — frosted-glass plate over the shimmer keeps copy
          legible at any screen width while staying on-brand. */}
      <div className="relative overflow-hidden rounded-2xl md-hero-shimmer shadow-lg">
        {/* Soft dark scrim behind the text plate (right side where copy sits) so
            white stays legible as the shimmer gradient sweeps through its
            lightest amber (which would otherwise wash out white). */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-l from-amber-900/45 via-amber-900/15 to-transparent"
        />
        <div className="relative flex items-center gap-4 px-5 py-5 sm:px-6 sm:py-6">
          <BasketIcon className="w-10 h-10 sm:w-12 sm:h-12 flex-none drop-shadow-lg motion-safe:md-animate-basket-sway" />
          <div className="text-white min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-bold [text-shadow:0_2px_10px_rgba(0,0,0,0.6)] motion-safe:md-animate-fade-in-up break-words">
              Hamper Registration
            </h1>
            <p className="mt-1.5 text-sm leading-snug text-amber-50 [text-shadow:0_2px_6px_rgba(0,0,0,0.55)] motion-safe:md-animate-fade-in-up motion-safe:md-delay-1">
              Register for the Market Day community hamper distribution.
              Fields marked <span className="text-red-200 font-bold">*</span> are required.
            </p>
          </div>
        </div>
      </div>

      {submitError && (
        <div className="motion-safe:md-animate-fade-in-up rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="motion-safe:md-animate-fade-in-up motion-safe:md-delay-1 rounded-2xl border border-amber-200 bg-white p-5 sm:p-6 space-y-0 shadow-sm" noValidate>
        <Field label="Full name" htmlFor="fullName" required error={errors.fullName}>
          <TextInput
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            placeholder="Jane Doe"
          />
        </Field>

        <Field label="National ID or other identifier" htmlFor="nationalId">
          <TextInput
            id="nationalId"
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value)}
            placeholder="Optional"
          />
        </Field>

        <Field label="Date of birth" htmlFor="dateOfBirth" required error={errors.dateOfBirth}>
          <TextInput
            id="dateOfBirth"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            type="date"
          />
        </Field>

        <Field label="Community" htmlFor="address" required error={errors.address}>
          <Select
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          >
            <option value="">Select your community…</option>
            {TOBAGO_LOCATIONS.filter((l) => l !== OTHER_LOCATION_VALUE).map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
            <option value={OTHER_LOCATION_VALUE}>{OTHER_LOCATION_VALUE}</option>
          </Select>
        </Field>
        {address === OTHER_LOCATION_VALUE && (
          <Field label="Specify your community" htmlFor="manualAddress" required error={errors.address}>
            <TextInput
              id="manualAddress"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              placeholder="Enter your community name"
            />
          </Field>
        )}

        <Field label="Phone number" htmlFor="phoneNumber" required error={errors.phoneNumber}>
          <TextInput
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(formatTtPhone(e.target.value))}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(868) 123-4567"
          />
        </Field>

        <Field label="Email address" htmlFor="email" error={errors.email}>
          <TextInput
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="Optional"
          />
        </Field>

        <Field label="Market-related category / product type" htmlFor="productCategory">
          <Select
            id="productCategory"
            value={productCategory}
            onChange={(e) => setProductCategory(e.target.value)}
          >
            <option value="">None selected</option>
            <option value="produce">Fresh produce</option>
            <option value="dry-goods">Dry goods</option>
            <option value="household">Household essentials</option>
            <option value="other">Other</option>
          </Select>
        </Field>

        <Field label="Household reference" htmlFor="householdReference">
          <TextInput
            id="householdReference"
            value={householdReference}
            onChange={(e) => setHouseholdReference(e.target.value)}
            placeholder="e.g. HH-0001 (if you already have one)"
          />
        </Field>

        <div className="mb-6 mt-4">
          <label className="flex items-start gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-6 w-6 flex-none rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <span>
              I consent to the collection and use of my data for the purpose of this
              hamper distribution programme. <span className="text-red-500">*</span>
            </span>
          </label>
          {errors.consent && <p className="mt-1 text-xs text-red-600">{errors.consent}</p>}
        </div>

        <div className="sticky-cta flex flex-col sm:flex-row gap-3">
          <SubmitButton className={cn("md:min-h-14 bg-amber-500 hover:bg-amber-600 active:scale-95 motion-safe:md-animate-pulse-warm")}>
            {submitting ? "Submitting…" : "Register"}
          </SubmitButton>
          <Link
            href="/md"
            className="inline-flex min-h-[56px] items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-base font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}