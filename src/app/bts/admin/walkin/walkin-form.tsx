"use client";

import { useState } from "react";
import Link from "next/link";
import { Field, TextInput, Select, SubmitButton } from "@/components/form";
import { SchoolPicker } from "@/components/school-picker";
import { cn } from "@/lib/cn";
import { formatTtPhone, isValidTtPhone } from "@/lib/tt-phone";
import { TOBAGO_LOCATIONS, OTHER_LOCATION_VALUE } from "@/lib/tobago-locations";
import { OTHER_SCHOOL_VALUE } from "@/lib/bts-schools";

const GRADE_OPTIONS = [
  "Pre-School / Kindergarten",
  "Infant 1",
  "Infant 2",
  "Standard 1",
  "Standard 2",
  "Standard 3",
  "Standard 4",
  "Standard 5",
  "Form 1",
  "Form 2",
  "Form 3",
  "Form 4",
  "Form 5",
  "Form 6",
  "Year 1",
  "Year 2",
  "Other",
];

type Errors = Partial<Record<string, string>>;

interface SuccessResult {
  thaId: string;
}

export function WalkInForm() {
  const [fullName, setFullName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [consent, setConsent] = useState(false);

  // Single dependent (walk-in: one only)
  const [studentName, setStudentName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [manualSchoolName, setManualSchoolName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessResult | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);

  function validate(): Errors {
    const e: Errors = {};
    if (!fullName.trim()) e.fullName = "Full name is required";
    if (!nationalId.trim()) e.nationalId = "National ID is required";
    if (!contactNumber.trim()) e.contactNumber = "Contact number is required";
    else if (!isValidTtPhone(contactNumber)) e.contactNumber = "Enter a valid TT number, e.g. (868) 123-4567";
    if (!address) e.address = "Select a community";
    else if (address === OTHER_LOCATION_VALUE && !manualAddress.trim()) e.address = "Enter your community";
    if (!studentName.trim()) e.studentName = "Child/Student name is required";
    if (!schoolName) e.schoolName = "School is required";
    if (schoolName === OTHER_SCHOOL_VALUE && !manualSchoolName.trim()) e.schoolName = "Enter the school name";
    if (!gradeLevel) e.gradeLevel = "Grade level is required";
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
      const resolvedSchool = schoolName === OTHER_SCHOOL_VALUE ? manualSchoolName : schoolName;
      const payload = {
        guardian: {
          fullName,
          nationalId,
          contactNumber,
          email: "",
          address: address === OTHER_LOCATION_VALUE ? manualAddress : address,
          consent,
        },
        dependents: [
          {
            studentName,
            schoolName: resolvedSchool,
            gradeLevel,
          },
        ],
      };
      const res = await fetch("/api/bts/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { thaId?: string; error?: string; issues?: unknown };
      if (!res.ok || !data.thaId) {
        throw new Error(data.error ?? "Registration failed. Please try again.");
      }
      setSuccess({ thaId: data.thaId });
      try {
        const qrRes = await fetch(`/api/qr?aid=${encodeURIComponent(data.thaId)}&site=bts`);
        if (qrRes.ok) {
          const qrData = (await qrRes.json()) as { dataUrl?: string };
          if (qrData.dataUrl) setQrCode(qrData.dataUrl);
        }
      } catch {
        /* QR is nice-to-have */
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setSuccess(null);
    setQrCode(null);
    setFullName("");
    setNationalId("");
    setContactNumber("");
    setAddress("");
    setManualAddress("");
    setConsent(false);
    setStudentName("");
    setSchoolName("");
    setManualSchoolName("");
    setGradeLevel("");
    setErrors({});
    setSubmitError(null);
  }

  if (success) {
    return (
      <div className="rounded-2xl border-2 border-cyan-300 bg-gradient-to-br from-cyan-50 to-white p-6 shadow-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100">
          <svg viewBox="0 0 40 40" className="w-10 h-10 text-cyan-700" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 10 20 L 17 27 L 30 13" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-cyan-900">Walk-In Registered</h2>
        <p className="mt-2 text-sm text-gray-600">
          Save this Application ID and take a screenshot of this screen. It&rsquo;s needed to collect resources on event day.
        </p>

        <div className="mt-5 rounded-xl border-2 border-dashed border-cyan-300 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-600">Application ID</p>
          <p className="mt-2 text-3xl font-bold font-mono tracking-wider text-cyan-900 break-all">
            {success.thaId}
          </p>
          {qrCode && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <img src={qrCode} alt="QR code for verification" className="rounded-lg shadow-sm" width={200} height={200} />
              <p className="text-xs text-gray-500">Scan at the distribution counter</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center justify-center rounded-xl bg-cyan-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-cyan-700 transition-colors min-h-[44px]"
          >
            Register Another Walk-In
          </button>
          <Link
            href="/bts/admin"
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
      {/* Guardian section */}
      <section className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-cyan-900 border-b border-cyan-100 pb-3 mb-4">
          Guardian
        </h2>
        <div className="grid gap-1 sm:grid-cols-2">
          <Field label="Full name" htmlFor="fullName" required error={errors.fullName}>
            <TextInput
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              className="text-lg"
            />
          </Field>
          <Field label="National ID" htmlFor="nationalId" required error={errors.nationalId}>
            <TextInput
              id="nationalId"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              autoComplete="off"
              placeholder="e.g. 19900101-12345"
              className="text-lg"
            />
          </Field>
          <Field label="Phone number" htmlFor="contactNumber" required error={errors.contactNumber}>
            <TextInput
              id="contactNumber"
              value={contactNumber}
              onChange={(e) => setContactNumber(formatTtPhone(e.target.value))}
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

      {/* Single dependent */}
      <section className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-cyan-900 border-b border-cyan-100 pb-3 mb-4">
          Child/Student
        </h2>
        <div className="grid gap-1 sm:grid-cols-2">
          <Field label="Child/Student name" htmlFor="studentName" required error={errors.studentName}>
            <TextInput
              id="studentName"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="text-lg"
            />
          </Field>
          <Field label="Grade level" htmlFor="gradeLevel" required error={errors.gradeLevel}>
            <Select
              id="gradeLevel"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="text-lg"
            >
              <option value="">Select grade…</option>
              {GRADE_OPTIONS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="School" htmlFor="schoolName" required error={errors.schoolName}>
              <SchoolPicker
                value={schoolName}
                onChange={(v) => setSchoolName(v)}
              />
            </Field>
          </div>
          {schoolName === OTHER_SCHOOL_VALUE && (
            <div className="sm:col-span-2">
              <Field label="School name (manual entry)" htmlFor="manualSchoolName" required error={errors.schoolName}>
                <TextInput
                  id="manualSchoolName"
                  value={manualSchoolName}
                  onChange={(e) => setManualSchoolName(e.target.value)}
                  className="text-lg"
                />
              </Field>
            </div>
          )}
        </div>
      </section>

      {/* Consent */}
      <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
        <label className="flex items-start gap-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-5 w-5 flex-none rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
          />
          <span>
            I confirm the guardian consents to data collection for the Back to School book drive.{" "}
            <span className="text-red-500">*</span>
          </span>
        </label>
        {errors.consent && <p className="mt-1 text-xs text-red-600">{errors.consent}</p>}
      </div>

      {submitError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800 shadow-sm">
          {submitError}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <SubmitButton
          className={cn(
            "min-h-[56px] px-8 text-lg bg-cyan-600 hover:bg-cyan-700",
            submitting && "opacity-60 cursor-not-allowed",
          )}
        >
          {submitting ? "Submitting…" : "Register Walk-In"}
        </SubmitButton>
        <Link
          href="/bts/admin"
          className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}