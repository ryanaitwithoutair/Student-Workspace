import React, { useState } from 'react';
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Flame, 
  Sparkles, 
  Sliders
} from '../common/Icons';
import { useApp } from '../../context/AppContext';

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
    sessionsCompleted 
  } = useApp();

  const [inputCustomMins, setInputCustomMins] = useState(30);

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
    return customMinutes * 60;
  };

  const totalSecs = getTotalSeconds();
  const progressPercent = Math.max(0, Math.min(100, ((totalSecs - timeLeft) / totalSecs) * 100));

  // SVG ring properties
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const handleApplyCustom = (e) => {
    e.preventDefault();
    const mins = parseInt(inputCustomMins, 10);
    if (mins && mins > 0) {
      setCustomMinutes(mins);
      changeTimerMode('custom', mins);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-3">
          <Timer className="w-8 h-8 text-emerald-400" />
          Focus & Break Timer
        </h1>
        <p className="text-sm text-emerald-200 font-medium">
          Supercharge productivity using proven time-boxing techniques.
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center justify-center gap-2 p-1.5 glass-panel rounded-2xl border border-emerald-500/30 max-w-md mx-auto">
        <button
          onClick={() => changeTimerMode('pomodoro')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all ${
            timerMode === 'pomodoro'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40'
              : 'text-emerald-200 hover:text-white'
          }`}
        >
          Pomodoro (25m)
        </button>

        <button
          onClick={() => changeTimerMode('shortBreak')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all ${
            timerMode === 'shortBreak'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40'
              : 'text-emerald-200 hover:text-white'
          }`}
        >
          Short Break (5m)
        </button>

        <button
          onClick={() => changeTimerMode('longBreak')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all ${
            timerMode === 'longBreak'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40'
              : 'text-emerald-200 hover:text-white'
          }`}
        >
          Long Break (15m)
        </button>

        <button
          onClick={() => changeTimerMode('custom')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all ${
            timerMode === 'custom'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40'
              : 'text-emerald-200 hover:text-white'
          }`}
        >
          Custom
        </button>
      </div>

      {/* Main SVG Circular Progress Timer Display */}
      <div className="flex flex-col items-center justify-center space-y-8 py-4">
        <div className="relative w-80 h-80 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              className="stroke-emerald-950/60"
              strokeWidth="14"
              fill="transparent"
            />
            {/* Animated Progress Circle */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              className="stroke-emerald-400 transition-all duration-1000 ease-linear"
              strokeWidth="14"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ filter: 'drop-shadow(0 0 16px rgba(52, 211, 153, 0.7))' }}
            />
          </svg>

          {/* Time & State Text */}
          <div className="absolute flex flex-col items-center justify-center text-center space-y-2">
            <span className="text-6xl font-mono font-extrabold tracking-tight text-white drop-shadow-md">
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs uppercase tracking-widest font-extrabold text-white bg-emerald-500/30 px-3.5 py-1 rounded-full border border-emerald-400">
              {isTimerRunning ? 'Flowing...' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={resetTimer}
            className="p-4 rounded-2xl glass-panel hover:bg-emerald-500/20 text-white transition-all border border-emerald-400"
            title="Reset Timer"
          >
            <RotateCcw className="w-6 h-6" />
          </button>

          {isTimerRunning ? (
            <button
              onClick={pauseTimer}
              className="btn-emerald px-8 py-4 rounded-2xl text-base font-extrabold flex items-center gap-3 shadow-xl"
            >
              <Pause className="w-6 h-6 fill-current" />
              Pause Session
            </button>
          ) : (
            <button
              onClick={startTimer}
              className="btn-emerald px-8 py-4 rounded-2xl text-base font-extrabold flex items-center gap-3 shadow-xl"
            >
              <Play className="w-6 h-6 fill-current" />
              Start Focus
            </button>
          )}
        </div>
      </div>

      {/* Custom Duration Setter (visible if custom mode selected) */}
      {timerMode === 'custom' && (
        <form onSubmit={handleApplyCustom} className="glass-panel p-5 rounded-2xl border border-emerald-400 max-w-sm mx-auto flex items-center gap-3">
          <Sliders className="w-5 h-5 text-emerald-300 shrink-0" />
          <input
            type="number"
            min="1"
            max="180"
            value={inputCustomMins}
            onChange={(e) => setInputCustomMins(e.target.value)}
            placeholder="Custom mins"
            className="glass-input rounded-xl px-3 py-2 text-sm w-full font-bold"
          />
          <button type="submit" className="btn-emerald px-4 py-2 rounded-xl text-xs font-bold shrink-0">
            Set Mins
          </button>
        </form>
      )}

      {/* Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-4">
        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/30 flex items-center justify-center">
            <Flame className="w-5 h-5 text-amber-300 fill-amber-300" />
          </div>
          <div>
            <span className="text-xs text-emerald-200 font-bold">Total Completed</span>
            <h4 className="text-base font-extrabold text-white">{sessionsCompleted} Pomodoros</h4>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <span className="text-xs text-emerald-200 font-bold">Logged Focus Time</span>
            <h4 className="text-base font-extrabold text-white">{sessionsCompleted * 25} Mins</h4>
          </div>
        </div>
      </div>
    </div>
  );
};
