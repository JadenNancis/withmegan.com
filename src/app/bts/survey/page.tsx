"use client";

import { useState, use } from "react";
import { SuccessCheckmark, SchoolBookIcon } from "@/components/bts-illustrations";

export default function BtsSurveyPage({ searchParams }: { searchParams: Promise<{ aid?: string }> }) {
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
          site: "bts",
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
      <div className="motion-safe:bts-fade-in-up flex flex-col items-center justify-center rounded-2xl border border-white/25 bg-brand-950/55 backdrop-blur-md py-12 px-6 text-center shadow-xl">
        <div className="motion-safe:bts-float mb-6">
          <SuccessCheckmark className="h-24 w-24 drop-shadow-lg" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">Thank you!</h1>
        <p className="mt-3 max-w-md text-sm text-brand-100/90">
          Your feedback helps us improve future book drives. We appreciate you taking the time to share
          your experience.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="motion-safe:bts-fade-in-up text-center rounded-2xl border border-white/25 bg-brand-950/55 backdrop-blur-md px-6 py-6 shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
          Post-Event Survey
        </h1>
        <p className="mt-2 text-sm sm:text-base text-brand-100/90 max-w-lg mx-auto leading-relaxed">
          Tell us how the Back to School book drive went for your family.
        </p>
        {aid && (
          <p className="mt-4 inline-block rounded-full bg-brand-950/70 backdrop-blur-md border border-brand-400/40 px-4 py-1.5 text-xs font-mono font-medium text-brand-200">
            Application ID: {aid}
          </p>
        )}
      </div>

      {/* Form card */}
      <form
        onSubmit={handleSubmit}
        className="motion-safe:bts-fade-in-up mx-auto max-w-lg space-y-6 rounded-2xl border border-brand-100 bg-white p-6 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] sm:p-8"
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
                className={`flex cursor-pointer items-center justify-center rounded-xl border-2 px-2 py-3 text-sm font-semibold transition-all min-h-[52px] ${
                  receivedNeeded === opt.value
                    ? "border-brand-500 bg-brand-50 text-brand-800"
                    : "border-gray-200 text-gray-600 hover:border-brand-300 hover:bg-brand-50/30"
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
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:shadow-[0_0_0_4px_rgba(8,145,178,0.12)] focus:outline-none transition-all"
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
          className="w-full inline-flex min-h-[56px] items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 text-base font-bold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/30 hover:-translate-y-px active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none disabled:shadow-sm transition-all duration-150"
        >
          {submitting ? "Submitting…" : "Submit survey"}
        </button>
      </form>
    </div>
  );
}