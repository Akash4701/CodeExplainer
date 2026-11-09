import { Code2 } from 'lucide-react'
import Editor, { type OnMount } from '@monaco-editor/react'
import type { editor as MonacoEditor } from 'monaco-editor'
import { useCallback, useEffect, useRef, useState } from 'react'
import { API_ENDPOINTS } from '../config/api'
import type { CodeRange } from '../types/executionFlow'

interface CodeInputProps {
  code: string;
  setCode: (code: string) => void;
  language: string;
  currentLine: number | null;
  activeCodeRanges: CodeRange[];
  onLineSelect: (line: number) => void;
}

const getMonacoLanguage = (language: string) => {
  const normalized = language.toLowerCase()
  if (normalized === 'apex trigger' || normalized === 'apex') return 'apex'
  if (normalized === 'c++') return 'cpp'
  if (normalized === 'c#') return 'csharp'
  if (normalized === 'c') return 'c'
  return normalized
}

function CodeInput({
  code,
  setCode,
  language,
  currentLine,
  activeCodeRanges,
  onLineSelect,
}: CodeInputProps) {
  const [loading, setLoading] = useState(false)
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null)
  const decorationsRef = useRef<MonacoEditor.IEditorDecorationsCollection | null>(null)
  const onLineSelectRef = useRef(onLineSelect)

  useEffect(() => {
    onLineSelectRef.current = onLineSelect
  }, [onLineSelect])

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    decorationsRef.current = editor.createDecorationsCollection()
    editor.onDidChangeCursorPosition(({ position }) => {
      onLineSelectRef.current(position.lineNumber)
    })

    if (!monaco.languages.getLanguages().some((languageInfo: { id: string }) => languageInfo.id === 'apex')) {
      monaco.languages.register({
        id: 'apex',
        extensions: ['.cls', '.trigger'],
        aliases: ['Apex', 'Apex Trigger'],
      })
      monaco.languages.setMonarchTokensProvider('apex', {
        keywords: [
          'abstract', 'after', 'before', 'break', 'catch', 'class', 'continue',
          'delete', 'do', 'else', 'enum', 'extends', 'false', 'final', 'finally',
          'for', 'if', 'implements', 'insert', 'instanceof', 'interface', 'new',
          'null', 'override', 'private', 'protected', 'public', 'return', 'static',
          'super', 'switch', 'this', 'throw', 'true', 'try', 'update', 'upsert',
          'virtual', 'void', 'while', 'trigger', 'on',
        ],
        tokenizer: {
          root: [
            [/[a-zA-Z_$][\w$]*/, {
              cases: {
                '@keywords': 'keyword',
                '@default': 'identifier',
              },
            }],
            [/\d+(\.\d+)?/, 'number'],
            [/"([^"\\]|\\.)*$/, 'string.invalid'],
            [/'([^'\\]|\\.)*$/, 'string.invalid'],
            [/"([^"\\]|\\.)*"/, 'string'],
            [/'([^'\\]|\\.)*'/, 'string'],
            [/\/\/.*$/, 'comment'],
            [/\/\*/, 'comment', '@comment'],
          ],
          comment: [
            [/[^/*]+/, 'comment'],
            [/\*\//, 'comment', '@pop'],
            [/[/*]/, 'comment'],
          ],
        },
      })
    }

    monaco.editor.defineTheme('codeexplainer-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#10251b',
        'editor.lineHighlightBackground': '#14532d66',
        'editorCursor.foreground': '#d9f99d',
      },
    })
    monaco.editor.setTheme('codeexplainer-dark')
  }

  useEffect(() => {
    if (!editorRef.current || currentLine === null || currentLine < 1) return
    editorRef.current.revealLineInCenterIfOutsideViewport(currentLine)
  }, [currentLine])

  useEffect(() => {
    const monacoEditor = editorRef.current
    const decorations = decorationsRef.current
    if (!monacoEditor || !decorations) return

    decorations.set(activeCodeRanges.map(({ line_start, line_end }) => ({
      range: {
        startLineNumber: line_start,
        startColumn: 1,
        endLineNumber: line_end,
        endColumn: monacoEditor.getModel()?.getLineMaxColumn(line_end) ?? 1,
      },
      options: {
        isWholeLine: true,
        className: 'flow-code-range',
        linesDecorationsClassName: 'flow-code-range-gutter',
      },
    })))
  }, [activeCodeRanges, code])

  const formatCode = useCallback(async () => {
    if (!code.trim()) return

    try {
      setLoading(true)
      const res = await fetch(API_ENDPOINTS.formatCode, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeSnippet: code, language }),
      })

      const data = await res.json()
      if (!res.ok || typeof data.formattedCode !== 'string') {
        throw new Error(data.error ?? 'Unable to format code.')
      }
      setCode(data.formattedCode)
    } catch (error) {
      console.error('Formatting failed:', error)
    } finally {
      setLoading(false)
    }
  }, [code, language, setCode])

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center gap-2">
        <label className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
          <Code2 size={16} className="text-emerald-600" />
          Your Code
        </label>
        <button
          onClick={formatCode}
          disabled={loading || !code.trim()}
          className="ml-auto text-xs font-semibold text-emerald-600 transition-colors hover:text-emerald-800 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          {loading ? 'Formatting…' : 'Format Code'}
        </button>
      </div>

      <div className="relative h-[710px] min-h-0 overflow-hidden rounded-xl border border-emerald-900/40 bg-[#10251b] shadow-inner shadow-emerald-950/30 transition-all focus-within:border-lime-400 focus-within:ring-2 focus-within:ring-lime-400/30">
        <Editor
          height="100%"
          language={getMonacoLanguage(language)}
          value={code}
          onChange={(value) => setCode(value ?? '')}
          onMount={handleMount}
          options={{
            automaticLayout: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 12,
            lineHeight: 26,
            tabSize: 2,
            wordWrap: 'off',
            lineNumbers: 'on',
            renderLineHighlight: 'line',
            padding: { top: 16, bottom: 16 },
          }}
          aria-label={`${language} source code editor`}
        />
        {!code && (
          <div className="pointer-events-none absolute left-14 top-4 whitespace-pre font-mono text-xs leading-[26px] text-emerald-700">
            {`// Paste your ${language} code here...\nfunction example() {\n  return "Hello World";\n}`}
          </div>
        )}
      </div>
    </div>
  )
}

export default CodeInput
