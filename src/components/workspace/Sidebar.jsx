import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Calendar as CalendarIcon, 
  Volume2, 
  Timer, 
  ChevronLeft, 
  ChevronRight, 
  Leaf,
  LogOut,
  Flame
} from '../common/Icons';
import { useApp } from '../../context/AppContext';
import { useNavigate } from '../../router/router';
import { LogFocusModal } from './LogFocusModal';

export const Sidebar = () => {
  const { 
    activeTab, 
    setActiveTab, 
    activeSoundId, 
    isMuted, 
    logout,
    user,
    totalLoggedFocusMinutes 
  } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [showLogFocus, setShowLogFocus] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { id: 'timer', label: 'Focus Timer', icon: Timer },
    { id: 'spaces', label: 'Spaces', icon: LayoutGrid },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'sounds', label: 'Sounds', icon: Volume2 },
  ];

  return (
    <aside 
      className={`relative h-screen glass-panel border-r border-emerald-500/20 flex flex-col justify-between transition-all duration-300 z-30 shadow-2xl backdrop-blur-2xl ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Brand Header */}
      <div>
        <div className="p-5 flex items-center justify-between border-b border-neutral-800/80">
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center gap-3 cursor-pointer overflow-hidden group"
          >
            <div className="w-10 h-10 rounded-2xl bg-neutral-900 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10 group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            {!collapsed && (
              <span className="text-xl font-extrabold tracking-tight text-white dark:text-neutral-50 group-hover:text-emerald-400 transition-colors">
                Evolve
              </span>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all shadow-md"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isPlayingSound = item.id === 'sounds' && activeSoundId && !isMuted;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all group relative overflow-hidden ${
                  isActive
                    ? 'bg-neutral-800/90 text-white border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                    : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-white hover:translate-x-1'
                }`}
                title={collapsed ? item.label : ''}
              >
                {/* Luminous Active Left Indicator Strip */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-emerald-400 rounded-r-full shadow-[0_0_12px_#10b981]"></span>
                )}

                <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-emerald-400' : 'text-neutral-400 group-hover:text-emerald-300'
                }`} />

                {!collapsed && <span>{item.label}</span>}

                {/* Animated wave indicator if sound is playing */}
                {isPlayingSound && (
                  <div className="ml-auto flex items-center gap-0.5">
                    <span className="w-1 bg-emerald-400 rounded-full animate-wave-1"></span>
                    <span className="w-1 bg-emerald-400 rounded-full animate-wave-2"></span>
                    <span className="w-1 bg-emerald-400 rounded-full animate-wave-3"></span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Profile & Exit Workspace */}
      <div className="p-3 border-t border-neutral-800/80 space-y-2">
        {/* User Mini Focus Profile */}
        {!collapsed && (
          <div className="p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center gap-3 shadow-inner">
            <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
              {user?.avatar || '🌿'}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white truncate">{user?.name || 'Focus Master'}</h4>
              <button
                onClick={() => setShowLogFocus(true)}
                className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 hover:text-emerald-300 transition-colors mt-0.5"
                title="Log custom focus time"
              >
                <Flame className="w-3 h-3 fill-current text-amber-400" /> {totalLoggedFocusMinutes} mins logged
              </button>
            </div>
          </div>
        )}

        {collapsed && (
          <button
            onClick={() => setShowLogFocus(true)}
            className="w-full flex items-center justify-center p-3 rounded-2xl text-amber-400 hover:bg-neutral-800/50 transition-all"
            title={`${totalLoggedFocusMinutes} mins logged — click to log focus time`}
            aria-label="Log focus time"
          >
            <Flame className="w-5 h-5" />
          </button>
        )}

        <LogFocusModal
          isOpen={showLogFocus}
          onClose={() => setShowLogFocus(false)}
        />

        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all group"
          title={collapsed ? 'Exit Workspace' : ''}
        >
          <LogOut className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
          {!collapsed && <span>Exit Workspace</span>}
        </button>
      </div>
    </aside>
  );
};
