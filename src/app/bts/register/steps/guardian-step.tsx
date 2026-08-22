"use client";

import { useState } from "react";
import { Field, TextInput, Select } from "@/components/form";
import { BTS_LOCATIONS, OTHER_LOCATION_VALUE } from "@/lib/bts-locations";
import { formatTtPhone } from "@/lib/tt-phone";

export interface GuardianState {
  fullName: string;
  nationalId: string;
  contactNumber: string;
  email: string;
  address: string;
  manualAddress: string;
  studentCount: number;
}

export function GuardianStep({
  state,
  onChange,
  onStudentCountChange,
  onNext,
}: {
  state: GuardianState;
  onChange: (p: Partial<GuardianState>) => void;
  onStudentCountChange: (count: number) => void;
  onNext: () => void;
}) {
  // Show the field empty until the guardian types a number. The default of
  // one dependent still applies underneath, so the step never dead-ends.
  const [countDraft, setCountDraft] = useState(
    state.studentCount > 1 ? String(state.studentCount) : "",
  );
  return (
    <section className="sticky-cta-host rounded-2xl border border-brand-100 bg-white p-5 sm:p-8 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] space-y-1">
      <h2 className="text-xl font-bold text-brand-900">Tell us about you</h2>
      <p className="mt-1 text-sm text-brand-700 mb-6">
        A couple of quick details so we can get your Application ID to you on time.
      </p>

      <Field label="Full name" required>
        <TextInput
          value={state.fullName}
          onChange={(e) => onChange({ fullName: e.target.value })}
          autoComplete="name"
          autoFocus
          placeholder="Your name"
        />
      </Field>

      <Field label="National ID" required>
        <TextInput
          value={state.nationalId}
          onChange={(e) => onChange({ nationalId: e.target.value })}
          inputMode="text"
          autoComplete="off"
          placeholder="e.g. 19850615031"
        />
        <p className="mt-1.5 text-sm text-gray-500">
          Your Trinidad and Tobago National ID or other government-issued identifier.
        </p>
      </Field>

      <Field label="Contact number" required>
        <TextInput
          value={state.contactNumber}
          onChange={(e) => onChange({ contactNumber: formatTtPhone(e.target.value) })}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="(868) 123-4567"
        />
        <p className="mt-1.5 text-sm text-gray-600">
          So we can reach you about your registration.
        </p>
      </Field>

      <Field label="Email address">
        <TextInput
          value={state.email}
          onChange={(e) => onChange({ email: e.target.value })}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="backup@youremail.com"
        />
        <p className="mt-1.5 text-sm text-gray-600">
          Optional. We&rsquo;ll email your Application ID as a backup copy.
        </p>
      </Field>

      <Field label="Your community" required>
        <Select
          value={state.address}
          onChange={(e) => onChange({ address: e.target.value })}
        >
          <option value="">Select your community…</option>
          {BTS_LOCATIONS.filter((l) => l !== OTHER_LOCATION_VALUE).map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
          <option value={OTHER_LOCATION_VALUE}>{OTHER_LOCATION_VALUE}</option>
        </Select>
      </Field>

      {state.address === OTHER_LOCATION_VALUE && (
        <Field label="Community name" required>
          <TextInput
            value={state.manualAddress}
            onChange={(e) => onChange({ manualAddress: e.target.value })}
            placeholder="Enter your community"
          />
        </Field>
      )}

      <Field label="How many children/students?" required>
        <TextInput
          type="number"
          inputMode="numeric"
          min={1}
          max={20}
          placeholder="e.g. 2"
          value={countDraft}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            setCountDraft(raw);
            const n = raw === "" ? 1 : Math.max(1, Math.min(20, parseInt(raw, 10)));
            onChange({ studentCount: n });
            onStudentCountChange(n);
          }}
          className="w-28"
        />
        <p className="mt-1.5 text-sm text-gray-500">
          Add every child/student in your household. You&rsquo;ll fill their details next.
        </p>
      </Field>

      <div className="pt-6 sticky-cta">
        <button
          type="button"
          onClick={onNext}
          className="w-full inline-flex min-h-[56px] items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 text-base font-bold text-white shadow-lg shadow-brand-700/25 hover:bg-brand-800 hover:shadow-xl hover:shadow-brand-700/30 active:scale-95 transition-all duration-150"
        >
          Continue
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
}
