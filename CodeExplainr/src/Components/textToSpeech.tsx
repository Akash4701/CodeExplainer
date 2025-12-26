import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Play, Pause, Square, Volume2, FastForward, Rewind } from 'lucide-react';

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

function TextToSpeech({ 
  code, 
  currentLine, 
  setCurrentLine,
  explanationData 
}: { 
  code: string; 
  currentLine: number | null; 
  setCurrentLine: (line: number) => void;
  explanationData: ExplanationData | null;
}) {
  const [isLineByLine, setIsLineByLine] = useState(true);
  const [currentExplanationIndex, setCurrentExplanationIndex] = useState(0);
  const [rate, setRate] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const shouldContinueRef = useRef(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Get current text to speak
  const getCurrentText = () => {
    if (!explanationData) return '';
    
    if (isLineByLine && explanationData.explanation.line_map.length > 0) {
      return explanationData.explanation.line_map[currentExplanationIndex]?.text || '';
    }
    return explanationData.explanation.narration;
  };

  // Speak a specific line
  const speakLine = (index: number) => {
    if (!explanationData) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const text = isLineByLine 
      ? explanationData.explanation.line_map[index]?.text 
      : explanationData.explanation.narration;
    
    if (!text) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = 'en-US';
    
    utterance.onstart = () => {
      console.log('Started speaking line:', index);
      if (isLineByLine && explanationData.explanation.line_map[index]) {
        const lineData = explanationData.explanation.line_map[index];
        setCurrentLine(lineData.line - 1);
      }
    };
    
    utterance.onend = () => {
      console.log('Finished speaking line:', index);
      
      if (isLineByLine && shouldContinueRef.current && explanationData) {
        const nextIndex = index + 1;
        if (nextIndex < explanationData.explanation.line_map.length) {
          // Move to next line and speak it
          console.log('Moving to next line:', nextIndex);
          setCurrentExplanationIndex(nextIndex);
          // Speak next line immediately
          setTimeout(() => speakLine(nextIndex), 50);
        } else {
          // Finished all lines
          console.log('Finished all lines');
          setIsPlaying(false);
          shouldContinueRef.current = false;
          setCurrentExplanationIndex(0);
          setCurrentLine(0);
        }
      } else if (!isLineByLine) {
        // Full narration ended
        setIsPlaying(false);
        shouldContinueRef.current = false;
      }
    };
    
    utterance.onerror = (event) => {
      console.error('Speech error:', event);
      setIsPlaying(false);
      shouldContinueRef.current = false;
    };
    
    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePlayPause = () => {
    if (!isPlaying) {
      // Start playing
      console.log('Starting playback from index:', currentExplanationIndex);
      shouldContinueRef.current = true;
      setIsPlaying(true);
      setIsPaused(false);
      speakLine(currentExplanationIndex);
    } else if (window.speechSynthesis.speaking && !isPaused) {
      // Pause
      console.log('Pausing');
      window.speechSynthesis.pause();
      setIsPaused(true);
      shouldContinueRef.current = false;
    } else if (isPaused) {
      // Resume
      console.log('Resuming');
      window.speechSynthesis.resume();
      setIsPaused(false);
      shouldContinueRef.current = true;
    }
  };

  const handleStop = () => {
    console.log('Stopping');
    shouldContinueRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);
    window.speechSynthesis.cancel();
    setCurrentExplanationIndex(0);
    setCurrentLine(0);
  };

  const handleNext = () => {
    if (!explanationData || !isLineByLine) return;
    
    const nextIndex = currentExplanationIndex + 1;
    if (nextIndex < explanationData.explanation.line_map.length) {
      const wasPlaying = shouldContinueRef.current;
      window.speechSynthesis.cancel();
      setCurrentExplanationIndex(nextIndex);
      
      if (wasPlaying) {
        setTimeout(() => speakLine(nextIndex), 100);
      } else {
        // Just update the highlight
        setCurrentLine(explanationData.explanation.line_map[nextIndex].line - 1);
      }
    }
  };

  const handlePrevious = () => {
    if (!explanationData || !isLineByLine) return;
    
    const prevIndex = currentExplanationIndex - 1;
    if (prevIndex >= 0) {
      const wasPlaying = shouldContinueRef.current;
      window.speechSynthesis.cancel();
      setCurrentExplanationIndex(prevIndex);
      
      if (wasPlaying) {
        setTimeout(() => speakLine(prevIndex), 100);
      } else {
        // Just update the highlight
        setCurrentLine(explanationData.explanation.line_map[prevIndex].line - 1);
      }
    }
  };

  const handleLineClick = (idx: number) => {
    setCurrentLine(idx);
    if (isLineByLine && explanationData) {
      const lineMap = explanationData.explanation.line_map.find(l => l.line - 1 === idx);
      if (lineMap) {
        const mapIndex = explanationData.explanation.line_map.indexOf(lineMap);
        const wasPlaying = shouldContinueRef.current;
        window.speechSynthesis.cancel();
        setCurrentExplanationIndex(mapIndex);
        
        if (wasPlaying) {
          setTimeout(() => speakLine(mapIndex), 100);
        }
      }
    }
  };

  const handleModeChange = () => {
    shouldContinueRef.current = false;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setIsLineByLine(!isLineByLine);
    setCurrentExplanationIndex(0);
    setCurrentLine(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Controls Section */}
      <div className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border border-purple-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <label className="text-purple-300 text-sm font-semibold flex items-center">
            <Volume2 size={16} className="mr-2" />
            Audio Controls
          </label>
          <div className="flex items-center gap-2">
            <label className="text-xs text-purple-300">Mode:</label>
            <button
              onClick={handleModeChange}
              className="text-xs bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 px-3 py-1 rounded transition-colors"
            >
              {isLineByLine ? 'Line-by-Line' : 'Full Narration'}
            </button>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-3 mb-4">
          {isLineByLine && (
            <button
              onClick={handlePrevious}
              disabled={currentExplanationIndex === 0}
              className="bg-cyan-600/30 hover:bg-cyan-600/50 disabled:bg-gray-700/30 disabled:cursor-not-allowed text-cyan-200 p-2 rounded transition-colors"
              title="Previous Line"
            >
              <Rewind size={20} />
            </button>
          )}
          
          <button
            onClick={handlePlayPause}
            className="bg-purple-600/40 hover:bg-purple-600/60 text-purple-200 p-3 rounded-lg transition-colors flex-shrink-0"
            title={isPlaying && !isPaused ? 'Pause' : 'Play'}
          >
            {isPlaying && !isPaused ? <Pause size={24} /> : <Play size={24} />}
          </button>

          <button
            onClick={handleStop}
            className="bg-red-600/30 hover:bg-red-600/50 text-red-200 p-2 rounded transition-colors"
            title="Stop"
          >
            <Square size={20} />
          </button>

          {isLineByLine && explanationData && (
            <button
              onClick={handleNext}
              disabled={currentExplanationIndex >= explanationData.explanation.line_map.length - 1}
              className="bg-cyan-600/30 hover:bg-cyan-600/50 disabled:bg-gray-700/30 disabled:cursor-not-allowed text-cyan-200 p-2 rounded transition-colors"
              title="Next Line"
            >
              <FastForward size={20} />
            </button>
          )}

          <div className="flex-1 flex items-center gap-3 ml-4">
            <label className="text-xs text-purple-300 whitespace-nowrap">Speed: {rate.toFixed(1)}x</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-purple-900/30 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-2 h-2 rounded-full ${isPlaying && !isPaused ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
          <span className="text-xs text-purple-300">
            {isPlaying && !isPaused ? 'Speaking...' : isPaused ? 'Paused' : 'Stopped'}
          </span>
          {isLineByLine && explanationData && (
            <span className="text-xs text-purple-400 ml-2">
              Line {currentExplanationIndex + 1} of {explanationData.explanation.line_map.length}
            </span>
          )}
        </div>

        {/* Current Text Display */}
        <div className="bg-[#0a1929] border border-cyan-500/30 rounded-lg p-3">
          <div className="text-xs text-purple-400 mb-1">
            {isLineByLine && explanationData 
              ? `Line ${explanationData.explanation.line_map[currentExplanationIndex]?.line || 1} Explanation` 
              : 'Full Explanation'}
          </div>
          <div className="text-cyan-300 text-sm leading-relaxed">
            {getCurrentText() || 'No explanation available'}
          </div>
        </div>
      </div>

      {/* Code Display Section */}
      <div>
        <label className="block text-purple-300 text-sm mb-2 font-semibold flex items-center">
          <MessageSquare size={16} className="mr-2" />
          Code with Line-by-Line Navigation
        </label>
        <div className="w-full h-96 bg-[#0a1929] border border-cyan-500/30 rounded-lg px-4 py-3 overflow-y-auto shadow-inner">
          {code ? (
            <div className="font-mono text-sm">
              {code.split('\n').map((line, idx) => (
                <div
                  key={idx}
                  className={`py-1 px-2 rounded transition-all cursor-pointer hover:bg-cyan-500/10 ${
                    currentLine === idx ? 'bg-cyan-500/20 border-l-4 border-cyan-400' : ''
                  }`}
                  onClick={() => handleLineClick(idx)}
                >
                  <span className="text-cyan-600 mr-4 select-none">{idx + 1}</span>
                  <span className="text-cyan-300">{line || ' '}</span>
                </div>
              ))}
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