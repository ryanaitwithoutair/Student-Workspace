const MAX_URL_LENGTH = 512;

export const isPlainObject = (value) => (
  value !== null && typeof value === 'object' && !Array.isArray(value)
);

export const clampNumber = (value, fallback, min, max) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
};

export const truncateText = (value, fallback = '', maxLength = 500) => {
  if (typeof value !== 'string') return fallback;
  return Array.from(value).filter((character) => {
    const code = character.charCodeAt(0);
    return code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127);
  }).join('').slice(0, maxLength);
};

export const normalizeHttpsUrl = (value) => {
  if (typeof value !== 'string') return null;
  const input = value.trim();
  if (!input || input.length > MAX_URL_LENGTH) return null;

  const candidate = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
};

export const isTrustedBackgroundImageUrl = (value) => {
  const url = normalizeHttpsUrl(value);
  if (!url) return false;
  return new URL(url).hostname === 'images.unsplash.com';
};

export const safeLocalGet = (key) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const safeLocalSet = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Browser storage is a cache only. A full or unavailable store must not crash the app.
  }
};

export const readLocalJson = (key, fallback, validate = () => true) => {
  const value = safeLocalGet(key);
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return validate(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

export const readLocalNumber = (key, fallback, min, max) => (
  clampNumber(safeLocalGet(key), fallback, min, max)
);
