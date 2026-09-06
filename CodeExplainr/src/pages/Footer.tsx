import { ChevronRight, Code2, FileCode, Github, Mail, MessageSquare, Twitter, Zap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-emerald-900/20 bg-[#10251b]">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="rounded-lg bg-emerald-500 p-2">
                <Code2 className="text-white" size={20} />
              </div>
              <h3 className="text-white font-bold text-lg">CodeExplainer</h3>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-emerald-200">
              A calmer way to understand unfamiliar code: listen, follow the flow, and learn as you go.
            </p>
            <div className="flex items-center gap-3">
              <button className="rounded-lg bg-emerald-900/70 p-2 transition-all group hover:bg-emerald-800">
                <Github size={18} className="text-emerald-300 group-hover:text-lime-300" />
              </button>
              <button className="rounded-lg bg-emerald-900/70 p-2 transition-all group hover:bg-emerald-800">
                <Twitter size={18} className="text-emerald-300 group-hover:text-lime-300" />
              </button>
              <button className="rounded-lg bg-emerald-900/70 p-2 transition-all group hover:bg-emerald-800">
                <Mail size={18} className="text-emerald-300 group-hover:text-lime-300" />
              </button>
            </div>
          </div>

          <div>
            <h4 className="mb-4 flex items-center gap-2 font-semibold text-white">
              <Zap size={16} className="text-lime-300" />
              Features
            </h4>
            <ul className="space-y-2.5">
              {['Voice Explanation', 'Interactive Q&A', 'Multi-Language', 'Code Summary'].map((item) => (
                <li key={item} className="group flex cursor-pointer items-center gap-2 text-sm text-emerald-200 transition-colors hover:text-lime-300">
                  <ChevronRight size={14} className="text-emerald-500 transition-transform group-hover:translate-x-1" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 flex items-center gap-2 font-semibold text-white">
              <FileCode size={16} className="text-lime-300" />
              Resources
            </h4>
            <ul className="space-y-2.5">
              {['Documentation', 'API Reference', 'Tutorials', 'Blog'].map((item) => (
                <li key={item} className="group flex cursor-pointer items-center gap-2 text-sm text-emerald-200 transition-colors hover:text-lime-300">
                  <ChevronRight size={14} className="text-emerald-500 transition-transform group-hover:translate-x-1" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 flex items-center gap-2 font-semibold text-white">
              <MessageSquare size={16} className="text-lime-300" />
              Support
            </h4>
            <ul className="space-y-2.5">
              {['Help Center', 'Community', 'Contact Us', 'Privacy Policy'].map((item) => (
                <li key={item} className="group flex cursor-pointer items-center gap-2 text-sm text-emerald-200 transition-colors hover:text-lime-300">
                  <ChevronRight size={14} className="text-emerald-500 transition-transform group-hover:translate-x-1" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-emerald-800/60 pt-8 sm:flex-row">
          <p className="text-center text-sm text-emerald-300 sm:text-left">
            © 2026 CodeExplainer. Built for clearer code.
          </p>
          <div className="flex items-center gap-6 text-xs text-emerald-400">
            <span className="cursor-pointer hover:text-lime-300">Terms</span>
            <span className="cursor-pointer hover:text-lime-300">Privacy</span>
            <span className="cursor-pointer hover:text-lime-300">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer