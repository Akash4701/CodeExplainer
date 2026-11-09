import { Upload, Sparkles, Terminal, Mic, Loader2, Workflow } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import TextToSpeech from "../Components/textToSpeech";
import CodeInput from "../Components/CodeInput";
import FeatureCard from "../Components/FeatureCardProps";
import { API_ENDPOINTS } from "../config/api";
import { FILE_EXTENSIONS, SUPPORTED_LANGUAGES } from "../config/languages";
import { getFlowStepForLine, type ExplanationData } from "../types/executionFlow";

interface MainContentProps {
  workspaceRef: React.RefObject<HTMLDivElement | null>;
  featuresRef: React.RefObject<HTMLDivElement | null>;
}

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
  const [activeFlowNodeId, setActiveFlowNodeId] = useState<string | null>(null);
  const [playbackControlsHost, setPlaybackControlsHost] = useState<HTMLDivElement | null>(null);
  const [explanationPreviewHost, setExplanationPreviewHost] = useState<HTMLDivElement | null>(null);

  const [explanationData, setExplanationData] = useState<ExplanationData | null>(null);

  // Memoized values
  const isCodeEmpty = useMemo(() => !code.trim(), [code]);

  // Handlers
  const handleCodeChange = useCallback((value: string) => {
    setCode(value);
    setExplanationData(null);
    setActiveFlowNodeId(null);
    setCurrentLine(null);
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        handleCodeChange(result);
      }
    };
    reader.onerror = () => {
      console.error("Error reading file");
    };
    reader.readAsText(file);
  }, [handleCodeChange]);

  const CodeExplanation = async (code: string) => {
    if (!code.trim()) return;
    setIsExplaining(true);
    try {
      const response = await fetch(API_ENDPOINTS.explain, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, codeSnippet: code }),
      });
      if (!response.ok) throw new Error("Unable to generate an execution flow.");
      const data = await response.json() as ExplanationData;
      setExplanationData(data);
      setActiveFlowNodeId(null);
      setCurrentLine(null);
    } catch (error) {
      console.error("Error fetching explanation:", error);
    } finally {
      setIsExplaining(false);
    }
  };

  const flowSteps = useMemo(() => explanationData?.explanation.flow_map ?? [], [explanationData]);
  const activeCodeRanges = flowSteps.find((step) => step.id === activeFlowNodeId)?.code_ranges ?? [];
  const handleLineSelect = useCallback((line: number) => {
    setCurrentLine(line);
    setActiveFlowNodeId(getFlowStepForLine(flowSteps, line)?.id ?? null);
  }, [flowSteps]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f8f4]">
      {/* Ambient background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-lime-200/30 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-teal-200/20 blur-3xl sm:h-96 sm:w-96" />
      </div>

      <div className="relative z-10 w-full px-4 py-4 sm:px-6 sm:py-10 lg:px-8 lg:py-8">
        {/* Hero Section */}
        <header className="text-center mb-10 sm:mb-14 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-200 mb-6">
            <Sparkles size={16} className="text-teal-600" />
            <span className="text-xs font-semibold tracking-wide text-emerald-700 sm:text-sm">
              A clearer way to follow code
            </span>
          </div>

          <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-emerald-950 sm:text-5xl lg:text-6xl">
            See how your code flows.
            <br />
            <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-lime-600 bg-clip-text text-transparent">
              Every step linked to the source.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-sm font-medium leading-relaxed text-slate-600 sm:text-base lg:text-lg">
            Get a plain-language map of your code's key actions, decisions, and data. Each step connects to the source lines behind it, so you can jump from the big picture straight to the code.
          </p>
        </header>

        {/* Main Interface */}
        <div className="w-full mx-auto">
          <div className="overflow-hidden rounded-2xl border border-emerald-900/10 bg-white shadow-xl shadow-emerald-950/10">
            {/* Controls Header */}
            <div className="border-b border-emerald-900/10 bg-emerald-50/70 px-4 py-5 sm:px-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1  w-full sm:w-auto sm:max-w-xs">
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

              <div className="mt-4 flex flex-col gap-3 border-t border-emerald-900/10 pt-4 lg:flex-row lg:items-center">
                <div
                  ref={setPlaybackControlsHost}
                  className="min-w-0 flex-1 rounded-xl border border-emerald-800/30 bg-emerald-950 px-4 py-3"
                />
                <button
                  onClick={() => CodeExplanation(code)}
                  disabled={isCodeEmpty || isExplaining}
                  className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-800 px-5 py-3 font-semibold text-white shadow-lg shadow-emerald-900/20 transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none lg:w-auto"
                >
                  {isExplaining ? <Loader2 size={20} className="animate-spin" /> : <Workflow size={20} />}
                  <span>{isExplaining ? "Preparing explanation..." : "Map my code's flow"}</span>
                </button>
              </div>
              <div
                ref={setExplanationPreviewHost}
                className="mt-3 min-h-16 rounded-xl border border-emerald-800/30 bg-emerald-950 p-3"
              />

            </div>

            {/* Code Editor Section */}
            <div className="p-4 sm:p-6">
              <div ref={workspaceRef} className="grid scroll-mt-28 items-stretch gap-2 lg:grid-cols-[1.2fr_1.4fr]">
                {/* Input Code */}
                <div className="flex flex-col">
                  <CodeInput
                    code={code}
                    setCode={handleCodeChange}
                    language={language}
                    currentLine={currentLine}
                    activeCodeRanges={activeCodeRanges}
                    onLineSelect={handleLineSelect}
                  />
                </div>

                {/* Explanation Output */}
                <div className="flex flex-col">
                  <label className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-950">
                    <Sparkles size={16} className="text-lime-600" />
                    Code-linked explanation
                  </label>
                  <div className="flex-1">
                    <TextToSpeech
                      code={code}
                      language={language}
                      currentLine={currentLine}
                      setCurrentLine={setCurrentLine}
                      activeFlowNodeId={activeFlowNodeId}
                      setActiveFlowNodeId={setActiveFlowNodeId}
                      explanationData={explanationData}
                      flowSteps={flowSteps}
                      controlsHost={playbackControlsHost}
                      explanationHost={explanationPreviewHost}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          <section ref={featuresRef} aria-labelledby="features-heading" className="scroll-mt-28 border-t border-emerald-900/10 py-12 sm:py-16">
            <div className="mb-7 max-w-2xl">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-700">For learners and curious coders</p>
              <h2 id="features-heading" className="text-2xl font-extrabold text-emerald-950 sm:text-3xl">
                Not just a flowchart. Your code, connected.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                Follow the execution path and jump from any flow step to the source lines that make it happen. No disconnected diagram, just a clearer view of your own code.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <FeatureCard
                icon={<Workflow className="text-emerald-600" size={22} />}
                title="A flow shaped by your code"
                description="See key actions, decisions, and results in execution order, mapped to the source lines where they happen."
                gradient="bg-gradient-to-br from-emerald-50 to-lime-50"
                accent="border-emerald-200"
              />
              <FeatureCard
                icon={<Sparkles className="text-teal-600" size={22} />}
                title="Flow step to source line"
                description="Select a step to jump straight to its code. The matching line highlights while you hear why it matters."
                gradient="bg-gradient-to-br from-teal-50 to-cyan-50"
                accent="border-teal-200"
              />
              <FeatureCard
                icon={<Mic className="text-lime-700" size={22} />}
                title="Understand the logic, not every line"
                description="Hear concise explanations of key transitions and data changes, without trudging through every line or repeated loop."
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