import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * useConsentStore — parental consent для записи голоса (v1.0).
 *
 * Одноразовое согласие родителя / законного представителя на обработку
 * детских данных перед первой записью. Хранится локально (на устройстве).
 *
 * Текст согласия — см. `docs/PRIVACY_CONSENT_PILOT.md` §2.
 * Мини-политика — §4.
 *
 * Persist в localStorage (`qoldau-consent-v1`). v=1 — согласие 1.0
 * (pilot-уровень, не GDPR/COPPA-certified).
 */
export interface ConsentRecord {
  /** Версия формы согласия — если в тексте меняется существенно,
   *  потребуется re-consent. */
  version: 1;
  /** ISO timestamp согласия. */
  acceptedAt: string;
}

interface ConsentState {
  /** Текущая запись согласия или null если ещё не дано. */
  consent: ConsentRecord | null;
  /** True если пользователь дал согласие текущей версии. */
  hasConsent: () => boolean;
  /** Записать согласие (вызывается после отметки чекбокса). */
  accept: () => void;
  /** Стереть согласие (для re-consent или «очистить данные»). */
  clear: () => void;
}

export const CONSENT_STORAGE_KEY = 'qoldau-consent-v1';

export const useConsentStore = create<ConsentState>()(
  persist(
    (set, get) => ({
      consent: null,

      hasConsent: () => {
        const c = get().consent;
        return c !== null && c.version === 1;
      },

      accept: () => {
        const record: ConsentRecord = {
          version: 1,
          acceptedAt: new Date().toISOString(),
        };
        set({ consent: record });
      },

      clear: () => set({ consent: null }),
    }),
    {
      name: CONSENT_STORAGE_KEY,
      version: 1,
      // Сохраняем только `consent` — методы воссоздаются из замыкания.
      partialize: (state) => ({ consent: state.consent }),
    },
  ),
);