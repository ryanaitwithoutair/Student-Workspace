/** Convert 24h "HH:MM" to 12h display string like "2:30 PM". */
export function formatTime12h(time24) {
  if (!time24) return '10:00 AM';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${period}`;
}

/** Convert stored display time or 24h input to HTML time input value "HH:MM". */
export function toTimeInputValue(timeStr) {
  if (!timeStr) return '10:00';
  if (/^\d{1,2}:\d{2}$/.test(timeStr)) return timeStr;

  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return '10:00';

  let h = parseInt(match[1], 10);
  const m = match[2];
  const period = match[3].toUpperCase();
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${m}`;
}
