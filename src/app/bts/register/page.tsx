"use client";

import { useState } from "react";
import Link from "next/link";
import { GuardianStep } from "./steps/guardian-step";
import { DependentsStep, type DependentForm, emptyDependent } from "./steps/dependents-step";
import { ReviewStep, type SubmitResult } from "./steps/review-step";
import { SuccessCard } from "./success-card";
import { InterestCard } from "./interest-card";
import { useWizardDraft } from "./draft";
import { OTHER_LOCATION_VALUE } from "@/lib/bts-locations";
import { OTHER_SCHOOL_VALUE } from "@/lib/bts-schools";

const STEPS = ["Parent/Guardian", "Children/Students", "Review"] as const;
type StepIndex = 0 | 1 | 2;

interface WizardState {
  fullName: string;
  nationalId: string;
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
  nationalId: "",
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
  const [waitlistCommunity, setWaitlistCommunity] = useState<string | null>(null);

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
      if (!state.nationalId.trim()) return "National ID is required.";
      if (!state.contactNumber.trim()) return "Contact number is required.";
      if (!state.address) return "Select your community.";
      if (state.address === OTHER_LOCATION_VALUE && !state.manualAddress.trim())
        return "Enter your community.";
      return null;
    }
    if (state.step === 1) {
      for (let i = 0; i < state.dependents.length; i++) {
        const d = state.dependents[i];
        if (!d.studentName.trim()) return `Child/Student ${i + 1}: name is required.`;
        if (!d.gradeLevel.trim()) return `Child/Student ${i + 1}: grade level is required.`;
        if (!d.schoolName) return `Child/Student ${i + 1}: school is required.`;
        if (d.schoolName === OTHER_SCHOOL_VALUE && !d.manualSchoolName.trim())
          return `Child/Student ${i + 1}: enter the school name.`;
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
          nationalId: state.nationalId,
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
      const data = (await res.json()) as {
        served?: boolean;
        thaId?: string;
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        throw new Error(data.message ?? data.error ?? "Registration failed. Please try again.");
      }

      // Outside the served district — recorded as interest, no ID or QR.
      if (data.served === false) {
        setWaitlistCommunity(payload.guardian.address);
        draft.clear();
        window.scrollTo({ top: 0 });
        return;
      }

      if (!data.thaId) {
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
    setWaitlistCommunity(null);
    setState({ ...initialState, dependents: [emptyDependent()] });
    window.scrollTo({ top: 0 });
  }

  if (waitlistCommunity) {
    return <InterestCard community={waitlistCommunity} onRegisterAnother={resetForAnother} />;
  }

  if (result) {
    return <SuccessCard result={result} onRegisterAnother={resetForAnother} />;
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
            Free books and supplies for every child/student. Three minutes, three steps.
          </p>
        </div>
      </div>
      {/* Spacer — the Tobago photo breathes between hero and step tracker */}
      <div className="h-8 sm:h-10" aria-hidden="true" />
      {/* Wizard header — step tracker spans the same width as the hero above */}
      <header className="motion-safe:bts-fade-in-up -mx-4">
        <nav aria-label="Registration progress" className="mt-2 px-5 sm:px-6">
          <ol className="relative grid grid-cols-3 place-items-center">
            {/* Single continuous track — spans bubble 1 center → bubble 3 center
                Bubbles are at 16.67%, 50%, 83.33% of ol width (3 equal columns).
                Track is centered on bubble row (top = half bubble height). */}
            <div
              aria-hidden="true"
              className="absolute left-[16.667%] right-[16.667%] top-4 sm:top-[1.125rem] -translate-y-1/2 h-1 rounded-full bg-white/50 shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
            />
            {/* Progress fill — colored portion: 0% at step 1, 50% at step 2, 100% at step 3 */}
            <div
              aria-hidden="true"
              className="absolute left-[16.667%] top-4 sm:top-[1.125rem] -translate-y-1/2 h-1 rounded-full bg-brand-400 shadow-[0_1px_3px_rgba(0,0,0,0.5)] transition-all duration-500"
              style={{ width: `calc((100% - 33.333%) * ${state.step} / 2)` }}
            />
            {STEPS.map((label, i) => (
              <li
                key={label}
                className="flex flex-col items-center gap-1.5 relative z-10"
              >
                {/* Step bubble — centers on the track line via margin trick */}
                <div
                  className={[
                    "flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.5)]",
                    i < state.step
                      ? "bg-brand-500 text-white ring-2 ring-brand-300/80"
                      : i === state.step
                        ? "bg-brand-500 text-white ring-4 ring-brand-300/60 scale-110"
                        : "bg-brand-950/80 text-white ring-1 ring-white/40",
                  ].join(" ")}
                  aria-current={i === state.step ? "step" : undefined}
                >
                  {i < state.step ? "✓" : i + 1}
                </div>

                {/* Step label under the bubble — always visible */}
                <span
                  className={[
                    "text-[10px] sm:text-xs font-semibold leading-tight whitespace-nowrap transition-colors",
                    i < state.step
                      ? "text-brand-200 [text-shadow:0_2px_8px_rgba(0,0,0,0.7)]"
                      : i === state.step
                        ? "text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.7)]"
                        : "text-white/85 [text-shadow:0_2px_8px_rgba(0,0,0,0.7)]",
                  ].join(" ")}
                >
                  {label}
                </span>
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
              nationalId: state.nationalId,
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
