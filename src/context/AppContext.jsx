import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { soundEngine } from '../audio/soundGenerator';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { streakStats, minutesFromSessions, localDateKey } from '../utils/focusData';
const AppContext = createContext();

const getAuthErrorMessage = (error) => {
  if (/fetch|network/i.test(error?.message || '')) {
    return 'Unable to reach Supabase. Verify VITE_SUPABASE_URL in Vercel uses your exact active Project URL.';
  }
  return error?.message || 'Unable to sign in. Please try again.';
};

const DEFAULT_SPACES = [
  {
    id: 'space-1',
    name: 'Zen Forest',
    icon: 'Trees',
    type: 'image',
    bg: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2000&q=80',
    overlayOpacity: 0.75,
    associatedSound: 'forest',
    notes: '### Deep Work Goal Today\n- Finish core feature architecture\n- Minimize notification distractions\n- Review daily priorities',
    links: [
      { id: 'l1', title: 'Cal Newport - Deep Work', url: 'https://calnewport.com/books/deep-work' },
      { id: 'l2', title: 'Flow State Research', url: 'https://wikipedia.org/wiki/Flow_(psychology)' }
    ]
  },
  {
    id: 'space-2',
    name: 'Misty Mountains',
    icon: 'Mountain',
    type: 'image',
    bg: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80',
    overlayOpacity: 0.8,
    associatedSound: 'ocean',
    notes: '### Quiet Meditation & Writing\nWrite without editing first. Let ideas flow seamlessly.',
    links: [
      { id: 'l3', title: 'Stanford Neuroscience of Focus', url: 'https://hubermanlab.com' }
    ]
  },
  {
    id: 'space-3',
    name: 'Rainy Night Sanctuary',
    icon: 'CloudRain',
    type: 'image',
    bg: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2000&q=80',
    overlayOpacity: 0.85,
    associatedSound: 'rain',
    notes: '### Late Night Coding Session\nKeep rain noise running at 40% and stay focused on single component logic.',
    links: []
  },
  {
    id: 'space-4',
    name: 'Sunlit Studio',
    icon: 'Sun',
    type: 'gradient',
    bg: 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #09090b 100%)',
    overlayOpacity: 0.7,
    associatedSound: 'chimes',
    notes: '### Morning Planning\n1. Review calendar tasks\n2. Run 2 x 25min Pomodoro sessions',
    links: []
  }
];

const QUOTES_DATABASE = [
  {
    id: 1,
    quote: "You have power over your mind - not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
    category: "Stoicism",
    role: "Roman Emperor & Philosopher"
  },
  {
    id: 2,
    quote: "Simplicity is the ultimate sophistication.",
    author: "Leonardo da Vinci",
    category: "Mastery",
    role: "Polymath & Inventor"
  },
  {
    id: 3,
    quote: "Who looks outside, dreams; who looks inside, awakes.",
    author: "Carl Jung",
    category: "Psychology",
    role: "Psychoanalyst"
  },
  {
    id: 4,
    quote: "There is nothing outside of yourself that can ever enable you to get better, stronger, richer, quicker, or smarter. Everything is within.",
    author: "Miyamoto Musashi",
    category: "Mastery",
    role: "Swordsman & Author"
  },
  {
    id: 5,
    quote: "We suffer more often in imagination than in reality.",
    author: "Seneca",
    category: "Stoicism",
    role: "Stoic Philosopher"
  },
  {
    id: 6,
    quote: "Between stimulus and response there is a space. In that space is our power to choose our response.",
    author: "Viktor Frankl",
    category: "Psychology",
    role: "Neurologist & Author"
  },
  {
    id: 7,
    quote: "Muddy water is best cleared by leaving it alone.",
    author: "Alan Watts",
    category: "Philosophy",
    role: "Philosopher & Speaker"
  },
  {
    id: 8,
    quote: "Nature does not hurry, yet everything is accomplished.",
    author: "Lao Tzu",
    category: "Philosophy",
    role: "Taoist Sage"
  }
];

const DEFAULT_REMINDERS = [
  { id: 'r1', title: 'Deep Work Sprint 1 (Core Module)', time: '09:30 AM', date: new Date().toISOString().split('T')[0], completed: true, priority: 'high', notes: 'Complete design specs' },
  { id: 'r2', title: 'Review System Architecture Notes', time: '02:00 PM', date: new Date().toISOString().split('T')[0], completed: false, priority: 'medium', notes: 'Refactor state context' },
  { id: 'r3', title: 'Evening Hydration & Mind Reset', time: '05:30 PM', date: new Date().toISOString().split('T')[0], completed: false, priority: 'low', notes: '15m walk' }
];

const ACHIEVEMENTS = [
  { id: 'first', label: 'First Focus Session', type: 'sessions', target: 1 }, { id: 'focus-5', label: '5 Hours Focused', type: 'minutes', target: 300 },
  { id: 'focus-10', label: '10 Hours Focused', type: 'minutes', target: 600 }, { id: 'focus-25', label: '25 Hours Focused', type: 'minutes', target: 1500 },
  { id: 'focus-50', label: '50 Hours Focused', type: 'minutes', target: 3000 }, { id: 'focus-100', label: '100 Hours Focused', type: 'minutes', target: 6000 },
  ...[10, 25, 50, 100].map((target) => ({ id: `sessions-${target}`, label: `${target} Sessions`, type: 'sessions', target })),
  ...[3, 7, 14, 30].map((target) => ({ id: `streak-${target}`, label: `${target} Day Streak`, type: 'streak', target })),
  ...[60, 120, 180].map((target) => ({ id: `day-${target}`, label: `${target / 60} Hour Focus Day`, type: 'dailyMinutes', target })),
  { id: 'daily-5', label: '5 Sessions in One Day', type: 'dailySessions', target: 5 },
];

export const AppProvider = ({ children }) => {
  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const dismissToast = () => {
    setToast(null);
  };

  // Auth User
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(isSupabaseConfigured);
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(false);
  const workspaceLoadedForUserRef = useRef(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return undefined;
    }

    let isMounted = true;
    const loadSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (isMounted) setUser(session?.user ?? null);
      } catch (error) {
        console.error('Unable to restore the Supabase session:', error);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsAuthLoading(false);
      }
    };

    void loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Active Workspace Tab — Focus Timer opens FIRST by default
  const [activeTab, setActiveTab] = useState('timer');

  // Widget Toggles
  const [showQuotesWidget, setShowQuotesWidget] = useState(() => {
    return localStorage.getItem('evolve_show_quotes_widget') === 'true';
  });

  const [showFlipClockWidget, setShowFlipClockWidget] = useState(() => {
    return localStorage.getItem('evolve_show_flip_clock') === 'true';
  });

  const [showTasksWidget, setShowTasksWidget] = useState(() => {
    return localStorage.getItem('evolve_show_tasks_widget') === 'true';
  });

  // Global Full-Screen Deep-Focus Dimming Mode
  const [isFocusDimmed, setIsFocusDimmed] = useState(() => {
    return localStorage.getItem('evolve_focus_dimmed') === 'true';
  });

  // Spaces
  const [spaces, setSpaces] = useState(() => {
    const saved = localStorage.getItem('evolve_spaces');
    return saved ? JSON.parse(saved) : DEFAULT_SPACES;
  });
  const [activeSpaceId, setActiveSpaceId] = useState(() => {
    return localStorage.getItem('evolve_active_space') || 'space-1';
  });

  // Ambient Audio state
  const [activeSoundId, setActiveSoundId] = useState(null);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  // Independent Timer Sound Settings (ON/OFF and Volume)
  const [isTimerSoundEnabled, setIsTimerSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('evolve_timer_sound_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const [timerSoundVolume, setTimerSoundVolume] = useState(() => {
    const saved = localStorage.getItem('evolve_timer_sound_volume');
    return saved ? parseFloat(saved) : 0.6;
  });

  // Timer state. The running deadline is persisted so elapsed time is calculated from
  // timestamps instead of counting intervals (which drifts in background tabs).
  const [timerPreferences, setTimerPreferences] = useState(() => {
    const saved = localStorage.getItem('evolve_timer_preferences');
    return saved ? JSON.parse(saved) : { focus: 25, shortBreak: 5, longBreak: 15, sessionsBeforeLongBreak: 4 };
  });
  const [timerMode, setTimerMode] = useState(() => localStorage.getItem('evolve_timer_mode') || 'pomodoro');
  const [customMinutes, setCustomMinutes] = useState(() => Number(localStorage.getItem('evolve_custom_minutes')) || 25);
  const [timeLeft, setTimeLeft] = useState(() => Number(localStorage.getItem('evolve_time_left')) || 25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerEndsAt, setTimerEndsAt] = useState(() => Number(localStorage.getItem('evolve_timer_ends_at')) || null);

  // Ref guards for guaranteed single sound triggers
  const hasStartedSessionRef = useRef(false);
  const hasFiredEndSoundRef = useRef(false);
  const focusSegmentStartRemainingRef = useRef(null);

  // Completed session records are the source of truth for streaks and analytics.
  const [focusSessions, setFocusSessions] = useState(() => {
    const saved = localStorage.getItem('evolve_focus_sessions');
    return saved ? JSON.parse(saved) : [];
  });
  const streak = streakStats(focusSessions);
  const sessionsCompleted = focusSessions.length;
  const totalLoggedFocusMinutes = minutesFromSessions(focusSessions);
  const [achievements, setAchievements] = useState(() => JSON.parse(localStorage.getItem('evolve_achievements') || '{}'));
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(() => Number(localStorage.getItem('evolve_daily_goal')) || 180);
  const [weeklyReflections, setWeeklyReflections] = useState(() => JSON.parse(localStorage.getItem('evolve_weekly_reflections') || '{}'));
  const [lastCompletedSessionId, setLastCompletedSessionId] = useState(null);

  // Reminders / Calendar Tasks
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('evolve_reminders');
    return saved ? JSON.parse(saved) : DEFAULT_REMINDERS;
  });
  const [checklists, setChecklists] = useState(() => {
    const saved = localStorage.getItem('evolve_checklists');
    return saved ? JSON.parse(saved) : [{ id: 'today', name: "Today's Focus", tasks: [] }];
  });

  // Quotes
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * QUOTES_DATABASE.length));
  const isQuoteLoading = false;

  const [favoriteQuotes, setFavoriteQuotes] = useState(() => {
    const saved = localStorage.getItem('evolve_fav_quotes');
    return saved ? JSON.parse(saved) : [];
  });

  // Browser storage remains an offline cache. Once signed in, every workspace
  // record is loaded from and saved to the authenticated user's Supabase rows.
  useEffect(() => {
    if (!user?.id || !isSupabaseConfigured) {
      workspaceLoadedForUserRef.current = null;
      setIsWorkspaceLoading(false);
      return undefined;
    }

    let isMounted = true;
    const loadWorkspace = async () => {
      workspaceLoadedForUserRef.current = null;
      setIsWorkspaceLoading(true);
      try {
        const [stateResult, sessionsResult] = await Promise.all([
          supabase.from('user_workspace_state').select('state').eq('user_id', user.id).maybeSingle(),
          supabase.from('focus_sessions').select('id, minutes, session_date, completed_at').eq('user_id', user.id).order('completed_at', { ascending: true }),
        ]);
        if (stateResult.error) throw stateResult.error;
        if (sessionsResult.error) throw sessionsResult.error;
        if (!isMounted) return;

        const cloudState = stateResult.data?.state;
        if (cloudState) {
          if (Array.isArray(cloudState.spaces) && cloudState.spaces.length) setSpaces(cloudState.spaces);
          if (typeof cloudState.activeSpaceId === 'string') setActiveSpaceId(cloudState.activeSpaceId);
          if (Array.isArray(cloudState.reminders)) setReminders(cloudState.reminders);
          if (Array.isArray(cloudState.checklists)) setChecklists(cloudState.checklists);
          if (typeof cloudState.dailyGoalMinutes === 'number') setDailyGoalMinutes(cloudState.dailyGoalMinutes);
          if (cloudState.weeklyReflections && typeof cloudState.weeklyReflections === 'object') setWeeklyReflections(cloudState.weeklyReflections);
          if (cloudState.achievements && typeof cloudState.achievements === 'object') setAchievements(cloudState.achievements);
          if (Array.isArray(cloudState.favoriteQuotes)) setFavoriteQuotes(cloudState.favoriteQuotes);
          if (cloudState.timerPreferences && typeof cloudState.timerPreferences === 'object') setTimerPreferences(cloudState.timerPreferences);
          if (typeof cloudState.timerMode === 'string') setTimerMode(cloudState.timerMode);
          if (typeof cloudState.customMinutes === 'number') setCustomMinutes(cloudState.customMinutes);
          if (typeof cloudState.timeLeft === 'number') setTimeLeft(cloudState.timeLeft);
          if (typeof cloudState.timerEndsAt === 'number') setTimerEndsAt(cloudState.timerEndsAt);
          if (typeof cloudState.showQuotesWidget === 'boolean') setShowQuotesWidget(cloudState.showQuotesWidget);
          if (typeof cloudState.showFlipClockWidget === 'boolean') setShowFlipClockWidget(cloudState.showFlipClockWidget);
          if (typeof cloudState.showTasksWidget === 'boolean') setShowTasksWidget(cloudState.showTasksWidget);
          if (typeof cloudState.isFocusDimmed === 'boolean') setIsFocusDimmed(cloudState.isFocusDimmed);
          if (typeof cloudState.isTimerSoundEnabled === 'boolean') setIsTimerSoundEnabled(cloudState.isTimerSoundEnabled);
          if (typeof cloudState.timerSoundVolume === 'number') setTimerSoundVolume(cloudState.timerSoundVolume);
        }

        if (sessionsResult.data.length) {
          setFocusSessions(sessionsResult.data.map((session) => ({
            id: session.id,
            minutes: session.minutes,
            date: session.session_date,
            completedAt: session.completed_at,
          })));
        } else if (localStorage.getItem('evolve_state_owner')) {
          setFocusSessions([]);
        }
        localStorage.setItem('evolve_state_owner', user.id);
        workspaceLoadedForUserRef.current = user.id;
      } catch (error) {
        console.error('Unable to load workspace data from Supabase:', error);
        showToast('Cloud data is unavailable. Run supabase/schema.sql, then refresh.', 'error');
      } finally {
        if (isMounted) setIsWorkspaceLoading(false);
      }
    };

    void loadWorkspace();
    return () => { isMounted = false; };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !isSupabaseConfigured || isWorkspaceLoading || workspaceLoadedForUserRef.current !== user.id) return undefined;

    const saveWorkspace = async () => {
      const { error } = await supabase.from('user_workspace_state').upsert({
        user_id: user.id,
        state: {
          spaces, activeSpaceId, reminders, checklists, dailyGoalMinutes,
          weeklyReflections, achievements, favoriteQuotes, timerPreferences,
          timerMode, customMinutes, timeLeft, timerEndsAt, showQuotesWidget,
          showFlipClockWidget, showTasksWidget, isFocusDimmed,
          isTimerSoundEnabled, timerSoundVolume,
        },
        updated_at: new Date().toISOString(),
      });
      if (error) console.error('Unable to save workspace data to Supabase:', error);
    };

    const timer = window.setTimeout(() => { void saveWorkspace(); }, 500);
    return () => window.clearTimeout(timer);
  }, [user?.id, isWorkspaceLoading, spaces, activeSpaceId, reminders, checklists, dailyGoalMinutes, weeklyReflections, achievements, favoriteQuotes, timerPreferences, timerMode, customMinutes, timeLeft, timerEndsAt, showQuotesWidget, showFlipClockWidget, showTasksWidget, isFocusDimmed, isTimerSoundEnabled, timerSoundVolume]);

  useEffect(() => {
    if (!user?.id || !isSupabaseConfigured || isWorkspaceLoading || workspaceLoadedForUserRef.current !== user.id || !focusSessions.length) return undefined;

    const saveFocusSessions = async () => {
      const { error } = await supabase.from('focus_sessions').upsert(
        focusSessions.map((session) => ({
          user_id: user.id,
          id: session.id,
          minutes: session.minutes,
          session_date: session.date || localDateKey(session.completedAt),
          completed_at: session.completedAt || new Date().toISOString(),
        })),
        { onConflict: 'user_id,id' },
      );
      if (error) console.error('Unable to save focus sessions to Supabase:', error);
    };

    void saveFocusSessions();
    return undefined;
  }, [user?.id, isWorkspaceLoading, focusSessions]);

  // Persistence Sync
  useEffect(() => {
    localStorage.setItem('evolve_spaces', JSON.stringify(spaces));
  }, [spaces]);

  useEffect(() => {
    localStorage.setItem('evolve_active_space', activeSpaceId);
  }, [activeSpaceId]);

  useEffect(() => {
    localStorage.setItem('evolve_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => { localStorage.setItem('evolve_focus_sessions', JSON.stringify(focusSessions)); }, [focusSessions]);
  useEffect(() => { localStorage.setItem('evolve_daily_goal', String(dailyGoalMinutes)); }, [dailyGoalMinutes]);
  useEffect(() => { localStorage.setItem('evolve_weekly_reflections', JSON.stringify(weeklyReflections)); }, [weeklyReflections]);
  useEffect(() => { localStorage.setItem('evolve_achievements', JSON.stringify(achievements)); }, [achievements]);
  useEffect(() => {
    const byDay = focusSessions.reduce((all, session) => { const key = session.date; all[key] = all[key] || []; all[key].push(session); return all; }, {});
    const unlocked = ACHIEVEMENTS.filter((achievement) => {
      if (achievement.type === 'sessions') return focusSessions.length >= achievement.target;
      if (achievement.type === 'minutes') return totalLoggedFocusMinutes >= achievement.target;
      if (achievement.type === 'streak') return streak.best >= achievement.target;
      if (achievement.type === 'dailyMinutes') return Object.values(byDay).some((sessions) => minutesFromSessions(sessions) >= achievement.target);
      return Object.values(byDay).some((sessions) => sessions.length >= achievement.target);
    });
    const fresh = unlocked.filter((achievement) => !achievements[achievement.id]);
    if (fresh.length) { setAchievements((previous) => ({ ...previous, ...Object.fromEntries(fresh.map((item) => [item.id, new Date().toISOString()])) })); showToast(`Achievement unlocked: ${fresh[0].label}`); }
  }, [focusSessions]);
  useEffect(() => { localStorage.setItem('evolve_checklists', JSON.stringify(checklists)); }, [checklists]);
  useEffect(() => { localStorage.setItem('evolve_timer_preferences', JSON.stringify(timerPreferences)); }, [timerPreferences]);
  useEffect(() => { localStorage.setItem('evolve_timer_mode', timerMode); localStorage.setItem('evolve_custom_minutes', String(customMinutes)); localStorage.setItem('evolve_time_left', String(timeLeft)); localStorage.setItem('evolve_timer_ends_at', String(timerEndsAt || '')); }, [timerMode, customMinutes, timeLeft, timerEndsAt]);

  useEffect(() => {
    localStorage.setItem('evolve_fav_quotes', JSON.stringify(favoriteQuotes));
  }, [favoriteQuotes]);

  useEffect(() => {
    localStorage.setItem('evolve_show_quotes_widget', showQuotesWidget.toString());
  }, [showQuotesWidget]);

  useEffect(() => {
    localStorage.setItem('evolve_show_flip_clock', showFlipClockWidget.toString());
  }, [showFlipClockWidget]);

  useEffect(() => {
    localStorage.setItem('evolve_show_tasks_widget', showTasksWidget.toString());
  }, [showTasksWidget]);

  useEffect(() => {
    localStorage.setItem('evolve_focus_dimmed', isFocusDimmed.toString());
  }, [isFocusDimmed]);

  useEffect(() => {
    localStorage.setItem('evolve_timer_sound_enabled', isTimerSoundEnabled.toString());
  }, [isTimerSoundEnabled]);

  useEffect(() => {
    localStorage.setItem('evolve_timer_sound_volume', timerSoundVolume.toString());
  }, [timerSoundVolume]);

  // Auth Methods
  const login = async (email, password) => {
    if (!isSupabaseConfigured) {
      throw new Error('Authentication is not configured. Add the Supabase environment variables and redeploy.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      const authError = new Error(getAuthErrorMessage(error));
      showToast(authError.message, 'error');
      throw authError;
    }
    return data;
  };

  const logout = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      return true;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      showToast(getAuthErrorMessage(error), 'error');
      return false;
    } else {
      setUser(null);
      return true;
    }
  };

  // Audio Control
  const toggleSound = (soundId) => {
    const playing = soundEngine.playSound(soundId);
    if (playing) {
      setActiveSoundId(soundId);
    } else {
      setActiveSoundId(null);
    }
  };

  const handleSetVolume = (val) => {
    setVolume(val);
    soundEngine.setVolume(val);
  };

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  // Space Management
  const activeSpace = spaces.find(s => s.id === activeSpaceId) || spaces[0];

  const handleSetActiveSpace = (spaceId) => {
    setActiveSpaceId(spaceId);
    const targetSpace = spaces.find(s => s.id === spaceId);
    if (targetSpace && targetSpace.associatedSound) {
      soundEngine.playSound(targetSpace.associatedSound);
      setActiveSoundId(targetSpace.associatedSound);
    }
  };

  const addSpace = (newSpace) => {
    const created = {
      id: `space-${Date.now()}`,
      name: newSpace.name || 'Custom Focus Space',
      icon: newSpace.icon || 'Sparkles',
      type: newSpace.type || 'image',
      bg: newSpace.bg || 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2000&q=80',
      overlayOpacity: newSpace.overlayOpacity !== undefined ? newSpace.overlayOpacity : 0.8,
      associatedSound: newSpace.associatedSound || 'forest',
      color: '#10b981',
      notes: `### Notes for ${newSpace.name || 'Custom Space'}\n- Define target focus goals for this session.`,
      links: []
    };
    setSpaces(prev => [...prev, created]);
    handleSetActiveSpace(created.id);
  };

  const updateSpace = (spaceId, updates) => {
    setSpaces(spaces.map(s => s.id === spaceId ? { ...s, ...updates } : s));
  };

  const deleteSpace = (spaceId) => {
    if (spaces.length <= 1) return;
    const filtered = spaces.filter(s => s.id !== spaceId);
    setSpaces(filtered);
    if (activeSpaceId === spaceId) {
      setActiveSpaceId(filtered[0].id);
    }
  };

  const addSpaceLink = (spaceId, link) => {
    setSpaces(spaces.map(s => {
      if (s.id === spaceId) {
        return { ...s, links: [...s.links, { id: `link-${Date.now()}`, ...link }] };
      }
      return s;
    }));
  };

  const deleteSpaceLink = (spaceId, linkId) => {
    setSpaces(spaces.map(s => {
      if (s.id === spaceId) {
        return { ...s, links: s.links.filter(l => l.id !== linkId) };
      }
      return s;
    }));
  };

  const updateSpaceNotes = (spaceId, notes) => {
    setSpaces(spaces.map(s => s.id === spaceId ? { ...s, notes } : s));
  };

  const logFocusTime = (minutes) => {
    const mins = Math.round(Number(minutes));
    if (!Number.isFinite(mins) || mins <= 0) return;
    const completedAt = new Date().toISOString();
    const id = `focus-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setFocusSessions((previous) => [...previous, { id, minutes: mins, date: localDateKey(), completedAt }]);
    setLastCompletedSessionId(id);
    return id;
  };
  const updateFocusSession = (id, updates) => setFocusSessions((previous) => previous.map((session) => session.id === id ? { ...session, ...updates } : session));

  const saveCurrentFocusSegment = (remainingSeconds) => {
    if (timerMode !== 'pomodoro' && timerMode !== 'custom') return;
    const startedWith = focusSegmentStartRemainingRef.current;
    if (!Number.isFinite(startedWith)) return;

    const elapsedSeconds = Math.max(0, startedWith - remainingSeconds);
    const elapsedMinutes = Math.round(elapsedSeconds / 60);
    if (elapsedMinutes > 0) logFocusTime(elapsedMinutes);
    focusSegmentStartRemainingRef.current = null;
  };

  // Timer control with a persisted deadline and single completion guard.
  const startTimer = () => {
    // Play start sound ONLY when a new session begins (not on resuming from pause)
    if (!hasStartedSessionRef.current) {
      soundEngine.playTimerStartSound(timerSoundVolume, isTimerSoundEnabled);
      hasStartedSessionRef.current = true;
    }
    hasFiredEndSoundRef.current = false;
    focusSegmentStartRemainingRef.current = timeLeft;
    const deadline = Date.now() + timeLeft * 1000;
    setTimerEndsAt(deadline);
    setIsTimerRunning(true);
  };

  const pauseTimer = () => {
    const remaining = timerEndsAt ? Math.max(0, Math.ceil((timerEndsAt - Date.now()) / 1000)) : timeLeft;
    saveCurrentFocusSegment(remaining);
    setTimeLeft(remaining);
    setTimerEndsAt(null);
    setIsTimerRunning(false);
    // Pause does NOT play completion sound or reset session start flag
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerEndsAt(null);
    hasStartedSessionRef.current = false;
    hasFiredEndSoundRef.current = false;
    focusSegmentStartRemainingRef.current = null;
    changeTimerMode(timerMode);
  };

  const completeTimer = () => {
    setTimerEndsAt(null);
    setTimeLeft(0);
    setIsTimerRunning(false);
    if (!hasFiredEndSoundRef.current) {
      hasFiredEndSoundRef.current = true;
      soundEngine.playTimerEndSound(timerSoundVolume, isTimerSoundEnabled);
      if (timerMode === 'pomodoro' || timerMode === 'custom') {
        saveCurrentFocusSegment(0);
        const breakMode = (sessionsCompleted + 1) % timerPreferences.sessionsBeforeLongBreak === 0 ? 'longBreak' : 'shortBreak';
        setTimerMode(breakMode);
        setTimeLeft(timerPreferences[breakMode] * 60);
        showToast('Focus session complete — your progress is saved.');
      } else showToast('Break complete. Ready for your next focus block.');
    }
    hasStartedSessionRef.current = false;
    focusSegmentStartRemainingRef.current = null;
  };

  useEffect(() => {
    if (!isTimerRunning || !timerEndsAt) return undefined;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((timerEndsAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) completeTimer();
    };
    tick();
    const interval = window.setInterval(tick, 500);
    return () => window.clearInterval(interval);
  }, [isTimerRunning, timerEndsAt, timerMode, timerSoundVolume, isTimerSoundEnabled]);

  useEffect(() => {
    if (!timerEndsAt) return;
    const remaining = Math.max(0, Math.ceil((timerEndsAt - Date.now()) / 1000));
    if (remaining === 0) completeTimer();
    else { setTimeLeft(remaining); setIsTimerRunning(true); }
  }, []);

  /* legacy timer effect removed: background interval countdown was inaccurate */
  /*
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);

      // Play completion end sound EXACTLY ONCE via ref guard
      if (!hasFiredEndSoundRef.current) {
        hasFiredEndSoundRef.current = true;
        soundEngine.playTimerEndSound(timerSoundVolume, isTimerSoundEnabled);
      }

      hasStartedSessionRef.current = false;
      
      const completedDuration = timerMode === 'pomodoro' ? 25 : customMinutes;
      logFocusTime(completedDuration);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, timerMode, customMinutes, isTimerSoundEnabled, timerSoundVolume]); */

  const changeTimerMode = (mode, customMins = customMinutes) => {
    setIsTimerRunning(false);
    setTimerEndsAt(null);
    hasStartedSessionRef.current = false;
    hasFiredEndSoundRef.current = false;
    focusSegmentStartRemainingRef.current = null;
    setTimerMode(mode);
    if (mode === 'pomodoro') {
      setTimeLeft(timerPreferences.focus * 60);
    } else if (mode === 'shortBreak') {
      setTimeLeft(timerPreferences.shortBreak * 60);
    } else if (mode === 'longBreak') {
      setTimeLeft(timerPreferences.longBreak * 60);
    } else if (mode === 'custom') {
      setCustomMinutes(customMins);
      setTimeLeft(customMins * 60);
    }
  };

  // Reminders / Calendar Tasks Management
  const addReminder = (title, time, priority = 'medium', date = new Date().toISOString().split('T')[0], notes = '') => {
    const newRem = {
      id: `rem-${Date.now()}`,
      title: title.trim(),
      time: time || '10:00 AM',
      date: date || new Date().toISOString().split('T')[0],
      priority,
      notes,
      completed: false
    };
    setReminders(prev => [newRem, ...prev]);
  };

  const updateReminder = (id, updates) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const toggleReminder = (id) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  const deleteReminder = (id) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const addChecklist = (name) => setChecklists((previous) => [...previous, { id: `list-${Date.now()}`, name: name.trim() || 'New checklist', tasks: [] }]);
  const updateChecklist = (id, updates) => setChecklists((previous) => previous.map((list) => list.id === id ? { ...list, ...updates } : list));
  const deleteChecklist = (id) => setChecklists((previous) => previous.length > 1 ? previous.filter((list) => list.id !== id) : previous);
  const addChecklistTask = (listId, title) => {
    if (!title.trim()) return;
    setChecklists((previous) => previous.map((list) => list.id === listId ? { ...list, tasks: [...list.tasks, { id: `task-${Date.now()}`, title: title.trim(), completed: false }] } : list));
  };
  const updateChecklistTask = (listId, taskId, updates) => setChecklists((previous) => previous.map((list) => list.id === listId ? { ...list, tasks: list.tasks.map((task) => task.id === taskId ? { ...task, ...updates } : task) } : list));
  const deleteChecklistTask = (listId, taskId) => setChecklists((previous) => previous.map((list) => list.id === listId ? { ...list, tasks: list.tasks.filter((task) => task.id !== taskId) } : list));

  // Quotes
  const refreshQuote = () => {
    setQuoteIndex((currentIndex) => {
      if (QUOTES_DATABASE.length < 2) return currentIndex;
      const offset = 1 + Math.floor(Math.random() * (QUOTES_DATABASE.length - 1));
      return (currentIndex + offset) % QUOTES_DATABASE.length;
    });
  };

  const toggleFavoriteQuote = (quoteObj) => {
    const exists = favoriteQuotes.some(q => q.id === quoteObj.id);
    if (exists) {
      setFavoriteQuotes(favoriteQuotes.filter(q => q.id !== quoteObj.id));
    } else {
      setFavoriteQuotes([...favoriteQuotes, quoteObj]);
    }
  };

  return (
    <AppContext.Provider value={{
      toast,
      showToast,
      dismissToast,
      user,
      isAuthLoading,
      isWorkspaceLoading,
      login,
      logout,
      activeTab,
      setActiveTab,
      showQuotesWidget,
      toggleQuotesWidget: () => setShowQuotesWidget(prev => !prev),
      showFlipClockWidget,
      toggleFlipClockWidget: () => setShowFlipClockWidget(prev => !prev),
      showTasksWidget,
      toggleTasksWidget: () => setShowTasksWidget(prev => !prev),
      isFocusDimmed,
      toggleFocusDimmed: () => setIsFocusDimmed(prev => !prev),
      spaces,
      activeSpace,
      activeSpaceId,
      setActiveSpaceId: handleSetActiveSpace,
      addSpace,
      updateSpace,
      deleteSpace,
      addSpaceLink,
      deleteSpaceLink,
      updateSpaceNotes,
      activeSoundId,
      toggleSound,
      volume,
      setSoundVolume: handleSetVolume,
      isMuted,
      toggleMute: handleToggleMute,
      isTimerSoundEnabled,
      toggleTimerSound: () => setIsTimerSoundEnabled(prev => !prev),
      timerSoundVolume,
      setTimerSoundVolume: (val) => setTimerSoundVolume(Math.max(0, Math.min(1, val))),
      timerMode,
      changeTimerMode,
      timerPreferences,
      setTimerPreferences,
      customMinutes,
      setCustomMinutes,
      timeLeft,
      setTimeLeft,
      isTimerRunning,
      startTimer,
      pauseTimer,
      resetTimer,
      sessionsCompleted,
      totalLoggedFocusMinutes,
      focusSessions,
      updateFocusSession,
      lastCompletedSessionId,
      setLastCompletedSessionId,
      streak,
      dailyGoalMinutes,
      setDailyGoalMinutes,
      weeklyReflections,
      setWeeklyReflections,
      achievements,
      achievementDefinitions: ACHIEVEMENTS,
      logFocusTime,
      reminders,
      addReminder,
      updateReminder,
      toggleReminder,
      deleteReminder,
      checklists,
      addChecklist,
      updateChecklist,
      deleteChecklist,
      addChecklistTask,
      updateChecklistTask,
      deleteChecklistTask,
      quotes: QUOTES_DATABASE,
      currentQuote: QUOTES_DATABASE[quoteIndex],
      isQuoteLoading,
      refreshQuote,
      favoriteQuotes,
      toggleFavoriteQuote
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
