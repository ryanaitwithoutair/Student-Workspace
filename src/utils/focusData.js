export const localDateKey = (value = new Date()) => {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

export const minutesFromSessions = (sessions) => sessions.reduce((total, session) => total + session.minutes, 0);

export const dayTotals = (sessions) => sessions.reduce((totals, session) => {
  const key = session.date || localDateKey(session.completedAt);
  totals[key] = (totals[key] || 0) + session.minutes;
  return totals;
}, {});

export const streakStats = (sessions) => {
  const dates = [...new Set(sessions.map((session) => session.date || localDateKey(session.completedAt)))].sort();
  if (!dates.length) return { current: 0, best: 0, days: [] };
  let best = 1;
  let run = 1;
  for (let index = 1; index < dates.length; index += 1) {
    const previous = new Date(`${dates[index - 1]}T12:00:00`);
    const current = new Date(`${dates[index]}T12:00:00`);
    if ((current - previous) / 86400000 === 1) run += 1;
    else run = 1;
    best = Math.max(best, run);
  }
  const today = localDateKey();
  const yesterday = localDateKey(Date.now() - 86400000);
  let current = dates.at(-1) === today || dates.at(-1) === yesterday ? 1 : 0;
  for (let index = dates.length - 1; current && index > 0; index -= 1) {
    const later = new Date(`${dates[index]}T12:00:00`);
    const earlier = new Date(`${dates[index - 1]}T12:00:00`);
    if ((later - earlier) / 86400000 === 1) current += 1;
    else break;
  }
  return { current, best, days: dates };
};

export const formatFocusTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const remainder = Math.round(minutes % 60);
  return hours ? `${hours}h ${remainder}m` : `${remainder}m`;
};
