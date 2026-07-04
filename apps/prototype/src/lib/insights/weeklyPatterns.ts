/**
 * WeeklyPatterns — движок инсайтов v0 (на устройстве, без AI).
 *
 * Чистые функции над QoldauEvent[], возвращают компактные структуры
 * для UI. На устройстве работает поверх EventStorage (см.
 * lib/storage/eventStorage.ts). На сервере может быть заменён на
 * полноценный аналитический движок без правки UI.
 *
 * Дизайн:
 *   - dayHourHeatmap — 7×24 матрица интенсивности (день недели × час).
 *     Считает события, попадающие в «неделю назад от weekStart». Возвращает
 *     массив где heatmap[d][h] = count. Без AI — без диагнозов.
 *   - topEventTypes — top-N типов событий за период. Группирует по type.
 *   - simpleStreaks — серии «N дней подряд был тип X» (минимальный
 *     streak-detector).
 *
 * ВАЖНО: это наблюдательные метрики, не клинические. UI должен
 * сопровождать их пометкой «наблюдение, не диагноз» (см. SAFETY_WORDING).
 */
import type { EventType, QoldauEvent } from '@/types/qoldau';

/**
 * Возвращает начало «недели назад» от weekStart — массив ISO-timestamps
 * за 7 дней (с dayStart = понедельник 00:00).
 */
export function getWeekDays(weekStart: Date): Date[] {
  const start = new Date(weekStart);
  start.setHours(0, 0, 0, 0);
  // Сдвигаем к понедельнику (day 1). JS getDay: 0=вс, 1=пн, …, 6=сб.
  const dow = start.getDay();
  const back = dow === 0 ? 6 : dow - 1;
  start.setDate(start.getDate() - back);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

/**
 * Heatmap 7×24 (день недели × час) — количество событий,
 * попавших в неделю, начинающуюся с weekStart.
 *
 * Использует occurredAt (v3), fallback на timestamp.
 *
 * - rows: 0=Пн, 1=Вт, …, 6=Вс
 * - cols: 0..23 часы
 */
export type Heatmap = number[][];

export function dayHourHeatmap(
  events: QoldauEvent[],
  childId: string | undefined,
  weekStart: Date,
): Heatmap {
  const days = getWeekDays(weekStart);
  const weekStartMs = days[0].getTime();
  const weekEndMs = days[6].getTime() + 24 * 60 * 60 * 1000;

  const heatmap: Heatmap = [
    new Array(24).fill(0),
    new Array(24).fill(0),
    new Array(24).fill(0),
    new Array(24).fill(0),
    new Array(24).fill(0),
    new Array(24).fill(0),
    new Array(24).fill(0),
  ];

  for (const e of events) {
    if (childId && e.childId !== childId) continue;
    if (e.deleted) continue;
    // occurredAt — канонический канал времени (v3). Fallback на timestamp,
    // если occurredAt пустой (например, событие после миграции без поля).
    const iso = e.occurredAt && e.occurredAt.length > 0 ? e.occurredAt : e.timestamp;
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) continue;
    if (t < weekStartMs || t >= weekEndMs) continue;
    const date = new Date(t);
    const dow = date.getDay();
    const row = dow === 0 ? 6 : dow - 1; // 0=Пн, …, 6=Вс
    const col = date.getHours();
    heatmap[row][col] += 1;
  }
  return heatmap;
}

/**
 * Top-N типов событий за период (по убыванию количества).
 *
 * Возвращает массив { type, count, label? }. Метки на русском — для UI;
 * если нужен i18n — вынести в отдельный mapper.
 */
export interface EventTypeStat {
  type: EventType;
  count: number;
}

export function topEventTypes(
  events: QoldauEvent[],
  since: string | undefined,
  limit = 5,
): EventTypeStat[] {
  const sinceMs = since ? new Date(since).getTime() : -Infinity;
  const counter = new Map<EventType, number>();
  for (const e of events) {
    if (e.deleted) continue;
    const iso = e.occurredAt && e.occurredAt.length > 0 ? e.occurredAt : e.timestamp;
    const t = new Date(iso).getTime();
    if (Number.isNaN(t) || t < sinceMs) continue;
    counter.set(e.type, (counter.get(e.type) ?? 0) + 1);
  }
  return [...counter.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Простейший streak detector: возвращает серии «тип X встречался каждый
 * день подряд в течение N дней до today».
 *
 * @param events — все события (без фильтра по дате)
 * @param type — тип для трекинга (например 'sleep' / 'calm_mode')
 * @returns максимальная длина серии (дней подряд) для типа
 */
export function simpleStreak(
  events: QoldauEvent[],
  type: EventType,
  today: Date = new Date(),
): number {
  // Соберём set дней, в которых был тип.
  const days = new Set<string>();
  for (const e of events) {
    if (e.deleted || e.type !== type) continue;
    const iso = e.occurredAt && e.occurredAt.length > 0 ? e.occurredAt : e.timestamp;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) continue;
    days.add(dayKey(d));
  }
  // Считаем streak с today назад.
  let streak = 0;
  const cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

/**
 * Подсчитывает общее число событий в heatmap (для empty-state и
 * проверки «есть ли что показать»).
 */
export function heatmapTotal(heatmap: Heatmap): number {
  let sum = 0;
  for (const row of heatmap) {
    for (const v of row) sum += v;
  }
  return sum;
}

/**
 * Максимум heatmap (для нормализации интенсивности цвета).
 */
export function heatmapMax(heatmap: Heatmap): number {
  let max = 0;
  for (const row of heatmap) {
    for (const v of row) {
      if (v > max) max = v;
    }
  }
  return max;
}