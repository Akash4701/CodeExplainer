import { Code2 } from 'lucide-react'
import React, { useCallback, useState } from 'react'

function CodeInput({code,setCode,language}:{code:string,setCode:React.Dispatch<React.SetStateAction<string>>,language:string}) {

    const [loading, setLoading] = useState(false);

  const formatCode = useCallback(async () => {
    if (!code.trim()) return;

    try {
      setLoading(true);

      const res = await fetch('http://localhost:3000/api/v1/format-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codeSnippet:code, language }),
      });

      const data = await res.json();
      setCode(data.formattedCode);
    } catch (error) {
      console.error('Formatting failed:', error);
    } finally {
      setLoading(false);
    }
  }, [code, language, setCode]);

  return (
   <div className="flex flex-col h-full">
                    <div className='flex flex-row gap-between'>
                        <label className="text-neutral-300 text-sm mb-3 flex font-semibold  items-center gap-2">
                    <Code2 size={16} className="text-amber-400" />
                    Your Code
                  </label>
                  <button
                    onClick={formatCode}
                    className="ml-auto text-sm text-amber-500 hover:text-amber-400 transition-colors"
                  >
                    Format Code
                  </button>

                    </div>
                  
                  <div className="relative flex-1 group min-h-0">
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder={`// Paste your ${language} code here...\nfunction example() {\n  return "Hello World";\n}`}
                      className="w-full h-[710px] bg-neutral-950/90 text-neutral-200 border border-neutral-800/50 rounded-xl px-4 py-4 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 resize-none transition-all placeholder:text-neutral-600"
                      spellCheck="false"
                    />
                    {/* Line numbers effect */}
                    <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-neutral-900/50 to-transparent pointer-events-none rounded-l-xl" />
                  </div>
                </div>
  )
}

export default CodeInput