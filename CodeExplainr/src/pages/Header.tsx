import React, { useState } from 'react';
import { Code2, Play, Pause, Upload, MessageSquare, Volume2, VolumeX, Sparkles, Zap, Terminal, FileCode, ChevronRight, Github, Twitter, Mail } from 'lucide-react';

// Header Component
const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-950 border-b border-purple-500/20 backdrop-blur-xl sticky top-0 z-50 shadow-xl">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2.5 rounded-xl shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300 group-hover:scale-110">
              <Code2 className="text-white" size={26} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                CodeExplainer
              </h1>
              <p className="text-purple-400 text-xs sm:text-sm flex items-center gap-1">
                <Sparkles size={12} className="text-pink-400" />
                AI Voice Code Analysis
              </p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button className="text-purple-300 hover:text-white transition-colors font-medium text-sm flex items-center gap-1 group">
              How It Works
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="text-purple-300 hover:text-white transition-colors font-medium text-sm">
              Features
            </button>
            <button className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-purple-500/50 font-semibold text-sm hover:scale-105">
              Get Started
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-purple-300 hover:text-white"
          >
            <Terminal size={24} />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 border-t border-purple-500/20 pt-4">
            <button className="block w-full text-left text-purple-300 hover:text-white transition-colors font-medium text-sm">
              How It Works
            </button>
            <button className="block w-full text-left text-purple-300 hover:text-white transition-colors font-medium text-sm">
              Features
            </button>
            <button className="w-full bg-linear-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg font-semibold text-sm">
              Get Started
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
export default Header;