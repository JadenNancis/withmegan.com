"use client";

import { Field, TextInput, Select } from "@/components/form";
import { BTS_LOCATIONS, OTHER_LOCATION_VALUE } from "@/lib/bts-locations";
import { formatTtPhone } from "@/lib/tt-phone";

export interface GuardianState {
  fullName: string;
  contactNumber: string;
  email: string;
  address: string;
  manualAddress: string;
}

export function GuardianStep({
  state,
  onChange,
  onNext,
}: {
  state: GuardianState;
  onChange: (p: Partial<GuardianState>) => void;
  onNext: () => void;
}) {
  return (
    <section className="rounded-card border border-brand-100 bg-white p-5 sm:p-6 shadow-sm space-y-1">
      <h2 className="text-lg font-bold text-brand-900 mb-4">About you (the parent or guardian)</h2>

      <Field label="Full name" required>
        <TextInput
          value={state.fullName}
          onChange={(e) => onChange({ fullName: e.target.value })}
          autoComplete="name"
          autoFocus
        />
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
        <p className="mt-1 text-xs text-gray-500">
          We&rsquo;ll text your Application ID to this number.
        </p>
      </Field>

      <Field label="Email address">
        <TextInput
          value={state.email}
          onChange={(e) => onChange({ email: e.target.value })}
          type="email"
          inputMode="email"
          autoComplete="email"
        />
        <p className="mt-1 text-xs text-gray-500">Optional — helpful if SMS fails.</p>
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
            placeholder="Enter your community name"
          />
        </Field>
      )}

      <div className="pt-4">
        <button
          type="button"
          onClick={onNext}
          className="w-full inline-flex min-h-[52px] items-center justify-center rounded-xl bg-brand-600 px-6 text-base font-bold text-white shadow-sm hover:bg-brand-700 transition-colors"
        >
          Continue → Students
        </button>
      </div>
    </section>
  );
}
