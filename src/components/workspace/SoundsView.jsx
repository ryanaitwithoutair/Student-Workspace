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
  Wind, 
  Bell, 
  Activity, 
  Radio,
  Sliders,
  Repeat
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

  const SOUND_LIST = [
    { id: 'ocean', name: 'Ocean Waves', category: 'Nature', icon: Waves, description: 'Rhythmic low-frequency tide waves' },
    { id: 'river', name: 'River Stream', category: 'Nature', icon: Activity, description: 'Continuous fresh flowing water' },
    { id: 'forest', name: 'Forest Birds', category: 'Nature', icon: Trees, description: 'Gentle canopy wind and distant birds' },
    { id: 'rain', name: 'Rainfall', category: 'Weather', icon: CloudRain, description: 'Relaxing precipitation on leaves' },
    { id: 'cafe', name: 'Café Ambience', category: 'City', icon: Coffee, description: 'Warm coffee shop background murmur' },
    { id: 'wind', name: 'Highland Wind', category: 'Weather', icon: Wind, description: 'Sweeping mountain breeze' },
    { id: 'chimes', name: 'Wind Chimes', category: 'Acoustic', icon: Bell, description: 'Harmonic C-pentatonic bell decays' },
    { id: 'white-noise', name: 'White Noise', category: 'Color Noise', icon: Radio, description: 'Uniform full-spectrum mask noise' },
    { id: 'brown-noise', name: 'Brown Noise', category: 'Color Noise', icon: Radio, description: 'Deep low-end rumble for concentration' },
    { id: 'pink-noise', name: 'Pink Noise', category: 'Color Noise', icon: Radio, description: 'Balanced 1/f acoustic mask' },
    { id: 'binaural', name: 'Binaural Beats (40Hz)', category: 'Brainwave', icon: Sliders, description: 'Gamma 40Hz focus frequency entrainment' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Volume2 className="w-7 h-7 text-emerald-400" />
            Ambient Soundscapes
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Procedurally synthesized ambient audio engineered to isolate distractions and boost focus.
          </p>
        </div>

        {/* Master Control Bar */}
        <div className="glass-panel px-5 py-3 rounded-2xl border border-neutral-800 flex items-center gap-4">
          <button
            onClick={toggleMute}
            className="p-2 rounded-xl glass-panel hover:bg-neutral-800 text-neutral-300 transition-colors"
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
              className={`group glass-panel rounded-2xl p-6 border cursor-pointer transition-all duration-300 relative overflow-hidden ${
                isPlaying
                  ? 'border-emerald-500 bg-neutral-800 ring-2 ring-emerald-500/30 scale-[1.02] shadow-xl'
                  : 'border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50'
              }`}
            >
              {/* Category tag */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-300 bg-neutral-800 px-2.5 py-1 rounded-full border border-neutral-700">
                  {sound.category}
                </span>
                
                {isPlaying && (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <Repeat className="w-3.5 h-3.5 animate-spin" /> Continuous Loop
                  </span>
                )}
              </div>

              {/* Icon & Name */}
              <div className="flex items-center gap-4 mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  isPlaying 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105' 
                    : 'bg-neutral-800 text-neutral-300 group-hover:bg-neutral-700 group-hover:text-white'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {sound.name}
                  </h3>
                  <span className="text-xs text-neutral-400 font-medium">
                    {isPlaying ? 'Playing Now' : 'Click to Play'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                {sound.description}
              </p>

              {/* Play / Pause Action Button */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
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
                      : 'bg-neutral-800 text-neutral-300 group-hover:bg-emerald-500 group-hover:text-white'
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
