import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { soundEngine } from '../audio/soundGenerator';

const AppContext = createContext();

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
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('evolve_user');
    return saved ? JSON.parse(saved) : { name: 'Focus Master', email: 'user@evolve.app', avatar: '🌿' };
  });

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

  // Timer state
  const [timerMode, setTimerMode] = useState('pomodoro');
  const [customMinutes, setCustomMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Ref guards for guaranteed single sound triggers
  const hasStartedSessionRef = useRef(false);
  const hasFiredEndSoundRef = useRef(false);

  // Focus Stats - Logged Focus Minutes
  const [sessionsCompleted, setSessionsCompleted] = useState(() => {
    return parseInt(localStorage.getItem('evolve_sessions_count') || '0', 10);
  });
  const [totalLoggedFocusMinutes, setTotalLoggedFocusMinutes] = useState(() => {
    return parseInt(localStorage.getItem('evolve_logged_focus_mins') || '50', 10);
  });

  // Reminders / Calendar Tasks
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('evolve_reminders');
    return saved ? JSON.parse(saved) : DEFAULT_REMINDERS;
  });

  // Quotes
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [favoriteQuotes, setFavoriteQuotes] = useState(() => {
    const saved = localStorage.getItem('evolve_fav_quotes');
    return saved ? JSON.parse(saved) : [];
  });

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

  useEffect(() => {
    localStorage.setItem('evolve_sessions_count', sessionsCompleted.toString());
  }, [sessionsCompleted]);

  useEffect(() => {
    localStorage.setItem('evolve_logged_focus_mins', totalLoggedFocusMinutes.toString());
  }, [totalLoggedFocusMinutes]);

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
  const login = (email, password) => {
    const name = email.split('@')[0];
    const newUser = { name: name.charAt(0).toUpperCase() + name.slice(1), email, avatar: '🌱' };
    setUser(newUser);
    localStorage.setItem('evolve_user', JSON.stringify(newUser));
  };

  const signup = (name, email, password) => {
    const newUser = { name, email, avatar: '🍃' };
    setUser(newUser);
    localStorage.setItem('evolve_user', JSON.stringify(newUser));
  };

  const googleAuth = () => {
    const newUser = { name: 'Alex Sage', email: 'alex.sage@gmail.com', avatar: '🌲' };
    setUser(newUser);
    localStorage.setItem('evolve_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('evolve_user');
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

  // Log Focus Duration
  const logFocusTime = (minutes) => {
    const mins = parseInt(minutes, 10);
    if (isNaN(mins) || mins <= 0) return;
    setSessionsCompleted(prev => prev + 1);
    setTotalLoggedFocusMinutes(prev => prev + mins);
  };

  // Timer Control with Guaranteed Sound Triggers
  const startTimer = () => {
    // Play start sound ONLY when a new session begins (not on resuming from pause)
    if (!hasStartedSessionRef.current) {
      soundEngine.playTimerStartSound(timerSoundVolume, isTimerSoundEnabled);
      hasStartedSessionRef.current = true;
    }
    hasFiredEndSoundRef.current = false;
    setIsTimerRunning(true);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
    // Pause does NOT play completion sound or reset session start flag
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    hasStartedSessionRef.current = false;
    hasFiredEndSoundRef.current = false;
    changeTimerMode(timerMode);
  };

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
  }, [isTimerRunning, timeLeft, timerMode, customMinutes, isTimerSoundEnabled, timerSoundVolume]);

  const changeTimerMode = (mode, customMins = customMinutes) => {
    setIsTimerRunning(false);
    hasStartedSessionRef.current = false;
    hasFiredEndSoundRef.current = false;
    setTimerMode(mode);
    if (mode === 'pomodoro') {
      setCustomMinutes(25);
      setTimeLeft(25 * 60);
    } else if (mode === 'shortBreak') {
      setTimeLeft(5 * 60);
    } else if (mode === 'longBreak') {
      setTimeLeft(15 * 60);
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

  // Quotes
  const refreshQuote = () => {
    setQuoteIndex(prev => (prev + 1) % QUOTES_DATABASE.length);
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
      login,
      signup,
      googleAuth,
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
      logFocusTime,
      reminders,
      addReminder,
      updateReminder,
      toggleReminder,
      deleteReminder,
      quotes: QUOTES_DATABASE,
      currentQuote: QUOTES_DATABASE[quoteIndex],
      refreshQuote,
      favoriteQuotes,
      toggleFavoriteQuote
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
