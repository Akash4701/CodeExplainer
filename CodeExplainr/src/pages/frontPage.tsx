import { Code2, MessageSquare, Pause, Play, Upload, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import TextToSpeech from "../Components/textToSpeech";


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

export const MainContent = () => {
  // const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isExplaining, setIsExplaining] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  // const [currentLine, setCurrentLine] = useState(0);
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

   const [code] = useState(`function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log("Fibonacci of 10:", result);`);

  const [currentLine, setCurrentLine] = useState<number | null>(null);

  const explanationData: ExplanationData = {
    explanation: {
      narration: "This code defines and uses a recursive function to calculate a Fibonacci number. The primary goal is to compute the 10th Fibonacci number and then display it on the console. The core logic resides within the fibonacci function. This function takes a single number n as input and is designed to return the nth Fibonacci number. It implements the classic recursive definition of the Fibonacci sequence. The function first checks for a base case: if n is 0 or 1, it directly returns n. This is crucial because it provides the starting values for the sequence and prevents infinite recursion. If n is greater than 1, the function proceeds to its recursive step, which calculates the nth Fibonacci number by summing the n minus 1 th and n minus 2 th Fibonacci numbers. After the fibonacci function is defined, the code then calls it with an argument of 10. The returned value is stored in a constant variable named result. Finally, a console dot log statement is used to print the calculated result to the standard output.",
      line_map: [
        {
          line: 1,
          text: "Defines a function named fibonacci that accepts a number n as input and is typed to return a number."
        },
        {
          line: 2,
          text: "This line checks for the base cases of the Fibonacci sequence; if n is 0 or 1, it immediately returns n to stop recursion and provide initial values."
        },
        {
          line: 3,
          text: "This is the recursive step: if n is greater than 1, it calculates the nth Fibonacci number by summing the results of calling itself for n minus 1 and n minus 2."
        },
        {
          line: 4,
          text: "Closes the definition of the fibonacci function."
        },
        {
          line: 5,
          text: "This is an empty line, serving as a visual separator."
        },
        {
          line: 6,
          text: "Calls the fibonacci function with an argument of 10 and stores the returned 10th Fibonacci number in a constant variable named result."
        },
        {
          line: 7,
          text: "Prints a descriptive string Fibonacci of 10 followed by the value stored in the result variable to the console."
        }
      ]
    }
  };

  return (
    <main className="flex-1 bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
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
              {
                isExplaining && 
                 <TextToSpeech 
          code={code} 
          currentLine={currentLine} 
          setCurrentLine={setCurrentLine}
          explanationData={explanationData}
        />
              }
              
            
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={startExplanation}
                disabled={!code}
                className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-3 rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-purple-500/50 disabled:cursor-not-allowed font-semibold"
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