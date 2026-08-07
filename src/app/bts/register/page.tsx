"use client";

import { useState } from "react";
import Link from "next/link";
import { GuardianStep } from "./steps/guardian-step";
import { DependentsStep, type DependentForm, emptyDependent } from "./steps/dependents-step";
import { ReviewStep, type SubmitResult } from "./steps/review-step";
import { SuccessCard } from "./success-card";
import { useWizardDraft } from "./draft";
import { OTHER_LOCATION_VALUE } from "@/lib/bts-locations";
import { OTHER_SCHOOL_VALUE } from "@/lib/bts-schools";

const STEPS = ["Parent/Guardian", "Students", "Review"] as const;
type StepIndex = 0 | 1 | 2;

interface WizardState {
  fullName: string;
  contactNumber: string;
  email: string;
  address: string;
  manualAddress: string;
  studentCount: number;
  consent: boolean;
  dependents: DependentForm[];
  step: StepIndex;
}

const initialState: WizardState = {
  fullName: "",
  contactNumber: "",
  email: "",
  address: "",
  manualAddress: "",
  studentCount: 1,
  consent: false,
  dependents: [emptyDependent()],
  step: 0,
};

export default function BtsRegisterPage() {
  const draft = useWizardDraft<WizardState>("bts-draft-v1", initialState);
  const state = draft.value;
  const setState = draft.setValue;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<(SubmitResult & { phone: string }) | null>(null);

  function patch(p: Partial<WizardState>) {
    setState((prev) => ({ ...prev, ...p }));
  }

  function goTo(step: StepIndex) {
    patch({ step });
    setError(null);
  }

  function validateCurrentStep(): string | null {
    if (state.step === 0) {
      if (!state.fullName.trim()) return "Full name is required.";
      if (!state.contactNumber.trim()) return "Contact number is required.";
      if (!state.address) return "Select your community.";
      if (state.address === OTHER_LOCATION_VALUE && !state.manualAddress.trim())
        return "Enter your community.";
      return null;
    }
    if (state.step === 1) {
      for (let i = 0; i < state.dependents.length; i++) {
        const d = state.dependents[i];
        if (!d.studentName.trim()) return `Student ${i + 1}: name is required.`;
        if (!d.gradeLevel.trim()) return `Student ${i + 1}: grade level is required.`;
        if (!d.schoolName) return `Student ${i + 1}: school is required.`;
        if (d.schoolName === OTHER_SCHOOL_VALUE && !d.manualSchoolName.trim())
          return `Student ${i + 1}: enter the school name.`;
      }
      return null;
    }
    if (state.step === 2) {
      if (!state.consent) return "Please tick the consent box to continue.";
      return null;
    }
    return null;
  }

  function next() {
    const err = validateCurrentStep();
    if (err) {
      setError(err);
      return;
    }
    if (state.step < 2) goTo((state.step + 1) as StepIndex);
  }

  function back() {
    if (state.step > 0) goTo((state.step - 1) as StepIndex);
  }

  async function submit() {
    const err = validateCurrentStep();
    if (err) {
      setError(err);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        guardian: {
          fullName: state.fullName,
          contactNumber: state.contactNumber,
          email: state.email,
          address: state.address === OTHER_LOCATION_VALUE ? state.manualAddress : state.address,
          consent: state.consent,
        },
        dependents: state.dependents.map((d) => ({
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
      const data = (await res.json()) as { thaId?: string; error?: string; message?: string };
      if (!res.ok || !data.thaId) {
        throw new Error(data.message ?? data.error ?? "Registration failed. Please try again.");
      }

      // Fetch QR in parallel with showing success (non-blocking).
      let qrCode: string | null = null;
      try {
        const qrRes = await fetch(
          `/api/qr?aid=${encodeURIComponent(data.thaId)}&site=bts`,
        );
        if (qrRes.ok) {
          const qrData = (await qrRes.json()) as { dataUrl?: string };
          qrCode = qrData.dataUrl ?? null;
        }
      } catch {
        // QR is nice-to-have
      }

      setResult({
        thaId: data.thaId,
        qrCode,
        phone: state.contactNumber,
        dependentsCount: state.dependents.length,
      });
      draft.clear();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForAnother() {
    setResult(null);
    setState({ ...initialState, dependents: [emptyDependent()] });
    window.scrollTo({ top: 0 });
  }

  if (result) {
    return <SuccessCard result={result} onRegisterAnother={resetForAnother} phone={result.phone} />;
  }

  const stepNum = state.step + 1;

  return (
    <div className="space-y-5">
      {/* Wizard header */}
      <header className="bts-fade-in-up">
        <h1 className="text-title text-brand-900">Register a Student</h1>
        <p className="mt-1 text-body text-brand-700">
          Step {stepNum} of 3 — <span className="font-semibold">{STEPS[state.step]}</span>
        </p>

        {/* Progress dots */}
        <ol className="mt-4 flex items-center gap-2" aria-label="Progress">
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-2 flex-1">
              <div
                className={[
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors",
                  i < state.step
                    ? "bg-brand-600 text-white"
                    : i === state.step
                      ? "bg-white text-brand-700 ring-2 ring-brand-600"
                      : "bg-white text-gray-400 ring-1 ring-gray-300",
                ].join(" ")}
                aria-current={i === state.step ? "step" : undefined}
              >
                {i < stepNum - 1 ? "✓" : i + 1}
              </div>
              <span
                className={[
                  "text-xs font-medium hidden sm:inline",
                  i === state.step ? "text-brand-900" : "text-gray-500",
                ].join(" ")}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className={[
                    "h-0.5 flex-1 rounded",
                    i < state.step ? "bg-brand-600" : "bg-gray-200",
                  ].join(" ")}
                />
              )}
            </li>
          ))}
        </ol>
      </header>

      {/* Draft resume banner */}
      {draft.hadDraft && (
        <div className="bts-card-enter rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900 flex flex-wrap items-center gap-3">
          <p className="flex-1 min-w-[200px]">
            We restored the draft you started earlier.
          </p>
          <button
            type="button"
            onClick={() => draft.dismissDraft()}
            className="text-xs font-bold text-brand-700 underline hover:text-brand-900"
          >
            Start fresh
          </button>
        </div>
      )}

      {error && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Steps */}
      <div className="bts-fade-in-up">
        {state.step === 0 && (
          <GuardianStep
            state={{
              fullName: state.fullName,
              contactNumber: state.contactNumber,
              email: state.email,
              address: state.address,
              manualAddress: state.manualAddress,
              studentCount: state.studentCount,
            }}
            onChange={(p) => patch(p)}
            onStudentCountChange={(count) => {
              setState((prev) => {
                const deps = [...prev.dependents];
                while (deps.length < count) deps.push(emptyDependent());
                while (deps.length > count) deps.pop();
                return { ...prev, studentCount: count, dependents: deps };
              });
            }}
            onNext={next}
          />
        )}
        {state.step === 1 && (
          <DependentsStep
            dependents={state.dependents}
            onChange={(deps) => patch({ dependents: deps })}
            onNext={next}
            onBack={back}
          />
        )}
        {state.step === 2 && (
          <ReviewStep
            state={state}
            onChangeConsent={(v) => patch({ consent: v })}
            onBack={back}
            onSubmit={submit}
            submitting={submitting}
          />
        )}
      </div>

      <p className="text-xs text-gray-500">
        <Link href="/bts" className="underline hover:text-brand-700">
          &larr; Back to home
        </Link>
      </p>
    </div>
  );
}
