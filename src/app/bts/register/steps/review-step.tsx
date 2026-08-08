"use client";

import type { DependentForm } from "./dependents-step";

export interface SubmitResult {
  thaId: string;
  qrCode: string | null;
  phone: string;
  dependentsCount: number;
}

interface ReviewState {
  fullName: string;
  contactNumber: string;
  email: string;
  address: string;
  manualAddress: string;
  consent: boolean;
  dependents: DependentForm[];
}

export function ReviewStep({
  state,
  onChangeConsent,
  onBack,
  onSubmit,
  submitting,
}: {
  state: ReviewState;
  onChangeConsent: (v: boolean) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-brand-100 bg-white p-5 sm:p-8 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)]">
        <h2 className="text-xl font-bold text-brand-900">Almost done</h2>
        <p className="mt-1 text-sm text-brand-700">
          Give everything one last look. Your Application ID arrives as soon as you submit.
        </p>

        <dl className="mt-6 grid gap-3 sm:gap-4 sm:grid-cols-2">
          <Row label="Your name" value={state.fullName} />
          <Row label="Contact number" value={state.contactNumber} />
          {state.email && <Row label="Email" value={state.email} />}
          <Row label="Community" value={state.address} />
        </dl>

        <div className="mt-6 border-t border-brand-100 pt-5">
          <h3 className="text-sm font-bold uppercase tracking-wide text-brand-600">
            {state.dependents.length}{" "}
            {state.dependents.length === 1 ? "student" : "students"}
          </h3>
          <ul className="mt-3 grid gap-2">
            {state.dependents.map((d, i) => (
              <li
                key={i}
                className="rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3"
              >
                <p className="font-semibold text-brand-900">{d.studentName}</p>
                <p className="text-sm text-gray-600 mt-0.5">
                  {d.schoolName} · {d.gradeLevel}
                  {d.bookListUrl && " · Book list attached"}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Consent */}
      <div className="rounded-2xl border border-brand-100 bg-white p-5 sm:p-6 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.06)]">
        <label className="flex items-start gap-4 cursor-pointer">
          <input
            id="consent"
            type="checkbox"
            checked={state.consent}
            onChange={(e) => onChangeConsent(e.target.checked)}
            className="mt-1 h-6 w-6 shrink-0 rounded-lg border-gray-300 bg-white text-brand-600 focus:ring-brand-500 focus:ring-offset-2"
          />
          <span className="text-sm text-gray-700 leading-relaxed">
            I consent to my data and my dependents&rsquo; data being collected for the purposes
            of participating in Back to School with Megan.
          </span>
        </label>
      </div>

      {/* Nav */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-3">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="inline-flex min-h-[52px] sm:min-h-[56px] items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 text-base font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:scale-95 transition-all duration-150 disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="flex-1 inline-flex min-h-[56px] items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 text-lg font-bold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/30 active:scale-95 transition-all duration-150 disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit registration"}
          {!submitting && (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
      <dt className="w-32 shrink-0 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </dt>
      <dd className="text-sm font-medium text-gray-900">{value}</dd>
    </div>
  );
}
