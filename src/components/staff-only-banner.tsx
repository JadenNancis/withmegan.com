"use client";

/**
 * Banner shown on features that are staff-only during the launch phase.
 * Lets staff/admin know the feature isn't public yet, while remaining
 * invisible to non-staff visitors (who don't see the nav links either).
 */
export function StaffOnlyBanner() {
  return (
    <div className="mb-6 rounded-xl border border-amber-300/40 bg-amber-500/15 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <svg
          className="mt-0.5 h-5 w-5 shrink-0 text-amber-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <div>
          <p className="text-sm font-semibold text-amber-100">
            Staff preview
          </p>
          <p className="mt-0.5 text-xs text-amber-200/80 leading-relaxed">
            This feature is visible to administrators and staff only. It will
            be released to the public in a later phase.
          </p>
        </div>
      </div>
    </div>
  );
}