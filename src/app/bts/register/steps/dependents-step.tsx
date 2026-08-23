"use client";

import { useRef, useState } from "react";
import { Field, TextInput, Select, TextArea } from "@/components/form";
import { SchoolPicker } from "@/components/school-picker";
import {
  OTHER_SCHOOL_VALUE,
  OTHER_GRADE_VALUE,
  gradesForSchool,
} from "@/lib/bts-schools";

export interface DependentForm {
  studentName: string;
  schoolName: string;
  manualSchoolName: string;
  manualSchoolAddress: string;
  gradeLevel: string;
  manualGradeLevel: string;
  notes: string;
  bookListUrl: string;
  bookListFileName: string;
}

export function emptyDependent(): DependentForm {
  return {
    studentName: "",
    schoolName: "",
    manualSchoolName: "",
    manualSchoolAddress: "",
    gradeLevel: "",
    manualGradeLevel: "",
    notes: "",
    bookListUrl: "",
    bookListFileName: "",
  };
}

export function DependentsStep({
  dependents,
  onChange,
  onNext,
  onBack,
}: {
  dependents: DependentForm[];
  onChange: (deps: DependentForm[]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  // Which cards are expanded. New cards start expanded; completed ones
  // can be collapsed to keep "3 kids" from being an endless scroll.
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  function update(i: number, patch: Partial<DependentForm>) {
    onChange(dependents.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  }

  function remove(i: number) {
    if (dependents.length <= 1) return;
    const next = dependents.filter((_, idx) => idx !== i);
    onChange(next);
    setCollapsed((prev) => {
      const copy = new Set<number>();
      for (const n of prev) {
        if (n < i) copy.add(n);
        else if (n > i) copy.add(n - 1);
      }
      return copy;
    });
  }

  function toggleCollapsed(i: number) {
    setCollapsed((prev) => {
      const copy = new Set(prev);
      if (copy.has(i)) copy.delete(i);
      else copy.add(i);
      return copy;
    });
  }

  async function uploadBookList(i: number, file: File) {
    setUploadErr(null);
    setUploadingIdx(i);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; filename?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
      update(i, { bookListUrl: data.url, bookListFileName: data.filename ?? file.name });
    } catch (e) {
      setUploadErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadingIdx(null);
    }
  }

  return (
    <section className="sticky-cta-host space-y-5">
      <div className="rounded-2xl border border-brand-100 bg-white p-5 sm:p-8 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)]">
        <h2 className="text-xl font-bold text-brand-900">Add your children/students</h2>
        <p className="mt-1 text-sm text-brand-700">
          Schools and grades. That&rsquo;s all this step needs from you.
        </p>
      </div>

      {dependents.map((dep, i) => {
        const isCollapsed = collapsed.has(i);
        const isOther = dep.schoolName === OTHER_SCHOOL_VALUE;
        return (
          <article
            key={i}
            className="rounded-2xl border border-brand-100 bg-white shadow-[0_2px_16px_-4px_rgba(0,0,0,0.06)] overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggleCollapsed(i)}
              className="w-full flex items-center justify-between px-5 py-4 sm:px-6 text-left hover:bg-brand-50/50 active:bg-brand-50/70 transition-colors min-h-[56px]"
              aria-expanded={!isCollapsed}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                  {i + 1}
                </span>
                <span className="truncate font-bold text-brand-900">
                  {dep.studentName.trim() ? dep.studentName : "Child/Student details"}
                  {dep.gradeLevel && (
                    <span className="ml-2 text-xs font-medium text-gray-500">
                      · {dep.gradeLevel}
                    </span>
                  )}
                </span>
              </div>
              <svg
                viewBox="0 0 24 24"
                className={`h-5 w-5 shrink-0 text-brand-600 transition-transform ${isCollapsed ? "" : "rotate-180"}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {!isCollapsed && (
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-4 border-t border-brand-50 space-y-1">
                <Field label="Child/Student&rsquo;s full name" required>
                  <TextInput
                    value={dep.studentName}
                    onChange={(e) => update(i, { studentName: e.target.value })}
                    autoFocus={i === dependents.length - 1 && !dep.studentName}
                    placeholder="Full name"
                  />
                </Field>

                <Field label="School" required>
                  <SchoolPicker
                    value={dep.schoolName}
                    onChange={(v) =>
                      // Changing school changes the grades available, so reset
                      // the grade (and any typed "Other" grade) with it.
                      update(i, {
                        schoolName: v,
                        gradeLevel: "",
                        manualGradeLevel: "",
                      })
                    }
                  />
                </Field>

                {isOther && (
                  <>
                    <Field label="School name" required>
                      <TextInput
                        value={dep.manualSchoolName}
                        onChange={(e) => update(i, { manualSchoolName: e.target.value })}
                        placeholder="School name"
                      />
                    </Field>
                    <Field label="School address (optional)">
                      <TextInput
                        value={dep.manualSchoolAddress}
                        onChange={(e) => update(i, { manualSchoolAddress: e.target.value })}
                        placeholder="Street or area"
                      />
                    </Field>
                  </>
                )}

                <Field label="Grade or form" required>
                  <Select
                    value={dep.gradeLevel}
                    onChange={(e) => update(i, { gradeLevel: e.target.value, manualGradeLevel: "" })}
                  >
                    <option value="">Select grade or form…</option>
                    {gradesForSchool(dep.schoolName).map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                    <option value={OTHER_GRADE_VALUE}>Other (enter manually)</option>
                  </Select>
                </Field>

                {dep.gradeLevel === OTHER_GRADE_VALUE && (
                  <Field label="Grade or form (manual entry)" required>
                    <TextInput
                      value={dep.manualGradeLevel}
                      onChange={(e) => update(i, { manualGradeLevel: e.target.value })}
                      placeholder="e.g. Standard 3, Form 2"
                    />
                  </Field>
                )}

                <Field label="Book list (optional)">
                  <BookListUpload
                    dep={dep}
                    uploading={uploadingIdx === i}
                    onSelect={(file) => uploadBookList(i, file)}
                  />
                  {uploadErr && uploadingIdx === null && (
                    <p className="mt-1.5 text-sm text-red-600">{uploadErr}</p>
                  )}
                </Field>

                <Field label="Notes (optional)">
                  <TextArea
                    value={dep.notes}
                    onChange={(e) => update(i, { notes: e.target.value })}
                    rows={2}
                    placeholder="Special needs, items you already have, anything we should know"
                  />
                </Field>

                {dependents.length > 1 && (
                  <div className="flex justify-end pt-3 border-t border-brand-50 mt-4">
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors min-h-[44px] px-2"
                    >
                      Remove child/student
                    </button>
                  </div>
                )}
              </div>
            )}
          </article>
        );
      })}

      {/* Nav — primary action pinned to the thumb on mobile */}
      <div className="sticky-cta flex flex-col-reverse sm:flex-row gap-3 pt-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-[52px] sm:min-h-[56px] items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 text-base font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:scale-95 transition-all duration-150"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 inline-flex min-h-[52px] sm:min-h-[56px] items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 text-base font-bold text-white shadow-lg shadow-brand-700/25 hover:bg-brand-800 hover:shadow-xl hover:shadow-brand-700/30 active:scale-95 transition-all duration-150"
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

/* ------------------------------------------------------------------ */
/*  Book-list upload — big tap zone with inline progress              */
/* ------------------------------------------------------------------ */
const ACCEPT = [
  ".pdf",
  ".doc",
  ".docx",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
].join(",");

function BookListUpload({
  dep,
  uploading,
  onSelect,
}: {
  dep: DependentForm;
  uploading: boolean;
  onSelect: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  if (dep.bookListUrl && !uploading) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-3 flex items-center gap-3 text-sm">
        <span className="text-green-600 font-bold">✓</span>
        <a
          href={dep.bookListUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 truncate font-medium text-green-800 underline"
        >
          {dep.bookListFileName || "Uploaded file"}
        </a>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-xs font-bold text-green-700 hover:text-green-900 underline"
        >
          Replace
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onSelect(file);
          }}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={uploading}
      className="w-full rounded-xl border-2 border-dashed border-brand-300 bg-brand-50/40 px-4 py-6 text-center hover:border-brand-400 hover:bg-brand-50 transition-colors disabled:opacity-60"
    >
      <p className="text-sm font-semibold text-brand-700">
        {uploading ? "Uploading…" : "Tap to attach a book list"}
      </p>
      <p className="mt-1 text-xs text-brand-600">PDF, Word, or a photo of the list — or skip this step</p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
        }}
      />
    </button>
  );
}
