import { QoldauEvent } from '@/types/qoldau';

/**
 * Stable demo events seeded by startDemo().
 * These have fixed IDs so the guided demo always lands on real events.
 */

const DEMO_BASE_DATE = '2026-07-01T10:30:00';

export const DEMO_EVENTS: QoldauEvent[] = [
  {
    id: 'evt-demo-voice-1',
    childId: 'child-1',
    type: 'voice_observation',
    title: 'Голосовое наблюдение',
    description: 'Родитель сказал: "Он поел кашу с сыром, потом нервничал, закрывал уши, сходил в туалет".',
    timestamp: DEMO_BASE_DATE,
    sourceRole: 'parent',
    status: 'confirmed',
    rawText: 'Он поел кашу с сыром, потом нервничал, закрывал уши, сходил в туалет',
    linkedEventIds: ['evt-demo-food-1', 'evt-demo-behavior-1', 'evt-demo-toilet-1'],
    payload: {
      clarifyingAnswers: {
        'water-amount': 'Нормально',
        'toilet-better': 'Да',
        'noise-around': 'Да',
      },
      aiInsight: 'Похоже, нервозность появилась после еды. Возможна связь с сенсорной нагрузкой. Это наблюдение, не диагноз.',
      source: 'voice_observation',
    },
    confidence: 0.85,
  },
  {
    id: 'evt-demo-food-1',
    childId: 'child-1',
    type: 'food',
    title: 'Питание',
    description: 'Каша с сыром, немного воды',
    timestamp: '2026-07-01T10:32:00',
    sourceRole: 'parent',
    status: 'confirmed',
    linkedEventIds: ['evt-demo-voice-1'],
  },
  {
    id: 'evt-demo-behavior-1',
    childId: 'child-1',
    type: 'behavior',
    title: 'Поведение',
    description: 'Наблюдалась нервозность, закрывал уши',
    timestamp: '2026-07-01T10:35:00',
    sourceRole: 'parent',
    status: 'confirmed',
    linkedEventIds: ['evt-demo-voice-1', 'evt-demo-toilet-1'],
  },
  {
    id: 'evt-demo-toilet-1',
    childId: 'child-1',
    type: 'toilet',
    title: 'Туалет',
    description: 'Стул жидкий',
    timestamp: '2026-07-01T10:40:00',
    sourceRole: 'parent',
    status: 'confirmed',
    linkedEventIds: ['evt-demo-voice-1', 'evt-demo-behavior-1'],
  },
  {
    id: 'evt-demo-communication-1',
    childId: 'child-1',
    type: 'communication',
    title: 'Коммуникация',
    description: 'Использовал звук "ту-ту" для запроса туалета',
    timestamp: '2026-07-01T09:00:00',
    sourceRole: 'parent',
    status: 'confirmed',
    linkedEventIds: ['evt-demo-toilet-1'],
  },
  {
    id: 'evt-demo-aac-water-1',
    childId: 'child-1',
    type: 'aac_card',
    title: 'AAC: Вода',
    description: 'Ребёнок нажал AAC карточку "Хочу пить"',
    timestamp: '2026-07-01T11:15:00',
    sourceRole: 'child',
    status: 'confirmed',
  },
  {
    id: 'evt-demo-tutor-1',
    childId: 'child-1',
    type: 'tutor_note',
    title: 'Наблюдение тьютора',
    description: 'На занятии ребёнок использовал визуальное расписание, пауза помогла при переходе',
    timestamp: '2026-07-01T14:00:00',
    sourceRole: 'tutor',
    status: 'confirmed',
  },
];

export const DEMO_EVENT_IDS = DEMO_EVENTS.map((e) => e.id);

/**
 * Seed demo events if not already present.
 * Safe to call multiple times — it skips ids that already exist.
 */
export function seedDemoEvents(events: QoldauEvent[]): QoldauEvent[] {
  const existingIds = new Set(events.map((e) => e.id));
  const toAdd = DEMO_EVENTS.filter((e) => !existingIds.has(e.id));
  if (toAdd.length === 0) return events;
  return [...toAdd, ...events];
}