import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * useChildSettingsStore — настройки ребёнка (v0.3.16).
 *
 * Обязательные настройки по DESIGN_RULES для child UI:
 * - calmVisual: убирает градиенты и анимации (полностью статичный визуал).
 * - largeIcons: увеличивает иконки (56 → 72 px).
 * - highContrast: bolder text/colors, без muted текста.
 * - paused: глобальная "Тишина" — отключает анимации и звук во всём приложении.
 * - fontScale: 1 / 1.1 / 1.2 — размер шрифта.
 *
 * Persist в localStorage (`qoldau-child-settings-v1`).
 */

export interface ChildSettings {
  calmVisual: boolean;
  largeIcons: boolean;
  highContrast: boolean;
  paused: boolean;
  fontScale: 1 | 1.1 | 1.2;
}

interface ChildSettingsState extends ChildSettings {
  set: (patch: Partial<ChildSettings>) => void;
  reset: () => void;
}

const DEFAULTS: ChildSettings = {
  calmVisual: false,
  largeIcons: false,
  highContrast: false,
  paused: false,
  fontScale: 1,
};

export const useChildSettingsStore = create<ChildSettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      set: (patch) => set((state) => ({ ...state, ...patch })),
      reset: () => set(DEFAULTS),
    }),
    {
      name: 'qoldau-child-settings-v1',
      version: 1,
    },
  ),
);

/**
 * Применить настройки к <html>:
 * - paused: добавить класс .qoldau-paused (глобально отключает анимации).
 * - fontScale: добавить data-font-scale для CSS.
 * - calmVisual: добавить класс .qoldau-calm-visual (без градиентов/теней).
 * - highContrast: добавить класс .qoldau-high-contrast.
 */
export function applyChildSettings(settings: ChildSettings) {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  if (settings.paused) {
    html.classList.add('qoldau-paused');
  } else {
    html.classList.remove('qoldau-paused');
  }
  if (settings.calmVisual) {
    html.classList.add('qoldau-calm-visual');
  } else {
    html.classList.remove('qoldau-calm-visual');
  }
  if (settings.highContrast) {
    html.classList.add('qoldau-high-contrast');
  } else {
    html.classList.remove('qoldau-high-contrast');
  }
  html.dataset.fontScale = String(settings.fontScale);
}