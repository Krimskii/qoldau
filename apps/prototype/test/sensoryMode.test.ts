/**
 * Тесты sensory dial (BATCH D2, v1.5+) — sensoryMode в useChildSettingsStore.
 *
 * Контракт:
 *   - default = 'standard';
 *   - persist в localStorage `qoldau-child-settings-v1`;
 *   - switch calm ↔ standard ↔ playful работает;
 *   - migrate v1 → v2 даёт sensoryMode='standard';
 *   - reset() возвращает 'standard'.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useChildSettingsStore } from '@/store/useChildSettingsStore';

describe('useChildSettingsStore — sensoryMode (BATCH D2)', () => {
  beforeEach(() => {
    localStorage.clear();
    // reset через set(), так как reset() тоже есть.
    useChildSettingsStore.getState().reset();
  });

  it('default sensoryMode = "standard"', () => {
    expect(useChildSettingsStore.getState().sensoryMode).toBe('standard');
  });

  it('set({ sensoryMode: "calm" }) сохраняется в стейте', () => {
    useChildSettingsStore.getState().set({ sensoryMode: 'calm' });
    expect(useChildSettingsStore.getState().sensoryMode).toBe('calm');
  });

  it('set({ sensoryMode: "playful" }) сохраняется в стейте', () => {
    useChildSettingsStore.getState().set({ sensoryMode: 'playful' });
    expect(useEventStoreSensoryViaPublicAPI()).toBe('playful');
  });

  it('persist: sensoryMode пишется в localStorage', () => {
    useChildSettingsStore.getState().set({ sensoryMode: 'calm' });
    const raw = localStorage.getItem('qoldau-child-settings-v1');
    expect(raw).toBeTruthy();
    expect(raw).toContain('calm');
  });

  it('reset() возвращает sensoryMode = "standard"', () => {
    useChildSettingsStore.getState().set({ sensoryMode: 'playful' });
    useChildSettingsStore.getState().reset();
    expect(useChildSettingsStore.getState().sensoryMode).toBe('standard');
  });

  it('migrate v1 → v2: добавляет sensoryMode="standard" если отсутствует', () => {
    // Симулируем persistedState из v1 (без sensoryMode).
    const fakeV1 = {
      calmVisual: false,
      largeIcons: false,
      highContrast: false,
      paused: false,
      fontScale: 1,
    };
    const persistApi = (
      useChildSettingsStore as unknown as {
        persist: {
          getOptions: () => {
            migrate: (s: unknown, v: number) => unknown;
          };
        };
      }
    ).persist.getOptions();
    const migrated = persistApi.migrate(fakeV1, 1) as Record<string, unknown>;
    expect(migrated.sensoryMode).toBe('standard');
    // Старые поля сохранены.
    expect(migrated.fontScale).toBe(1);
    expect(migrated.paused).toBe(false);
  });
});

/** Helper для проверки store-значения после set(). */
function getEventStoreSensoryViaPublicAPI(): string {
  return useChildSettingsStore.getState().sensoryMode;
}
// alias для теста выше
function useEventStoreSensoryViaPublicAPI(): string {
  return getEventStoreSensoryViaPublicAPI();
}