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
      <div
        className="motion-safe:bts-fade-in-up -mx-4 -my-5 sm:-my-8 rounded-none overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/tobago/bts-child-reading.jpg')" }}
      >
        <div className="bg-brand-900/55 backdrop-blur-sm px-5 py-8 sm:px-6 sm:py-10 text-center">
          <h2 className="text-xl sm:text-3xl font-bold text-white leading-snug drop-shadow-md">
            Register a family for Back to School
          </h2>
          <p className="mt-2 text-sm sm:text-base text-brand-100 drop-shadow-sm">
            Free books and supplies for every student. Three minutes, three steps.
          </p>
        </div>
      </div>
      {/* Spacer — the Tobago photo breathes between hero and step tracker */}
      <div className="h-8 sm:h-10" aria-hidden="true" />
      {/* Wizard header — step tracker floats on the photo, text reads via strong shadow */}
      <header className="motion-safe:bts-fade-in-up">
        <nav aria-label="Registration progress" className="mt-2">
          <ol className="flex items-center gap-0">
            {STEPS.map((label, i) => (
              <li key={label} className="flex items-center flex-1 min-w-0">
                {/* Step bubble */}
                <div
                  className={[
                    "flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-all duration-200 shadow-md",
                    i < state.step
                      ? "bg-brand-500 text-white ring-2 ring-brand-300/60"
                      : i === state.step
                        ? "bg-brand-500 text-white ring-4 ring-brand-400/40 scale-110"
                        : "bg-brand-950/70 text-white ring-1 ring-white/30",
                  ].join(" ")}
                  aria-current={i === state.step ? "step" : undefined}
                >
                  {i < state.step ? "✓" : i + 1}
                </div>

                {/* Step label — hidden on very small screens to save space */}
                <span
                  className={[
                    "ml-2 sm:ml-3 text-xs sm:text-sm font-medium truncate transition-colors hidden sm:block",
                    i < state.step
                      ? "text-brand-200 [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]"
                      : i === state.step
                        ? "text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]"
                        : "text-white/80 [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]",
                  ].join(" ")}
                >
                  {label}
                </span>

                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div
                    aria-hidden="true"
                    className={[
                      "ml-2 sm:ml-4 h-px flex-1 transition-colors duration-300",
                      i < state.step ? "bg-brand-400" : "bg-white/30",
                    ].join(" ")}
                  />
                )}
              </li>
            ))}
          </ol>
        </nav>
      </header>

      {/* Draft resume banner */}
      {draft.hadDraft && (
        <div className="motion-safe:bts-card-enter rounded-xl border border-brand-500/40 bg-brand-900/60 backdrop-blur-md p-4 text-sm text-white flex flex-wrap items-center gap-3 shadow-lg">
          <p className="flex-1 min-w-[200px]">
            We restored the draft you started earlier.
          </p>
          <button
            type="button"
            onClick={() => draft.dismissDraft()}
            className="text-xs font-bold text-brand-300 underline hover:text-white transition-colors"
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

      {/* Steps — transitions animated between states */}
      <div className="motion-safe:bts-card-enter" key={state.step}>
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

      <p className="text-center pt-2">
        <Link
          href="/bts"
          className="text-xs font-semibold text-white underline underline-offset-2 [text-shadow:0_2px_8px_rgba(0,0,0,0.55)] hover:text-brand-100 transition-colors min-h-[44px] inline-flex items-center"
        >
          &larr; Back to home
        </Link>
      </p>
    </div>
  );
}
