import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * useChildSettingsStore — настройки ребёнка (v0.3.16 + v1.5+ D2 + v1.6 E10.2.10).
 *
 * Обязательные настройки по DESIGN_RULES для child UI:
 * - calmVisual: убирает градиенты и анимации (полностью статичный визуал).
 * - largeIcons: увеличивает иконки (56 → 72 px).
 * - highContrast: bolder text/colors, без muted текста.
 * - paused: глобальная "Тишина" — отключает анимации и звук во всём приложении.
 * - fontScale: 1 / 1.1 / 1.2 — размер шрифта.
 * - sensoryMode (v1.5+ D2): 'calm' | 'standard' | 'playful' — общий сенсорный
 *   регулятор. Заменяет «один toggle» на сегментированный переключатель.
 * - communicationLevel (v1.6 E10.2.10): 'beginner' | 'basic' | 'advanced' —
 *   уровень сборщика фраз. beginner — только быстрые пресеты (≤6),
 *   basic — категории (6-9), advanced — полный сборщик.
 *
 * Persist в localStorage (`qoldau-child-settings-v1`, version 3 — добавили
 * communicationLevel).
 */

export type SensoryMode = 'calm' | 'standard' | 'playful';

/** v1.6 E10.2.10: уровень сложности сборщика фраз. */
export type CommunicationLevel = 'beginner' | 'basic' | 'advanced';

export interface ChildSettings {
  calmVisual: boolean;
  largeIcons: boolean;
  highContrast: boolean;
  paused: boolean;
  fontScale: 1 | 1.1 | 1.2;
  /** v1.5+ D2 — сенсорный режим (CSS-vars + haptics + personalization). */
  sensoryMode: SensoryMode;
  /** v1.6 E10.2.10 — уровень сборщика фраз (PhraseBuilderPage). */
  communicationLevel: CommunicationLevel;
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
  sensoryMode: 'standard',
  communicationLevel: 'basic',
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
      version: 3,
      // v2 → v3: добавлено поле communicationLevel (default 'basic').
      // v1 → v2: sensoryMode (default 'standard').
      migrate: (persistedState, fromVersion) => {
        const state = (persistedState ?? {}) as Partial<ChildSettings> & {
          events?: unknown;
        };
        if (fromVersion < 2 && !state.sensoryMode) {
          return { ...DEFAULTS, ...state, sensoryMode: 'standard' };
        }
        if (fromVersion < 3 && !state.communicationLevel) {
          return { ...DEFAULTS, ...state, communicationLevel: 'basic' };
        }
        return state as ChildSettings;
      },
    },
  ),
);

/**
 * Применить настройки к <html>:
 * - paused: добавить класс .qoldau-paused (глобально отключает анимации).
 * - fontScale: добавить data-font-scale для CSS.
 * - calmVisual: добавить класс .qoldau-calm-visual (без градиентов/теней).
 * - highContrast: добавить класс .qoldau-high-contrast.
 * - sensoryMode (v1.5+ D2): добавить data-sensory="calm|standard|playful".
 *   CSS-vars --child-saturation / --child-motion определены в sensory.css.
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
  html.dataset.sensory = settings.sensoryMode ?? 'standard';
}