import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Volume2, FastForward, Rewind, Mic, Search, Loader2, VolumeX, ChevronDown, RotateCcw, Workflow } from 'lucide-react';
import { createPortal } from 'react-dom';
import { API_ENDPOINTS } from '../config/api';
import { getFlowStepForLine, type ExplanationData, type FlowStep } from '../types/executionFlow';

const EMPTY_FLOW_MAP: FlowStep[] = [];

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
  currentLine,
  setCurrentLine,
  activeFlowNodeId,
  setActiveFlowNodeId,
  explanationData,
  flowSteps,
  controlsHost,
  explanationHost,
}: {
  code: string;
  language: string;
  currentLine: number | null;
  setCurrentLine: (line: number) => void;
  activeFlowNodeId: string | null;
  setActiveFlowNodeId: (id: string | null) => void;
  explanationData: ExplanationData | null;
  flowSteps: FlowStep[];
  controlsHost: HTMLDivElement | null;
  explanationHost: HTMLDivElement | null;
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
  const speakLineRef = useRef<(index: number) => void>(() => undefined);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  // ── Per-line DOM refs for auto-scroll ────────────────────────────────────
  const codeLines = code ? code.split('\n') : [];
  const flowContainerRef = useRef<HTMLDivElement | null>(null);
  const flowStepRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const narrationSteps = explanationData?.explanation.flow_map ?? EMPTY_FLOW_MAP;
  const activeFlowIndex = flowSteps.findIndex((step) => step.id === activeFlowNodeId);

  useEffect(() => {
    if (explanationData) return
    shouldContinueRef.current = false
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentExplanationIndex(0)
    currentIndexRef.current = 0
  }, [explanationData])

  useEffect(() => {
    flowStepRefs.current = flowStepRefs.current.slice(0, flowSteps.length);
  }, [flowSteps.length]);

  useEffect(() => {
    const container = flowContainerRef.current;
    const activeStep = flowStepRefs.current[activeFlowIndex];
    if (!container || !activeStep || activeFlowIndex < 0) return;

    const containerBounds = container.getBoundingClientRect();
    const stepBounds = activeStep.getBoundingClientRect();
    if (stepBounds.top < containerBounds.top || stepBounds.bottom > containerBounds.bottom) {
      container.scrollTo({
        top: container.scrollTop + stepBounds.top - containerBounds.top - (containerBounds.height - stepBounds.height) / 2,
        behavior: 'smooth',
      });
    }
  }, [activeFlowIndex, flowSteps.length]);

  // Keep rateRef in sync so speakLine closures always read the latest value
  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  useEffect(() => {
    if (!activeFlowNodeId) return;
    const narrationIndex = narrationSteps.findIndex((step) => step.id === activeFlowNodeId);
    if (narrationIndex < 0 || narrationIndex === currentIndexRef.current) return;

    setCurrentExplanationIndex(narrationIndex);
    currentIndexRef.current = narrationIndex;
    if (shouldContinueRef.current) {
      window.speechSynthesis.cancel();
      setTimeout(() => speakLineRef.current(narrationIndex), 100);
    }
  }, [activeFlowNodeId, narrationSteps]);

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
    if (narrationSteps.length > 0) {
      return narrationSteps[currentExplanationIndex]?.description || '';
    }
    return '';
  };

  const speakLine = (index: number) => {
    if (!explanationData) return;

    window.speechSynthesis.cancel();

    const step = narrationSteps[index];
    const text = step?.description;
    if (!step || !text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rateRef.current;   // ← always use ref, not stale closure value
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = 'en-US';

    utterance.onstart = () => {
      setActiveFlowNodeId(step.id);
      setCurrentLine(step.code_ranges[0]?.line_start ?? 0);
    };

    utterance.onend = () => {
      if (shouldContinueRef.current && explanationData) {
        const nextIndex = index + 1;
        if (nextIndex < narrationSteps.length) {
          setCurrentExplanationIndex(nextIndex);
          currentIndexRef.current = nextIndex;
          setTimeout(() => speakLine(nextIndex), 50);
        } else {
          setIsPlaying(false);
          shouldContinueRef.current = false;
          setCurrentExplanationIndex(0);
          currentIndexRef.current = 0;
          setCurrentLine(0);
          setActiveFlowNodeId(null);
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
  speakLineRef.current = speakLine;

  const handlePlayPause = () => {
    if (!explanationData) return;
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
    setActiveFlowNodeId(null);
  };

  const handleNext = () => {
    if (!explanationData) return;
    const nextIndex = currentExplanationIndex + 1;
    if (nextIndex < narrationSteps.length) {
      const wasPlaying = shouldContinueRef.current;
      window.speechSynthesis.cancel();
      setCurrentExplanationIndex(nextIndex);
      currentIndexRef.current = nextIndex;
      if (wasPlaying) {
        setTimeout(() => speakLine(nextIndex), 100);
      } else {
        const nextStep = narrationSteps[nextIndex];
        setActiveFlowNodeId(nextStep.id);
        setCurrentLine(nextStep.code_ranges[0]?.line_start ?? 0);
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
        const previousStep = narrationSteps[prevIndex];
        setActiveFlowNodeId(previousStep.id);
        setCurrentLine(previousStep.code_ranges[0]?.line_start ?? 0);
      }
    }
  };

  const handleLineClick = (idx: number) => {
    const step = flowSteps[idx];
    if (!step || !explanationData) return;
    const narrationIndex = narrationSteps.findIndex((item) => item.id === step.id);
    if (narrationIndex < 0) return;

    const wasPlaying = shouldContinueRef.current;
    window.speechSynthesis.cancel();
    setCurrentExplanationIndex(narrationIndex);
    currentIndexRef.current = narrationIndex;
    setActiveFlowNodeId(step.id);
    setCurrentLine(step.code_ranges[0]?.line_start ?? 0);
    shouldContinueRef.current = wasPlaying;
    setIsPaused(false);
    setIsPlaying(wasPlaying);
    if (wasPlaying) setTimeout(() => speakLine(narrationIndex), 100);
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
    const selectedExplanation = getFlowStepForLine(flowSteps, selectedLineNumber)?.description ?? '';

    setIsAnswering(true);
    setAnswer('');
    try {
      const response = await fetch(API_ENDPOINTS.answerQuestion, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          lineNumber: selectedLineNumber,
          lineCode: selectedLine,
          existingExplanation: selectedExplanation,
          question: question.trim(),
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

  const audioControls = (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
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
            disabled={!explanationData}
            className="flex-shrink-0 rounded-lg bg-lime-400 p-3 text-emerald-950 transition-colors hover:bg-lime-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-400"
            title={isPlaying && !isPaused ? 'Pause' : 'Play'}
          >
            {isPlaying && !isPaused ? <Pause size={24} /> : <Play size={24} />}
          </button>

          <button
            onClick={handleStop}
            className="rounded bg-rose-900/60 p-2 text-rose-200 transition-colors hover:bg-rose-800 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
            title="Stop"
          >
            <Square size={20} />
          </button>

          <button
            onClick={handleNext}
            disabled={!explanationData || currentExplanationIndex >= narrationSteps.length - 1}
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
      <div className="flex items-center gap-2 whitespace-nowrap sm:ml-auto">
          <div className={`w-2 h-2 rounded-full ${isPlaying && !isPaused ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
          <span className="text-xs text-emerald-300">
            {isPlaying && !isPaused ? 'Speaking...' : isPaused ? 'Paused' : 'Stopped'}
          </span>
          {explanationData && (
            <span className="ml-2 text-xs text-emerald-400">
              Step {currentExplanationIndex + 1} of {narrationSteps.length}
            </span>
          )}
      </div>
    </div>
  );

  return (
    <>
      {controlsHost && createPortal(audioControls, controlsHost)}
      {explanationHost && createPortal(
        <section aria-label="Current explanation" className="shadow-lg shadow-emerald-950/10">
          <div className="mb-1 text-xs font-semibold text-lime-300">
            {explanationData
              ? `${narrationSteps[currentExplanationIndex]?.title ?? 'Execution'} Explanation`
              : 'Full Explanation'}
          </div>
          <div className="max-h-20 overflow-y-auto text-sm leading-relaxed text-emerald-100">
            {getCurrentText() || 'Generate an explanation to follow the execution flow.'}
          </div>
        </section>,
        explanationHost,
      )}
      <div className="grid h-[710px] min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-3 overflow-hidden">

        <section aria-labelledby="visual-flow-heading" className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-emerald-900/15 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 id="visual-flow-heading" className="flex items-center gap-2 text-sm font-bold text-emerald-950">
                <Workflow size={18} className="text-emerald-700" />
                Execution Flow
              </h3>
              <p className="mt-1 text-[11px] text-slate-500">The active step follows the highlighted code line.</p>
            </div>
            {flowSteps.length > 0 && (
              <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                {activeFlowIndex >= 0 ? `STEP ${activeFlowIndex + 1} OF ` : 'FLOW '} {flowSteps.length}
              </span>
            )}
          </div>

          {flowSteps.length > 0 ? (
            <div ref={flowContainerRef} className="min-h-0 flex-1 overflow-y-auto rounded-lg bg-slate-50/80 px-3 py-3">
              <div className="flex flex-col items-center">
                {flowSteps.map((step, index) => {
                  const rangeLabel = step.code_ranges.map(({ line_start, line_end }) =>
                    line_start === line_end ? `L${line_start}` : `L${line_start}-${line_end}`,
                  ).join(', ');
                  const isActive = step.id === activeFlowNodeId;
                  const isDecision = step.type === 'decision';
                  const isPill = step.type === 'start' || step.type === 'end';
                  const stateClass = isActive
                    ? 'border-emerald-500 bg-lime-100 shadow-lg shadow-emerald-900/10 ring-2 ring-emerald-200'
                    : 'border-slate-200 bg-white';

                  return (
                    <React.Fragment key={step.id}>
                      <button
                        ref={(element) => { flowStepRefs.current[index] = element; }}
                        type="button"
                        aria-current={isActive ? 'step' : undefined}
                        aria-label={`Source ${rangeLabel}, ${step.title}. ${step.description}`}
                        onClick={() => handleLineClick(index)}
                        className={`relative flex min-h-14 w-full max-w-sm flex-col items-center justify-center border-2 px-4 py-2 text-center transition-all duration-300 hover:border-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${isDecision ? 'my-1 min-h-24 max-w-[17rem] px-10' : isPill ? 'rounded-full' : 'rounded-xl'} ${stateClass}`}
                        style={isDecision ? { clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)' } : undefined}
                      >
                        <span className={`text-[9px] font-extrabold uppercase tracking-wider ${isActive ? 'text-emerald-800' : 'text-slate-500'}`}>
                          {isActive ? 'Active' : step.type}
                        </span>
                        <span className="text-[11px] font-bold leading-tight text-emerald-950">{step.title}</span>
                        <span className="mt-0.5 text-[9px] leading-snug text-slate-600">{step.description}</span>
                        <span className="absolute right-2 top-1 text-[9px] font-semibold text-slate-400">
                          {rangeLabel}
                        </span>
                      </button>
                      {step.next.length > 0 && (
                        <div className="my-1 flex w-full max-w-sm flex-col items-center gap-1" aria-label="Outgoing execution connections">
                          {step.next.map((nextId) => {
                            const nextIndex = flowSteps.findIndex((candidate) => candidate.id === nextId);
                            const nextStep = flowSteps[nextIndex];
                            if (!nextStep) return null;
                            const isLoopBack = nextIndex <= index && nextStep.type === 'decision';
                            const isReturn = nextIndex <= index && step.type === 'end';
                            const connectionLabel = isLoopBack
                              ? 'Loop to'
                              : isReturn
                                ? 'Return to'
                                : step.next.length > 1
                                  ? 'Branch to'
                                  : 'Next';
                            return (
                              <button
                                key={`${step.id}-${nextId}`}
                                type="button"
                                onClick={() => handleLineClick(nextIndex)}
                                className="inline-flex max-w-full items-center gap-1 rounded-full border border-emerald-200 bg-white px-2 py-1 text-[9px] text-emerald-800 hover:border-emerald-400 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
                                aria-label={`${connectionLabel} ${nextStep.title}`}
                              >
                                {isLoopBack ? <RotateCcw size={11} /> : <ChevronDown size={11} />}
                                <span>{connectionLabel}</span>
                                <span className="max-w-40 truncate font-semibold">{nextStep.title}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-emerald-900/20 bg-emerald-50/50 px-4 py-8 text-center">
              <p className="text-xs font-semibold text-emerald-900">Your flow appears here</p>
              <p className="mt-1 text-xs text-slate-500">Generate an explanation to map key execution stages.</p>
            </div>
          )}
        </section>

        <section aria-label="Ask about code" className="rounded-xl border border-emerald-800/30 bg-emerald-950 p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-lime-300">
              {questionFormLineIndex !== null
                ? `Question about line ${questionFormLineIndex + 1}`
                : currentLine && currentLine > 0
                  ? `Ask about highlighted line ${currentLine}`
                  : 'Ask a question about a line'}
            </p>
            {questionFormLineIndex === null && currentLine !== null && currentLine > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQuestionLineIndex(currentLine - 1);
                  setQuestionFormLineIndex(currentLine - 1);
                  setQuestion('');
                  setAnswer('');
                }}
                className="text-xs font-semibold text-lime-300 underline decoration-lime-300/40 underline-offset-4 hover:text-white"
              >
                Ask
              </button>
            )}
          </div>

          {questionFormLineIndex !== null && questionLineIndex !== null && (
            <form onSubmit={handleQuestionSubmit} className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Ask about this line..."
                  className="min-w-0 flex-1 rounded border border-emerald-600/60 bg-emerald-950 px-3 py-2 text-xs text-white outline-none focus:border-lime-400"
                  aria-label={`Question about line ${questionLineIndex + 1}`}
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
                  className="inline-flex items-center gap-1 rounded bg-lime-400 px-3 py-2 text-xs font-bold text-emerald-950 hover:bg-lime-300 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-slate-300"
                >
                  {isAnswering ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                  Get answer
                </button>
              </div>
              {answer && (
                <div className="flex items-start justify-between gap-3">
                  <p className="max-h-16 overflow-y-auto text-xs leading-relaxed text-emerald-100">{answer}</p>
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
              )}
            </form>
          )}
        </section>
      </div>
    </>
  );
}

export default TextToSpeech;