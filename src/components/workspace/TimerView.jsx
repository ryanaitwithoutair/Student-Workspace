import React, { useState } from 'react';
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Flame, 
  Sparkles, 
  Sliders,
  Quote as QuoteIcon,
  RotateCw,
  Heart,
  Copy,
  Check,
  Plus
} from '../common/Icons';
import { useApp } from '../../context/AppContext';
import { DraggableResizable } from '../common/DraggableResizable';

export const TimerView = () => {
  const { 
    timerMode, 
    changeTimerMode, 
    customMinutes, 
    setCustomMinutes, 
    timeLeft, 
    isTimerRunning, 
    startTimer, 
    pauseTimer, 
    resetTimer, 
    sessionsCompleted,
    totalLoggedFocusMinutes,
    logFocusTime,
    currentQuote,
    isQuoteLoading,
    refreshQuote,
    favoriteQuotes,
    toggleFavoriteQuote
  } = useApp();

  // Custom focus duration form state
  const [customInput, setCustomInput] = useState('25');
  const [manualDurationInput, setManualDurationInput] = useState('45');
  const [copied, setCopied] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  // Formatting time MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate total seconds for current mode
  const getTotalSeconds = () => {
    if (timerMode === 'pomodoro') return 25 * 60;
    if (timerMode === 'shortBreak') return 5 * 60;
    if (timerMode === 'longBreak') return 15 * 60;
    return (customMinutes || 25) * 60;
  };

  const totalSecs = getTotalSeconds();
  const progressPercent = Math.max(0, Math.min(100, ((totalSecs - timeLeft) / totalSecs) * 100));

  // Quick Preset Durations
  const PRESET_DURATIONS = [15, 25, 45, 60, 90];

  const handleSelectPresetDuration = (mins) => {
    setCustomMinutes(mins);
    setCustomInput(mins.toString());
    changeTimerMode('custom', mins);
  };

  const handleApplyCustomDuration = (e) => {
    e.preventDefault();
    const mins = parseInt(customInput, 10);
    if (!isNaN(mins) && mins > 0 && mins <= 360) {
      setCustomMinutes(mins);
      changeTimerMode('custom', mins);
    } else {
      alert('Please enter a valid focus duration between 1 and 360 minutes.');
    }
  };

  const handleManualLogSubmit = (e) => {
    e.preventDefault();
    const mins = parseInt(manualDurationInput, 10);
    if (!isNaN(mins) && mins > 0 && mins <= 360) {
      logFocusTime(mins);
      alert(`Successfully logged ${mins} minutes of custom focus time!`);
    } else {
      alert('Please enter a valid duration (1-360 mins).');
    }
  };

  const handleQuoteRefresh = () => {
    setIsFlipping(true);
    refreshQuote();
    setTimeout(() => {
      setIsFlipping(false);
    }, 250);
  };

  const handleQuoteCopy = () => {
    navigator.clipboard.writeText(`"${currentQuote.quote}" — ${currentQuote.author}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isFav = favoriteQuotes.some(q => q.id === currentQuote.id);

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-20">
      {/* Header */}
      

      {/* Main Focus Workspace Area */}
      <div className="relative min-h-[760px]  p-6 md:p-10 flex flex-col justify-between overflow-hidden">
        
        {/* Floating Draggable & Resizable Timer Circle */}
        <div className="flex justify-center items-center py-6">
          <DraggableResizable
            storageKey="timer_circle_v2"
            defaultSize={320}
            minSize={220}
            maxSize={480}
            className="flex flex-col items-center justify-center"
          >
            {({ size }) => {
              // Scale SVG radius dynamically based on size
              const svgRadius = Math.max(80, (size / 2) - 24);
              const svgCircumference = 2 * Math.PI * svgRadius;
              const strokeDashoffset = svgCircumference - (progressPercent / 100) * svgCircumference;
              const fontSizeClass = size < 260 ? 'text-4xl' : size < 360 ? 'text-5xl' : 'text-6xl';

              return (
                <div className="glass-panel rounded-full p-6 border border-emerald-500/40 shadow-2xl flex flex-col items-center justify-center relative bg-neutral-900/90 backdrop-blur-xl">
                  <div className="relative flex items-center justify-center" style={{ width: `${size - 48}px`, height: `${size - 48}px` }}>
                    <svg className="w-full h-full transform -rotate-90">
                      {/* Background Circle */}
                      <circle
                        cx="50%"
                        cy="50%"
                        r={svgRadius}
                        className="stroke-neutral-800"
                        strokeWidth="12"
                        fill="transparent"
                      />
                      {/* Animated Progress Circle */}
                      <circle
                        cx="50%"
                        cy="50%"
                        r={svgRadius}
                        className="stroke-emerald-400 transition-all duration-1000 ease-linear"
                        strokeWidth="12"
                        strokeDasharray={svgCircumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        style={{ filter: 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.6))' }}
                      />
                    </svg>

                    {/* Time & State Text */}
                    <div className="absolute flex flex-col items-center justify-center text-center space-y-2 no-drag">
                      <span className={`${fontSizeClass} font-mono font-extrabold tracking-tight text-white drop-shadow-md`}>
                        {formatTime(timeLeft)}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest font-extrabold text-emerald-400 bg-emerald-500/20 px-3 py-0.5 rounded-full border border-emerald-500/40">
                        {isTimerRunning ? 'Flowing...' : 'Paused'}
                      </span>

                      {/* Primary Play/Pause/Reset Controls inside Timer */}
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={resetTimer}
                          className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all border border-neutral-700"
                          title="Reset Timer"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>

                        {isTimerRunning ? (
                          <button
                            onClick={pauseTimer}
                            className="btn-emerald px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                          >
                            <Pause className="w-3.5 h-3.5 fill-current" /> Pause
                          </button>
                        ) : (
                          <button
                            onClick={startTimer}
                            className="btn-emerald px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" /> Start
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }}
          </DraggableResizable>
        </div>

        {/* Bottom Bar containing Break Options in Bottom-Right Corner (Req #1) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-neutral-800 z-10">

          {/* REQUIREMENT #1: Timer Break Options in Bottom-Right Corner */}
          <div className="flex items-center gap-2 p-1.5 glass-panel rounded-2xl border border-neutral-800 self-end md:self-auto shadow-lg">
            <span className="text-[11px] font-bold text-neutral-400 px-2 uppercase tracking-wider hidden sm:inline">
              Timer Mode:
            </span>

            <button
              onClick={() => changeTimerMode('pomodoro')}
              className={`py-1.5 px-3 rounded-xl text-xs font-extrabold transition-all border ${
                timerMode === 'pomodoro'
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                  : 'text-neutral-300 hover:bg-neutral-800 hover:text-white border-transparent'
              }`}
            >
              Pomodoro (25m)
            </button>

            <button
              onClick={() => changeTimerMode('shortBreak')}
              className={`py-1.5 px-3 rounded-xl text-xs font-extrabold transition-all border ${
                timerMode === 'shortBreak'
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                  : 'text-neutral-300 hover:bg-neutral-800 hover:text-white border-transparent'
              }`}
            >
              Short Break (5m)
            </button>

            <button
              onClick={() => changeTimerMode('longBreak')}
              className={`py-1.5 px-3 rounded-xl text-xs font-extrabold transition-all border ${
                timerMode === 'longBreak'
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                  : 'text-neutral-300 hover:bg-neutral-800 hover:text-white border-transparent'
              }`}
            >
              Long Break (15m)
            </button>

            <button
              onClick={() => changeTimerMode('custom', customMinutes)}
              className={`py-1.5 px-3 rounded-xl text-xs font-extrabold transition-all border ${
                timerMode === 'custom'
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                  : 'text-neutral-300 hover:bg-neutral-800 hover:text-white border-transparent'
              }`}
            >
              Custom ({customMinutes}m)
            </button>
          </div>
        </div>
      </div>

      {/* REQUIREMENT #5: Floating Draggable Daily Quote Widget */}
      <div className="py-2">
        <DraggableResizable
          storageKey="floating_quote_v2"
          defaultSize={360}
          minSize={280}
          maxSize={500}
          className="w-full"
        >
          {({ isDragging }) => (
            <div className="glass-panel rounded-3xl p-6 border border-emerald-500/40 shadow-2xl relative overflow-hidden bg-neutral-900/90 backdrop-blur-xl">
              <div className="absolute top-4 right-4 text-emerald-500/10 pointer-events-none">
                <QuoteIcon className="w-20 h-20" />
              </div>

              <div className="relative z-10 space-y-4 no-drag">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    {currentQuote.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleQuoteRefresh}
                      disabled={isQuoteLoading}
                      className={`p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors ${isQuoteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title="Next Quote"
                    >
                      <RotateCw className={`w-3.5 h-3.5 text-emerald-400 ${isFlipping || isQuoteLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      onClick={() => toggleFavoriteQuote(currentQuote)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isFav ? 'bg-red-500/20 text-red-400' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400'
                      }`}
                      title="Favorite"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={handleQuoteCopy}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                      title="Copy Quote"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <blockquote className="text-sm md:text-base font-serif italic text-white leading-relaxed">
                  "{currentQuote.quote}"
                </blockquote>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-800">
                  <span className="font-bold text-emerald-400">— {currentQuote.author}</span>
                  <span className="text-[10px] text-neutral-400 font-medium">{currentQuote.role}</span>
                </div>
              </div>
            </div>
          )}
        </DraggableResizable>
      </div>

      {/* Custom Focus Duration & Logging Controls (Req #2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Set Custom Timer Duration Form */}
        <div className="glass-panel p-6 rounded-2xl border border-neutral-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" /> Custom Focus Timer Duration
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Enter any custom focus session length (e.g. 15, 45, 60, or 90 minutes) to set the countdown.
          </p>
          <form onSubmit={handleApplyCustomDuration} className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              max="360"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Custom mins"
              className="glass-input rounded-xl px-4 py-2.5 text-sm w-full font-bold"
            />
            <button type="submit" className="btn-emerald px-5 py-2.5 rounded-xl text-xs font-bold shrink-0">
              Apply Timer
            </button>
          </form>
        </div>

        
      </div>

      {/* Dynamic Focus Stats Banner (Req #2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-2">
        <div className="glass-panel p-4 rounded-2xl border border-neutral-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
          </div>
          <div>
            <span className="text-xs text-neutral-400 font-semibold">Total Sessions</span>
            <h4 className="text-base font-extrabold text-white">{sessionsCompleted} Completed</h4>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-neutral-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-xs text-neutral-400 font-semibold">Logged Focus Time</span>
            <h4 className="text-base font-extrabold text-white">{totalLoggedFocusMinutes} Mins</h4>
          </div>
        </div>
      </div>
    </div>
  );
};
