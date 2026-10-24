import { Upload, Sparkles, Terminal, Mic, Loader2, Code2 } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import TextToSpeech from "../Components/textToSpeech";
import CodeInput from "../Components/CodeInput";
import FeatureCard from "../Components/FeatureCardProps";
import { API_ENDPOINTS } from "../config/api";

// Types
interface LineExplanation {
  line: number;
  text: string;
}

interface ExplanationData {
  explanation: {
    line_map: LineExplanation[];
  };
}

interface MainContentProps {
  workspaceRef: React.RefObject<HTMLDivElement | null>;
  featuresRef: React.RefObject<HTMLDivElement | null>;
}

// Constants
const SUPPORTED_LANGUAGES = [
  "JavaScript", "TypeScript", "Python", "Java", "C++",
  "C#", "Ruby", "Go", "Rust", "PHP",
] as const;

const FILE_EXTENSIONS = ".js,.jsx,.ts,.tsx,.py,.java,.cpp,.cs,.rb,.go,.rs,.php";

const DEFAULT_CODE = `function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log("Fibonacci of 10:", result);`;

export const MainContent: React.FC<MainContentProps> = ({ workspaceRef, featuresRef }) => {
  // State
  const [language, setLanguage] = useState<string>("JavaScript");
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const [currentLine, setCurrentLine] = useState<number | null>(null);

  const [explanationData, setExplanationData] = useState<ExplanationData | null>(null);

  // Memoized values
  const isCodeEmpty = useMemo(() => !code.trim(), [code]);

  // Handlers
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setCode(result);
      }
    };
    reader.onerror = () => {
      console.error("Error reading file");
    };
    reader.readAsText(file);
  }, []);

  const CodeExplanation = async (code: string) => {
    console.log("Starting code explanation request", code);

    if (!code.trim()) return;
    setIsExplaining(true);
    fetch(API_ENDPOINTS.explain, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language,
        codeSnippet: code,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setExplanationData(data);
        console.log("Explanation data:", data);
      })
      .catch((error) => {
        console.error("Error Fetching Explanation:", error);
      })
      .finally(() => {
        setIsExplaining(false);
      });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f8f4]">
      {/* Ambient background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-lime-200/30 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-teal-200/20 blur-3xl sm:h-96 sm:w-96" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-10 lg:py-8 relative z-10">
        {/* Hero Section */}
        <header className="text-center mb-10 sm:mb-14 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-200 mb-6">
            <Sparkles size={16} className="text-teal-600" />
            <span className="text-xs font-semibold tracking-wide text-emerald-700 sm:text-sm">
              Voice-first code understanding
            </span>
          </div>

          <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-emerald-950 sm:text-5xl lg:text-6xl">
            Hear how your code works
            <br />
            <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-lime-600 bg-clip-text text-transparent">
              from the first line to the last.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-sm font-medium leading-relaxed text-slate-600 sm:text-base lg:text-lg">
            Turn unfamiliar code into a clear spoken walkthrough. Paste a snippet, choose its language,
            and follow the code's flow with natural voice narration.
          </p>
        </header>

        {/* Main Interface */}
        <div className="max-w-7xl mx-auto">
          <div className="overflow-hidden rounded-2xl border border-emerald-900/10 bg-white shadow-xl shadow-emerald-950/10">
            {/* Controls Header */}
            <div className="border-b border-emerald-900/10 bg-emerald-50/70 px-4 py-5 sm:px-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1 min-w-[200px] w-full sm:w-auto sm:max-w-xs">
                  <label className="mt-4 mb-2 block text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Language
                  </label>
                  <div className="relative">
                    <Terminal size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-600 pointer-events-none" />
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full cursor-pointer appearance-none rounded-lg border border-emerald-900/20 bg-white py-2.5 pl-10 pr-8 font-medium text-emerald-950 transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    >
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <option key={lang} value={lang.toLowerCase()}>
                          {lang}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                        <path
                          d="M1 1.5L6 6.5L11 1.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          className="text-stone-400"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex items-end gap-3 w-full sm:w-auto justify-end">
                  <label className="group relative w-full cursor-pointer sm:w-auto">
                    <input
                      type="file"
                      accept={FILE_EXTENSIONS}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-900/20 bg-white px-5 py-2.5 font-semibold text-emerald-900 transition-all group-hover:border-emerald-400 group-hover:bg-emerald-50 sm:w-auto">
                      <Upload size={18} className="text-emerald-600" />
                      <span>Upload File</span>
                    </div>
                  </label>
                </div>
              </div>


            </div>

            {/* Code Editor Section */}
            <div className="p-4 sm:p-6">
              <div ref={workspaceRef} className="grid scroll-mt-28 items-stretch gap-6 lg:grid-cols-2">
                {/* Input Code */}
                <div className="flex flex-col">
                  <CodeInput code={code} setCode={setCode} language={language} />
                </div>

                {/* Explanation Output */}
                <div className="flex flex-col">
                  <label className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-950">
                    <Sparkles size={16} className="text-lime-600" />
                    AI Explanation
                  </label>
                  <div className="flex-1">
                    <TextToSpeech
                      code={code}
                      language={language}
                      currentLine={currentLine}
                      setCurrentLine={setCurrentLine}
                      explanationData={explanationData}
                    />
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex flex-wrap gap-3 justify-center">
                <div>
                  <button
                    onClick={() => CodeExplanation(code)}
                    disabled={isCodeEmpty || isExplaining}
                    className="relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-lg bg-emerald-800 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-900/20 transition-all hover:bg-emerald-700 hover:shadow-emerald-700/30 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none sm:w-auto"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    {isExplaining ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Mic size={20} />
                    )}
                    <span>{isExplaining ? "Explaining..." : "Start Voice Explanation"}</span>
                  </button>
                </div>

              </div>
            </div>
          </div>

          <section ref={featuresRef} aria-labelledby="features-heading" className="scroll-mt-28 border-t border-emerald-900/10 py-12 sm:py-16">
            <div className="mb-7 max-w-2xl">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-700">Made for understanding</p>
              <h2 id="features-heading" className="text-2xl font-extrabold text-emerald-950 sm:text-3xl">
                More than a code formatter
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                Move from reading unfamiliar code to following its logic, asking questions, and listening at your own pace.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <FeatureCard
                icon={<Mic className="text-emerald-600" size={22} />}
                title="Narration that follows the code"
                description="Hear how each part connects as you follow the code's flow, with the active line highlighted to keep you oriented."
                gradient="bg-gradient-to-br from-emerald-50 to-lime-50"
                accent="border-emerald-200"
              />
              <FeatureCard
                icon={<Sparkles className="text-teal-600" size={22} />}
                title="Ask about a specific line"
                description="Pause on a confusing part and ask a contextual question about that line and its explanation."
                gradient="bg-gradient-to-br from-teal-50 to-cyan-50"
                accent="border-teal-200"
              />
              <FeatureCard
                icon={<Code2 className="text-lime-700" size={22} />}
                title="Your code, your language"
                description="Choose from supported languages, then paste or upload the code you want to explore."
                gradient="bg-gradient-to-br from-lime-50 to-emerald-50"
                accent="border-lime-200"
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default MainContent;