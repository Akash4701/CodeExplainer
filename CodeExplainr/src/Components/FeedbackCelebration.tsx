import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Heart, Sparkles, X } from "lucide-react";

interface FeedbackCelebrationProps {
  open: boolean;
  onClose: () => void;
}

const CONFETTI_COLORS = ["#34d399", "#a3e635", "#2dd4bf", "#fbbf24", "#6ee7b7", "#c084fc"];

export default function FeedbackCelebration({ open, onClose }: FeedbackCelebrationProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="feedback-celebration fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-emerald-950/90 p-5 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-thanks-title"
    >
      <div className="feedback-celebration-confetti pointer-events-none absolute inset-0" aria-hidden="true">
        {Array.from({ length: 64 }, (_, index) => (
          <span
            key={index}
            className="feedback-celebration-piece"
            style={{
              left: `${(index * 37) % 100}%`,
              backgroundColor: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
              animationDelay: `${(index % 12) * 90}ms`,
            }}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close thank-you message"
        className="absolute right-4 top-4 z-20 rounded-full border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300"
      >
        <X size={20} />
      </button>

      <div className="feedback-celebration-card relative z-10 max-w-xl rounded-3xl border border-white/20 bg-white p-8 text-center shadow-2xl shadow-emerald-950/40 sm:p-12">
        <div className="feedback-celebration-heart mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <Heart size={38} fill="currentColor" />
        </div>
        <Sparkles size={24} className="mx-auto mb-3 text-amber-500" />
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
          Feedback saved
        </p>
        <h2 id="feedback-thanks-title" className="mt-2 text-3xl font-extrabold text-emerald-950 sm:text-4xl">
          You made our day!
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-600">
          Thanks for helping this little coding journey grow. Your feedback has been saved to our Google Form.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-7 rounded-xl bg-emerald-800 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          Back to the page
        </button>
      </div>
    </div>,
    document.body,
  );
}
