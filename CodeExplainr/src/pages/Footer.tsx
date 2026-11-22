import { Linkedin, Mail } from "lucide-react";
import FeedbackForm from "../Components/FeedbackForm";

interface FooterProps {
  onFeedbackSubmitted: () => void;
}

const Footer = ({ onFeedbackSubmitted }: FooterProps) => {
  return (
    <footer className="border-t border-emerald-900/10 bg-emerald-50/70">
      <div className="container mx-auto px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(340px,0.9fr)] lg:items-start lg:gap-12">
          <div className="flex flex-col items-start">
            <div className="mb-3 flex items-center gap-3">
              <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-emerald-950/15 bg-[#0b1623] p-1 shadow-md shadow-emerald-950/15">
                <img
                  src="/flow_logo.png"
                  alt="CodeJourney logo"
                  className="h-full w-full rounded-lg object-cover"
                />
              </span>
              <h2 className="text-lg font-bold text-emerald-950">CodeJourney AI</h2>
            </div>
            <p className="max-w-lg text-sm leading-relaxed text-emerald-950/70">
              A calmer way to understand unfamiliar code: listen, follow the flow, and learn as you go.
            </p>
            <p className="mt-4 text-sm font-semibold text-emerald-950">Made by Akash Saha</p>
            <p className="mt-3 text-xs text-emerald-950/60">
              © 2026 CodeJourney AI. Built for clearer code.
            </p>

            <nav aria-label="Connect with Akash Saha" className="mt-4 flex flex-wrap gap-3">
              <a
                href="https://www.linkedin.com/in/akash-saha-270000351/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-emerald-900/15 bg-white/70 px-4 py-2.5 text-sm font-semibold text-emerald-950 transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
              >
                <Linkedin size={17} /> LinkedIn
              </a>
              <a
                href="mailto:saha.akash5909@gmail.com"
                className="inline-flex items-center gap-2 rounded-md border border-emerald-900/15 bg-white/70 px-4 py-2.5 text-sm font-semibold text-emerald-950 transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
              >
                <Mail size={17} /> Email
              </a>
            </nav>
          </div>

          <FeedbackForm onSubmitted={onFeedbackSubmitted} />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
