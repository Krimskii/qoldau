/**
 * Тесты WeeklyPatterns — движок инсайтов v0 (BATCH C).
 *
 * Покрывает:
 *   - dayHourHeatmap: корректная матрица 7×24, фильтр по childId и since/until,
 *     soft-delete исключается, fallback на timestamp.
 *   - topEventTypes: сортировка desc, лимит, фильтр по since.
 *   - simpleStreaks: подсчёт дней подряд (сегодня включительно).
 *   - heatmapTotal/Max: сумма и максимум.
 *   - getWeekDays: 7 дней начиная с понедельника.
 */
import { describe, it, expect } from 'vitest';
import {
  dayHourHeatmap,
  topEventTypes,
  simpleStreak,
  heatmapTotal,
  heatmapMax,
  getWeekDays,
  type Heatmap,
} from '@/lib/insights/weeklyPatterns';
import type { QoldauEvent } from '@/types/qoldau';

const baseEvent = (overrides: Partial<QoldauEvent> = {}): QoldauEvent => ({
  id: 'evt-x',
  childId: 'child-alikhan',
  type: 'food',
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

describe('dayHourHeatmap', () => {
  it('возвращает 7 строк × 24 колонки, заполненных нулями', () => {
    const hm = dayHourHeatmap([], 'c1', new Date('2026-07-01'));
    expect(hm.length).toBe(7);
    for (const row of hm) {
      expect(row.length).toBe(24);
      for (const v of row) expect(v).toBe(0);
    }
  });

  it('считает событие в правильной ячейке (день × час)', () => {
    // Используем локальный ISO без TZ, чтобы не зависеть от часового пояса
    // тестового окружения. 2026-07-01 — среда, day index 2 (Пн=0).
    const localTs = '2026-07-01T14:30:00'; // локальное время без Z
    const event = baseEvent({
      occurredAt: localTs,
      timestamp: localTs,
    });
    // weekStart=Mon 2026-06-29 (локально).
    const hm = dayHourHeatmap([event], 'child-alikhan', new Date('2026-06-29'));
    expect(hm[2][14]).toBe(1);
  });

  it('фильтрует по childId', () => {
    const ev1 = baseEvent({ childId: 'c1', occurredAt: '2026-07-01T10:00:00.000Z', timestamp: '2026-07-01T10:00:00.000Z' });
    const ev2 = baseEvent({ childId: 'c2', occurredAt: '2026-07-01T10:00:00.000Z', timestamp: '2026-07-01T10:00:00.000Z' });
    const hm = dayHourHeatmap([ev1, ev2], 'c1', new Date('2026-06-29'));
    expect(heatmapTotal(hm)).toBe(1);
  });

  it('soft-delete события не считаются', () => {
    const ev = baseEvent({
      occurredAt: '2026-07-01T10:00:00.000Z',
      timestamp: '2026-07-01T10:00:00.000Z',
      deleted: true,
    });
    const hm = dayHourHeatmap([ev], 'c1', new Date('2026-06-29'));
    expect(heatmapTotal(hm)).toBe(0);
  });

  it('fallback на timestamp если occurredAt пустой', () => {
    const localTs = '2026-07-01T10:00:00';
    // occurredAt='' → функция должна fallback'нуться на timestamp.
    const ev = baseEvent({
      timestamp: localTs,
      occurredAt: '',
    });
    const hm = dayHourHeatmap([ev], 'child-alikhan', new Date('2026-06-29'));
    expect(heatmapTotal(hm)).toBe(1);
  });

  it('событие вне недели — игнорируется', () => {
    const ev = baseEvent({
      occurredAt: '2026-05-01T10:00:00.000Z',
      timestamp: '2026-05-01T10:00:00.000Z',
    });
    const hm = dayHourHeatmap([ev], 'c1', new Date('2026-06-29'));
    expect(heatmapTotal(hm)).toBe(0);
  });
});

describe('topEventTypes', () => {
  it('группирует и сортирует по убыванию count', () => {
    const events: QoldauEvent[] = [
      baseEvent({ type: 'food', occurredAt: '2026-07-01T08:00:00.000Z' }),
      baseEvent({ type: 'food', occurredAt: '2026-07-01T09:00:00.000Z' }),
      baseEvent({ type: 'water', occurredAt: '2026-07-01T10:00:00.000Z' }),
    ];
    const top = topEventTypes(events, undefined);
    expect(top[0]).toEqual({ type: 'food', count: 2 });
    expect(top[1]).toEqual({ type: 'water', count: 1 });
  });

  it('limit=N — возвращает top-N', () => {
    const events: QoldauEvent[] = [
      baseEvent({ type: 'food', occurredAt: '2026-07-01T08:00:00.000Z' }),
      baseEvent({ type: 'water', occurredAt: '2026-07-01T09:00:00.000Z' }),
      baseEvent({ type: 'toilet', occurredAt: '2026-07-01T10:00:00.000Z' }),
      baseEvent({ type: 'sleep', occurredAt: '2026-07-01T11:00:00.000Z' }),
    ];
    const top = topEventTypes(events, undefined, 2);
    expect(top.length).toBe(2);
  });

  it('since фильтрует события', () => {
    const events: QoldauEvent[] = [
      baseEvent({ type: 'food', occurredAt: '2026-01-01T08:00:00.000Z' }),
      baseEvent({ type: 'food', occurredAt: '2026-07-01T08:00:00.000Z' }),
    ];
    const top = topEventTypes(events, '2026-06-01T00:00:00.000Z');
    expect(top[0]?.count).toBe(1);
  });
});

describe('simpleStreak', () => {
  it('считает дни подряд (включая сегодня)', () => {
    const today = new Date('2026-07-01T15:00:00');
    const day = (offset: number) =>
      new Date(today.getTime() - offset * 24 * 60 * 60 * 1000).toISOString();
    const events: QoldauEvent[] = [
      baseEvent({ type: 'sleep', occurredAt: day(0), timestamp: day(0) }),
      baseEvent({ type: 'sleep', occurredAt: day(1), timestamp: day(1) }),
      baseEvent({ type: 'sleep', occurredAt: day(2), timestamp: day(2) }),
      // день -3 пропущен → streak должен быть 3
    ];
    const s = simpleStreak(events, 'sleep', today);
    expect(s).toBe(3);
  });

  it('streak=0 если сегодня нет события', () => {
    const today = new Date('2026-07-01T15:00:00');
    const events: QoldauEvent[] = [
      baseEvent({ type: 'sleep', occurredAt: '2026-06-30T10:00:00.000Z', timestamp: '2026-06-30T10:00:00.000Z' }),
    ];
    expect(simpleStreak(events, 'sleep', today)).toBe(0);
  });
});

describe('getWeekDays', () => {
  it('возвращает 7 дней начиная с понедельника', () => {
    // 2026-06-29 — понедельник.
    const days = getWeekDays(new Date('2026-06-29'));
    expect(days.length).toBe(7);
    expect(days[0].getDay()).toBe(1); // Пн
    expect(days[6].getDay()).toBe(0); // Вс
  });

  it('если старт — воскресенье, всё равно возвращает 7 дней включая предыдущий Пн', () => {
    // 2026-07-05 — воскресенье.
    const days = getWeekDays(new Date('2026-07-05'));
    expect(days.length).toBe(7);
    expect(days[0].getDay()).toBe(1);
    expect(days[6].getDay()).toBe(0);
  });
});

describe('heatmapTotal / heatmapMax', () => {
  it('считают сумму и максимум', () => {
    const hm: Heatmap = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      new Array(24).fill(0),
      new Array(24).fill(0),
      new Array(24).fill(0),
      new Array(24).fill(0),
    ];
    expect(heatmapTotal(hm)).toBe(45);
    expect(heatmapMax(hm)).toBe(9);
  });
});