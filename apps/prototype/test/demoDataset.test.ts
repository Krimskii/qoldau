/**
 * Тесты demoDataset — getFamilyChildName / setProfileMode / getProfileMode.
 *
 * Покрывает контракт profile-mode (BATCH 6 — real family clean start):
 *   - default 'demo' для обратной совместимости
 *   - setProfileMode('real') пишет в localStorage
 *   - getProfileMode() читает и валидирует значение ('real' → 'real',
 *     что угодно ещё → 'demo')
 *   - setFamilyChildName + clearFamilyChildName идемпотентны
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getFamilyChildName,
  setFamilyChildName,
  clearFamilyChildName,
  getProfileMode,
  setProfileMode,
} from '@/data/demoDataset';

describe('demoDataset — profile mode (BATCH 6)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getProfileMode / setProfileMode', () => {
    it('default — "demo" при пустом localStorage (обратная совместимость)', () => {
      expect(getProfileMode()).toBe('demo');
    });

    it('default — "demo" для любого мусорного значения в ключе', () => {
      window.localStorage.setItem('qoldau-profile-mode-v1', 'wat');
      expect(getProfileMode()).toBe('demo');
    });

    it('setProfileMode("real") → getProfileMode() возвращает "real"', () => {
      setProfileMode('real');
      expect(getProfileMode()).toBe('real');
      expect(window.localStorage.getItem('qoldau-profile-mode-v1')).toBe('real');
    });

    it('setProfileMode("demo") перезаписывает "real"', () => {
      setProfileMode('real');
      setProfileMode('demo');
      expect(getProfileMode()).toBe('demo');
    });

    it('setProfileMode игнорирует невалидные значения', () => {
      setProfileMode('real');
      // @ts-expect-error — намеренно невалидный аргумент для runtime-проверки
      setProfileMode('production');
      // значение не перезаписано
      expect(getProfileMode()).toBe('real');
    });
  });

  describe('getFamilyChildName / setFamilyChildName', () => {
    it('default — null при пустом localStorage', () => {
      expect(getFamilyChildName()).toBeNull();
    });

    it('setFamilyChildName пишет trimmed имя', () => {
      setFamilyChildName('  Алихан  ');
      expect(getFamilyChildName()).toBe('Алихан');
    });

    it('setFamilyChildName("") — no-op (trimmed пустая строка)', () => {
      setFamilyChildName('   ');
      expect(getFamilyChildName()).toBeNull();
    });

    it('clearFamilyChildName удаляет запись', () => {
      setFamilyChildName('Алихан');
      clearFamilyChildName();
      expect(getFamilyChildName()).toBeNull();
    });
  });
});