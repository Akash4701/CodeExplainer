import { Code2, MessageSquare, Pause, Play, Upload, Volume2, VolumeX, Sparkles, Terminal, Code } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import TextToSpeech from "../Components/textToSpeech";
import CodeInput from "../Components/CodeInput";

// Types
interface LineExplanation {
  line: number;
  text: string;
}

interface ExplanationData {
  explanation: {
    narration: string;
    line_map: LineExplanation[];
  };
}

interface MainContentProps {}

// Constants
const SUPPORTED_LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 
  'C#', 'Ruby', 'Go', 'Rust', 'PHP'
] as const;

const FILE_EXTENSIONS = '.js,.jsx,.ts,.tsx,.py,.java,.cpp,.cs,.rb,.go,.rs,.php';

const DEFAULT_CODE = `function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log("Fibonacci of 10:", result);`;

// const MOCK_EXPLANATION_DATA: ExplanationData = {
//   explanation: {
//     narration: "The program begins its execution by initiating a call to the fibonacci function with the argument n = 10.",
//     line_map: [
//       {
//         line: 5,
//         text: "The program execution begins by calling the `fibonacci` function with `n=10`. This initiates the entire recursive computation."
//       },
//       {
//         line: 2,
//         text: "Inside the `fibonacci` function, this line checks if `n` is `10` or less. Since `10` is not less than or equal to `1`, the condition is false, and execution proceeds to the next line."
//       },
//       {
//         line: 3,
//         text: "The function recursively calls itself twice: first with `n-1` (i.e., `fibonacci(9)`) and then with `n-2` (i.e., `fibonacci(8)`). The execution of `fibonacci(10)` is paused until both sub-calls return their values."
//       },
//       {
//         line: 2,
//         text: "As the recursion deepens, calls like `fibonacci(1)` will eventually be made. Here, `n` is `1`. The condition `1 <= 1` is true, causing `fibonacci(1)` to directly return `1`."
//       },
//       {
//         line: 2,
//         text: "Similarly, calls like `fibonacci(0)` will occur. Here, `n` is `0`. The condition `0 <= 1` is true, causing `fibonacci(0)` to directly return `0`."
//       },
//       {
//         line: 3,
//         text: "Once base cases return, calls higher up the stack (e.g., `fibonacci(2)`) can resume. This line sums the returned values from its sub-calls (e.g., `fibonacci(1)` returning `1` and `fibonacci(0)` returning `0`) and returns their sum (`1 + 0 = 1`). This summation and return process continues up the call stack until the initial `fibonacci(10)` call receives its results."
//       },
//       {
//         line: 5,
//         text: "After the entire recursive calculation completes, the final result (`55`) is returned by `fibonacci(10)` and assigned to the `result` constant."
//       },
//       {
//         line: 6,
//         text: "Finally, the program logs the computed Fibonacci number, `55`, to the console."
//       }
//     ]
//   }
// };

export const MainContent: React.FC<MainContentProps> = () => {
  // State
  const [language, setLanguage] = useState<string>('javascript');
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentLine, setCurrentLine] = useState<number | null>(null);
  const [showAskDialog, setShowAskDialog] = useState<boolean>(false);
  const [question, setQuestion] = useState<string>('');

  const [explanationData,setExplanationData]=useState<ExplanationData |null>(null);

  // Memoized values
  const isCodeEmpty = useMemo(() => !code.trim(), [code]);

  // Handlers
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setCode(result);
      }
    };
    reader.onerror = () => {
      console.error('Error reading file');
    };
    reader.readAsText(file);
  }, []);

  const CodeExplanation = async(code: string) => {
    console.log('Starting code explanation request',code);

    if(!code.trim()) 
      return;
    setIsExplaining(true);
    fetch('http://localhost:3000/api/v1/explain',{
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        language,
        codeSnippet:code,
    })
  })
                    .then(response=>response.json())
                    .then(data=>{
                      setExplanationData(data);
                        console.log('Explanation data:',data);
                    })
                    .catch(error=>{
                        console.error('Error Fetching Explanation:',error)
                    }).finally(()=>{
                      setIsExplaining(false);
                    })
    
    
  }

 

  const toggleAskDialog = useCallback(() => {
    setShowAskDialog(prev => !prev);
  }, []);

  const handleQuestionSubmit = useCallback(() => {
    // TODO: Implement question submission logic
    console.log('Question submitted:', question);
    setQuestion('');
  }, [question]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0a0a0a] relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-600/3 rounded-full blur-3xl" />
      </div>

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative z-10">
        {/* Hero Section */}
        <header className="text-center mb-12 lg:mb-16 animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
            <Sparkles size={16} className="text-amber-400" />
            <span className="text-amber-300 text-sm font-medium tracking-wide">AI-Powered Code Analysis</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
            Understand Your Code
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500">
              Through Voice
            </span>
          </h1>
          
          <p className="text-neutral-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Paste your code, select a language, and receive AI-powered line-by-line explanations 
            with interactive voice narration
          </p>
        </header>

        {/* Main Interface */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-neutral-900/40 backdrop-blur-xl rounded-2xl border border-neutral-800/50 shadow-2xl overflow-hidden">
            {/* Controls Header */}
            <div className="bg-neutral-900/60 border-b border-neutral-800/50 px-6 py-5">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1 min-w-[240px] max-w-xs">
                  <label className="block text-neutral-400 text-xs uppercase tracking-wider mb-2 font-semibold">
                    Language
                  </label>
                  <div className="relative">
                    <Terminal size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-neutral-950/80 text-neutral-200 border border-neutral-700/50 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all cursor-pointer appearance-none"
                    >
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <option key={lang} value={lang.toLowerCase()}>
                          {lang}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-neutral-500"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-end gap-3">
                  <label className="relative cursor-pointer group">
                    <input
                      type="file"
                      accept={FILE_EXTENSIONS}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="bg-neutral-800 hover:bg-neutral-750 text-neutral-200 px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 border border-neutral-700/50 group-hover:border-neutral-600/50">
                      <Upload size={18} />
                      <span className="font-medium">Upload File</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Code Editor Section */}
            <div className="p-6">
              <div className="grid lg:grid-cols-2 gap-6 mb-6 items-stretch">
                {/* Input Code */}
                <CodeInput code={code} setCode={setCode} language={language} />
                {/* Explanation Output */}
                {(
                  <div className="flex flex-col animate-slideIn">
                    <label className="text-neutral-300 text-sm mb-3 font-semibold flex items-center gap-2">
                      <Sparkles size={16} className="text-amber-400" />
                      AI Explanation
                    </label>
                    <div className="flex-1">
                      <TextToSpeech 
                        code={code} 
                        currentLine={currentLine} 
                        setCurrentLine={setCurrentLine}
                        explanationData={explanationData}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Controls */}
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={()=>CodeExplanation(code)}
                  disabled={isCodeEmpty}
                  className="relative bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-neutral-800 disabled:to-neutral-800 text-white px-6 py-3 rounded-lg transition-all flex items-center gap-2.5 shadow-lg hover:shadow-amber-500/25 disabled:cursor-not-allowed font-semibold disabled:text-neutral-500 group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  {isExplaining ? <Pause size={20} /> : <Play size={20} />}
                  <span>{isExplaining ? 'Pause Explanation' : 'Start Voice Explanation'}</span>
                </button>

             

                <button
                  onClick={toggleAskDialog}
                  disabled={isCodeEmpty}
                  className="bg-neutral-800 hover:bg-neutral-750 disabled:bg-neutral-850 text-neutral-200 disabled:text-neutral-500 px-6 py-3 rounded-lg transition-all flex items-center gap-2.5 shadow-lg border border-neutral-700/50 hover:border-neutral-600/50 disabled:cursor-not-allowed disabled:border-neutral-800"
                >
                  <MessageSquare size={20} />
                  <span>Ask a Question</span>
                </button>
              </div>

              {/* Ask Question Dialog */}
              {showAskDialog && (
                <div className="mt-6 bg-neutral-950/60 rounded-xl p-6 border border-neutral-800/50 animate-slideDown backdrop-blur-sm">
                  <h3 className="text-neutral-200 font-semibold mb-4 flex items-center gap-2">
                    <MessageSquare className="text-amber-400" size={20} />
                    Ask About the Code
                  </h3>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Type your question about any line or concept in the code..."
                    className="w-full bg-neutral-900/80 text-neutral-200 border border-neutral-800/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 resize-none placeholder:text-neutral-600 mb-4"
                    rows={3}
                  />
                  <button 
                    onClick={handleQuestionSubmit}
                    disabled={!question.trim()}
                    className="bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-800 text-white disabled:text-neutral-500 px-6 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-amber-500/25 font-medium disabled:cursor-not-allowed"
                  >
                    Get Answer
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 lg:mt-16">
            <FeatureCard
              icon={<Volume2 className="text-amber-400" size={24} />}
              title="Voice Narration"
              description="Listen to AI-powered explanations for each line of code with natural speech synthesis"
              gradient="from-amber-500/10 to-orange-500/10"
            />
            
            <FeatureCard
              icon={<MessageSquare className="text-amber-400" size={24} />}
              title="Interactive Q&A"
              description="Pause anytime and ask questions about specific lines or concepts you don't understand"
              gradient="from-orange-500/10 to-amber-500/10"
            />
            
            <FeatureCard
              icon={<Code2 className="text-amber-400" size={24} />}
              title="Multi-Language Support"
              description="Full support for 10+ programming languages including JavaScript, Python, Rust, and more"
              gradient="from-amber-500/10 to-yellow-500/10"
            />
          </div>
        </div>
      </div>

      {/* Custom styles for animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        /* Custom scrollbar */
        textarea::-webkit-scrollbar {
          width: 8px;
        }

        textarea::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }

        textarea::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.3);
          border-radius: 4px;
        }

        textarea::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.5);
        }

        /* Select dropdown styling */
        select option {
          background: #0a0a0a;
          color: #e5e5e5;
        }
      `}</style>
    </main>
  );
};

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, gradient }) => (
  <div className="group bg-neutral-900/30 backdrop-blur-sm rounded-xl p-6 border border-neutral-800/40 hover:border-neutral-700/60 transition-all duration-300 hover:translate-y-[-4px]">
    <div className={`bg-gradient-to-br ${gradient} w-12 h-12 rounded-lg flex items-center justify-center mb-4 border border-amber-500/20 group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
    <h3 className="text-neutral-100 font-semibold mb-2 text-lg">{title}</h3>
    <p className="text-neutral-400 text-sm leading-relaxed">{description}</p>
  </div>
);

export default MainContent;