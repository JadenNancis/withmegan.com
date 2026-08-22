import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Label({ children, htmlFor, required }: { children: ReactNode; htmlFor?: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-gray-800 mb-1.5">
      {children}
      {required && <span className="text-brand-600 ml-1">*</span>}
    </label>
  );
}

export function Field({ label, htmlFor, required, error, children }: { label: string; htmlFor?: string; required?: boolean; error?: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      <Label htmlFor={htmlFor} required={required}>{label}</Label>
      {children}
      {error && <p className="mt-1.5 text-sm text-red-600" role="alert">{error}</p>}
    </div>
  );
}

const inputBase =
  "w-full min-h-[52px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 shadow-[0_0_0_0_rgba(8,145,178,0)] transition-all duration-150 " +
  "focus:border-brand-500 focus:shadow-[0_0_0_4px_rgba(8,145,178,0.12)] focus:outline-none " +
  "disabled:bg-gray-50 disabled:text-gray-500";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputBase, props.className)} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputBase, props.className)} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(inputBase, "cursor-pointer appearance-none pr-10 select-chevron", props.className)}
    />
  );
}

const SUBMIT_TONES = {
  brand:
    "bg-brand-700 shadow-brand-700/25 hover:bg-brand-800 hover:shadow-brand-700/30",
  amber:
    "bg-amber-600 shadow-amber-600/25 hover:bg-amber-700 hover:shadow-amber-600/30",
} as const;

/**
 * `tone` picks the accent rather than letting callers override `bg-*` via
 * className — `cn()` is a plain joiner, so two competing Tailwind background
 * utilities would both land in the class list and stylesheet order, not the
 * caller, would decide the winner.
 */
export function SubmitButton({
  children,
  className,
  tone = "brand",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  tone?: keyof typeof SUBMIT_TONES;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="submit"
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-bold text-white " +
        "shadow-lg active:scale-95 " +
        "disabled:opacity-60 disabled:pointer-events-none disabled:shadow-sm transition-all duration-150 min-h-[56px]",
        SUBMIT_TONES[tone],
        className,
      )}
    >
      {children}
    </button>
  );
}
