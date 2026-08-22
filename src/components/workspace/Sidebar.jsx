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
  CheckSquare,
  Activity,
  Users,
} from '../common/Icons';
import { useApp } from '../../context/AppContext';
import { useNavigate } from '../../router/router';

export const Sidebar = () => {
  const { 
    activeTab, 
    setActiveTab, 
    activeSoundId, 
    isMuted, 
    logout,
    
  } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { id: 'timer', label: 'Focus Timer', icon: Timer },
    { id: 'spaces', label: 'Spaces', icon: LayoutGrid },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'checklists', label: 'Checklists', icon: CheckSquare },
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'sounds', label: 'Sounds', icon: Volume2 },
    { id: 'party', label: 'Focus Together', icon: Users },
  ];

  return (
    <aside 
      className={`relative z-30 flex h-screen flex-col justify-between border-r border-white/[0.08] bg-[#0c0d0f]/82 shadow-2xl backdrop-blur-2xl transition-[width] duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Brand Header */}
      <div>
        <div className="flex items-center justify-between border-b border-white/[0.07] p-4">
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center gap-3 cursor-pointer overflow-hidden group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.07] shadow-lg shadow-emerald-500/10 transition-transform group-hover:scale-105">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
            {!collapsed && (
              <span className="text-xl font-extrabold tracking-tight text-white dark:text-neutral-50 group-hover:text-emerald-400 transition-colors">
                Evolve
              </span>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-2 text-neutral-400 shadow-sm transition-all hover:bg-white/[0.08] hover:text-white"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="mt-4 space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isPlayingSound = item.id === 'sounds' && activeSoundId && !isMuted;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`group relative flex w-full items-center gap-3.5 overflow-hidden rounded-xl px-3.5 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? 'border border-emerald-400/25 bg-emerald-400/[0.08] text-white shadow-lg shadow-emerald-500/[0.06]'
                    : 'border border-transparent text-neutral-400 hover:bg-white/[0.05] hover:text-white hover:translate-x-0.5'
                }`}
                title={collapsed ? item.label : ''}
              >
                {/* Luminous Active Left Indicator Strip */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-emerald-400 shadow-[0_0_12px_#10b981]"></span>
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
      <div className="space-y-2 border-t border-white/[0.07] p-3">
        {/* User Mini Focus Profile */}
        <button
          onClick={async () => {
            const didLogOut = await logout();
            if (didLogOut) navigate('/');
          }}
          className="group flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300"
          title={collapsed ? 'Exit Workspace' : ''}
        >
          <LogOut className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
          {!collapsed && <span>Exit Workspace</span>}
        </button>
      </div>
    </aside>
  );
};
