import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Label({ children, htmlFor, required }: { children: ReactNode; htmlFor?: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

export function Field({ label, htmlFor, required, error, children }: { label: string; htmlFor?: string; required?: boolean; error?: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <Label htmlFor={htmlFor} required={required}>{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

const inputBase =
  "w-full min-h-[44px] rounded-md border border-gray-300 px-3 py-2.5 text-base sm:text-sm shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputBase, props.className)} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputBase, props.className)} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputBase, props.className)} />;
}

export function SubmitButton({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <button
      type="submit"
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2.5 text-base sm:text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors min-h-[44px]",
        className,
      )}
    >
      {children}
    </button>
  );
}