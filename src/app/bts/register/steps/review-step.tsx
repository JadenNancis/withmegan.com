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
    <section className="space-y-4">
      <div className="rounded-card border border-brand-100 bg-white p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-brand-900">Review your registration</h2>
        <p className="mt-1 text-sm text-brand-700">
          Check everything below — after you submit, we&rsquo;ll send your Application ID.
        </p>

        <dl className="mt-5 space-y-4">
          <Row label="Your name" value={state.fullName} />
          <Row label="Contact number" value={state.contactNumber} />
          {state.email && <Row label="Email" value={state.email} />}
          <Row label="Community" value={state.address} />
        </dl>

        <div className="mt-6 border-t border-brand-100 pt-5">
          <h3 className="text-sm font-bold text-brand-900">
            {state.dependents.length}{" "}
            {state.dependents.length === 1 ? "student" : "students"}
          </h3>
          <ul className="mt-3 space-y-2">
            {state.dependents.map((d, i) => (
              <li
                key={i}
                className="rounded-lg border border-brand-100 bg-brand-50/40 px-3 py-2.5 text-sm"
              >
                <p className="font-semibold text-brand-900">{d.studentName}</p>
                <p className="text-xs text-gray-600">
                  {d.schoolName} · {d.gradeLevel}
                  {d.bookListUrl && " · Book list attached"}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Consent */}
      <div className="rounded-card border border-brand-100 bg-white p-5 shadow-sm">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            id="consent"
            type="checkbox"
            checked={state.consent}
            onChange={(e) => onChangeConsent(e.target.checked)}
            className="mt-1 h-5 w-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm text-gray-700 leading-relaxed">
            <span className="font-semibold">I consent</span> to the collection of my data
            and my dependents&rsquo; data, for the purpose of participating in Back to School
            with Megan.
          </span>
        </label>
      </div>

      {/* Nav */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-gray-300 bg-white px-6 text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="flex-1 inline-flex min-h-[56px] items-center justify-center rounded-xl bg-brand-600 px-6 text-lg font-bold text-white shadow-md hover:bg-brand-700 transition-colors disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit Registration"}
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
