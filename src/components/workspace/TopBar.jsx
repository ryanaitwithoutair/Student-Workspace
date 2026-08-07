import React from 'react';
import { 
  Volume2, 
  VolumeX, 
  Flame, 
  Sparkles,
  Play,
  Square,
  Sliders
} from '../common/Icons';
import { useApp } from '../../context/AppContext';

export const TopBar = () => {
  const { 
    activeSpace, 
    updateSpace,
    user, 
    activeSoundId, 
    toggleSound, 
    volume, 
    setSoundVolume, 
    isMuted, 
    toggleMute,
    totalLoggedFocusMinutes
  } = useApp();

  const currentOpacity = activeSpace?.overlayOpacity !== undefined ? activeSpace.overlayOpacity : 0.8;

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

      {/* Center: Audio Quick Player & Live Background Dimming Slider (Req #4) */}
      <div className="hidden lg:flex items-center gap-5 px-4 py-2 rounded-2xl glass-panel border border-neutral-800">
        {/* Audio Player */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSound(activeSoundId || 'forest')}
            className={`p-1.5 rounded-lg transition-colors ${
              activeSoundId 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' 
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
            title={activeSoundId ? 'Pause sound' : 'Play forest sound'}
          >
            {activeSoundId ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>

          <span className="text-xs font-medium text-neutral-200 capitalize">
            {activeSoundId ? activeSoundId.replace('-', ' ') : 'Ambient Audio'}
          </span>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleMute}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
            className="w-16 accent-emerald-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            title="Ambient Volume"
          />
        </div>

        <div className="h-4 w-[1px] bg-neutral-800"></div>

        {/* REQUIREMENT #4: Background Overlay / Dimming Control Slider (0% - 100%) */}
        <div className="flex items-center gap-2" title="Background Overlay Dimming">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-neutral-300">Dimming</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={currentOpacity}
            onChange={(e) => updateSpace(activeSpace.id, { overlayOpacity: parseFloat(e.target.value) })}
            className="w-24 accent-emerald-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
          />
          <span className="text-xs font-mono font-bold text-emerald-400 w-8">
            {Math.round(currentOpacity * 100)}%
          </span>
        </div>
      </div>

      {/* Right Controls */}
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
