export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'qoldau-theme-v1';

/** Applies the given theme to <html>. Does not persist — call saveTheme() separately if needed. */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.toggle('dark', isDark);
}

export function loadTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
  return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
}

export function saveTheme(theme: Theme): void {
  localStorage.setItem(STORAGE_KEY, theme);
}
