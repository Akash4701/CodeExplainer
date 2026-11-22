import { useState } from "react";
import { ArrowUpRight, Github, LoaderCircle, Send, Star } from "lucide-react";
import { API_ENDPOINTS } from "../config/api";

interface FeedbackFormProps {
  onSubmitted: () => void;
}

interface FeedbackResponse {
  success?: boolean;
  error?: string;
}

export default function FeedbackForm({ onSubmitted }: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const displayedRating = hoveredRating ?? rating;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!rating || !feedback.trim() || isSubmitting) return;

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(API_ENDPOINTS.submitFeedback, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, feedback: feedback.trim() }),
      });

      let result: FeedbackResponse;
      try {
        result = await response.json() as FeedbackResponse;
      } catch {
        throw new Error("The feedback service returned an unexpected response. Please try again.");
      }

      if (!response.ok || result.success !== true) {
        throw new Error(result.error ?? "We couldn't save your feedback. Please try again.");
      }

      setRating(0);
      setFeedback("");
      onSubmitted();
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't save your feedback. Check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      aria-labelledby="feedback-heading"
      className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-lg shadow-emerald-950/5 sm:p-6"
    >
      <h2 id="feedback-heading" className="text-lg font-extrabold text-emerald-950">
        Help make the journey better
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">
        A quick rating or a few words from you help shape what i build next.
      </p>

      <a
        href="https://github.com/Akash4701/CodeExplainer"
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-900/10 bg-emerald-50/70 p-3 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-900 shadow-sm">
          <Github size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-emerald-950">Enjoying CodeJourney?</span>
          <span className="block text-xs text-emerald-800">Star the project on GitHub</span>
        </span>
        <Star size={18} className="shrink-0 text-amber-500" fill="currentColor" />
        <ArrowUpRight size={16} className="shrink-0 text-emerald-700" />
      </a>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <fieldset>
          <legend className="text-sm font-bold text-emerald-950">How was your experience?</legend>
          <div className="mt-2 flex items-center gap-1" role="radiogroup" aria-label="Rate your experience">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={rating === value}
                aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(null)}
                onFocus={() => setHoveredRating(value)}
                onBlur={() => setHoveredRating(null)}
                className="rounded-md p-1 text-amber-400 transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
              >
                <Star size={26} fill={value <= displayedRating ? "currentColor" : "none"} />
              </button>
            ))}
            <span className="ml-2 text-xs text-slate-500" aria-live="polite">
              {displayedRating ? `${displayedRating} out of 5` : "Choose a rating"}
            </span>
          </div>
        </fieldset>

        <div>
          <label htmlFor="footer-feedback" className="text-sm font-bold text-emerald-950">
            What could we improve?
          </label>
          <textarea
            id="footer-feedback"
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Share an idea, a bug, or what you enjoyed..."
            className="mt-2 w-full resize-y rounded-xl border border-emerald-900/15 bg-emerald-50/40 px-3 py-2.5 text-sm text-emerald-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            required
          />
        </div>

        {errorMessage && (
          <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={!rating || !feedback.trim() || isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
        >
          {isSubmitting ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />}
          {isSubmitting ? "Saving feedback..." : "Send feedback"}
        </button>
      </form>
    </section>
  );
}
