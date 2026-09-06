import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Play, Pause, Square, Volume2, FastForward, Rewind, MessageCircle, Mic, Search, Loader2, VolumeX } from 'lucide-react';

interface LineExplanation {
  line: number;
  text: string;
}

interface ExplanationData {
  explanation: {
    line_map: LineExplanation[];
  };
}

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

function TextToSpeech({
  code,
  language,
  apiKey,
  currentLine,
  setCurrentLine,
  explanationData
}: {
  code: string;
  language: string;
  apiKey: string;
  currentLine: number | null;
  setCurrentLine: (line: number) => void;
  explanationData: ExplanationData | null;
}) {

  const [currentExplanationIndex, setCurrentExplanationIndex] = useState(0);
  const [rate, setRate] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [questionLineIndex, setQuestionLineIndex] = useState<number | null>(null);
  const [questionFormLineIndex, setQuestionFormLineIndex] = useState<number | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [answerVoiceEnabled, setAnswerVoiceEnabled] = useState(true);

  const shouldContinueRef = useRef(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentIndexRef = useRef(0);       // ← mirrors currentExplanationIndex for use inside closures
  const rateRef = useRef(1);               // ← mirrors rate for live rate changes inside closures
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  // ── Per-line DOM refs for auto-scroll ────────────────────────────────────
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const codeLines = code ? code.split('\n') : [];

  // Keep lineRefs array sized correctly when code changes
  useEffect(() => {
    lineRefs.current = lineRefs.current.slice(0, codeLines.length);
  }, [codeLines.length]);

  // Auto-scroll to active line whenever currentLine changes
  useEffect(() => {
    if (currentLine == null || currentLine === 0) return;
    const el = lineRefs.current[currentLine - 1]; // currentLine is 1-based
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [currentLine]);

  // Keep rateRef in sync so speakLine closures always read the latest value
  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  // Keep the question action beside the line currently being narrated.
  useEffect(() => {
    if (isPlaying && currentLine !== null && currentLine > 0) {
      setQuestionLineIndex(currentLine - 1);
    }
  }, [currentLine, isPlaying]);

  // ── Live rate change: restart current utterance at new speed ─────────────
  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    rateRef.current = newRate;

    // Only restart if currently speaking (not paused, not stopped)
    if (!isPlaying || isPaused) return;
    if (!window.speechSynthesis.speaking) return;

    // Cancel current utterance and re-speak from same index
    window.speechSynthesis.cancel();
    setTimeout(() => {
      if (shouldContinueRef.current) {
        speakLine(currentIndexRef.current);
      }
    }, 80);
  };

  const getCurrentText = () => {
    if (!explanationData) return '';
    if (explanationData.explanation.line_map.length > 0) {
      return explanationData.explanation.line_map[currentExplanationIndex]?.text || '';
    }
   
  };

  const speakLine = (index: number) => {
    if (!explanationData) return;

    window.speechSynthesis.cancel();

    const text = explanationData.explanation.line_map[index]?.text


    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rateRef.current;   // ← always use ref, not stale closure value
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = 'en-US';

    utterance.onstart = () => {
      if (explanationData.explanation.line_map[index]) {
        const lineData = explanationData.explanation.line_map[index];
        setCurrentLine(lineData.line);   // 1-based, matches idx+1 in renderer
      }
    };

    utterance.onend = () => {
      if (shouldContinueRef.current && explanationData) {
        const nextIndex = index + 1;
        if (nextIndex < explanationData.explanation.line_map.length) {
          setCurrentExplanationIndex(nextIndex);
          currentIndexRef.current = nextIndex;
          setTimeout(() => speakLine(nextIndex), 50);
        } else {
          setIsPlaying(false);
          shouldContinueRef.current = false;
          setCurrentExplanationIndex(0);
          currentIndexRef.current = 0;
          setCurrentLine(0);
        }
      }
    };

    utterance.onerror = (event) => {
      // 'interrupted' fires when we cancel intentionally (rate change, skip) — ignore it
      if (event.error === 'interrupted') return;
      console.error('Speech error:', event);
      setIsPlaying(false);
      shouldContinueRef.current = false;
    };

    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePlayPause = () => {
    if (!isPlaying) {
      shouldContinueRef.current = true;
      setIsPlaying(true);
      setIsPaused(false);
      speakLine(currentExplanationIndex);
    } else if (window.speechSynthesis.speaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      shouldContinueRef.current = false;
    } else if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      shouldContinueRef.current = true;
    }
  };

  const handleStop = () => {
    shouldContinueRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);
    window.speechSynthesis.cancel();
    setCurrentExplanationIndex(0);
    currentIndexRef.current = 0;
    setCurrentLine(0);
  };

  const handleNext = () => {
    if (!explanationData) return;
    const nextIndex = currentExplanationIndex + 1;
    if (nextIndex < explanationData.explanation.line_map.length) {
      const wasPlaying = shouldContinueRef.current;
      window.speechSynthesis.cancel();
      setCurrentExplanationIndex(nextIndex);
      currentIndexRef.current = nextIndex;
      if (wasPlaying) {
        setTimeout(() => speakLine(nextIndex), 100);
      } else {
        setCurrentLine(explanationData.explanation.line_map[nextIndex].line);
      }
    }
  };

  const handlePrevious = () => {
    if (!explanationData) return;
    const prevIndex = currentExplanationIndex - 1;
    if (prevIndex >= 0) {
      const wasPlaying = shouldContinueRef.current;
      window.speechSynthesis.cancel();
      setCurrentExplanationIndex(prevIndex);
      currentIndexRef.current = prevIndex;
      if (wasPlaying) {
        setTimeout(() => speakLine(prevIndex), 100);
      } else {
        setCurrentLine(explanationData.explanation.line_map[prevIndex].line);
      }
    }
  };

  const handleLineClick = (idx: number) => {
    setCurrentLine(idx + 1);  // store 1-based
    setQuestionLineIndex(idx);
    setQuestionFormLineIndex(null);
    setAnswer('');
    if (explanationData) {
      const lineMap = explanationData.explanation.line_map.find(l => l.line === idx + 1);
      if (lineMap) {
        const mapIndex = explanationData.explanation.line_map.indexOf(lineMap);
        const wasPlaying = shouldContinueRef.current;
        window.speechSynthesis.cancel();
        setCurrentExplanationIndex(mapIndex);
        currentIndexRef.current = mapIndex;
        if (wasPlaying) setTimeout(() => speakLine(mapIndex), 100);
      }
    }
  };

  const handleAskClick = (idx: number) => {
    setQuestionLineIndex(idx);
    setQuestionFormLineIndex(idx);
    setQuestion('');
    setAnswer('');
  };

  const toggleAnswerVoice = () => {
    if (answerVoiceEnabled) {
      window.speechSynthesis.cancel();
    }
    setAnswerVoiceEnabled((enabled) => !enabled);
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const speechWindow = window as Window & {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!Recognition) {
      setAnswer('Voice input is not supported in this browser.');
      return;
    }

    const recognition = new Recognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) setQuestion((currentQuestion) => `${currentQuestion} ${transcript}`.trim());
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const handleQuestionSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (questionLineIndex === null || !question.trim() || isAnswering) return;

    const selectedLineNumber = questionLineIndex + 1;
    const selectedLine = codeLines[questionLineIndex] ?? '';
    const selectedExplanation = explanationData?.explanation.line_map.find(
      (item) => item.line === selectedLineNumber,
    )?.text ?? '';

    setIsAnswering(true);
    setAnswer('');
    try {
      const response = await fetch('http://localhost:3000/api/v1/answer-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          lineNumber: selectedLineNumber,
          lineCode: selectedLine,
          existingExplanation: selectedExplanation,
          question: question.trim(),
          apiKey: apiKey.trim() || undefined,
        }),
      });
      const data = await response.json() as { answer?: string; error?: string };
      if (!response.ok) throw new Error(data.error ?? 'Unable to get an answer.');

      const answerText = data.answer?.trim() || 'No answer was returned.';
      setAnswer(answerText);
      if (answerVoiceEnabled) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(answerText));
      }
    } catch (error: unknown) {
      setAnswer(error instanceof Error ? error.message : 'Unable to get an answer.');
    } finally {
      setIsAnswering(false);
    }
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      recognitionRef.current?.stop();
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Controls Section */}
      <div className="rounded-xl border border-emerald-800/30 bg-emerald-950 p-4 shadow-lg shadow-emerald-950/10">
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center text-sm font-semibold text-emerald-200">
            <Volume2 size={16} className="mr-2" />
            Audio Controls
          </label>

        </div>

        <div className="flex items-center gap-3 mb-4">

          <button
            onClick={handlePrevious}
            disabled={currentExplanationIndex === 0}
            className="rounded bg-emerald-800 p-2 text-emerald-200 transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-800"
            title="Previous Line"
          >
            <Rewind size={20} />
          </button>


          <button
            onClick={handlePlayPause}
            className="flex-shrink-0 rounded-lg bg-lime-400 p-3 text-emerald-950 transition-colors hover:bg-lime-300"
            title={isPlaying && !isPaused ? 'Pause' : 'Play'}
          >
            {isPlaying && !isPaused ? <Pause size={24} /> : <Play size={24} />}
          </button>

          <button
            onClick={handleStop}
            className="rounded bg-rose-900/60 p-2 text-rose-200 transition-colors hover:bg-rose-800"
            title="Stop"
          >
            <Square size={20} />
          </button>

          <button
            onClick={handleNext}
            disabled={!explanationData || currentExplanationIndex >= explanationData.explanation.line_map.length - 1}
            className="rounded bg-emerald-800 p-2 text-emerald-200 transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-800"
            title="Next Line"
          >
            <FastForward size={20} />
          </button>

          <div className="flex-1 flex items-center gap-3 ml-4">
            <label className="whitespace-nowrap text-xs text-emerald-300">
              Speed: {rate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => handleRateChange(parseFloat(e.target.value))}  // ← live handler
              className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-emerald-800 accent-lime-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className={`w-2 h-2 rounded-full ${isPlaying && !isPaused ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
          <span className="text-xs text-emerald-300">
            {isPlaying && !isPaused ? 'Speaking...' : isPaused ? 'Paused' : 'Stopped'}
          </span>
          {explanationData && (
            <span className="ml-2 text-xs text-emerald-400">
              Line {currentExplanationIndex + 1} of {explanationData.explanation.line_map.length}
            </span>
          )}
        </div>

        <div className="rounded-lg border border-emerald-700/40 bg-[#163526] p-3">
          <div className="mb-1 text-xs text-lime-300">
            {explanationData
              ? `Line ${explanationData.explanation.line_map[currentExplanationIndex]?.line || 1} Explanation`
              : 'Full Explanation'}
          </div>
          <div className="text-sm leading-relaxed text-emerald-100">
            {getCurrentText() || 'No explanation available'}
          </div>
        </div>
      </div>

      {/* Code Display Section */}
      <div>
        <label className="mb-2 flex items-center text-sm font-semibold text-emerald-800">
          <MessageSquare size={16} className="mr-2" />
           Navigation of the flow of the Code
        </label>
        <div className="h-96 w-full overflow-y-auto rounded-lg border border-emerald-900/30 bg-[#10251b] px-4 py-3 shadow-inner">
          {code ? (
            <div className="font-mono text-sm">
              {codeLines.map((line, idx) => {
                const isQuestionLine = isPlaying && questionLineIndex === idx;
                const isQuestionFormOpen = questionFormLineIndex === idx;
                return (
                  <React.Fragment key={idx}>
                    <div
                      ref={el => { lineRefs.current[idx] = el; }}
                      className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1 transition-all hover:bg-emerald-800/50 ${currentLine === idx + 1 ? 'border-l-4 border-lime-400 bg-emerald-800/70' : ''}`}
                      onClick={() => handleLineClick(idx)}
                    >
                      <span className="mr-2 select-none text-emerald-500">{idx + 1}</span>
                      <span className="min-w-0 flex-1 text-emerald-100">{line || ' '}</span>
                      {isQuestionLine && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleAskClick(idx);
                          }}
                          className="inline-flex shrink-0 items-center gap-1 rounded bg-lime-400 px-2 py-1 text-xs font-bold text-emerald-950 hover:bg-lime-300"
                        >
                          <MessageCircle size={13} /> Ask a question
                        </button>
                      )}
                    </div>
                    {isQuestionFormOpen && (
                      <form onSubmit={handleQuestionSubmit} className="mb-2 ml-8 rounded-lg border border-emerald-700/50 bg-emerald-900/70 p-3">
                        <p className="mb-2 text-xs text-lime-300">Question about line {idx + 1}</p>
                        <div className="flex gap-2">
                          <input
                            value={question}
                            onChange={(event) => setQuestion(event.target.value)}
                            placeholder="Ask about this line..."
                            className="min-w-0 flex-1 rounded border border-emerald-600/60 bg-emerald-950 px-3 py-2 text-sm text-white outline-none focus:border-lime-400"
                            aria-label={`Question about line ${idx + 1}`}
                          />
                          <button
                            type="button"
                            onClick={toggleVoiceInput}
                            className={`rounded p-2 text-lime-300 hover:bg-emerald-700 ${isListening ? 'bg-rose-700 text-white' : 'bg-emerald-800'}`}
                            title={isListening ? 'Stop voice input' : 'Use voice input'}
                          >
                            <Mic size={18} />
                          </button>
                          <button
                            type="submit"
                            disabled={!question.trim() || isAnswering}
                            className="inline-flex items-center gap-1 rounded bg-lime-400 px-3 py-2 text-sm font-bold text-emerald-950 hover:bg-lime-300 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-slate-300"
                          >
                            {isAnswering ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                            Get answer
                          </button>
                        </div>
                        <div className="mt-3 flex items-start justify-between gap-3">
                          {answer ? <p className="text-sm leading-relaxed text-emerald-100">{answer}</p> : <span />}
                          <button
                            type="button"
                            onClick={toggleAnswerVoice}
                            className="inline-flex shrink-0 items-center gap-1 rounded bg-emerald-800 px-2 py-1 text-xs text-emerald-100 hover:bg-emerald-700"
                            title={answerVoiceEnabled ? 'Turn answer voice off' : 'Turn answer voice on'}
                          >
                            {answerVoiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                            {answerVoiceEnabled ? 'Voice on' : 'Voice off'}
                          </button>
                        </div>
                      </form>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          ) : (
            <div className="text-gray-500 text-center mt-20">
              Paste code to see explanation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TextToSpeech;