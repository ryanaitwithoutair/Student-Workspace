import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Calendar as CalendarIcon, 
  Volume2, 
  Timer, 
  Quote, 
  ChevronLeft, 
  ChevronRight, 
  Leaf,
  LogOut
} from '../common/Icons';
import { useApp } from '../../context/AppContext';
import { useNavigate } from '../../router/router';

export const Sidebar = () => {
  const { activeTab, setActiveTab, activeSoundId, isMuted, logout } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { id: 'spaces', label: 'Spaces', icon: LayoutGrid },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'sounds', label: 'Sounds', icon: Volume2 },
    { id: 'timer', label: 'Focus Timer', icon: Timer },
    { id: 'quotes', label: 'Daily Quotes', icon: Quote },
  ];

  return (
    <aside 
      className={`relative h-screen glass-panel border-r border-neutral-800 flex flex-col justify-between transition-all duration-300 z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header & Logo */}
      <div>
        <div className="p-5 flex items-center justify-between border-b border-neutral-800">
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center gap-3 cursor-pointer overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0 shadow-md">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
            {!collapsed && (
              <span className="text-xl font-bold tracking-tight text-white dark:text-neutral-50">
                Evolve
              </span>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg glass-panel hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
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
                className={`w-full flex items-center gap-4 px-3.5 py-3 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-neutral-800 text-white border border-emerald-500/40 shadow-md'
                    : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-white'
                }`}
                title={collapsed ? item.label : ''}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-neutral-400 group-hover:text-neutral-200 transition-transform'}`} />
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

      {/* Footer / Exit */}
      <div className="p-3 border-t border-neutral-800">
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="w-full flex items-center gap-4 px-3.5 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          title={collapsed ? 'Exit Workspace' : ''}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Exit Workspace</span>}
        </button>
      </div>
    </aside>
  );
};
