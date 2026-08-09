import React, { useState } from 'react';
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders,
  X,
  ChevronUp,
  Quote,
  Clock,
  Eye,
  EyeOff,
  CheckSquare,
  Volume2,
  VolumeX
} from '../common/Icons';
import { useApp } from '../../context/AppContext';
import { DraggableResizable } from '../common/DraggableResizable';
import { useWidgetTranslucency } from '../../hooks/useWidgetTranslucency';
import { TIMER_DURATIONS, MAX_CUSTOM_MINUTES } from '../../utils/constants';

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
    showQuotesWidget,
    toggleQuotesWidget,
    showFlipClockWidget,
    toggleFlipClockWidget,
    showTasksWidget,
    toggleTasksWidget,
    isFocusDimmed,
    toggleFocusDimmed,
    isTimerSoundEnabled,
    toggleTimerSound,
    timerSoundVolume,
    setTimerSoundVolume
  } = useApp();

  const { widgetBgStyle } = useWidgetTranslucency();

  const [showMenu, setShowMenu] = useState(false);
  const [showCustomPanel, setShowCustomPanel] = useState(false);
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [customInput, setCustomInput] = useState(customMinutes ? customMinutes.toString() : '25');

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalSeconds = () => {
    if (timerMode === 'pomodoro') return TIMER_DURATIONS.pomodoro * 60;
    if (timerMode === 'shortBreak') return TIMER_DURATIONS.shortBreak * 60;
    if (timerMode === 'longBreak') return TIMER_DURATIONS.longBreak * 60;
    return (customMinutes || TIMER_DURATIONS.pomodoro) * 60;
  };

  const totalSecs = getTotalSeconds();
  const progressPercent = Math.max(0, Math.min(100, ((totalSecs - timeLeft) / totalSecs) * 100));

  const timerSize = typeof window !== 'undefined' && window.innerWidth < 640 ? 260 : 320;
  const svgRadius = (timerSize / 2) - 24;
  const svgCircumference = 2 * Math.PI * svgRadius;
  const strokeDashoffset = svgCircumference - (progressPercent / 100) * svgCircumference;

  const modeLabels = {
    pomodoro: 'Focus',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
    custom: 'Custom Focus',
  };

  const handleSelectMode = (mode) => {
    if (mode === 'custom') {
      setShowCustomPanel(true);
    } else {
      setShowCustomPanel(false);
      setShowMenu(false);
      changeTimerMode(mode);
    }
  };

  const handleApplyCustomTimer = (e) => {
    e.preventDefault();
    const mins = parseInt(customInput, 10);
    if (!isNaN(mins) && mins > 0 && mins <= MAX_CUSTOM_MINUTES) {
      setCustomMinutes(mins);
      changeTimerMode('custom', mins);
      setShowCustomPanel(false);
      setShowMenu(false);
    }
  };

  const defaultTimerX = typeof window !== 'undefined'
    ? Math.max(24, (window.innerWidth / 2) - (timerSize / 2))
    : 0;

  return (
    <div className="relative min-h-[calc(100vh-8rem)] w-full flex flex-col justify-between select-none pb-24 sm:pb-0">
      {/* Floating Timer Circle */}
      <div className="flex-1 flex justify-center items-center py-6 sm:py-10">
        <DraggableResizable
          storageKey="timer_circle_v3"
          defaultSize={timerSize}
          resizable={false}
          defaultPosition={{ x: defaultTimerX, y: 120 }}
          className="flex flex-col items-center justify-center"
        >
          {() => (
            <div 
              style={widgetBgStyle}
              className="rounded-full p-4 sm:p-6 border border-emerald-500/40 shadow-2xl flex flex-col items-center justify-center relative transition-all duration-500 hover:border-emerald-400"
            >
              <div
                className="relative flex items-center justify-center"
                style={{ width: `${timerSize - 48}px`, height: `${timerSize - 48}px` }}
              >
                <svg className="w-full h-full transform -rotate-90" aria-hidden="true">
                  <circle
                    cx="50%"
                    cy="50%"
                    r={svgRadius}
                    className="stroke-neutral-800/80"
                    strokeWidth="12"
                    fill="transparent"
                  />
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
                    style={{ filter: 'drop-shadow(0 0 14px rgba(16, 185, 129, 0.7))' }}
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center space-y-2 sm:space-y-2.5 no-drag">
                  <span
                    className="text-4xl sm:text-5xl font-mono font-extrabold tracking-tight text-white drop-shadow-md"
                    role="timer"
                    aria-live="off"
                    aria-label={`${formatTime(timeLeft)} remaining`}
                  >
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest font-extrabold text-emerald-400 bg-emerald-500/20 px-3 py-0.5 rounded-full border border-emerald-500/40 backdrop-blur-md">
                    {isTimerRunning ? 'Flowing...' : modeLabels[timerMode] || 'Paused'}
                  </span>

                  <div className="flex items-center gap-2 pt-1 sm:pt-2">
                    <button
                      onClick={resetTimer}
                      className="p-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700/80 text-neutral-300 hover:text-white transition-all border border-neutral-700/80 backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      aria-label="Reset timer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    {isTimerRunning ? (
                      <button
                        onClick={pauseTimer}
                        className="btn-emerald px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                        aria-label="Pause timer"
                      >
                        <Pause className="w-4 h-4 fill-current" /> Pause
                      </button>
                    ) : (
                      <button
                        onClick={startTimer}
                        className="btn-emerald px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                        aria-label="Start timer"
                      >
                        <Play className="w-4 h-4 fill-current" /> Start
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DraggableResizable>
      </div>

      {/* Bottom-Right Floating Action Bar & Panels */}
      <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 flex flex-col items-end gap-2 sm:gap-3 max-w-[calc(100vw-2rem)]">
        {/* Timer Sound Settings Panel */}
        {showSoundSettings && (
          <div 
            style={widgetBgStyle}
            className="p-4 rounded-2xl border border-emerald-500/40 shadow-2xl space-y-3 w-full sm:w-64 animate-fadeIn transition-all duration-300 mb-1"
          >
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> Timer Sound Effects
              </span>
              <button
                type="button"
                onClick={() => setShowSoundSettings(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg"
                aria-label="Close sound settings"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 pt-1">
              {/* ON/OFF Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-300 font-medium">Chime Sound Effects</span>
                <button
                  type="button"
                  onClick={toggleTimerSound}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                    isTimerSoundEnabled
                      ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  }`}
                >
                  {isTimerSoundEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Volume Slider */}
              {isTimerSoundEnabled && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-neutral-400 font-medium">Effects Volume</span>
                    <span className="font-mono text-emerald-400">{Math.round(timerSoundVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={timerSoundVolume}
                    onChange={(e) => setTimerSoundVolume(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Custom Duration Panel */}
        {showCustomPanel && (
          <div 
            style={widgetBgStyle}
            className="p-4 rounded-2xl border border-emerald-500/40 shadow-2xl space-y-3 w-full sm:w-64 animate-fadeIn transition-all duration-300 mb-1"
          >
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" /> Set Custom Duration
              </span>
              <button
                type="button"
                onClick={() => setShowCustomPanel(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg"
                aria-label="Close custom duration panel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleApplyCustomTimer} className="space-y-3">
              <div>
                <label htmlFor="custom-duration" className="block text-[10px] font-semibold text-neutral-300 mb-1">
                  Duration (minutes)
                </label>
                <input
                  id="custom-duration"
                  type="number"
                  min="1"
                  max={MAX_CUSTOM_MINUTES}
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="e.g. 45"
                  className="glass-input rounded-xl px-3 py-2 text-xs w-full font-bold"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomPanel(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-neutral-400 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-emerald px-4 py-1.5 rounded-xl text-xs font-bold shadow-md"
                >
                  Apply Timer
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Vertical Popup Menu */}
        {showMenu && (
          <div 
            style={widgetBgStyle}
            className="p-2 rounded-2xl border border-emerald-500/30 shadow-2xl flex flex-col gap-1 w-full sm:w-52 animate-fadeIn transition-all duration-300"
            role="menu"
            aria-label="Timer modes"
          >
            {[
              { mode: 'pomodoro', label: 'Pomodoro', duration: `${TIMER_DURATIONS.pomodoro}m` },
              { mode: 'shortBreak', label: 'Short Break', duration: `${TIMER_DURATIONS.shortBreak}m` },
              { mode: 'longBreak', label: 'Long Break', duration: `${TIMER_DURATIONS.longBreak}m` },
              { mode: 'custom', label: 'Custom...', duration: `${customMinutes}m` },
            ].map(({ mode, label, duration }) => (
              <button
                key={mode}
                onClick={() => handleSelectMode(mode)}
                role="menuitem"
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  timerMode === mode
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-neutral-300 hover:bg-neutral-800/80 hover:text-white'
                }`}
              >
                <span>{label}</span>
                <span className="text-[10px] opacity-80">{duration}</span>
              </button>
            ))}
          </div>
        )}

        {/* Action Bar */}
        <div 
          style={widgetBgStyle}
          className="p-1.5 rounded-full border border-emerald-500/40 shadow-2xl flex items-center gap-1 sm:gap-2 backdrop-blur-xl flex-wrap justify-end"
        >
          {/* Timer Sound Settings Button */}
          <button
            onClick={() => {
              setShowSoundSettings(!showSoundSettings);
              setShowCustomPanel(false);
              setShowMenu(false);
            }}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              showSoundSettings || !isTimerSoundEnabled
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105'
                : 'text-neutral-300 hover:bg-neutral-800/80 hover:text-white'
            }`}
            aria-label="Timer sound effect settings"
            title="Timer Sound Effects Settings"
          >
            {isTimerSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>

          {[
            { active: showTasksWidget, toggle: toggleTasksWidget, icon: CheckSquare, label: 'Toggle focus tasks widget' },
            { active: showQuotesWidget, toggle: toggleQuotesWidget, icon: Quote, label: 'Toggle quotes widget' },
            { active: showFlipClockWidget, toggle: toggleFlipClockWidget, icon: Clock, label: 'Toggle flip clock widget' },
          ].map(({ active, toggle, icon: Icon, label }) => (
            <button
              key={label}
              onClick={toggle}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                active
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105'
                  : 'text-neutral-300 hover:bg-neutral-800/80 hover:text-white'
              }`}
              aria-label={label}
              aria-pressed={active}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}

          <button
            onClick={toggleFocusDimmed}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              isFocusDimmed
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105'
                : 'text-neutral-300 hover:bg-neutral-800/80 hover:text-white'
            }`}
            aria-label="Toggle deep focus dimming"
            aria-pressed={isFocusDimmed}
          >
            {isFocusDimmed ? <EyeOff className="w-4 h-4 text-white" /> : <Eye className="w-4 h-4 text-emerald-400" />}
          </button>

          <div className="h-5 w-px bg-neutral-800 hidden sm:block" aria-hidden="true" />

          <button
            onClick={() => {
              setShowMenu(!showMenu);
              setShowCustomPanel(false);
              setShowSoundSettings(false);
            }}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
              showMenu || showCustomPanel
                ? 'bg-emerald-500 text-white border-emerald-300 ring-2 ring-emerald-500/30 scale-105'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500 hover:text-white hover:scale-105'
            }`}
            aria-label="Select timer mode"
            aria-expanded={showMenu}
          >
            {showMenu ? <ChevronUp className="w-5 h-5 transform rotate-180" /> : <Timer className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
