import React, { useState } from 'react';
import { Flame, X } from '../common/Icons';
import { useApp } from '../../context/AppContext';
import { MIN_FOCUS_MINUTES, MAX_CUSTOM_MINUTES } from '../../utils/constants';

export const LogFocusModal = ({ isOpen, onClose }) => {
  const { logFocusTime, totalLoggedFocusMinutes, showToast } = useApp();
  const [minutes, setMinutes] = useState('25');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const mins = parseInt(minutes, 10);

    if (isNaN(mins) || mins < MIN_FOCUS_MINUTES) {
      setError(`Enter at least ${MIN_FOCUS_MINUTES} minute.`);
      return;
    }
    if (mins > MAX_CUSTOM_MINUTES) {
      setError(`Maximum is ${MAX_CUSTOM_MINUTES} minutes.`);
      return;
    }

    logFocusTime(mins);
    showToast(`${mins} minutes of focus time logged.`);
    onClose();
  };

  const presets = [15, 25, 45, 60, 90];

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="log-focus-title"
    >
      <div
        className="glass-panel w-full max-w-sm rounded-2xl p-6 border border-neutral-700 space-y-5 animate-fadeIn shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <h3 id="log-focus-title" className="text-lg font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            Log Focus Time
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          Manually record focus time for sessions completed outside the timer. Total logged:{' '}
          <span className="text-emerald-400 font-semibold">{totalLoggedFocusMinutes} mins</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="focus-minutes" className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Duration (minutes)
            </label>
            <input
              id="focus-minutes"
              type="number"
              min={MIN_FOCUS_MINUTES}
              max={MAX_CUSTOM_MINUTES}
              value={minutes}
              onChange={(e) => {
                setMinutes(e.target.value);
                setError('');
              }}
              className="w-full glass-input rounded-xl px-4 py-2.5 text-sm font-bold"
              autoFocus
            />
            {error && (
              <p className="text-xs text-red-400 mt-1.5" role="alert">{error}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setMinutes(String(preset));
                  setError('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  minutes === String(preset)
                    ? 'bg-emerald-500 text-white border-emerald-400'
                    : 'bg-neutral-900/80 text-neutral-300 border-neutral-700 hover:border-emerald-500/40'
                }`}
              >
                {preset}m
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button type="submit" className="btn-emerald px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg">
              Log Time
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
