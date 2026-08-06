"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Field, TextInput, TextArea, Select, SubmitButton } from "@/components/form";
import { cn } from "@/lib/cn";
import { BTS_SCHOOLS, OTHER_SCHOOL_VALUE, schoolsByCategory } from "@/lib/bts-schools";

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

type SubmitError = { message: string; issues?: unknown };

export default function BtsRegisterPage() {
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [consent, setConsent] = useState(false);
  const [dependents, setDependents] = useState<DependentForm[]>([emptyDependent()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<{ thaId: string } | null>(null);

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
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email";
    if (!address.trim()) errs.address = "Home address is required";
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
        guardian: { fullName, contactNumber, email, address, consent },
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg text-center py-12">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Registration Submitted!</h1>
        <p className="mt-2 text-sm text-gray-600">
          Your registration has been received. Save your THA ID — you&rsquo;ll need it to collect
          resources on event day.
        </p>
        <div className="mt-6 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-700">Your THA ID</p>
          <p className="mt-1 text-2xl font-bold text-blue-900 tracking-wider">{success.thaId}</p>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/bts"
            className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Back to Home
          </Link>
          <button
            type="button"
            onClick={() => {
              setSuccess(null);
              setFullName("");
              setContactNumber("");
              setEmail("");
              setAddress("");
              setConsent(false);
              setDependents([emptyDependent()]);
            }}
            className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Register Another Family
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-blue-50 border border-blue-200 p-5">
        <h1 className="text-2xl font-bold text-blue-900">Register a Student</h1>
        <p className="mt-1 text-sm text-blue-800">
          Complete the form below to register your dependents for the book drive. Fields marked{" "}
          <span className="text-red-500">*</span> are required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Guardian section */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">
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
                onChange={(e) => setContactNumber(e.target.value)}
                type="tel"
                autoComplete="tel"
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
            <Field label="Home address / community" htmlFor="address" required error={fieldErrors.address}>
              <TextInput
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                autoComplete="street-address"
              />
            </Field>
          </div>
          <div className="mt-2 flex items-start gap-2">
            <input
              id="consent"
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Dependents</h2>
            <button
              type="button"
              onClick={addDependent}
              className="rounded-md bg-blue-100 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-200"
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
          <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <SubmitButton className={cn(submitting && "opacity-60 cursor-not-allowed")}>
            {submitting ? "Submitting…" : "Submit Registration"}
          </SubmitButton>
          <Link
            href="/bts"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
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
    <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50/50 p-4 last:mb-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Dependent {index + 1}</h3>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-medium text-red-600 hover:text-red-800"
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
              className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
            {dep.uploading && (
              <p className="mt-1 text-xs text-blue-600">Uploading…</p>
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