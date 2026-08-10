import React from 'react';
import { 
  Flame, 
  Sparkles
} from '../common/Icons';
import { useApp } from '../../context/AppContext';

export const TopBar = () => {
  const { 
    activeSpace, 
    user, 
    totalLoggedFocusMinutes
  } = useApp();

  return (
    <header className="w-full glass-panel border-b border-neutral-800 px-6 py-3.5 flex items-center justify-between z-20">
      {/* Left: Active Space Indicator */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">
            Active Space
          </span>
          <h2 className="text-sm font-semibold text-white">
            {activeSpace?.name || 'Zen Forest'}
          </h2>
        </div>
      </div>

      {/* Right: Focus Stats & Profile Avatar */}
      <div className="flex items-center gap-4">
        {/* Logged Focus Time Counter */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel border border-neutral-800 text-xs font-medium text-neutral-200">
          <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
          <span>{totalLoggedFocusMinutes} Focus Mins</span>
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-neutral-800">
          <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sm font-semibold text-white">
            {user?.avatar || '🌱'}
          </div>
          <span className="hidden sm:inline text-xs font-medium text-neutral-200">
            {user?.name || 'Focus Master'}
          </span>
        </div>
      </div>
    </header>
  );
};
