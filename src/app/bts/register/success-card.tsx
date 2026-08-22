"use client";

import Link from "next/link";
import { SuccessCheckmark } from "@/components/bts-illustrations";
import { SITES } from "@/sites/site-registry";
import type { SubmitResult } from "./steps/review-step";

export function SuccessCard({
  result,
  onRegisterAnother,
}: {
  result: SubmitResult;
  onRegisterAnother: () => void;
}) {
  function downloadIcs() {
    const d = new Date(SITES.bts.eventDate + "T09:00:00");
    const pad = (n: number) => String(n).padStart(2, "0");
    const stamp = (x: Date) =>
      `${x.getUTCFullYear()}${pad(x.getUTCMonth() + 1)}${pad(x.getUTCDate())}T${pad(
        x.getUTCHours(),
      )}${pad(x.getUTCMinutes())}00Z`;
    const end = new Date(d.getTime() + 4 * 60 * 60 * 1000);
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//withmegan//bts//EN",
      "BEGIN:VEVENT",
      `UID:${result.thaId}@withmegan`,
      `DTSTAMP:${stamp(new Date())}`,
      `DTSTART:${stamp(d)}`,
      `DTEND:${stamp(end)}`,
      "SUMMARY:Back to School with Megan · Collection Day",
      `DESCRIPTION:Your Application ID is ${result.thaId}. Show it (or your QR code) at the distribution counter.`,
      "LOCATION:Mt. St. George Community Centre\\, Tobago",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bts-collection-${result.thaId}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-xl space-y-5 py-2 sm:py-6">
      {/* Celebration header + ID share one white surface so the copy stays
          legible over the photographic page background. */}
      <div className="rounded-2xl border border-brand-100 bg-white p-5 sm:p-8 text-center shadow-lg">
        <div className="motion-safe:bts-bounce-in mx-auto mb-5 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-200 drop-shadow-lg">
          <SuccessCheckmark className="h-20 w-20 sm:h-24 sm:w-24 drop-shadow-xl" />
        </div>
        <h1 className="text-title text-brand-900">You&rsquo;re all set</h1>
        <p className="mx-auto mt-3 max-w-md text-body text-gray-700 leading-relaxed">
          Take a screenshot of this screen and keep your Application ID somewhere
          safe. You&rsquo;ll show it on collection day.
        </p>

        <div className="mt-6 rounded-2xl border-2 border-dashed border-brand-300 bg-gradient-to-br from-brand-50 to-white p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700">
            Your Application ID
          </p>
          <p className="mt-3 text-3xl sm:text-4xl font-bold font-mono tracking-wider text-brand-900 break-all leading-tight">
            {result.thaId}
          </p>
          {result.qrCode && (
            <div className="mt-5 inline-block rounded-2xl bg-white p-3 sm:p-4 shadow-md ring-1 ring-brand-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result.qrCode} alt="QR code for event day" width={180} height={180} className="w-40 h-40 sm:w-[180px] sm:h-[180px]" />
            </div>
          )}
          <p className="mt-4 text-sm text-gray-600">
            {result.dependentsCount}{" "}
            {result.dependentsCount === 1 ? "child/student" : "children/students"} registered
          </p>
        </div>
      </div>

      {/* Action grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={downloadIcs}
          className="flex flex-col items-center justify-center rounded-xl bg-brand-700 px-4 py-4 text-center shadow-lg shadow-brand-700/25 hover:bg-brand-800 hover:shadow-xl hover:shadow-brand-700/30 active:scale-95 transition-all duration-150 min-h-[80px] text-white"
        >
          <span className="text-sm font-bold">Add to calendar</span>
          <span className="mt-0.5 text-xs text-brand-100">
            {new Date(SITES.bts.eventDate + "T12:00:00").toLocaleDateString("en-TT", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </button>
        <Link
          href="/bts"
          className="flex flex-col items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-4 text-center shadow-sm hover:bg-gray-50 hover:border-gray-400 hover:shadow active:scale-95 transition-all duration-150 min-h-[80px]"
        >
          <span className="text-sm font-bold text-gray-800">Back home</span>
          <span className="mt-0.5 text-xs text-gray-600">Return to the site</span>
        </Link>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={onRegisterAnother}
          className="text-sm font-semibold text-white underline underline-offset-2 [text-shadow:0_2px_8px_rgba(0,0,0,0.55)] hover:text-brand-100 transition-colors min-h-[44px] inline-flex items-center"
        >
          Register another family
        </button>
      </div>
    </div>
  );
}
