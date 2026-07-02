/**
 * ThemeToggle (v0.6.8) — переключатель темы (light/dark/system).
 *
 * Применяет `html.dark` класс, persistence в localStorage 'qoldau-theme-v1'.
 * Default: 'system' (prefers-color-scheme).
 */
import React, { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { AppIcon } from './AppIcon';

type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'qoldau-theme-v1';

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.toggle('dark', isDark);
}

function loadTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
  return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
}

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const [theme, setTheme] = useState<Theme>(() => loadTheme());

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // Слушаем системные изменения
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  const cycle = () => {
    const next: Record<Theme, Theme> = { light: 'dark', dark: 'system', system: 'light' };
    setTheme(next[theme]);
  };

  const icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;
  const label = theme === 'light' ? 'Светлая' : theme === 'dark' ? 'Тёмная' : 'Системная';

  return (
    <button
      onClick={cycle}
      className={`w-9 h-9 rounded-full bg-white border border-line flex items-center justify-center hover:bg-teal-soft transition-colors shadow-card-soft ${className ?? ''}`}
      aria-label={`Тема: ${label}`}
      title={`Тема: ${label}`}
    >
      <AppIcon component={icon} size={16} colorClass="text-ink-2" />
    </button>
  );
};