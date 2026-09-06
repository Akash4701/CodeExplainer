import { Code2 } from 'lucide-react'
import React, { useCallback, useState } from 'react'

function CodeInput({ code, setCode, language, apiKey }: { code: string, setCode: React.Dispatch<React.SetStateAction<string>>, language: string, apiKey?: string }) {

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
        body: JSON.stringify({ codeSnippet: code, language, apiKey: apiKey?.trim() || undefined }),
      });

      const data = await res.json();
      setCode(data.formattedCode);
    } catch (error) {
      console.error('Formatting failed:', error);
    } finally {
      setLoading(false);
    }
  }, [apiKey, code, language, setCode]);

  return (
    <div className="flex flex-col h-full">
      <div className='flex flex-row gap-between'>
        <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-900">
          <Code2 size={16} className="text-emerald-600" />
          Your Code
        </label>
        <button
          onClick={formatCode}
          className="ml-auto text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-800"
        >
          Format Code
        </button>

      </div>

      <div className="relative flex-1 group min-h-0">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={`// Paste your ${language} code here...\nfunction example() {\n  return "Hello World";\n}`}
          className="h-[710px] w-full resize-none rounded-xl border border-emerald-900/40 bg-[#10251b] px-4 py-4 font-mono text-sm leading-relaxed text-emerald-50 shadow-inner shadow-emerald-950/30 transition-all placeholder:text-emerald-700 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/30"
          spellCheck="false"
        />
        {/* Line numbers effect */}
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-12 rounded-l-xl bg-gradient-to-r from-emerald-950/40 to-transparent" />
      </div>
    </div>
  )
}

export default CodeInput