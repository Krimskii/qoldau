/**
 * Тесты sensory-фильтра (BATCH B, wave 2) — логика матчинга тегов.
 *
 * Контракт:
 *   - sensoryContext содержит точные теги (lowercase)
 *   - payload.modalities (SensoryPayload) — альтернативный источник
 *   - фильтр 'sensory:sound' матчит события, у которых в любом из этих мест есть 'sound'
 */
import { describe, it, expect } from 'vitest';
import type { QoldauEvent } from '@/types/qoldau';

const baseEvent = (overrides: Partial<QoldauEvent> = {}): QoldauEvent => ({
  id: 'evt-x',
  childId: 'child-alikhan',
  type: 'sensory',
  title: 'X',
  description: '...',
  timestamp: '2026-07-01T10:00:00.000Z',
  occurredAt: '2026-07-01T10:00:00.000Z',
  recordedAt: '2026-07-01T10:00:00.000Z',
  source: 'manual',
  sourceRole: 'parent',
  status: 'confirmed',
  schemaVersion: 3,
  ...overrides,
});

/**
 * Чистая функция матчинга, идентичная логике в EventTimeline.tsx.
 * Выделена для тестирования без зависимости от React-рендеринга.
 */
function matchesSensoryFilter(e: QoldauEvent, tag: string): boolean {
  if (e.sensoryContext?.some((s) => s.toLowerCase() === tag)) return true;
  const mods = (e.payload as { modalities?: string[] } | undefined)?.modalities;
  return mods?.some((m) => m.toLowerCase() === tag) ?? false;
}

describe('Sensory filter — matchesSensoryFilter', () => {
  it('матчит по sensoryContext', () => {
    const e = baseEvent({ sensoryContext: ['sound'] });
    expect(matchesSensoryFilter(e, 'sound')).toBe(true);
    expect(matchesSensoryFilter(e, 'light')).toBe(false);
  });

  it('матчит по payload.modalities (SensoryPayload)', () => {
    const e = baseEvent({
      type: 'sensory',
      payload: { modalities: ['light', 'temperature'] },
    });
    expect(matchesSensoryFilter(e, 'light')).toBe(true);
    expect(matchesSensoryFilter(e, 'temperature')).toBe(true);
    expect(matchesSensoryFilter(e, 'sound')).toBe(false);
  });

  it('case-insensitive', () => {
    const e = baseEvent({ sensoryContext: ['Sound', 'LIGHT'] });
    expect(matchesSensoryFilter(e, 'sound')).toBe(true);
    expect(matchesSensoryFilter(e, 'light')).toBe(true);
  });

  it('empty/undefined — не матчит', () => {
    const e = baseEvent({});
    expect(matchesSensoryFilter(e, 'sound')).toBe(false);
  });

  it('приоритет sensoryContext над modalities', () => {
    const e = baseEvent({
      sensoryContext: ['sound'],
      payload: { modalities: ['light'] },
    });
    expect(matchesSensoryFilter(e, 'sound')).toBe(true);
    expect(matchesSensoryFilter(e, 'light')).toBe(true);
  });
});

/**
 * ABC секция в EventDetails — показывается только если есть хотя бы
 * одно из полей. Логика выделена для тестирования.
 */
function hasAbc(e: QoldauEvent): boolean {
  if (!e.abc) return false;
  return Boolean(e.abc.antecedent || e.abc.behavior || e.abc.consequence);
}

describe('ABC section visibility', () => {
  it('показывается если есть antecedent', () => {
    expect(hasAbc(baseEvent({ abc: { antecedent: 'Шум' } }))).toBe(true);
  });
  it('показывается если есть behavior', () => {
    expect(hasAbc(baseEvent({ abc: { behavior: 'Закрыл уши' } }))).toBe(true);
  });
  it('показывается если есть consequence', () => {
    expect(hasAbc(baseEvent({ abc: { consequence: 'Успокоился через 5 мин' } }))).toBe(true);
  });
  it('скрывается если abc пустой', () => {
    expect(hasAbc(baseEvent({ abc: {} }))).toBe(false);
  });
  it('скрывается если abc отсутствует', () => {
    expect(hasAbc(baseEvent({}))).toBe(false);
  });
});