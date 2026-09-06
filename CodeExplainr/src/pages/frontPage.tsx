import { Code2, Upload, Sparkles, Terminal, Mic, Loader2, KeyRound, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import TextToSpeech from "../Components/textToSpeech";
import CodeInput from "../Components/CodeInput";
import FeatureCard from "../Components/FeatureCardProps";

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

interface MainContentProps { }

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

export const MainContent: React.FC<MainContentProps> = () => {
  // State
  const [language, setLanguage] = useState<string>("JavaScript");
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const [currentLine, setCurrentLine] = useState<number | null>(null);
  const [apiKey, setApiKey] = useState<string>(() => sessionStorage.getItem("codeexplainer-api-key") ?? "");
  const [keyStatus, setKeyStatus] = useState<"idle" | "testing" | "valid" | "invalid">("idle");
  const [keyStatusMessage, setKeyStatusMessage] = useState<string>("");

  const [explanationData, setExplanationData] = useState<ExplanationData | null>(null);

  // Memoized values
  const isCodeEmpty = useMemo(() => !code.trim(), [code]);

  const handleApiKeyTest = useCallback(async () => {
    const trimmedApiKey = apiKey.trim();

    if (!trimmedApiKey) {
      setKeyStatus("invalid");
      setKeyStatusMessage("Enter an API key to test.");
      sessionStorage.removeItem("codeexplainer-api-key");
      return;
    }

    setKeyStatus("testing");
    setKeyStatusMessage("Checking your API key...");

    try {
      const response = await fetch("http://localhost:3000/api/v1/validate-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey: trimmedApiKey }),
      });
      const data = await response.json() as {
        message?: string;
        error?: string;
        details?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? data.details ?? "The API key could not be validated.");
      }

      setKeyStatus("valid");
      setKeyStatusMessage(data.message ?? "Gemini API key is valid and available.");
      sessionStorage.setItem("codeexplainer-api-key", trimmedApiKey);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "The API key could not be validated.";
      setKeyStatus("invalid");
      setKeyStatusMessage(message);
      sessionStorage.removeItem("codeexplainer-api-key");
    }
  }, [apiKey]);

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
    fetch("http://localhost:3000/api/v1/explain", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language,
        codeSnippet: code,
        apiKey: apiKey.trim() || undefined,
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20 relative z-10">
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
            and follow the logic line by line with natural voice narration.
          </p>
        </header>

        {/* Main Interface */}
        <div className="max-w-7xl mx-auto">
          <div className="overflow-hidden rounded-2xl border border-emerald-900/10 bg-white shadow-xl shadow-emerald-950/10">
            {/* Controls Header */}
            <div className="border-b border-emerald-900/10 bg-emerald-50/70 px-4 py-5 sm:px-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1 min-w-[200px] w-full sm:w-auto sm:max-w-xs">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-emerald-800">
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

              <div className="mt-5 rounded-xl border border-emerald-900/10 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                  <div className="flex-1">
                    <label className="mb-2 flex items-center gap-2 text-sm font-bold text-emerald-950">
                      <KeyRound size={17} className="text-emerald-600" />
                      Bring your API key
                    </label>
                    <p className="mb-3 text-xs leading-relaxed text-slate-500">
                      Add your key to use the explainer with your own quota. It stays in this browser session only.
                    </p>
                    <div className="relative">
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(event) => {
                          setApiKey(event.target.value);
                          setKeyStatus("idle");
                          setKeyStatusMessage("");
                        }}
                        placeholder="Paste your provider API key"
                        className="w-full rounded-lg border border-emerald-900/20 bg-emerald-50/50 px-4 py-3 pr-11 text-sm text-emerald-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        aria-label="API key"
                      />
                      <ShieldCheck size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleApiKeyTest}
                    disabled={keyStatus === "testing"}
                    className="rounded-lg bg-emerald-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                  >
                    {keyStatus === "testing" ? "Testing..." : "Test API key"}
                  </button>
                </div>
                {keyStatus !== "idle" && (
                  <div className={`mt-3 flex items-center gap-2 text-sm font-semibold ${keyStatus === "valid" ? "text-emerald-700" : keyStatus === "testing" ? "text-slate-600" : "text-rose-600"}`}>
                    {keyStatus === "valid" ? <CheckCircle2 size={17} /> : keyStatus === "testing" ? <Loader2 size={17} className="animate-spin" /> : <XCircle size={17} />}
                    {keyStatusMessage}
                  </div>
                )}
              </div>
            </div>

            {/* Code Editor Section */}
            <div className="p-4 sm:p-6">
              <div className="grid lg:grid-cols-2 gap-6 mb-6 items-stretch">
                {/* Input Code */}
                <div className="flex flex-col">
                  <label className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-950">
                    <Code2 size={16} className="text-emerald-600" />
                    Your Code
                  </label>
                  <CodeInput code={code} setCode={setCode} language={language} apiKey={apiKey} />
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
                      apiKey={apiKey}
                      currentLine={currentLine}
                      setCurrentLine={setCurrentLine}
                      explanationData={explanationData}
                    />
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => CodeExplanation(code)}
                  disabled={isCodeEmpty}
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

          {/* Feature Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mt-10 sm:mt-12 lg:mt-16">
            <FeatureCard
              icon={<Mic className="text-emerald-600" size={22} />}
              emoji="🎙️"
              title="Voice Narration"
              description="Follow the logic line by line with a natural spoken walkthrough that keeps you oriented."
              gradient="bg-gradient-to-br from-emerald-50 to-lime-50"
              accent="border-emerald-200"
            />

            <FeatureCard
              icon={<KeyRound className="text-emerald-600" size={22} />}
              emoji="💬"
              title="Use your API key"
              description="Connect your own provider key, check its format, and keep control of your usage."
              gradient="bg-gradient-to-br from-emerald-50 to-teal-50"
              accent="border-emerald-200"
            />

            <FeatureCard
              icon={<Code2 className="text-lime-700" size={22} />}
              emoji="🌐"
              title="Your code, your pace"
              description="Switch languages, upload files, format snippets, and replay explanations whenever you need."
              gradient="bg-gradient-to-br from-lime-50 to-emerald-50"
              accent="border-lime-200"
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default MainContent;