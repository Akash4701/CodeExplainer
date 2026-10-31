import { Code2 } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { API_ENDPOINTS } from '../config/api'

interface CodeInputProps {
  code: string;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  language: string;
  currentLine: number | null;
  onLineSelect: (line: number) => void;
}

function CodeInput({ code, setCode, language, currentLine, onLineSelect }: CodeInputProps) {

  const [loading, setLoading] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const [editorScroll, setEditorScroll] = useState({ top: 0, left: 0 });

  const handleLineSelect = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const cursorPosition = event.currentTarget.selectionStart;
    const selectedLine = event.currentTarget.value.slice(0, cursorPosition).split('\n').length;
    onLineSelect(selectedLine);
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || currentLine === null || currentLine < 1) return;

    const lineTop = (currentLine - 1) * 26 + 16;
    if (lineTop < editor.scrollTop || lineTop + 26 > editor.scrollTop + editor.clientHeight) {
      editor.scrollTop = Math.max(0, lineTop - (editor.clientHeight - 26) / 2);
    }
  }, [currentLine]);

  const formatCode = useCallback(async () => {
    if (!code.trim()) return;

    try {
      setLoading(true);

      const res = await fetch(API_ENDPOINTS.formatCode, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codeSnippet: code, language }),
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
        <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-900">
          <Code2 size={16} className="text-emerald-600" />
          Your Code
        </label>
        <div className="ml-auto">
          <button
            onClick={formatCode}
            disabled={loading || !code.trim()}
            className="text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-800 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            Format Code
          </button>
        </div>

      </div>

      <div className="relative h-[710px] min-h-0 overflow-hidden rounded-xl border border-emerald-900/40 bg-[#10251b] shadow-inner shadow-emerald-950/30 transition-all focus-within:border-lime-400 focus-within:ring-2 focus-within:ring-lime-400/30">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="min-h-full min-w-full px-4 py-4 font-mono text-sm leading-[1.625rem]"
            style={{ transform: `translate(${-editorScroll.left}px, ${-editorScroll.top}px)`, tabSize: 2 }}
          >
            {code.split('\n').map((line, index) => (
              <div
                key={index}
                className={`flex h-[1.625rem] min-w-max whitespace-pre ${currentLine === index + 1 ? 'bg-emerald-700/50' : ''}`}
              >
                <span className="sticky left-0 mr-4 inline-block w-8 shrink-0 select-none bg-[#10251b] pr-2 text-right text-emerald-500">
                  {index + 1}
                </span>
                <span className="text-emerald-50">{line || ' '}</span>
              </div>
            ))}
          </div>
        </div>
        <textarea
          ref={editorRef}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          onSelect={handleLineSelect}
          onClick={handleLineSelect}
          onKeyUp={handleLineSelect}
          onScroll={(event) => setEditorScroll({
            top: event.currentTarget.scrollTop,
            left: event.currentTarget.scrollLeft,
          })}
          placeholder={`// Paste your ${language} code here...\nfunction example() {\n  return "Hello World";\n}`}
          className="relative z-10 h-full w-full resize-none whitespace-pre overflow-auto rounded-xl bg-transparent px-4 py-4 font-mono text-sm leading-[1.625rem] text-transparent caret-lime-300 selection:bg-emerald-500/50 selection:text-emerald-50 focus:outline-none"
          spellCheck="false"
          wrap="off"
          style={{ tabSize: 2 }}
        />
        {!code && (
          <div className="pointer-events-none absolute inset-0 px-4 py-4 font-mono text-sm leading-[1.625rem] text-emerald-700">
            {`// Paste your ${language} code here...\nfunction example() {\n  return "Hello World";\n}`}
          </div>
        )}
      </div>
    </div>
  )
}

export default CodeInput