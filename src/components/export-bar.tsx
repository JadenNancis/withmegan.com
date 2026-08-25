"use client";

import { useState } from "react";

type ExportScope = "all" | "district" | "outside";

const SCOPE_OPTIONS: { value: ExportScope; label: string }[] = [
  { value: "all", label: "Entire database" },
  { value: "district", label: "In the district" },
  { value: "outside", label: "Outside the district" },
];

interface ExportBarProps {
  site: "bts" | "md";
  /** Button classes for the PDF download (site accent). */
  pdfClassName?: string;
  /** Button classes for the CSV download. */
  csvClassName?: string;
}

/**
 * Export controls for the reports pages. A scope dropdown sits next to the
 * download buttons and filters the export to the entire database, only the
 * electoral district (Mt. St. George/Goodwood), or only registrations
 * outside it. The buttons download the matching CSV/PDF from /api/export.
 */
export function ExportBar({
  site,
  pdfClassName = "bg-blue-600 hover:bg-blue-700",
  csvClassName = "bg-green-600 hover:bg-green-700",
}: ExportBarProps) {
  const [scope, setScope] = useState<ExportScope>("all");

  const href = (format: "csv" | "pdf") =>
    `/api/export?site=${site}&format=${format}${scope === "all" ? "" : `&scope=${scope}`}`;

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:items-stretch">
      <label className="relative sm:self-stretch">
        <span className="sr-only">Export scope</span>
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value as ExportScope)}
          title="What to export"
          className="h-full min-h-[44px] w-full sm:w-auto cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-3.5 pr-9 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:border-gray-300 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          {SCOPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </label>

      <a
        href={href("csv")}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex min-h-[44px] items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors active:scale-95 ${csvClassName}`}
      >
        Export Sheet (CSV)
      </a>
      <a
        href={href("pdf")}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex min-h-[44px] items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors active:scale-95 ${pdfClassName}`}
      >
        Export PDF
      </a>
    </div>
  );
}
