import { ChevronRight, Code2, FileCode, Github, Mail, MessageSquare, Twitter, Zap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-linear-to-b from-slate-950 to-black border-t border-purple-500/20 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-linear-to-b from-purple-600 to-pink-600 p-2 rounded-lg">
                <Code2 className="text-white" size={20} />
              </div>
              <h3 className="text-white font-bold text-lg">CodeExplainer</h3>
            </div>
            <p className="text-purple-300 text-sm leading-relaxed mb-4">
              Revolutionizing code understanding with AI-powered voice explanations for developers worldwide.
            </p>
            <div className="flex items-center gap-3">
              <button className="bg-purple-600/20 hover:bg-purple-600/30 p-2 rounded-lg transition-all group">
                <Github size={18} className="text-purple-400 group-hover:text-purple-300" />
              </button>
              <button className="bg-purple-600/20 hover:bg-purple-600/30 p-2 rounded-lg transition-all group">
                <Twitter size={18} className="text-purple-400 group-hover:text-purple-300" />
              </button>
              <button className="bg-purple-600/20 hover:bg-purple-600/30 p-2 rounded-lg transition-all group">
                <Mail size={18} className="text-purple-400 group-hover:text-purple-300" />
              </button>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Zap size={16} className="text-purple-400" />
              Features
            </h4>
            <ul className="space-y-2.5">
              {['Voice Explanation', 'Interactive Q&A', 'Multi-Language', 'Code Summary'].map((item) => (
                <li key={item} className="text-purple-300 text-sm hover:text-purple-200 transition-colors cursor-pointer flex items-center gap-2 group">
                  <ChevronRight size={14} className="text-purple-500 group-hover:translate-x-1 transition-transform" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <FileCode size={16} className="text-purple-400" />
              Resources
            </h4>
            <ul className="space-y-2.5">
              {['Documentation', 'API Reference', 'Tutorials', 'Blog'].map((item) => (
                <li key={item} className="text-purple-300 text-sm hover:text-purple-200 transition-colors cursor-pointer flex items-center gap-2 group">
                  <ChevronRight size={14} className="text-purple-500 group-hover:translate-x-1 transition-transform" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <MessageSquare size={16} className="text-purple-400" />
              Support
            </h4>
            <ul className="space-y-2.5">
              {['Help Center', 'Community', 'Contact Us', 'Privacy Policy'].map((item) => (
                <li key={item} className="text-purple-300 text-sm hover:text-purple-200 transition-colors cursor-pointer flex items-center gap-2 group">
                  <ChevronRight size={14} className="text-purple-500 group-hover:translate-x-1 transition-transform" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-purple-500/20 mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-purple-400 text-sm text-center sm:text-left">
            © 2024 CodeExplainer. Crafted with 💜 for developers.
          </p>
          <div className="flex items-center gap-6 text-purple-400 text-xs">
            <span className="hover:text-purple-300 cursor-pointer">Terms</span>
            <span className="hover:text-purple-300 cursor-pointer">Privacy</span>
            <span className="hover:text-purple-300 cursor-pointer">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer