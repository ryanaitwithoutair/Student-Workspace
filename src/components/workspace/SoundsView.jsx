import React from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  Waves, 
  Trees, 
  CloudRain, 
  Coffee, 
  Bell, 
  Activity, 
  Repeat,
  Sliders,
  Radio
} from '../common/Icons';
import { useApp } from '../../context/AppContext';

export const SoundsView = () => {
  const { 
    activeSoundId, 
    toggleSound, 
    volume, 
    setSoundVolume, 
    isMuted, 
    toggleMute 
  } = useApp();

  // 8 Ultra-Soothing, Warm Deep-Focus Soundscapes
  const SOUND_LIST = [
    { id: 'rain', name: 'Whispering Rain', category: 'Soothing', icon: CloudRain, description: 'Velvety, soft rain without harsh frequencies', color: 'from-sky-500/10 to-indigo-500/10', tagColor: 'text-sky-300 bg-sky-500/10 border-sky-500/30' },
    { id: 'ocean', name: 'Velvet Ocean Tide', category: 'Tranquil', icon: Waves, description: 'Deep low-frequency slow 14s wave swell', color: 'from-cyan-500/10 to-blue-500/10', tagColor: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30' },
    { id: 'river', name: 'Quiet Meadow Stream', category: 'Calm', icon: Activity, description: 'Gentle babbling stream murmur', color: 'from-teal-500/10 to-emerald-500/10', tagColor: 'text-teal-300 bg-teal-500/10 border-teal-500/30' },
    { id: 'forest', name: 'Warm Forest Breeze', category: 'Serene', icon: Trees, description: 'Deep canopy breeze & 432Hz bird whispers', color: 'from-emerald-500/10 to-green-500/10', tagColor: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30' },
    { id: 'cafe', name: 'Cozy Sanctuary', category: 'Warm', icon: Coffee, description: 'Subtle low-frequency atmospheric warmth', color: 'from-amber-600/10 to-orange-500/10', tagColor: 'text-amber-300 bg-amber-500/10 border-amber-500/30' },
    { id: 'chimes', name: 'Zen Singing Bowls', category: 'Solfeggio', icon: Bell, description: 'Resonant 432Hz & 528Hz Tibetan bowl harmonics', color: 'from-yellow-500/10 to-amber-500/10', tagColor: 'text-yellow-300 bg-yellow-500/10 border-yellow-500/30' },
    { id: 'brown-noise', name: 'Deep Sub-Bass Brown', category: 'Focus Mask', icon: Radio, description: 'Warm sub-frequency distraction mask', color: 'from-amber-800/10 to-neutral-700/10', tagColor: 'text-neutral-300 bg-neutral-700/20 border-neutral-600' },
    { id: 'binaural', name: 'Soft Alpha Binaural', category: '8Hz Alpha', icon: Sliders, description: '136.1Hz Om tone & 8Hz relaxation beat', color: 'from-purple-500/10 to-violet-500/10', tagColor: 'text-purple-300 bg-purple-500/10 border-purple-500/30' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Volume2 className="w-7 h-7 text-emerald-400" />
            Soothing Focus Soundscapes
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Velvety, low-frequency audio layers engineered to quiet the mind and sustain tranquil concentration.
          </p>
        </div>

        {/* Master Audio Control Bar */}
        <div className="glass-panel px-5 py-3 rounded-2xl border border-neutral-800 flex items-center gap-4 shadow-lg">
          <button
            onClick={toggleMute}
            className="p-2 rounded-xl glass-panel hover:bg-neutral-800 text-neutral-300 transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-300 font-medium">Volume</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
              className="w-28 accent-emerald-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono text-emerald-400 w-8">{Math.round(volume * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Grid of Sound Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {SOUND_LIST.map((sound) => {
          const Icon = sound.icon;
          const isPlaying = activeSoundId === sound.id;

          return (
            <div
              key={sound.id}
              onClick={() => toggleSound(sound.id)}
              className={`group glass-panel rounded-2xl p-6 border cursor-pointer transition-all duration-300 relative overflow-hidden bg-gradient-to-br ${sound.color} ${
                isPlaying
                  ? 'border-emerald-400 ring-2 ring-emerald-500/40 scale-[1.02] shadow-xl'
                  : 'border-neutral-800 hover:border-neutral-700 hover:scale-[1.01]'
              }`}
            >
              {/* Category Tag & Status */}
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${sound.tagColor}`}>
                  {sound.category}
                </span>
                
                {isPlaying && (
                  <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                    <Repeat className="w-3.5 h-3.5 animate-spin" /> Playing
                  </span>
                )}
              </div>

              {/* Icon & Name */}
              <div className="flex items-center gap-4 mb-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  isPlaying 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 scale-105' 
                    : 'bg-neutral-900/80 text-neutral-300 group-hover:bg-emerald-500 group-hover:text-white border border-neutral-700'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    {sound.name}
                  </h3>
                  <span className="text-xs text-neutral-400 font-medium">
                    {isPlaying ? 'Active Soothing Audio' : 'Click to Play'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed mb-4 font-normal">
                {sound.description}
              </p>

              {/* Action Button & Visualizer */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-800/80">
                {isPlaying ? (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1 bg-emerald-400 rounded-full animate-wave-1"></span>
                    <span className="w-1 bg-emerald-400 rounded-full animate-wave-2"></span>
                    <span className="w-1 bg-emerald-400 rounded-full animate-wave-3"></span>
                    <span className="w-1 bg-emerald-400 rounded-full animate-wave-4"></span>
                  </div>
                ) : (
                  <span className="text-xs text-neutral-500">Ready</span>
                )}

                <button
                  className={`p-2 rounded-xl transition-all ${
                    isPlaying 
                      ? 'bg-emerald-500 text-white shadow-md' 
                      : 'bg-neutral-900 text-neutral-300 group-hover:bg-emerald-500 group-hover:text-white border border-neutral-700'
                  }`}
                >
                  {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
