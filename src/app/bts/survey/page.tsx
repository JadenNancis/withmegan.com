"use client";

import { useState, use } from "react";
import { SuccessCheckmark, WaveDivider, SchoolBookIcon } from "@/components/bts-illustrations";

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
      <div className="bts-fade-in-up flex flex-col items-center justify-center py-12 text-center">
        <div className="bts-float mb-6">
          <SuccessCheckmark className="h-24 w-24 drop-shadow-lg" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-cyan-900">Thank you!</h1>
        <p className="mt-3 max-w-md text-sm text-gray-600">
          Your feedback helps us improve future book drives. We appreciate you taking the time to share
          your experience.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subtle wave divider at top */}
      <div className="-mx-4 -mt-8 mb-2 h-10 overflow-hidden">
        <WaveDivider className="h-10 w-full" preserveAspectRatio="none" />
      </div>

      {/* Header */}
      <div className="bts-fade-in-up flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-cyan-50 shadow-sm">
          <SchoolBookIcon className="h-9 w-9" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-cyan-900">Post-Event Survey</h1>
        <p className="mt-2 max-w-md text-sm text-gray-600">
          Tell us how the Back to School book drive went for your family.
        </p>
        {aid && (
          <p className="mt-3 rounded-full bg-cyan-50 px-4 py-1.5 text-xs font-mono font-medium text-cyan-700">
            Application ID: {aid}
          </p>
        )}
      </div>

      {/* Form card */}
      <form
        onSubmit={handleSubmit}
        className="bts-fade-in-up mx-auto max-w-lg space-y-6 rounded-2xl border border-cyan-100 bg-white p-6 shadow-sm sm:p-8"
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
                className={`flex cursor-pointer items-center justify-center rounded-xl border-2 px-3 py-3 text-sm font-medium transition-all ${
                  receivedNeeded === opt.value
                    ? "border-cyan-500 bg-cyan-50 text-cyan-800"
                    : "border-gray-200 text-gray-600 hover:border-cyan-300"
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
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-3xl transition-transform hover:scale-110"
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
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
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-transparent focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow"
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
          className="bts-pulse-glow inline-flex w-full items-center justify-center rounded-xl bg-cyan-600 px-6 py-3.5 text-base font-bold text-white shadow-sm transition-all hover:bg-cyan-700 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
        >
          {submitting ? "Submitting…" : "Submit Survey"}
        </button>
      </form>
    </div>
  );
}