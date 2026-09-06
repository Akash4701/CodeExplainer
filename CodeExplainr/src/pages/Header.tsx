import { useState } from 'react';
import { Code2, Sparkles, Terminal, ChevronRight } from 'lucide-react';

// Header Component
const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-900/20 bg-[#10251b]/95 shadow-lg shadow-emerald-950/10 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="rounded-xl bg-emerald-500 p-2.5 shadow-lg shadow-emerald-500/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-lime-400">
              <Code2 className="text-white" size={26} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                CodeExplainer
              </h1>
              <p className="flex items-center gap-1 text-xs text-emerald-300 sm:text-sm">
                <Sparkles size={12} className="text-lime-300" />
                Read the logic. Hear the flow.
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button className="flex items-center gap-1 text-sm font-medium text-emerald-100 transition-colors hover:text-lime-300 group">
              How It Works
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="text-sm font-medium text-emerald-100 transition-colors hover:text-lime-300">
              Features
            </button>
            <button className="rounded-lg bg-lime-400 px-5 py-2.5 text-sm font-bold text-emerald-950 shadow-lg shadow-lime-400/20 transition-all hover:scale-105 hover:bg-lime-300">
              Get Started
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-emerald-200 hover:text-lime-300 md:hidden"
          >
            <Terminal size={24} />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mt-4 space-y-3 border-t border-emerald-800/60 pt-4 pb-4 md:hidden">
            <button className="block w-full text-left text-sm font-medium text-emerald-100 transition-colors hover:text-lime-300">
              How It Works
            </button>
            <button className="block w-full text-left text-sm font-medium text-emerald-100 transition-colors hover:text-lime-300">
              Features
            </button>
            <button className="w-full rounded-lg bg-lime-400 px-5 py-2.5 text-sm font-bold text-emerald-950 shadow-lg">
              Get Started
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
export default Header;