"use client";

import { useState, use } from "react";
import { BasketIcon } from "@/components/md-illustrations";

export default function MdSurveyPage({ searchParams }: { searchParams: Promise<{ aid?: string }> }) {
  const params = use(searchParams);
  const aid = params.aid ?? "";

  const [receivedNeeded, setReceivedNeeded] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comments, setComments] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!aid) {
      setError("Missing application ID. Please use the link from your confirmation.");
      return;
    }
    if (!receivedNeeded) {
      setError("Please let us know if you received what you needed.");
      return;
    }
    if (rating < 1 || rating > 5) {
      setError("Please select a star rating.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: aid,
          site: "md",
          receivedNeeded,
          rating,
          comments: comments || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="motion-safe:md-animate-fade-in-up flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-6 motion-safe:md-animate-float">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
            <svg viewBox="0 0 64 64" className="h-14 w-14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 20 32 L 28 40 L 44 24"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">Thank you!</h1>
        <p className="mt-3 max-w-md text-sm text-amber-100/90 drop-shadow-sm">
          Your feedback helps us improve future hamper distributions. We appreciate you taking the time
          to share your experience.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="motion-safe:md-animate-fade-in-up flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 ring-1 ring-inset ring-amber-400/40 backdrop-blur-sm shadow-lg">
          <BasketIcon className="h-9 w-9 text-amber-300" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">Post-Event Survey</h1>
        <p className="mt-2 max-w-md text-sm text-amber-100/90 drop-shadow-sm">
          Tell us how the Market Day hamper distribution went for your household.
        </p>
        {aid && (
          <p className="mt-3 rounded-full bg-amber-950/70 backdrop-blur-md border border-amber-400/40 px-4 py-1.5 text-xs font-mono font-medium text-amber-200">
            Application ID: {aid}
          </p>
        )}
      </div>

      {/* Form card */}
      <form
        onSubmit={handleSubmit}
        className="motion-safe:md-animate-fade-in-up motion-safe:md-delay-1 mx-auto max-w-lg space-y-6 rounded-2xl border border-amber-100 bg-white p-6 shadow-sm sm:p-8"
      >
        {/* Received needed */}
        <fieldset>
          <legend className="mb-3 block text-sm font-semibold text-gray-800">
            Did you receive what you needed?
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "yes", label: "Yes" },
              { value: "partially", label: "Partially" },
              { value: "no", label: "No" },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-center justify-center rounded-xl border-2 px-2 py-3 text-sm font-medium transition-all min-h-[52px] ${
                  receivedNeeded === opt.value
                    ? "border-amber-500 bg-amber-50 text-amber-800"
                    : "border-gray-200 text-gray-600 hover:border-amber-300"
                }`}
              >
                <input
                  type="radio"
                  name="receivedNeeded"
                  value={opt.value}
                  checked={receivedNeeded === opt.value}
                  onChange={() => setReceivedNeeded(opt.value)}
                  className="sr-only"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Star rating */}
        <fieldset>
          <legend className="mb-3 block text-sm font-semibold text-gray-800">
            How would you rate the experience?
          </legend>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-3xl transition-transform hover:scale-110 flex h-12 w-12 items-center justify-center rounded-lg origin-center"
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
                aria-pressed={rating === star}
              >
                <span className={star <= (hoverRating || rating) ? "text-amber-400" : "text-gray-300"}>
                  &#9733;
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        {/* Comments */}
        <div>
          <label htmlFor="comments" className="mb-1 block text-sm font-semibold text-gray-800">
            Any comments? <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
          placeholder="Share what worked well or what could be improved…"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-amber-500 focus:shadow-[0_0_0_4px_rgba(217,119,6,0.12)] focus:outline-none transition-all"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="motion-safe:md-animate-pulse-warm inline-flex w-full min-h-[56px] items-center justify-center rounded-xl bg-amber-500 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-amber-600/25 transition-all hover:bg-amber-600 active:scale-95 disabled:opacity-60 disabled:shadow-sm"
        >
          {submitting ? "Submitting…" : "Submit Survey"}
        </button>
      </form>
    </div>
  );
}