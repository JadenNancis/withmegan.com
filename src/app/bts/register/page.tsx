"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Field, TextInput, TextArea, Select, SubmitButton } from "@/components/form";
import { cn } from "@/lib/cn";
import { BTS_SCHOOLS, OTHER_SCHOOL_VALUE, schoolsByCategory } from "@/lib/bts-schools";
import { formatTtPhone, isValidTtPhone } from "@/lib/tt-phone";
import { BTS_LOCATIONS, OTHER_LOCATION_VALUE } from "@/lib/bts-locations";
import { SchoolBookIcon, PalmTreeIcon, PelicanIcon, SuccessCheckmark } from "@/components/bts-illustrations";

interface DependentForm {
  studentName: string;
  schoolName: string;
  manualSchoolName: string;
  manualSchoolAddress: string;
  gradeLevel: string;
  notes: string;
  bookListUrl: string;
  bookListFileName: string;
  uploading: boolean;
}

function emptyDependent(): DependentForm {
  return {
    studentName: "",
    schoolName: "",
    manualSchoolName: "",
    manualSchoolAddress: "",
    gradeLevel: "",
    notes: "",
    bookListUrl: "",
    bookListFileName: "",
    uploading: false,
  };
}

type SubmitError = { message?: string; error?: string; issues?: unknown };

export default function BtsRegisterPage() {
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [consent, setConsent] = useState(false);
  const [dependents, setDependents] = useState<DependentForm[]>([emptyDependent()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<{ thaId: string } | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);

  function addDependent() {
    setDependents((d) => [...d, emptyDependent()]);
  }

  function removeDependent(index: number) {
    setDependents((d) => (d.length > 1 ? d.filter((_, i) => i !== index) : d));
  }

  function updateDependent(index: number, patch: Partial<DependentForm>) {
    setDependents((d) => d.map((dep, i) => (i === index ? { ...dep, ...patch } : dep)));
  }

  async function uploadBookList(index: number, file: File) {
    updateDependent(index, { uploading: true });
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? "Upload failed");
      }
      const { url, filename } = data as { url: string; filename: string };
      updateDependent(index, { bookListUrl: url, bookListFileName: filename });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      updateDependent(index, { uploading: false });
    }
  }

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = "Full name is required";
    if (!contactNumber.trim()) errs.contactNumber = "Contact number is required";
    else if (!isValidTtPhone(contactNumber)) errs.contactNumber = "Enter a valid TT number, e.g. (868) 123-4567";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email";
    if (!address) errs.address = "Select your community";
    else if (address === OTHER_LOCATION_VALUE && !manualAddress.trim()) errs.address = "Enter your community";
    if (!consent) errs.consent = "You must consent to continue";
    dependents.forEach((d, i) => {
      if (!d.studentName.trim()) errs[`dep-${i}-name`] = "Student name is required";
      if (!d.schoolName) errs[`dep-${i}-school`] = "School is required";
      if (d.schoolName === OTHER_SCHOOL_VALUE && !d.manualSchoolName.trim())
        errs[`dep-${i}-manual`] = "Enter the school name";
      if (!d.gradeLevel.trim()) errs[`dep-${i}-grade`] = "Grade level is required";
    });
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setError("Please fix the highlighted fields.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        guardian: {
          fullName,
          contactNumber,
          email,
          address: address === OTHER_LOCATION_VALUE ? manualAddress : address,
          consent,
        },
        dependents: dependents.map((d) => ({
          studentName: d.studentName,
          schoolName:
            d.schoolName === OTHER_SCHOOL_VALUE ? d.manualSchoolName : d.schoolName,
          schoolAddress: d.schoolName === OTHER_SCHOOL_VALUE ? d.manualSchoolAddress : undefined,
          gradeLevel: d.gradeLevel,
          notes: d.notes || undefined,
          bookListUrl: d.bookListUrl || undefined,
        })),
      };
      const res = await fetch("/api/bts/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        const errData = data as SubmitError;
        throw new Error(errData.message ?? errData.error ?? "Registration failed");
      }
      setSuccess(data as { thaId: string });
      // Fetch QR code
      try {
        const qrRes = await fetch(`/api/qr?aid=${encodeURIComponent((data as { thaId: string }).thaId)}&site=bts`);
        if (qrRes.ok) {
          const qrData = await qrRes.json() as { dataUrl?: string };
          if (qrData.dataUrl) setQrCode(qrData.dataUrl);
        }
      } catch { /* QR is nice-to-have */ }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="relative mx-auto max-w-lg overflow-hidden text-center py-12">
        {/* Floating celebration elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="bts-float bts-float-delay-1 absolute left-[10%] top-[15%] opacity-30">
            <PalmTreeIcon className="h-12 w-12" />
          </div>
          <div className="bts-float bts-float-delay-3 absolute right-[10%] top-[20%] opacity-30">
            <PelicanIcon className="h-14 w-12" />
          </div>
          <div className="bts-float-sm bts-float-delay-2 absolute left-[15%] bottom-[10%] opacity-25">
            <SchoolBookIcon className="h-10 w-10" />
          </div>
          <div className="bts-float-sm bts-float-delay-4 absolute right-[15%] bottom-[15%] opacity-25">
            <PalmTreeIcon className="h-10 w-10" />
          </div>
        </div>

        {/* Success checkmark with bounce-in */}
        <div className="relative">
          <div className="bts-bounce-in mx-auto mb-6 flex h-24 w-24 items-center justify-center">
            <SuccessCheckmark className="h-24 w-24 drop-shadow-xl" />
          </div>
          <h1 className="bts-fade-in-up bts-stagger-2 text-2xl sm:text-3xl font-bold text-cyan-900">
            Registration Submitted!
          </h1>
          <p className="bts-fade-in-up bts-stagger-3 mt-3 text-sm text-gray-600">
            Your registration has been received. Save your Application ID &mdash; you&rsquo;ll need it to collect
            resources on event day.
          </p>

          {/* Application ID card */}
          <div className="bts-fade-in-up bts-stagger-4 mt-6 rounded-2xl border-2 border-dashed border-cyan-300 bg-gradient-to-br from-cyan-50 to-white p-6 shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-600">Your Application ID</p>
            <p className="mt-2 text-3xl font-bold text-cyan-900 tracking-wider font-mono">
              {success.thaId}
            </p>
            {qrCode && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <img src={qrCode} alt="QR code for verification" className="rounded-lg shadow-sm" width={200} height={200} />
                <p className="text-xs text-gray-500">Scan this at the distribution counter on event day</p>
              </div>
            )}
          </div>

          <div className="bts-fade-in-up bts-stagger-5 mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/bts"
              className="inline-flex items-center justify-center rounded-xl bg-cyan-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-cyan-700 transition-all hover:scale-105 active:scale-95"
            >
              Back to Home
            </Link>
            <button
              type="button"
              onClick={() => {
                setSuccess(null);
                setQrCode(null);
                setFullName("");
                setContactNumber("");
                setEmail("");
                setAddress("");
                setManualAddress("");
                setConsent(false);
                setDependents([emptyDependent()]);
              }}
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all hover:scale-105 active:scale-95"
            >
              Register Another Family
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Animated header */}
      <div className="bts-fade-in-up bts-stagger-1 relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-700 to-cyan-500 p-6 shadow-lg">
        <div className="pointer-events-none absolute right-4 top-2 opacity-20">
          <SchoolBookIcon className="h-16 w-16 bts-float-sm" />
        </div>
        <div className="relative">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <SchoolBookIcon className="h-10 w-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Register a Student</h1>
          <p className="mt-2 text-sm text-cyan-50">
            Complete the form below to register your dependents for the book drive. Fields marked{" "}
            <span className="font-bold text-red-200">*</span> are required.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Guardian section */}
        <section className="bts-fade-in-up bts-stagger-2 rounded-2xl border border-cyan-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <h2 className="text-lg font-bold text-cyan-900 border-b border-cyan-100 pb-3 mb-4">
            Guardian Information
          </h2>
          <div className="grid gap-1 sm:grid-cols-2">
            <Field label="Full name" htmlFor="fullName" required error={fieldErrors.fullName}>
              <TextInput
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
              />
            </Field>
            <Field label="Contact number" htmlFor="contactNumber" required error={fieldErrors.contactNumber}>
              <TextInput
                id="contactNumber"
                value={contactNumber}
                onChange={(e) => setContactNumber(formatTtPhone(e.target.value))}
                type="tel"
                autoComplete="tel"
                placeholder="(868) 123-4567"
              />
            </Field>
            <Field label="Email address" htmlFor="email" error={fieldErrors.email}>
              <TextInput
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
              />
            </Field>
            <Field label="Community" htmlFor="address" required error={fieldErrors.address}>
              <Select
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              >
                <option value="">Select your community…</option>
                {BTS_LOCATIONS.filter((l) => l !== OTHER_LOCATION_VALUE).map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
                <option value={OTHER_LOCATION_VALUE}>{OTHER_LOCATION_VALUE}</option>
              </Select>
            </Field>
            {address === OTHER_LOCATION_VALUE && (
              <Field label="Specify your community" htmlFor="manualAddress" required error={fieldErrors.address}>
                <TextInput
                  id="manualAddress"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="Enter your community name"
                />
              </Field>
            )}
          </div>
          <div className="mt-2 flex items-start gap-2">
            <input
              id="consent"
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
            />
            <label htmlFor="consent" className="text-sm text-gray-700">
              I consent to the collection of my data and my dependents&rsquo; data for the purpose of
              participating in the Back to School with Megan book drive.{" "}
              <span className="text-red-500">*</span>
            </label>
          </div>
          {fieldErrors.consent && <p className="mt-1 text-xs text-red-600">{fieldErrors.consent}</p>}
        </section>

        {/* Dependents section */}
        <section className="bts-fade-in-up bts-stagger-3 rounded-2xl border border-cyan-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between border-b border-cyan-100 pb-3 mb-4">
            <h2 className="text-lg font-bold text-cyan-900">Dependents</h2>
            <button
              type="button"
              onClick={addDependent}
              className="rounded-lg bg-cyan-100 px-4 py-2 text-sm font-bold text-cyan-700 hover:bg-cyan-200 transition-colors"
            >
              + Add dependent
            </button>
          </div>

          {dependents.map((dep, index) => (
            <DependentCard
              key={index}
              index={index}
              dep={dep}
              onChange={(patch) => updateDependent(index, patch)}
              onRemove={dependents.length > 1 ? () => removeDependent(index) : null}
              onUpload={(file) => uploadBookList(index, file)}
              errors={fieldErrors}
            />
          ))}
        </section>

        {error && (
          <div className="bts-fade-in-up rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800 shadow-sm">
            {error}
          </div>
        )}

        <div className="bts-fade-in-up bts-stagger-4 flex items-center gap-4">
          <SubmitButton className={cn(submitting && "opacity-60 cursor-not-allowed")}>
            {submitting ? "Submitting…" : "Submit Registration"}
          </SubmitButton>
          <Link
            href="/bts"
            className="text-sm font-medium text-gray-600 hover:text-cyan-700 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function DependentCard({
  index,
  dep,
  onChange,
  onRemove,
  onUpload,
  errors,
}: {
  index: number;
  dep: DependentForm;
  onChange: (patch: Partial<DependentForm>) => void;
  onRemove: (() => void) | null;
  onUpload: (file: File) => void;
  errors: Record<string, string>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categories = schoolsByCategory();
  const isOther = dep.schoolName === OTHER_SCHOOL_VALUE;

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-gradient-to-br from-cyan-50/30 to-gray-50/30 p-4 last:mb-0 transition-all hover:shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-cyan-800">Dependent {index + 1}</h3>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors"
          >
            Remove
          </button>
        )}
      </div>
      <div className="grid gap-1 sm:grid-cols-2">
        <Field label="Student full name" required error={errors[`dep-${index}-name`]}>
          <TextInput
            value={dep.studentName}
            onChange={(e) => onChange({ studentName: e.target.value })}
          />
        </Field>
        <Field label="Grade level" required error={errors[`dep-${index}-grade`]}>
          <TextInput
            value={dep.gradeLevel}
            onChange={(e) => onChange({ gradeLevel: e.target.value })}
            placeholder="e.g. Standard 3, Form 2, Year 1"
          />
        </Field>
        <Field label="School" required error={errors[`dep-${index}-school`]}>
          <Select
            value={dep.schoolName}
            onChange={(e) => onChange({ schoolName: e.target.value })}
          >
            <option value="">Select a school…</option>
            {categories.map((cat) => (
              <optgroup key={cat.category} label={cat.category}>
                {cat.schools.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
            ))}
            <option value={OTHER_SCHOOL_VALUE}>Other (enter manually)</option>
          </Select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Book list document (PDF or Word)">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file);
              }}
              className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-700 hover:file:bg-cyan-100 file:transition-colors"
            />
            {dep.uploading && (
              <p className="mt-1 text-xs text-cyan-600">Uploading…</p>
            )}
            {dep.bookListUrl && !dep.uploading && (
              <p className="mt-1 text-xs text-green-600">
                ✓ Uploaded{" "}
                <a
                  href={dep.bookListUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {dep.bookListFileName || "document"}
                </a>
              </p>
            )}
          </Field>
        </div>
        {isOther && (
          <>
            <Field label="School name (manual entry)" required error={errors[`dep-${index}-manual`]}>
              <TextInput
                value={dep.manualSchoolName}
                onChange={(e) => onChange({ manualSchoolName: e.target.value })}
              />
            </Field>
            <Field label="School address (optional)">
              <TextInput
                value={dep.manualSchoolAddress}
                onChange={(e) => onChange({ manualSchoolAddress: e.target.value })}
              />
            </Field>
          </>
        )}
        <div className="sm:col-span-2">
          <Field label="Notes on required items or special needs (optional)">
            <TextArea
              value={dep.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              rows={2}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}