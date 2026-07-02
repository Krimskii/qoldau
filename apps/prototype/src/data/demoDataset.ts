import { ChildProfile, QoldauEvent, Signal, EventType, EventStatus } from '@/types/qoldau';

/**
 * Demo dataset — все mock-данные для полноценной презентации v0.3.0.
 *
 * Структура:
  *   - 3 ребёнка (Демо-профиль 1, Демо-профиль 2, Демо-профиль 3) — synthetic имена (v0.7.4)
 *   - Родители, тьюторы, специалисты
 *   - 60+ событий за 7 дней для Алихана
 *   - События логически связаны через linkedEventIds
 *   - Все события имеют status: 'confirmed' или 'corrected'
 *
 * ВАЖНО: Это профиль наблюдений, не диагноз.
 * Все AI-выводы должны формулироваться осторожно.
 */

// =====================================================================
// CHILDREN
// =====================================================================

export const DEMO_CHILDREN: ChildProfile[] = [
  {
    id: 'child-alikhan',
    name: 'Демо-профиль 1',
    age: 7,
    diagnosisLabel: 'РАС',
    currentState: 'спокойный',
    avatar: '1',
    mainSignals: [
      { id: 'sig-1', signal: '«ту-ту»', kind: 'sound', possibleMeaning: 'возможно — туалет', confidence: 0.82, confirmedCount: 14, lastSeenAt: '2026-07-01T10:38:00' },
      { id: 'sig-2', signal: '«ва»', kind: 'sound', possibleMeaning: 'возможно — пить', confidence: 0.88, confirmedCount: 18, lastSeenAt: '2026-07-01T11:15:00' },
      { id: 'sig-3', signal: 'закрывает уши', kind: 'gesture', possibleMeaning: 'шум / перегрузка', confidence: 0.90, confirmedCount: 22, lastSeenAt: '2026-07-01T14:20:00' },
      { id: 'sig-4', signal: '«ма»', kind: 'word', possibleMeaning: 'мама / помощь', confidence: 0.93, confirmedCount: 30, lastSeenAt: '2026-07-01T09:00:00' },
      { id: 'sig-5', signal: 'тянет за руку', kind: 'gesture', possibleMeaning: 'хочет показать', confidence: 0.78, confirmedCount: 9, lastSeenAt: '2026-07-01T12:00:00' },
    ],
  },
  {
    id: 'child-mira',
    name: 'Демо-профиль 2',
    age: 5,
    diagnosisLabel: 'РАС',
    currentState: 'активная',
    avatar: '2',
    mainSignals: [
      { id: 'sig-m1', signal: 'хлопает в ладоши', kind: 'behavior', possibleMeaning: 'радость / волнение', confidence: 0.75, confirmedCount: 6, lastSeenAt: '2026-06-30T15:00:00' },
      { id: 'sig-m2', signal: 'указывает пальцем', kind: 'gesture', possibleMeaning: 'хочет предмет', confidence: 0.88, confirmedCount: 11, lastSeenAt: '2026-07-01T10:00:00' },
      { id: 'sig-m3', signal: 'избегает зрительный контакт', kind: 'behavior', possibleMeaning: 'перегрузка', confidence: 0.80, confirmedCount: 7, lastSeenAt: '2026-06-29T11:30:00' },
    ],
  },
  {
    id: 'child-timur',
    name: 'Демо-профиль 3',
    age: 9,
    diagnosisLabel: 'РАС',
    currentState: 'сфокусирован',
    avatar: '3',
    mainSignals: [
      { id: 'sig-t1', signal: 'стереотипные движения', kind: 'behavior', possibleMeaning: 'саморегуляция', confidence: 0.70, confirmedCount: 5, lastSeenAt: '2026-06-28T16:00:00' },
      { id: 'sig-t2', signal: 'использует планшет', kind: 'aac', possibleMeaning: 'коммуникация через AAC', confidence: 0.92, confirmedCount: 15, lastSeenAt: '2026-07-01T11:00:00' },
      { id: 'sig-t3', signal: '«да/нет» жестом', kind: 'gesture', possibleMeaning: 'согласие / отказ', confidence: 0.95, confirmedCount: 24, lastSeenAt: '2026-07-01T13:30:00' },
    ],
  },
];

export const getDemoChild = (id: string): ChildProfile | undefined =>
  DEMO_CHILDREN.find((c) => c.id === id);

// =====================================================================
// FAMILY OVERRIDE (pilot) — реальная семья вводит имя своего ребёнка один
// раз при настройке; оно подменяет "Демо-профиль 1" здесь, при инициализации
// модуля, поэтому все места в коде, читающие DEMO_PRIMARY_CHILD.name,
// получают реальное имя без единой правки в них. id остаётся прежним
// ('child-alikhan') — это по-прежнему единственный ребёнок на устройство,
// просто с настоящим именем вместо демо-плейсхолдера.
// =====================================================================
const FAMILY_CHILD_NAME_KEY = 'qoldau-family-child-name-v1';

export function getFamilyChildName(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(FAMILY_CHILD_NAME_KEY);
}

export function setFamilyChildName(name: string): void {
  const trimmed = name.trim();
  if (!trimmed) return;
  localStorage.setItem(FAMILY_CHILD_NAME_KEY, trimmed);
}

export function clearFamilyChildName(): void {
  localStorage.removeItem(FAMILY_CHILD_NAME_KEY);
}

const familyChildName = getFamilyChildName();
if (familyChildName) {
  DEMO_CHILDREN[0] = { ...DEMO_CHILDREN[0], name: familyChildName };
}

export const DEMO_PRIMARY_CHILD = DEMO_CHILDREN[0];

// =====================================================================
// PARENTS
// =====================================================================

export interface ParentProfile {
  id: string;
  name: string;
  role: 'mother' | 'father' | 'guardian';
  childId: string;
  preferences: {
    notifyOnAAC: boolean;
    notifyOnSOS: boolean;
    notifyOnTutorReport: boolean;
    voiceOnly: boolean;
  };
  lastAction: string;
  lastActionAt: string;
}

export const DEMO_PARENTS: ParentProfile[] = [
  {
    id: 'parent-mother',
    name: 'Мама — Алия',
    role: 'mother',
    childId: 'child-alikhan',
    preferences: { notifyOnAAC: true, notifyOnSOS: true, notifyOnTutorReport: true, voiceOnly: false },
    lastAction: 'Подтвердила наблюдение про обед',
    lastActionAt: '2026-07-01T10:32:00',
  },
  {
    id: 'parent-father',
    name: 'Папа — Арман',
    role: 'father',
    childId: 'child-alikhan',
    preferences: { notifyOnAAC: true, notifyOnSOS: true, notifyOnTutorReport: false, voiceOnly: false },
    lastAction: 'Смотрел отчёт тьютора',
    lastActionAt: '2026-06-30T18:00:00',
  },
];

// =====================================================================
// TUTORS
// =====================================================================

export interface TutorProfile {
  id: string;
  name: string;
  childIds: string[];
  scheduleToday: string;
  recentObservation: string;
  recentObservationAt: string;
}

export const DEMO_TUTORS: TutorProfile[] = [
  {
    id: 'tutor-aidana',
    name: 'Айдана',
    childIds: ['child-alikhan', 'child-mira'],
    scheduleToday: 'Сегодня: 10:00–15:00, занятие + обед',
    recentObservation: 'Пауза помогла при переходе к новой активности',
    recentObservationAt: '2026-07-01T11:45:00',
  },
  {
    id: 'tutor-bolat',
    name: 'Болат',
    childIds: ['child-timur'],
    scheduleToday: 'Сегодня: 13:00–17:00, проектная работа',
    recentObservation: 'Использовал визуальное расписание самостоятельно',
    recentObservationAt: '2026-06-30T15:00:00',
  },
];

// =====================================================================
// SPECIALISTS
// =====================================================================

export interface SpecialistProfile {
  id: string;
  name: string;
  specialty: string;
  childIds: string[];
}

export const DEMO_SPECIALISTS: SpecialistProfile[] = [
  {
    id: 'specialist-comm',
    name: 'Айгерим',
    specialty: 'Специалист по коммуникации',
    childIds: ['child-alikhan', 'child-mira', 'child-timur'],
  },
  {
    id: 'specialist-supervisor',
    name: 'Дария',
    specialty: 'Супервизор / психолог',
    childIds: ['child-alikhan', 'child-mira'],
  },
];

// =====================================================================
// EVENTS — 60+ событий за 7 дней для Алихана
// =====================================================================

const alikhan = 'child-alikhan';

// Helper для генерации ISO timestamp
const iso = (day: number, hour: number, minute: number): string => {
  // 2026-06-25 (чт) ... 2026-07-01 (ср) — 7 дней
  const dates = [
    '2026-06-25', // чт
    '2026-06-26', // пт
    '2026-06-27', // сб
    '2026-06-28', // вс
    '2026-06-29', // пн
    '2026-06-30', // вт
    '2026-07-01', // ср (сегодня)
  ];
  return `${dates[day]}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
};

interface SeedEvent {
  id: string;
  day: number;
  hour: number;
  minute: number;
  type: EventType;
  title: string;
  description: string;
  sourceRole: QoldauEvent['sourceRole'];
  status?: EventStatus;
  confidence?: number;
  rawText?: string;
  linkedEventIds?: string[];
  tags?: string[];
  payload?: Record<string, unknown>;
}

const SEED: SeedEvent[] = [
  // ============ ДЕНЬ 1 (чт, 2026-06-25) ============
  { id: 'evt-25-1', day: 0, hour: 8, minute: 10, type: 'sleep', title: 'Пробуждение', description: 'Проснулся спокойно, без слёз', sourceRole: 'parent', status: 'confirmed', tags: ['утро'] },
  { id: 'evt-25-2', day: 0, hour: 8, minute: 30, type: 'food', title: 'Завтрак', description: 'Каша с бананом, стакан воды', sourceRole: 'parent', status: 'confirmed', tags: ['завтрак'] },
  { id: 'evt-25-3', day: 0, hour: 9, minute: 5, type: 'communication', title: 'Коммуникация', description: 'Сказал «ма» при входе мамы', sourceRole: 'parent', status: 'confirmed' },
  { id: 'evt-25-4', day: 0, hour: 10, minute: 30, type: 'aac_card', title: 'AAC: Хочу играть', description: 'Нажал карточку «Играть»', sourceRole: 'child', status: 'confirmed' },
  { id: 'evt-25-5', day: 0, hour: 13, minute: 0, type: 'food', title: 'Обед', description: 'Суп, хлеб, компот', sourceRole: 'parent', status: 'confirmed', tags: ['обед'] },
  { id: 'evt-25-6', day: 0, hour: 14, minute: 30, type: 'toilet', title: 'Туалет', description: 'Сходил по-большому', sourceRole: 'parent', status: 'confirmed' },
  { id: 'evt-25-7', day: 0, hour: 17, minute: 0, type: 'sensory', title: 'Сенсорная реакция', description: 'Закрывал уши при включённом телевизоре', sourceRole: 'parent', status: 'confirmed', tags: ['шум'] },

  // ============ ДЕНЬ 2 (пт, 2026-06-26) ============
  { id: 'evt-26-1', day: 1, hour: 8, minute: 0, type: 'sleep', title: 'Пробуждение', description: 'Проснулся, потянулся', sourceRole: 'parent', status: 'confirmed' },
  { id: 'evt-26-2', day: 1, hour: 9, minute: 30, type: 'voice_observation', title: 'Голосовое наблюдение', description: 'Мама наговорила: «Утром съел кашу, потом сам пошёл к полке с карточками»', sourceRole: 'parent', status: 'confirmed', confidence: 0.85, rawText: 'Утром съел кашу, потом сам пошёл к полке с карточками' },
  { id: 'evt-26-3', day: 1, hour: 9, minute: 35, type: 'food', title: 'Завтрак', description: 'Каша овсяная с маслом', sourceRole: 'parent', status: 'confirmed', linkedEventIds: ['evt-26-2'] },
  { id: 'evt-26-4', day: 1, hour: 11, minute: 15, type: 'communication', title: 'Звук «ту-ту»', description: 'Сказал «ту-ту» и потянулся к двери', sourceRole: 'parent', status: 'confirmed' },
  { id: 'evt-26-5', day: 1, hour: 11, minute: 20, type: 'toilet', title: 'Туалет', description: 'Сходил в туалет', sourceRole: 'parent', status: 'confirmed', linkedEventIds: ['evt-26-4'] },
  { id: 'evt-26-6', day: 1, hour: 14, minute: 0, type: 'behavior', title: 'Поведение', description: 'Наблюдалась нервозность при переходе к новой активности', sourceRole: 'tutor', status: 'confirmed', tags: ['переход'] },
  { id: 'evt-26-7', day: 1, hour: 14, minute: 5, type: 'calm_mode', title: 'Спокойный режим', description: 'Запустил Calm Mode, дышал 2 минуты', sourceRole: 'child', status: 'confirmed', linkedEventIds: ['evt-26-6'] },
  { id: 'evt-26-8', day: 1, hour: 14, minute: 15, type: 'state', title: 'Состояние', description: 'Стало спокойнее, продолжил занятие', sourceRole: 'tutor', status: 'confirmed', linkedEventIds: ['evt-26-7'] },
  { id: 'evt-26-9', day: 1, hour: 15, minute: 30, type: 'tutor_note', title: 'Заметка тьютора', description: 'Похоже, помогла короткая пауза. Стоит попробовать визуальное расписание переходов.', sourceRole: 'tutor', status: 'confirmed' },

  // ============ ДЕНЬ 3 (сб, 2026-06-27) ============
  { id: 'evt-27-1', day: 2, hour: 9, minute: 0, type: 'food', title: 'Завтрак', description: 'Блинчики с творогом', sourceRole: 'parent', status: 'confirmed' },
  { id: 'evt-27-2', day: 2, hour: 10, minute: 30, type: 'media_request', title: 'Мультик', description: 'Ребёнок выбрал мультик «Маша и Медведь»', sourceRole: 'child', status: 'confirmed' },
  { id: 'evt-27-3', day: 2, hour: 12, minute: 0, type: 'food', title: 'Обед', description: 'Плов, чай', sourceRole: 'parent', status: 'confirmed' },
  { id: 'evt-27-4', day: 2, hour: 13, minute: 30, type: 'water', title: 'Вода', description: 'Выпил стакан воды, попросил сам знаком «ва»', sourceRole: 'parent', status: 'confirmed' },
  { id: 'evt-27-5', day: 2, hour: 15, minute: 0, type: 'aac_card', title: 'AAC: Помощь', description: 'Нажал карточку «Помощь»', sourceRole: 'child', status: 'confirmed' },
  { id: 'evt-27-6', day: 2, hour: 17, minute: 0, type: 'sensory', title: 'Сенсорная реакция', description: 'Закрывал уши при громкой музыке у соседей', sourceRole: 'parent', status: 'confirmed', tags: ['шум'] },
  { id: 'evt-27-7', day: 2, hour: 17, minute: 10, type: 'calm_mode', title: 'Спокойный режим', description: 'Включил тихую музыку', sourceRole: 'parent', status: 'confirmed', linkedEventIds: ['evt-27-6'] },

  // ============ ДЕНЬ 4 (вс, 2026-06-28) ============
  { id: 'evt-28-1', day: 3, hour: 9, minute: 0, type: 'sleep', title: 'Пробуждение', description: 'Спал хорошо, проснулся сам', sourceRole: 'parent', status: 'confirmed' },
  { id: 'evt-28-2', day: 3, hour: 10, minute: 30, type: 'aac_card', title: 'AAC: Туалет', description: 'Сам нажал карточку «Туалет»', sourceRole: 'child', status: 'confirmed' },
  { id: 'evt-28-3', day: 3, hour: 10, minute: 35, type: 'toilet', title: 'Туалет', description: 'Сходил в туалет, стул нормальный', sourceRole: 'parent', status: 'confirmed', linkedEventIds: ['evt-28-2'] },
  { id: 'evt-28-4', day: 3, hour: 12, minute: 0, type: 'food', title: 'Обед', description: 'Макароны с котлетой', sourceRole: 'parent', status: 'confirmed' },
  { id: 'evt-28-5', day: 3, hour: 14, minute: 0, type: 'phrase', title: 'Фраза: «Я хочу пить»', description: 'Собрал фразу «Я хочу пить»', sourceRole: 'child', status: 'confirmed' },
  { id: 'evt-28-6', day: 3, hour: 14, minute: 5, type: 'water', title: 'Вода', description: 'Получил воду', sourceRole: 'parent', status: 'confirmed', linkedEventIds: ['evt-28-5'] },
  { id: 'evt-28-7', day: 3, hour: 16, minute: 0, type: 'behavior', title: 'Поведение', description: 'Закрывал уши на улице', sourceRole: 'parent', status: 'confirmed', tags: ['шум'] },

  // ============ ДЕНЬ 5 (пн, 2026-06-29) ============
  { id: 'evt-29-1', day: 4, hour: 8, minute: 30, type: 'food', title: 'Завтрак', description: 'Каша рисовая', sourceRole: 'parent', status: 'confirmed' },
  { id: 'evt-29-2', day: 4, hour: 10, minute: 0, type: 'tutor_note', title: 'Заметка тьютора', description: 'Сегодня использовал визуальное расписание самостоятельно, переходы прошли спокойнее', sourceRole: 'tutor', status: 'confirmed' },
  { id: 'evt-29-3', day: 4, hour: 11, minute: 30, type: 'communication', title: 'Звук «ва»', description: 'Произнёс «ва» при виде бутылки', sourceRole: 'tutor', status: 'confirmed' },
  { id: 'evt-29-4', day: 4, hour: 11, minute: 35, type: 'water', title: 'Вода', description: 'Дали воду', sourceRole: 'tutor', status: 'confirmed', linkedEventIds: ['evt-29-3'] },
  { id: 'evt-29-5', day: 4, hour: 13, minute: 0, type: 'food', title: 'Обед', description: 'Гречка с тефтелями, компот', sourceRole: 'parent', status: 'confirmed' },
  { id: 'evt-29-6', day: 4, hour: 15, minute: 0, type: 'sensory', title: 'Сенсорная реакция', description: 'Закрывал уши при включении пылесоса', sourceRole: 'parent', status: 'confirmed', tags: ['шум'] },
  { id: 'evt-29-7', day: 4, hour: 15, minute: 5, type: 'calm_mode', title: 'Спокойный режим', description: 'Включил наушники с тихой музыкой', sourceRole: 'parent', status: 'confirmed', linkedEventIds: ['evt-29-6'] },

  // ============ ДЕНЬ 6 (вт, 2026-06-30) ============
  { id: 'evt-30-1', day: 5, hour: 8, minute: 30, type: 'food', title: 'Завтрак', description: 'Омлет с сыром', sourceRole: 'parent', status: 'confirmed' },
  { id: 'evt-30-2', day: 5, hour: 10, minute: 0, type: 'voice_observation', title: 'Голосовое наблюдение', description: 'Мама: «Поел омлет, попросил воду, играл с конструктором»', sourceRole: 'parent', status: 'confirmed', confidence: 0.88, rawText: 'Поел омлет, попросил воду, играл с конструктором' },
  { id: 'evt-30-3', day: 5, hour: 11, minute: 30, type: 'aac_card', title: 'AAC: Домой', description: 'Нажал карточку «Домой»', sourceRole: 'child', status: 'confirmed' },
  { id: 'evt-30-4', day: 5, hour: 12, minute: 0, type: 'food', title: 'Обед', description: 'Суп куриный, хлеб', sourceRole: 'parent', status: 'confirmed' },
  { id: 'evt-30-5', day: 5, hour: 13, minute: 30, type: 'toilet', title: 'Туалет', description: 'Сходил в туалет', sourceRole: 'parent', status: 'confirmed' },
  { id: 'evt-30-6', day: 5, hour: 15, minute: 0, type: 'sos', title: 'SOS: позвал маму', description: 'Нажал кнопку «SOS», мама пришла через 30 секунд', sourceRole: 'child', status: 'confirmed' },
  { id: 'evt-30-7', day: 5, hour: 17, minute: 0, type: 'media_request', title: 'Мультик', description: 'Запросил «Машу и Медведь»', sourceRole: 'child', status: 'confirmed' },

  // ============ ДЕНЬ 7 (ср, 2026-07-01, сегодня) ============
  { id: 'evt-1-1', day: 6, hour: 8, minute: 0, type: 'sleep', title: 'Пробуждение', description: 'Проснулся в хорошем настроении', sourceRole: 'parent', status: 'confirmed' },
  { id: 'evt-1-2', day: 6, hour: 8, minute: 30, type: 'food', title: 'Завтрак', description: 'Каша с сыром, немного воды', sourceRole: 'parent', status: 'confirmed' },
  { id: 'evt-1-3', day: 6, hour: 9, minute: 0, type: 'communication', title: 'Звук «ма»', description: 'Сказал «ма» при пробуждении', sourceRole: 'parent', status: 'confirmed' },
  { id: 'evt-1-4', day: 6, hour: 9, minute: 30, type: 'aac_card', title: 'AAC: Хочу играть', description: 'Нажал карточку «Играть»', sourceRole: 'child', status: 'confirmed' },
  { id: 'evt-1-5', day: 6, hour: 10, minute: 30, type: 'voice_observation', title: 'Голосовое наблюдение', description: 'Мама: «Он поел кашу с сыром, потом нервничал, закрывал уши, сходил в туалет»', sourceRole: 'parent', status: 'confirmed', confidence: 0.85, rawText: 'Он поел кашу с сыром, потом нервничал, закрывал уши, сходил в туалет', tags: ['демо'], payload: { clarifyingAnswers: { 'water-amount': 'Нормально', 'toilet-better': 'Да', 'noise-around': 'Да' }, aiInsight: 'Похоже, нервозность появилась после еды. Возможна связь с сенсорной нагрузкой. Это наблюдение, не диагноз.', source: 'voice_observation' } },
  { id: 'evt-1-6', day: 6, hour: 10, minute: 32, type: 'food', title: 'Питание', description: 'Каша с сыром', sourceRole: 'parent', status: 'confirmed', linkedEventIds: ['evt-1-5'] },
  { id: 'evt-1-7', day: 6, hour: 10, minute: 35, type: 'behavior', title: 'Поведение', description: 'Наблюдалась нервозность', sourceRole: 'parent', status: 'confirmed', linkedEventIds: ['evt-1-5'] },
  { id: 'evt-1-8', day: 6, hour: 10, minute: 38, type: 'communication', title: 'Звук «ту-ту»', description: 'Сказал «ту-ту»', sourceRole: 'parent', status: 'confirmed', linkedEventIds: ['evt-1-5'] },
  { id: 'evt-1-9', day: 6, hour: 10, minute: 40, type: 'toilet', title: 'Туалет', description: 'Стул жидкий', sourceRole: 'parent', status: 'confirmed', linkedEventIds: ['evt-1-5', 'evt-1-8'] },
  { id: 'evt-1-10', day: 6, hour: 11, minute: 15, type: 'aac_card', title: 'AAC: Вода', description: 'Нажал карточку «Хочу пить»', sourceRole: 'child', status: 'confirmed' },
  { id: 'evt-1-11', day: 6, hour: 11, minute: 30, type: 'communication', title: 'Звук «ва»', description: 'Сказал «ва», глядя на бутылку', sourceRole: 'parent', status: 'confirmed' },
  { id: 'evt-1-12', day: 6, hour: 14, minute: 0, type: 'tutor_note', title: 'Заметка тьютора', description: 'На занятии использовал визуальное расписание. Пауза помогла при переходе к новой активности.', sourceRole: 'tutor', status: 'confirmed' },
  { id: 'evt-1-13', day: 6, hour: 14, minute: 20, type: 'sensory', title: 'Сенсорная реакция', description: 'Закрывал уши при громкой музыке в группе', sourceRole: 'tutor', status: 'confirmed', tags: ['шум'] },
  { id: 'evt-1-14', day: 6, hour: 14, minute: 25, type: 'calm_mode', title: 'Спокойный режим', description: 'Запустил Calm Mode, использовал наушники', sourceRole: 'tutor', status: 'confirmed', linkedEventIds: ['evt-1-13'] },
  { id: 'evt-1-15', day: 6, hour: 15, minute: 0, type: 'specialist_note', title: 'Заметка специалиста', description: 'Похоже, ребёнок хорошо реагирует на короткие паузы и визуальные подсказки. Стоит продолжать использовать в ежедневной рутине.', sourceRole: 'specialist', status: 'confirmed' },
  { id: 'evt-1-16', day: 6, hour: 15, minute: 30, type: 'phrase', title: 'Фраза: «Я хочу есть»', description: 'Собрал фразу «Я хочу есть»', sourceRole: 'child', status: 'confirmed' },
];

// Build DEMO_EVENTS — события только для primary child
export const DEMO_EVENTS: QoldauEvent[] = SEED.map((s) => ({
  id: s.id,
  childId: alikhan,
  type: s.type,
  title: s.title,
  description: s.description,
  timestamp: iso(s.day, s.hour, s.minute),
  sourceRole: s.sourceRole,
  status: s.status ?? 'confirmed',
  confidence: s.confidence,
  rawText: s.rawText,
  linkedEventIds: s.linkedEventIds,
  tags: s.tags,
  payload: s.payload,
}));

// =====================================================================
// Helpers
// =====================================================================

/**
 * Сводка по дням для карточки ребёнка / отчёта.
 */
export function getDemoTimelineSummary(childId: string) {
  const childEvents = DEMO_EVENTS.filter((e) => e.childId === childId);
  return {
    total: childEvents.length,
    byType: {
      food: childEvents.filter((e) => e.type === 'food').length,
      water: childEvents.filter((e) => e.type === 'water').length,
      toilet: childEvents.filter((e) => e.type === 'toilet').length,
      sleep: childEvents.filter((e) => e.type === 'sleep').length,
      behavior: childEvents.filter((e) => e.type === 'behavior').length,
      sensory: childEvents.filter((e) => e.type === 'sensory').length,
      communication: childEvents.filter((e) => e.type === 'communication').length,
      aac_card: childEvents.filter((e) => e.type === 'aac_card').length,
      calm_mode: childEvents.filter((e) => e.type === 'calm_mode').length,
      tutor_note: childEvents.filter((e) => e.type === 'tutor_note').length,
      voice_observation: childEvents.filter((e) => e.type === 'voice_observation').length,
      phrase: childEvents.filter((e) => e.type === 'phrase').length,
      sos: childEvents.filter((e) => e.type === 'sos').length,
      media_request: childEvents.filter((e) => e.type === 'media_request').length,
    },
  };
}

export function getDemoCommunicationProfile(childId: string): Signal[] {
  const child = getDemoChild(childId);
  return child?.mainSignals ?? [];
}

export function getDemoEventsByChild(childId: string): QoldauEvent[] {
  return DEMO_EVENTS.filter((e) => e.childId === childId);
}

export function getDemoTutorReport(childId: string) {
  const child = getDemoChild(childId);
  const events = getDemoEventsByChild(childId)
    .filter((e) => e.sourceRole === 'tutor')
    .slice(-5);
  return {
    child,
    events,
    summary: 'Похоже, ребёнок хорошо реагирует на визуальные подсказки и короткие паузы. Это наблюдение, не диагноз. Можно обсудить со специалистом.',
  };
}

export function getDemoSpecialistSummary(childId: string) {
  const child = getDemoChild(childId);
  const events = getDemoEventsByChild(childId);
  const summary = getDemoTimelineSummary(childId);
  return {
    child,
    events,
    summary,
    aiInsight: 'Похоже, в последние дни ребёнок активнее использовал коммуникацию и AAC. Это наблюдение, не диагноз. Нужно подтвердить.',
  };
}

/**
 * Добавляет demo events в стор, если их ещё нет (по id).
 */
export function seedDemoEvents(events: QoldauEvent[]): QoldauEvent[] {
  const existingIds = new Set(events.map((e) => e.id));
  const toAdd = DEMO_EVENTS.filter((e) => !existingIds.has(e.id));
  if (toAdd.length === 0) return events;
  return [...toAdd, ...events];
}

export function resetDemoData(): QoldauEvent[] {
  return [...DEMO_EVENTS];
}

export const DEMO_PRIMARY_CHILD_ID = alikhan;