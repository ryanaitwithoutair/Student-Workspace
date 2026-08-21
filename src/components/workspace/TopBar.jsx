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
  const displayName = user?.user_metadata?.display_name || user?.name || user?.email?.split('@')[0] || 'Focus Master';

  return (
    <header className="z-20 flex min-h-[72px] w-full items-center justify-between border-b border-white/[0.07] bg-[#0b0c0e]/72 px-4 py-3 backdrop-blur-xl sm:px-6">
      {/* Left: Active Space Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06]">
          <Sparkles className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">
            Active Space
          </span>
          <h2 className="max-w-32 truncate text-sm font-semibold text-white sm:max-w-none">
            {activeSpace?.name || 'Zen Forest'}
          </h2>
        </div>
      </div>

      {/* Right: Focus Stats & Profile Avatar */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Logged Focus Time Counter */}
        <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-black/15 px-2.5 py-1.5 text-xs font-medium text-neutral-200 sm:px-3">
          <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="hidden sm:inline">{totalLoggedFocusMinutes} Focus Mins</span>
          <span className="sm:hidden">{totalLoggedFocusMinutes}m</span>
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2.5 border-l border-white/[0.08] pl-2 sm:pl-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-400/[0.08] text-sm font-semibold text-white">
            {user?.avatar || '🌱'}
          </div>
          <span className="hidden sm:inline text-xs font-medium text-neutral-200">
            {displayName}
          </span>
        </div>
      </div>
    </header>
  );
};
