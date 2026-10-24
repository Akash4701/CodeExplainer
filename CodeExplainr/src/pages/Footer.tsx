import { Code2, Github, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-emerald-900/10 bg-[#e8f1e9] text-emerald-950">
      <div className="container mx-auto px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-lg">
            <div className="mb-3 flex items-center gap-3">
              <span className="rounded-md bg-emerald-800 p-2 text-white">
                <Code2 size={19} />
              </span>
              <h2 className="text-lg font-bold">CodeExplainer</h2>
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
              href="https://github.com/Akash4701"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-emerald-900/15 bg-white/70 px-4 py-2.5 text-sm font-semibold text-emerald-950 transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            >
              <Github size={17} /> GitHub
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
            © 2026 CodeExplainer. Built for clearer code.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer