import { Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
      <div className="container mx-auto px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-lg">
            <div className="mb-3 flex items-center gap-3">
              <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-emerald-950/15 bg-[#0b1623] p-1 shadow-md shadow-emerald-950/15">
                <img
                  src="/flow_logo.png"
                  alt="CodeJourney logo"
                  className="h-full w-full rounded-lg object-cover"
                />
              </span>
              <h2 className="text-lg font-bold">CodeJourney AI</h2>
            </div>
            <p className="text-sm leading-relaxed text-emerald-950/70">
              A calmer way to understand unfamiliar code: listen, follow the flow, and learn as you go.
            </p>
            <p className="mt-4 text-sm font-semibold">Made by Akash Saha</p>
          </div>

          <nav aria-label="Connect with Akash Saha" className="flex flex-wrap gap-3">
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
         
        <div className="mt-8 border-t border-emerald-900/15 pt-5">
          <p className="text-xs text-emerald-950/60">
            © 2026 CodeJourney AI. Built for clearer code.
          </p>
        </div>
      </div>
    
  );
};

export default Footer