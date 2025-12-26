import { Code2, MessageSquare, Pause, Play, Upload, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";

export const MainContent = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isExplaining, setIsExplaining] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentLine, setCurrentLine] = useState(null);
  const [showAskDialog, setShowAskDialog] = useState(false);

  const languages = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 
    'C#', 'Ruby', 'Go', 'Rust', 'PHP'
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCode(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const startExplanation = () => {
    setIsExplaining(!isExplaining);
  };

  return (
    <main className="flex-1 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Understand Your Code Through
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600"> Voice</span>
          </h2>
          <p className="text-purple-300 text-lg max-w-2xl mx-auto">
            Paste your code, select a language, and get AI-powered line-by-line explanations with interactive voice narration
          </p>
        </div>

        {/* Main Code Input Section */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/30 shadow-2xl p-8">
            {/* Controls Row */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-purple-300 text-sm mb-2 font-semibold">
                  Select Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-gray-900 text-white border border-purple-500/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end gap-3">
                <label className="relative cursor-pointer">
                  <input
                    type="file"
                    accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.cs,.rb,.go,.rs,.php"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-purple-500/50">
                    <Upload size={20} />
                    Upload File
                  </div>
                </label>
              </div>
            </div>

            {/* Two Side-by-Side Code Areas */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Original Code */}
              <div>
                <label className="block text-purple-300 text-sm mb-2 font-semibold flex items-center">
                  <Code2 size={16} className="mr-2" />
                  Your Code
                </label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={`// Paste your ${language} code here...\nfunction example() {\n  return "Hello World";\n}`}
                  className="w-full h-96 bg-[#0a1929] text-cyan-300 border border-cyan-500/30 rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none shadow-inner"
                  spellCheck="false"
                />
              </div>

              {/* Explained Code */}
              <div>
                <label className="block text-purple-300 text-sm mb-2 font-semibold flex items-center">
                  <MessageSquare size={16} className="mr-2" />
                  Line-by-Line Explanation
                </label>
                <div className="w-full h-96 bg-[#0a1929] border border-cyan-500/30 rounded-lg px-4 py-3 overflow-y-auto shadow-inner">
                  {code ? (
                    <div className="font-mono text-sm">
                      {code.split('\n').map((line, idx) => (
                        <div
                          key={idx}
                          className={`py-1 px-2 rounded transition-all cursor-pointer hover:bg-cyan-500/10 ${
                            currentLine === idx ? 'bg-cyan-500/20 border-l-4 border-cyan-400' : ''
                          }`}
                          onClick={() => setCurrentLine(idx)}
                        >
                          <span className="text-cyan-600 mr-4 select-none">{idx + 1}</span>
                          <span className="text-cyan-300">{line || ' '}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center mt-20">
                      Paste code to see explanation
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={startExplanation}
                disabled={!code}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-3 rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-purple-500/50 disabled:cursor-not-allowed font-semibold"
              >
                {isExplaining ? <Pause size={20} /> : <Play size={20} />}
                {isExplaining ? 'Pause Explanation' : 'Start Voice Explanation'}
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg transition-all flex items-center gap-2 shadow-lg"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                {isMuted ? 'Unmute' : 'Mute'}
              </button>

              <button
                onClick={() => setShowAskDialog(!showAskDialog)}
                disabled={!code}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-8 py-3 rounded-lg transition-all flex items-center gap-2 shadow-lg disabled:cursor-not-allowed"
              >
                <MessageSquare size={20} />
                Ask a Question
              </button>
            </div>

                          {/* Ask Question Dialog */}
            {showAskDialog && (
              <div className="mt-6 bg-[#0a1929] rounded-lg p-6 border border-cyan-500/30">
                <h3 className="text-cyan-300 font-semibold mb-3 flex items-center">
                  <MessageSquare className="mr-2 text-cyan-400" size={20} />
                  Ask About the Code
                </h3>
                <textarea
                  placeholder="Type your question about any line or concept in the code..."
                  className="w-full bg-[#051423] text-cyan-300 border border-cyan-500/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none placeholder:text-gray-500"
                  rows="3"
                />
                <button className="mt-3 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-all shadow-lg">
                  Get Answer
                </button>
              </div>
            )}
          </div>

          {/* Features Info */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <div className="bg-purple-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Volume2 className="text-purple-400" size={24} />
              </div>
              <h3 className="text-white font-semibold mb-2">Voice Narration</h3>
              <p className="text-purple-300 text-sm">
                Listen to AI-powered explanations for each line of code
              </p>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <div className="bg-purple-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="text-purple-400" size={24} />
              </div>
              <h3 className="text-white font-semibold mb-2">Interactive Q&A</h3>
              <p className="text-purple-300 text-sm">
                Pause anytime and ask questions about specific lines
              </p>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <div className="bg-purple-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Code2 className="text-purple-400" size={24} />
              </div>
              <h3 className="text-white font-semibold mb-2">Multi-Language</h3>
              <p className="text-purple-300 text-sm">
                Support for 10+ programming languages
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
export default MainContent;