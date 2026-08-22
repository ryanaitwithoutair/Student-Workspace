import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { soundEngine } from '../audio/soundGenerator';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { streakStats, minutesFromSessions, localDateKey } from '../utils/focusData';
import {
  clampNumber,
  isPlainObject,
  isTrustedBackgroundImageUrl,
  normalizeHttpsUrl,
  readLocalJson,
  readLocalNumber,
  safeLocalGet,
  safeLocalSet,
  truncateText,
} from '../utils/security';
const AppContext = createContext();

const getAuthErrorMessage = (error) => {
  if (/fetch|network/i.test(error?.message || '')) {
    return 'Unable to reach Supabase. Verify VITE_SUPABASE_URL in Vercel uses your exact active Project URL.';
  }
  return 'Unable to sign in with those credentials.';
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

const DEFAULT_TIMER_PREFERENCES = { focus: 25, shortBreak: 5, longBreak: 15, sessionsBeforeLongBreak: 4 };
const VALID_TIMER_MODES = new Set(['pomodoro', 'shortBreak', 'longBreak', 'custom']);
const VALID_SOUNDS = new Set(['forest', 'rain', 'ocean', 'river', 'cafe', 'chimes', 'binaural', 'brown-noise']);
const VALID_PRIORITIES = new Set(['low', 'medium', 'high']);
const VALID_DATE = /^\d{4}-\d{2}-\d{2}$/;
const VALID_ID = /^[a-zA-Z0-9_-]{1,128}$/;

const sanitizeId = (value, fallback) => (typeof value === 'string' && VALID_ID.test(value) ? value : fallback);
const sanitizeDate = (value, fallback) => (typeof value === 'string' && VALID_DATE.test(value) ? value : fallback);

const sanitizeLinks = (links) => {
  if (!Array.isArray(links)) return [];
  const ids = new Set();
  return links.slice(0, 10).reduce((safeLinks, link, index) => {
    if (!isPlainObject(link)) return safeLinks;
    const url = normalizeHttpsUrl(link.url);
    if (!url) return safeLinks;
    let id = sanitizeId(link.id, `link-import-${index}`);
    if (ids.has(id)) id = `link-import-${index}`;
    ids.add(id);
    safeLinks.push({
      id,
      title: truncateText(link.title, 'Untitled link', 120).trim() || 'Untitled link',
      url,
    });
    return safeLinks;
  }, []);
};

const sanitizeSpace = (space, index) => {
  const fallback = DEFAULT_SPACES[index % DEFAULT_SPACES.length];
  if (!isPlainObject(space)) return { ...fallback, links: [...fallback.links] };

  const imageUrl = isTrustedBackgroundImageUrl(space.bg) ? normalizeHttpsUrl(space.bg) : null;
  const usesImage = space.type === 'image' && Boolean(imageUrl);
  return {
    id: sanitizeId(space.id, `space-import-${index}`),
    name: truncateText(space.name, fallback.name, 80).trim() || fallback.name,
    icon: truncateText(space.icon, fallback.icon, 40) || fallback.icon,
    type: usesImage ? 'image' : fallback.type,
    bg: usesImage ? imageUrl : fallback.bg,
    overlayOpacity: clampNumber(space.overlayOpacity, fallback.overlayOpacity, 0, 1),
    associatedSound: VALID_SOUNDS.has(space.associatedSound) ? space.associatedSound : fallback.associatedSound,
    notes: truncateText(space.notes, fallback.notes, 2_000),
    links: sanitizeLinks(space.links),
  };
};

const sanitizeSpaces = (spaces) => {
  if (!Array.isArray(spaces) || !spaces.length) return DEFAULT_SPACES.map((space) => ({ ...space, links: [...space.links] }));
  const ids = new Set();
  const safeSpaces = spaces.slice(0, 10).map(sanitizeSpace).filter((space) => {
    if (ids.has(space.id)) return false;
    ids.add(space.id);
    return true;
  });
  return safeSpaces.length ? safeSpaces : DEFAULT_SPACES.map((space) => ({ ...space, links: [...space.links] }));
};

const sanitizeReminder = (reminder, index) => {
  const fallback = DEFAULT_REMINDERS[index % DEFAULT_REMINDERS.length];
  if (!isPlainObject(reminder)) return { ...fallback };
  return {
    id: sanitizeId(reminder.id, `rem-import-${index}`),
    title: truncateText(reminder.title, fallback.title, 160).trim() || fallback.title,
    time: truncateText(reminder.time, fallback.time, 32),
    date: sanitizeDate(reminder.date, fallback.date),
    completed: Boolean(reminder.completed),
    priority: VALID_PRIORITIES.has(reminder.priority) ? reminder.priority : 'medium',
    notes: truncateText(reminder.notes, '', 1_000),
  };
};

const sanitizeReminders = (reminders) => (
  Array.isArray(reminders) ? reminders.slice(0, 50).map(sanitizeReminder) : DEFAULT_REMINDERS.map((reminder) => ({ ...reminder }))
);

const sanitizeChecklist = (list, index) => {
  if (!isPlainObject(list)) return null;
  const tasks = Array.isArray(list.tasks) ? list.tasks.slice(0, 50).reduce((safeTasks, task, taskIndex) => {
    if (!isPlainObject(task)) return safeTasks;
    safeTasks.push({
      id: sanitizeId(task.id, `task-import-${index}-${taskIndex}`),
      title: truncateText(task.title, 'Untitled task', 120).trim() || 'Untitled task',
      completed: Boolean(task.completed),
    });
    return safeTasks;
  }, []) : [];
  return {
    id: sanitizeId(list.id, `list-import-${index}`),
    name: truncateText(list.name, 'New checklist', 80).trim() || 'New checklist',
    tasks,
  };
};

const sanitizeChecklists = (checklists) => {
  const fallback = [{ id: 'today', name: "Today's Focus", tasks: [] }];
  if (!Array.isArray(checklists)) return fallback;
  const safeLists = checklists.slice(0, 10).map(sanitizeChecklist).filter(Boolean);
  return safeLists.length ? safeLists : fallback;
};

const sanitizeTimerPreferences = (preferences) => {
  if (!isPlainObject(preferences)) return DEFAULT_TIMER_PREFERENCES;
  return {
    focus: clampNumber(preferences.focus, DEFAULT_TIMER_PREFERENCES.focus, 1, 360),
    shortBreak: clampNumber(preferences.shortBreak, DEFAULT_TIMER_PREFERENCES.shortBreak, 1, 120),
    longBreak: clampNumber(preferences.longBreak, DEFAULT_TIMER_PREFERENCES.longBreak, 1, 180),
    sessionsBeforeLongBreak: clampNumber(preferences.sessionsBeforeLongBreak, DEFAULT_TIMER_PREFERENCES.sessionsBeforeLongBreak, 1, 20),
  };
};

const sanitizeFocusSessions = (sessions) => {
  if (!Array.isArray(sessions)) return [];
  const ids = new Set();
  return sessions.slice(-5_000).reduce((safeSessions, session, index) => {
    if (!isPlainObject(session)) return safeSessions;
    const id = sanitizeId(session.id, `focus-import-${index}`);
    if (ids.has(id)) return safeSessions;
    const minutes = clampNumber(session.minutes, 0, 1, 1_440);
    const date = sanitizeDate(session.date, '');
    if (!minutes || !date) return safeSessions;
    const completedAt = typeof session.completedAt === 'string' ? session.completedAt : session.completed_at;
    ids.add(id);
    safeSessions.push({
      id,
      minutes,
      date,
      completedAt: typeof completedAt === 'string' && completedAt.length <= 64 && Number.isFinite(Date.parse(completedAt)) ? completedAt : undefined,
    });
    return safeSessions;
  }, []);
};

const sanitizeWeeklyReflections = (reflections) => {
  if (!isPlainObject(reflections)) return {};
  return Object.entries(reflections).slice(-26).reduce((safeReflections, [week, reflection]) => {
    if (!VALID_DATE.test(week) || !isPlainObject(reflection)) return safeReflections;
    safeReflections[week] = {
      wentWell: truncateText(reflection.wentWell, '', 500),
      improve: truncateText(reflection.improve, '', 500),
    };
    return safeReflections;
  }, {});
};

const sanitizeAchievements = (achievements) => {
  if (!isPlainObject(achievements)) return {};
  const validIds = new Set(ACHIEVEMENTS.map((achievement) => achievement.id));
  return Object.fromEntries(Object.entries(achievements).filter(([id, value]) => (
    validIds.has(id) && typeof value === 'string' && value.length <= 64
  )));
};

const sanitizeFavoriteQuotes = (quotes) => {
  if (!Array.isArray(quotes)) return [];
  const ids = new Set(quotes.map((quote) => quote?.id));
  return QUOTES_DATABASE.filter((quote) => ids.has(quote.id));
};

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
    return safeLocalGet('evolve_show_quotes_widget') === 'true';
  });

  const [showFlipClockWidget, setShowFlipClockWidget] = useState(() => {
    return safeLocalGet('evolve_show_flip_clock') === 'true';
  });

  const [showTasksWidget, setShowTasksWidget] = useState(() => {
    return safeLocalGet('evolve_show_tasks_widget') === 'true';
  });

  // Global Full-Screen Deep-Focus Dimming Mode
  const [isFocusDimmed, setIsFocusDimmed] = useState(() => {
    return safeLocalGet('evolve_focus_dimmed') === 'true';
  });

  // Spaces
  const [spaces, setSpaces] = useState(() => {
    return sanitizeSpaces(readLocalJson('evolve_spaces', DEFAULT_SPACES, Array.isArray));
  });
  const [activeSpaceId, setActiveSpaceId] = useState(() => {
    return sanitizeId(safeLocalGet('evolve_active_space'), 'space-1');
  });

  // Ambient Audio state
  const [activeSoundId, setActiveSoundId] = useState(null);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  // Independent Timer Sound Settings (ON/OFF and Volume)
  const [isTimerSoundEnabled, setIsTimerSoundEnabled] = useState(() => {
    const saved = safeLocalGet('evolve_timer_sound_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const [timerSoundVolume, setTimerSoundVolume] = useState(() => {
    return readLocalNumber('evolve_timer_sound_volume', 0.6, 0, 1);
  });

  // Timer state. The running deadline is persisted so elapsed time is calculated from
  // timestamps instead of counting intervals (which drifts in background tabs).
  const [timerPreferences, setTimerPreferences] = useState(() => {
    return sanitizeTimerPreferences(readLocalJson('evolve_timer_preferences', DEFAULT_TIMER_PREFERENCES, isPlainObject));
  });
  const [timerMode, setTimerMode] = useState(() => {
    const mode = safeLocalGet('evolve_timer_mode');
    return VALID_TIMER_MODES.has(mode) ? mode : 'pomodoro';
  });
  const [customMinutes, setCustomMinutes] = useState(() => readLocalNumber('evolve_custom_minutes', 25, 1, 360));
  const [timeLeft, setTimeLeft] = useState(() => readLocalNumber('evolve_time_left', 25 * 60, 0, 21_600));
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerEndsAt, setTimerEndsAt] = useState(() => {
    const endsAt = readLocalNumber('evolve_timer_ends_at', 0, 0, Date.now() + 86_400_000);
    return endsAt || null;
  });

  // Ref guards for guaranteed single sound triggers
  const hasStartedSessionRef = useRef(false);
  const hasFiredEndSoundRef = useRef(false);
  const focusSegmentStartRemainingRef = useRef(null);

  // Completed session records are the source of truth for streaks and analytics.
  const [focusSessions, setFocusSessions] = useState(() => {
    return sanitizeFocusSessions(readLocalJson('evolve_focus_sessions', [], Array.isArray));
  });
  const streak = streakStats(focusSessions);
  const sessionsCompleted = focusSessions.length;
  const totalLoggedFocusMinutes = minutesFromSessions(focusSessions);
  const [achievements, setAchievements] = useState(() => sanitizeAchievements(readLocalJson('evolve_achievements', {}, isPlainObject)));
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(() => readLocalNumber('evolve_daily_goal', 180, 5, 720));
  const [weeklyReflections, setWeeklyReflections] = useState(() => sanitizeWeeklyReflections(readLocalJson('evolve_weekly_reflections', {}, isPlainObject)));
  const [lastCompletedSessionId, setLastCompletedSessionId] = useState(null);

  // Reminders / Calendar Tasks
  const [reminders, setReminders] = useState(() => {
    return sanitizeReminders(readLocalJson('evolve_reminders', DEFAULT_REMINDERS, Array.isArray));
  });
  const [checklists, setChecklists] = useState(() => {
    return sanitizeChecklists(readLocalJson('evolve_checklists', [], Array.isArray));
  });

  // Quotes
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * QUOTES_DATABASE.length));
  const isQuoteLoading = false;

  const [favoriteQuotes, setFavoriteQuotes] = useState(() => {
    return sanitizeFavoriteQuotes(readLocalJson('evolve_fav_quotes', [], Array.isArray));
  });

  // Browser storage remains an offline cache. Once signed in, every workspace
  // record is loaded from and saved to the authenticated user's Supabase rows.
  useEffect(() => {
    if (!user?.id || !isSupabaseConfigured) {
      workspaceLoadedForUserRef.current = null;
      const clearLoading = window.setTimeout(() => setIsWorkspaceLoading(false), 0);
      return () => window.clearTimeout(clearLoading);
    }

    let isMounted = true;
    const loadWorkspace = async () => {
      workspaceLoadedForUserRef.current = null;
      setIsWorkspaceLoading(true);
      try {
        const [stateResult, sessionsResult] = await Promise.all([
          supabase.from('user_workspace_state').select('state').eq('user_id', user.id).maybeSingle(),
          supabase.from('focus_sessions').select('id, minutes, session_date, completed_at').eq('user_id', user.id).order('completed_at', { ascending: true }).limit(5_000),
        ]);
        if (stateResult.error) throw stateResult.error;
        if (sessionsResult.error) throw sessionsResult.error;
        if (!isMounted) return;

        const cloudState = stateResult.data?.state;
        if (isPlainObject(cloudState)) {
          if (Array.isArray(cloudState.spaces) && cloudState.spaces.length) {
            const safeSpaces = sanitizeSpaces(cloudState.spaces);
            setSpaces(safeSpaces);
            const safeActiveSpaceId = sanitizeId(cloudState.activeSpaceId, safeSpaces[0].id);
            setActiveSpaceId(safeSpaces.some((space) => space.id === safeActiveSpaceId) ? safeActiveSpaceId : safeSpaces[0].id);
          }
          if (Array.isArray(cloudState.reminders)) setReminders(sanitizeReminders(cloudState.reminders));
          if (Array.isArray(cloudState.checklists)) setChecklists(sanitizeChecklists(cloudState.checklists));
          if (typeof cloudState.dailyGoalMinutes === 'number') setDailyGoalMinutes(clampNumber(cloudState.dailyGoalMinutes, 180, 5, 720));
          if (cloudState.weeklyReflections && typeof cloudState.weeklyReflections === 'object') setWeeklyReflections(sanitizeWeeklyReflections(cloudState.weeklyReflections));
          if (cloudState.achievements && typeof cloudState.achievements === 'object') setAchievements(sanitizeAchievements(cloudState.achievements));
          if (Array.isArray(cloudState.favoriteQuotes)) setFavoriteQuotes(sanitizeFavoriteQuotes(cloudState.favoriteQuotes));
          if (cloudState.timerPreferences && typeof cloudState.timerPreferences === 'object') setTimerPreferences(sanitizeTimerPreferences(cloudState.timerPreferences));
          if (VALID_TIMER_MODES.has(cloudState.timerMode)) setTimerMode(cloudState.timerMode);
          if (typeof cloudState.customMinutes === 'number') setCustomMinutes(clampNumber(cloudState.customMinutes, 25, 1, 360));
          if (typeof cloudState.timeLeft === 'number') setTimeLeft(clampNumber(cloudState.timeLeft, 25 * 60, 0, 21_600));
          if (typeof cloudState.timerEndsAt === 'number') setTimerEndsAt(clampNumber(cloudState.timerEndsAt, 0, 0, Date.now() + 86_400_000) || null);
          if (typeof cloudState.showQuotesWidget === 'boolean') setShowQuotesWidget(cloudState.showQuotesWidget);
          if (typeof cloudState.showFlipClockWidget === 'boolean') setShowFlipClockWidget(cloudState.showFlipClockWidget);
          if (typeof cloudState.showTasksWidget === 'boolean') setShowTasksWidget(cloudState.showTasksWidget);
          if (typeof cloudState.isFocusDimmed === 'boolean') setIsFocusDimmed(cloudState.isFocusDimmed);
          if (typeof cloudState.isTimerSoundEnabled === 'boolean') setIsTimerSoundEnabled(cloudState.isTimerSoundEnabled);
          if (typeof cloudState.timerSoundVolume === 'number') setTimerSoundVolume(clampNumber(cloudState.timerSoundVolume, 0.6, 0, 1));
        }

        if (sessionsResult.data.length) {
          setFocusSessions(sanitizeFocusSessions(sessionsResult.data.map((session) => ({
            id: session.id,
            minutes: session.minutes,
            date: session.session_date,
            completedAt: session.completed_at,
          }))));
        } else if (safeLocalGet('evolve_state_owner')) {
          setFocusSessions([]);
        }
        safeLocalSet('evolve_state_owner', user.id);
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
    safeLocalSet('evolve_spaces', JSON.stringify(spaces));
  }, [spaces]);

  useEffect(() => {
    safeLocalSet('evolve_active_space', activeSpaceId);
  }, [activeSpaceId]);

  useEffect(() => {
    safeLocalSet('evolve_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => { safeLocalSet('evolve_focus_sessions', JSON.stringify(focusSessions)); }, [focusSessions]);
  useEffect(() => { safeLocalSet('evolve_daily_goal', String(dailyGoalMinutes)); }, [dailyGoalMinutes]);
  useEffect(() => { safeLocalSet('evolve_weekly_reflections', JSON.stringify(weeklyReflections)); }, [weeklyReflections]);
  useEffect(() => { safeLocalSet('evolve_achievements', JSON.stringify(achievements)); }, [achievements]);
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
    if (!fresh.length) return undefined;
    const announceAchievement = window.setTimeout(() => {
      setAchievements((previous) => ({ ...previous, ...Object.fromEntries(fresh.map((item) => [item.id, new Date().toISOString()])) }));
      showToast(`Achievement unlocked: ${fresh[0].label}`);
    }, 0);
    return () => window.clearTimeout(announceAchievement);
  }, [focusSessions, achievements, streak.best, totalLoggedFocusMinutes]);
  useEffect(() => { safeLocalSet('evolve_checklists', JSON.stringify(checklists)); }, [checklists]);
  useEffect(() => { safeLocalSet('evolve_timer_preferences', JSON.stringify(timerPreferences)); }, [timerPreferences]);
  useEffect(() => { safeLocalSet('evolve_timer_mode', timerMode); safeLocalSet('evolve_custom_minutes', String(customMinutes)); safeLocalSet('evolve_time_left', String(timeLeft)); safeLocalSet('evolve_timer_ends_at', String(timerEndsAt || '')); }, [timerMode, customMinutes, timeLeft, timerEndsAt]);

  useEffect(() => {
    safeLocalSet('evolve_fav_quotes', JSON.stringify(favoriteQuotes));
  }, [favoriteQuotes]);

  useEffect(() => {
    safeLocalSet('evolve_show_quotes_widget', showQuotesWidget.toString());
  }, [showQuotesWidget]);

  useEffect(() => {
    safeLocalSet('evolve_show_flip_clock', showFlipClockWidget.toString());
  }, [showFlipClockWidget]);

  useEffect(() => {
    safeLocalSet('evolve_show_tasks_widget', showTasksWidget.toString());
  }, [showTasksWidget]);

  useEffect(() => {
    safeLocalSet('evolve_focus_dimmed', isFocusDimmed.toString());
  }, [isFocusDimmed]);

  useEffect(() => {
    safeLocalSet('evolve_timer_sound_enabled', isTimerSoundEnabled.toString());
  }, [isTimerSoundEnabled]);

  useEffect(() => {
    safeLocalSet('evolve_timer_sound_volume', timerSoundVolume.toString());
  }, [timerSoundVolume]);

  const updateTimerPreferences = (nextPreferences) => {
    setTimerPreferences((previous) => sanitizeTimerPreferences(
      typeof nextPreferences === 'function' ? nextPreferences(previous) : nextPreferences,
    ));
  };

  const updateCustomMinutes = (nextMinutes) => {
    setCustomMinutes((previous) => clampNumber(
      typeof nextMinutes === 'function' ? nextMinutes(previous) : nextMinutes,
      previous,
      1,
      360,
    ));
  };

  const updateDailyGoalMinutes = (nextGoal) => {
    setDailyGoalMinutes((previous) => clampNumber(
      typeof nextGoal === 'function' ? nextGoal(previous) : nextGoal,
      previous,
      5,
      720,
    ));
  };

  const updateWeeklyReflections = (nextReflections) => {
    setWeeklyReflections((previous) => sanitizeWeeklyReflections(
      typeof nextReflections === 'function' ? nextReflections(previous) : nextReflections,
    ));
  };

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
    const targetSpace = spaces.find(s => s.id === spaceId);
    if (!targetSpace) return;
    setActiveSpaceId(targetSpace.id);
    if (targetSpace.associatedSound) {
      soundEngine.playSound(targetSpace.associatedSound);
      setActiveSoundId(targetSpace.associatedSound);
    }
  };

  const addSpace = (newSpace) => {
    const name = truncateText(newSpace?.name, 'Custom Focus Space', 80).trim() || 'Custom Focus Space';
    const background = isTrustedBackgroundImageUrl(newSpace?.bg)
      ? normalizeHttpsUrl(newSpace.bg)
      : DEFAULT_SPACES[0].bg;
    const created = {
      id: `space-${Date.now()}`,
      name,
      icon: truncateText(newSpace?.icon, 'Sparkles', 40) || 'Sparkles',
      type: 'image',
      bg: background,
      overlayOpacity: clampNumber(newSpace?.overlayOpacity, 0.8, 0, 1),
      associatedSound: VALID_SOUNDS.has(newSpace?.associatedSound) ? newSpace.associatedSound : 'forest',
      color: '#10b981',
      notes: `### Notes for ${name}\n- Define target focus goals for this session.`,
      links: []
    };
    if (spaces.length >= 10) {
      showToast('You can keep up to 10 focus environments.', 'error');
      return false;
    }
    setSpaces(prev => [...prev, created]);
    setActiveSpaceId(created.id);
    soundEngine.playSound(created.associatedSound);
    setActiveSoundId(created.associatedSound);
    return true;
  };

  const updateSpace = (spaceId, updates) => {
    if (!isPlainObject(updates)) return;
    const safeUpdates = {};
    if ('overlayOpacity' in updates) safeUpdates.overlayOpacity = clampNumber(updates.overlayOpacity, 0.8, 0, 1);
    if (!Object.keys(safeUpdates).length) return;
    setSpaces((previous) => previous.map((space) => space.id === spaceId ? { ...space, ...safeUpdates } : space));
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
    const url = normalizeHttpsUrl(link?.url);
    if (!url) return false;
    const title = truncateText(link?.title, 'Untitled link', 120).trim() || 'Untitled link';
    setSpaces((previous) => previous.map((space) => {
      if (space.id === spaceId) {
        if (space.links.length >= 10) return space;
        return { ...space, links: [...space.links, { id: `link-${Date.now()}`, title, url }] };
      }
      return space;
    }));
    return true;
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
    const safeNotes = truncateText(notes, '', 2_000);
    setSpaces((previous) => previous.map((space) => space.id === spaceId ? { ...space, notes: safeNotes } : space));
  };

  const logFocusTime = (minutes) => {
    const mins = Math.round(Number(minutes));
    if (!Number.isFinite(mins) || mins < 1 || mins > 1_440) return;
    const completedAt = new Date().toISOString();
    const nonce = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2, 12);
    const id = `focus-${nonce}`;
    setFocusSessions((previous) => [...previous, { id, minutes: mins, date: localDateKey(), completedAt }]);
    setLastCompletedSessionId(id);
    return id;
  };
  const updateFocusSession = (id, updates) => {
    if (!isPlainObject(updates)) return;
    const safeUpdates = {};
    if ('quality' in updates) safeUpdates.quality = clampNumber(updates.quality, 0, 0, 5);
    if ('note' in updates) safeUpdates.note = truncateText(updates.note, '', 500);
    if (!Object.keys(safeUpdates).length) return;
    setFocusSessions((previous) => previous.map((session) => session.id === id ? { ...session, ...safeUpdates } : session));
  };

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
  // completeTimer intentionally reads the current timer settings without recreating the interval on every tick.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimerRunning, timerEndsAt, timerMode, timerSoundVolume, isTimerSoundEnabled]);

  useEffect(() => {
    if (!timerEndsAt) return;
    const resumeTimer = window.setTimeout(() => {
      const remaining = Math.max(0, Math.ceil((timerEndsAt - Date.now()) / 1000));
      if (remaining === 0) completeTimer();
      else { setTimeLeft(remaining); setIsTimerRunning(true); }
    }, 0);
    return () => window.clearTimeout(resumeTimer);
  // This is a mount-only restoration of the persisted deadline.
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!VALID_TIMER_MODES.has(mode)) return;
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
      const safeMinutes = clampNumber(customMins, 25, 1, 360);
      setCustomMinutes(safeMinutes);
      setTimeLeft(safeMinutes * 60);
    }
  };

  const syncTimerState = ({ isTimerRunning: remoteIsRunning, timerEndsAt: remoteEndsAt, timeLeft: remoteTimeLeft, timerMode: remoteMode, customMinutes: remoteCustomMinutes }) => {
    setTimerMode(remoteMode);
    if (remoteCustomMinutes) {
      setCustomMinutes(remoteCustomMinutes);
    }
    
    // Always align timeLeft and endsAt to match host
    setTimeLeft(remoteTimeLeft);
    setTimerEndsAt(remoteEndsAt);
    
    if (remoteIsRunning !== isTimerRunning) {
      if (remoteIsRunning && !hasStartedSessionRef.current) {
         hasStartedSessionRef.current = true;
      }
      setIsTimerRunning(remoteIsRunning);
    }
  };

  // Reminders / Calendar Tasks Management
  const addReminder = (title, time, priority = 'medium', date = new Date().toISOString().split('T')[0], notes = '') => {
    const safeTitle = truncateText(title, '', 160).trim();
    if (!safeTitle) return;
    const newRem = {
      id: `rem-${Date.now()}`,
      title: safeTitle,
      time: truncateText(time, '10:00 AM', 32) || '10:00 AM',
      date: sanitizeDate(date, new Date().toISOString().split('T')[0]),
      priority: VALID_PRIORITIES.has(priority) ? priority : 'medium',
      notes: truncateText(notes, '', 2_000),
      completed: false
    };
    setReminders(prev => prev.length >= 50 ? prev : [newRem, ...prev]);
  };

  const updateReminder = (id, updates) => {
    if (!isPlainObject(updates)) return;
    const safeUpdates = {};
    if ('title' in updates) safeUpdates.title = truncateText(updates.title, '', 160).trim();
    if ('time' in updates) safeUpdates.time = truncateText(updates.time, '10:00 AM', 32) || '10:00 AM';
    if ('date' in updates) safeUpdates.date = sanitizeDate(updates.date, localDateKey());
    if ('priority' in updates) safeUpdates.priority = VALID_PRIORITIES.has(updates.priority) ? updates.priority : 'medium';
    if ('notes' in updates) safeUpdates.notes = truncateText(updates.notes, '', 1_000);
    if ('completed' in updates) safeUpdates.completed = Boolean(updates.completed);
    if (!Object.keys(safeUpdates).length || ('title' in safeUpdates && !safeUpdates.title)) return;
    setReminders(prev => prev.map(r => r.id === id ? { ...r, ...safeUpdates } : r));
  };

  const toggleReminder = (id) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  const deleteReminder = (id) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const addChecklist = (name) => {
    const safeName = truncateText(name, 'New checklist', 80).trim() || 'New checklist';
    setChecklists((previous) => previous.length >= 10 ? previous : [...previous, { id: `list-${Date.now()}`, name: safeName, tasks: [] }]);
  };
  const updateChecklist = (id, updates) => {
    if (!isPlainObject(updates) || !('name' in updates)) return;
    const name = truncateText(updates.name, '', 80).trim();
    if (!name) return;
    setChecklists((previous) => previous.map((list) => list.id === id ? { ...list, name } : list));
  };
  const deleteChecklist = (id) => setChecklists((previous) => previous.length > 1 ? previous.filter((list) => list.id !== id) : previous);
  const addChecklistTask = (listId, title) => {
    const safeTitle = truncateText(title, '', 120).trim();
    if (!safeTitle) return;
    setChecklists((previous) => previous.map((list) => {
      if (list.id !== listId || list.tasks.length >= 50) return list;
      return { ...list, tasks: [...list.tasks, { id: `task-${Date.now()}`, title: safeTitle, completed: false }] };
    }));
  };
  const updateChecklistTask = (listId, taskId, updates) => {
    if (!isPlainObject(updates)) return;
    const safeUpdates = {};
    if ('title' in updates) safeUpdates.title = truncateText(updates.title, '', 120).trim();
    if ('completed' in updates) safeUpdates.completed = Boolean(updates.completed);
    if (!Object.keys(safeUpdates).length || ('title' in safeUpdates && !safeUpdates.title)) return;
    setChecklists((previous) => previous.map((list) => list.id === listId ? { ...list, tasks: list.tasks.map((task) => task.id === taskId ? { ...task, ...safeUpdates } : task) } : list));
  };
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
      setTimerPreferences: updateTimerPreferences,
      customMinutes,
      setCustomMinutes: updateCustomMinutes,
      timeLeft,
      setTimeLeft,
      isTimerRunning,
      startTimer,
      pauseTimer,
      resetTimer,
      syncTimerState,
      timerEndsAt,
      sessionsCompleted,
      totalLoggedFocusMinutes,
      focusSessions,
      updateFocusSession,
      lastCompletedSessionId,
      setLastCompletedSessionId,
      streak,
      dailyGoalMinutes,
      setDailyGoalMinutes: updateDailyGoalMinutes,
      weeklyReflections,
      setWeeklyReflections: updateWeeklyReflections,
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
