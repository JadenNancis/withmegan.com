"use client";

import Link from "next/link";
import { TobagoMapBadge } from "@/components/md-illustrations";

/**
 * Shown when someone registers from a community the programme doesn't serve
 * yet. Their details are on file, but there is no Application ID or QR code
 * to issue — so this screen deliberately offers neither.
 */
export function InterestCard({
  community,
  onRegisterAnother,
}: {
  community: string;
  onRegisterAnother: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl space-y-5 py-2 sm:py-6">
      <div className="rounded-2xl border border-amber-100 bg-white p-6 sm:p-10 text-center shadow-lg">
        <div className="motion-safe:md-animate-celebrate mx-auto mb-6 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-50 shadow-inner">
          <TobagoMapBadge className="h-12 w-12 sm:h-14 sm:w-14" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-amber-900">
          Thank you for registering
        </h1>

        <p className="mx-auto mt-4 max-w-md text-base text-gray-700 leading-relaxed">
          We will inform you when this initiative becomes available for your
          community.
        </p>

        <p className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 ring-1 ring-inset ring-amber-200">
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {community}
        </p>

        <p className="mx-auto mt-6 max-w-md text-sm text-gray-600 leading-relaxed">
          Market Day with Megan currently serves the Mt. St. George/Goodwood
          electoral district. Your details are safely on file.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/md"
          className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-amber-600 px-6 text-base font-bold text-white shadow-lg shadow-amber-600/25 hover:bg-amber-700 active:scale-95 transition-all duration-150"
        >
          Back home
        </Link>
        <button
          type="button"
          onClick={onRegisterAnother}
          className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-gray-300 bg-white px-6 text-base font-semibold text-gray-800 shadow-sm hover:bg-gray-50 hover:border-gray-400 active:scale-95 transition-all duration-150"
        >
          Register another person
        </button>
      </div>
    </div>
  );
}
