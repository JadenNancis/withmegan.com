"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Field, TextInput, Select, TextArea } from "@/components/form";
import { SchoolPicker } from "@/components/school-picker";
import {
  OTHER_SCHOOL_VALUE,
  OTHER_GRADE_VALUE,
  gradesForSchool,
  isKnownSchool,
} from "@/lib/bts-schools";
import { BTS_LOCATIONS, OTHER_LOCATION_VALUE, isKnownLocation } from "@/lib/bts-locations";
import { formatTtPhone } from "@/lib/tt-phone";
import type { GuardianWithDependents } from "@/lib/bts-queries";

interface DependentDraft {
  id?: string;
  studentName: string;
  schoolName: string;
  manualSchoolName: string;
  gradeLevel: string;
  manualGradeLevel: string;
  notes: string;
}

function emptyDependent(): DependentDraft {
  return {
    studentName: "",
    schoolName: "",
    manualSchoolName: "",
    gradeLevel: "",
    manualGradeLevel: "",
    notes: "",
  };
}

export function EditApplicationForm({ guardian }: { guardian: GuardianWithDependents }) {
  const router = useRouter();

  // ── Guardian state ─────────────────────────────────────────────
  const [fullName, setFullName] = useState(guardian.fullName);
  const [nationalId, setNationalId] = useState(guardian.nationalId ?? "");
  const [contactNumber, setContactNumber] = useState(guardian.contactNumber);
  const [email, setEmail] = useState(guardian.email);
  const [consent, setConsent] = useState(guardian.consent);

  // Address: the stored value may not be one of the dropdown options
  // (legacy or free-text). In that case show "Other" and prefill the manual
  // field with the stored value.
  const addressIsKnown = isKnownLocation(guardian.address);
  const [address, setAddress] = useState(addressIsKnown ? guardian.address : OTHER_LOCATION_VALUE);
  const [manualAddress, setManualAddress] = useState(addressIsKnown ? "" : guardian.address);

  // ── Dependent state ────────────────────────────────────────────
  const [dependents, setDependents] = useState<DependentDraft[]>(
    guardian.dependents.map((d) => {
      const known = isKnownSchool(d.schoolName);
      const gradeKnown = gradesForSchool(d.schoolName).includes(d.gradeLevel);
      return {
        id: d.id,
        studentName: d.studentName,
        schoolName: known ? d.schoolName : OTHER_SCHOOL_VALUE,
        manualSchoolName: known ? "" : d.schoolName,
        gradeLevel: gradeKnown ? d.gradeLevel : OTHER_GRADE_VALUE,
        manualGradeLevel: gradeKnown ? "" : d.gradeLevel,
        notes: d.notes ?? "",
      };
    }),
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const updateDependent = (i: number, patch: Partial<DependentDraft>) => {
    setDependents((prev) => prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  };

  function addDependent() {
    setDependents((prev) => [...prev, emptyDependent()]);
  }

  function removeDependent(i: number) {
    setDependents((prev) => prev.filter((_, idx) => idx !== i));
  }

  const resolvedAddress = address === OTHER_LOCATION_VALUE ? manualAddress.trim() : address;

  function validate(): string | null {
    if (!fullName.trim()) return "Full name is required.";
    if (!nationalId.trim()) return "National ID is required.";
    if (!contactNumber.trim()) return "Contact number is required.";
    if (!resolvedAddress) return "Community is required.";
    for (let i = 0; i < dependents.length; i++) {
      const d = dependents[i];
      if (!d.studentName.trim()) return `Child/Student ${i + 1}: name is required.`;
      if (!d.schoolName) return `Child/Student ${i + 1}: school is required.`;
      if (d.schoolName === OTHER_SCHOOL_VALUE && !d.manualSchoolName.trim())
        return `Child/Student ${i + 1}: enter the school name.`;
      if (!d.gradeLevel) return `Child/Student ${i + 1}: grade or form is required.`;
      if (d.gradeLevel === OTHER_GRADE_VALUE && !d.manualGradeLevel.trim())
        return `Child/Student ${i + 1}: enter the grade or form.`;
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      setNotice(null);
      return;
    }
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const payload = {
        guardian: {
          fullName: fullName.trim(),
          nationalId: nationalId.trim(),
          contactNumber,
          email: email.trim(),
          address: resolvedAddress,
          consent,
        },
        dependents: dependents.map((d) => ({
          id: d.id,
          studentName: d.studentName.trim(),
          schoolName: d.schoolName === OTHER_SCHOOL_VALUE ? d.manualSchoolName.trim() : d.schoolName,
          gradeLevel:
            d.gradeLevel === OTHER_GRADE_VALUE ? d.manualGradeLevel.trim() : d.gradeLevel,
          notes: d.notes.trim(),
        })),
      };
      const res = await fetch(`/api/bts/admin/registrations/${guardian.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Could not save changes.");
      }
      setNotice("Changes saved.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">
            Edit application
          </h1>
          <p className="mt-1 text-sm text-brand-100/90 [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]">
            {guardian.thaId ?? "No Application ID"} · {guardian.fullName}
          </p>
        </div>
        <Link
          href={`/bts/admin/${guardian.id}`}
          className="inline-flex min-h-[44px] items-center text-sm font-bold text-cyan-200 hover:text-white transition-colors"
        >
          &larr; Back to application
        </Link>
      </div>

      {notice && (
        <div
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800"
          role="status"
        >
          {notice}
        </div>
      )}
      {error && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Guardian details */}
        <section className="rounded-2xl border border-brand-100 bg-white p-5 sm:p-8 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)]">
          <h2 className="text-lg font-bold text-brand-900">Guardian details</h2>
          <p className="mt-1 text-sm text-brand-700 mb-6">
            Contact and household information for this application.
          </p>

          <div className="grid gap-x-6 sm:grid-cols-2">
            <Field label="Full name" required>
              <TextInput
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                placeholder="Full name"
              />
            </Field>

            <Field label="National ID" required>
              <TextInput
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                autoComplete="off"
                placeholder="e.g. 19850615031"
              />
            </Field>

            <Field label="Contact number" required>
              <TextInput
                value={contactNumber}
                onChange={(e) => setContactNumber(formatTtPhone(e.target.value))}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="(868) 123-4567"
              />
            </Field>

            <Field label="Email address">
              <TextInput
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="guardian@email.com"
              />
            </Field>
          </div>

          <Field label="Community" required>
            <Select
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            >
              <option value="">Select a community…</option>
              {BTS_LOCATIONS.filter((l) => l !== OTHER_LOCATION_VALUE).map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
              <option value={OTHER_LOCATION_VALUE}>{OTHER_LOCATION_VALUE}</option>
            </Select>
          </Field>

          {address === OTHER_LOCATION_VALUE && (
            <Field label="Community name" required>
              <TextInput
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                placeholder="Enter the community"
              />
            </Field>
          )}

          <label className="flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50/50 p-4">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-5 w-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">
              Consent to data collection and participation in the Back to School book drive.
            </span>
          </label>
        </section>

        {/* Dependents */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">
              Children/Students ({dependents.length})
            </h2>
            <button
              type="button"
              onClick={addDependent}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-bold text-brand-800 shadow-sm hover:bg-brand-50 active:scale-95 transition-all"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add child/student
            </button>
          </div>

          {dependents.map((dep, i) => (
            <article
              key={dep.id ?? `new-${i}`}
              className="rounded-2xl border border-brand-100 bg-white p-5 sm:p-6 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.06)]"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2.5 font-bold text-brand-900">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                    {i + 1}
                  </span>
                  {dep.studentName.trim() || "Child/Student"}
                </h3>
                {dependents.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDependent(i)}
                    className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors min-h-[40px] px-2"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid gap-x-6 sm:grid-cols-2">
                <Field label="Child/Student&rsquo;s full name" required>
                  <TextInput
                    value={dep.studentName}
                    onChange={(e) => updateDependent(i, { studentName: e.target.value })}
                    placeholder="Full name"
                  />
                </Field>

                <Field label="School" required>
                  <SchoolPicker
                    value={dep.schoolName}
                    onChange={(v) =>
                      updateDependent(i, {
                        schoolName: v,
                        gradeLevel: "",
                        manualGradeLevel: "",
                      })
                    }
                  />
                </Field>

                {dep.schoolName === OTHER_SCHOOL_VALUE && (
                  <Field label="School name" required>
                    <TextInput
                      value={dep.manualSchoolName}
                      onChange={(e) => updateDependent(i, { manualSchoolName: e.target.value })}
                      placeholder="School name"
                    />
                  </Field>
                )}

                <Field label="Grade or form" required>
                  <Select
                    value={dep.gradeLevel}
                    onChange={(e) =>
                      updateDependent(i, { gradeLevel: e.target.value, manualGradeLevel: "" })
                    }
                  >
                    <option value="">Select grade or form…</option>
                    {gradesForSchool(
                      dep.schoolName === OTHER_SCHOOL_VALUE ? dep.manualSchoolName : dep.schoolName,
                    ).map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                    <option value={OTHER_GRADE_VALUE}>Other (enter manually)</option>
                  </Select>
                </Field>

                {dep.gradeLevel === OTHER_GRADE_VALUE && (
                  <Field label="Grade or form (manual entry)" required>
                    <TextInput
                      value={dep.manualGradeLevel}
                      onChange={(e) => updateDependent(i, { manualGradeLevel: e.target.value })}
                      placeholder="e.g. Standard 3, Form 2"
                    />
                  </Field>
                )}
              </div>

              <Field label="Notes (optional)">
                <TextArea
                  value={dep.notes}
                  onChange={(e) => updateDependent(i, { notes: e.target.value })}
                  rows={2}
                  placeholder="Special needs, items already on hand, anything we should know"
                />
              </Field>
            </article>
          ))}
        </section>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Link
            href={`/bts/admin/${guardian.id}`}
            className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-gray-300 bg-white px-6 text-base font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:scale-95 transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-xl bg-brand-700 px-8 text-base font-bold text-white shadow-lg shadow-brand-700/25 hover:bg-brand-800 active:scale-95 transition-all disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
