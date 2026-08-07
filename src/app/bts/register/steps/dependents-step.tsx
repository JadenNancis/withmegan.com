"use client";

import { useRef, useState } from "react";
import { Field, TextInput, TextArea, Select } from "@/components/form";
import { OTHER_SCHOOL_VALUE, schoolsByCategory } from "@/lib/bts-schools";

export interface DependentForm {
  studentName: string;
  schoolName: string;
  manualSchoolName: string;
  manualSchoolAddress: string;
  gradeLevel: string;
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

  function add() {
    onChange([...dependents, emptyDependent()]);
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
    <section className="space-y-4">
      <div className="rounded-card border border-brand-100 bg-white p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-brand-900">Your students</h2>
        <p className="mt-1 text-sm text-brand-700">
          Add every child you&rsquo;re registering. Book list is optional.
        </p>
      </div>

      {dependents.map((dep, i) => {
        const isCollapsed = collapsed.has(i);
        const isOther = dep.schoolName === OTHER_SCHOOL_VALUE;
        return (
          <article
            key={i}
            className="rounded-card border border-brand-100 bg-white shadow-sm overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggleCollapsed(i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-brand-50/50 transition-colors"
              aria-expanded={!isCollapsed}
            >
              <span className="text-sm font-bold text-brand-900">
                {dep.studentName.trim() ? dep.studentName : `Student ${i + 1}`}
                {dep.gradeLevel && (
                  <span className="ml-2 text-xs font-medium text-gray-500">
                    · {dep.gradeLevel}
                  </span>
                )}
              </span>
              <svg
                viewBox="0 0 24 24"
                className={`h-5 w-5 text-brand-600 transition-transform ${isCollapsed ? "" : "rotate-180"}`}
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
              <div className="px-5 pb-5 pt-1 border-t border-brand-50 space-y-1">
                <Field label="Student full name" required>
                  <TextInput
                    value={dep.studentName}
                    onChange={(e) => update(i, { studentName: e.target.value })}
                    autoFocus={i === dependents.length - 1 && !dep.studentName}
                  />
                </Field>

                <Field label="Grade level" required>
                  <TextInput
                    value={dep.gradeLevel}
                    onChange={(e) => update(i, { gradeLevel: e.target.value })}
                    placeholder="e.g. Standard 3, Form 2"
                  />
                </Field>

                <Field label="School" required>
                  <Select
                    value={dep.schoolName}
                    onChange={(e) => update(i, { schoolName: e.target.value })}
                  >
                    <option value="">Select a school…</option>
                    {schoolsByCategory().map((cat) => (
                      <optgroup key={cat.category} label={cat.category}>
                        {cat.schools.map((s) => (
                          <option key={s.name} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    <option value={OTHER_SCHOOL_VALUE}>Other (enter manually)</option>
                  </Select>
                </Field>

                {isOther && (
                  <>
                    <Field label="School name (manual entry)" required>
                      <TextInput
                        value={dep.manualSchoolName}
                        onChange={(e) => update(i, { manualSchoolName: e.target.value })}
                      />
                    </Field>
                    <Field label="School address (optional)">
                      <TextInput
                        value={dep.manualSchoolAddress}
                        onChange={(e) => update(i, { manualSchoolAddress: e.target.value })}
                      />
                    </Field>
                  </>
                )}

                <Field label="Book list (PDF or Word, optional)">
                  <BookListUpload
                    dep={dep}
                    uploading={uploadingIdx === i}
                    onSelect={(file) => uploadBookList(i, file)}
                  />
                  {uploadErr && uploadingIdx === null && (
                    <p className="mt-1 text-xs text-red-600">{uploadErr}</p>
                  )}
                </Field>

                <Field label="Notes — special needs, items you already have (optional)">
                  <TextArea
                    value={dep.notes}
                    onChange={(e) => update(i, { notes: e.target.value })}
                    rows={2}
                  />
                </Field>

                {dependents.length > 1 && (
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="text-xs font-bold text-red-600 hover:text-red-800"
                    >
                      Remove this student
                    </button>
                  </div>
                )}
              </div>
            )}
          </article>
        );
      })}

      <button
        type="button"
        onClick={add}
        className="w-full rounded-card border-2 border-dashed border-brand-300 bg-white px-4 py-4 text-sm font-bold text-brand-700 hover:bg-brand-50 hover:border-brand-400 transition-colors"
      >
        + Add another student
      </button>

      {/* Nav */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-gray-300 bg-white px-6 text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 inline-flex min-h-[52px] items-center justify-center rounded-xl bg-brand-600 px-6 text-base font-bold text-white shadow-sm hover:bg-brand-700 transition-colors"
        >
          Continue → Review
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Book-list upload — big tap zone with inline progress              */
/* ------------------------------------------------------------------ */
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
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
      <p className="mt-1 text-xs text-brand-600">PDF or Word — or skip this step</p>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
        }}
      />
    </button>
  );
}
