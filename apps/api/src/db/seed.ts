/**
 * Seed logic for Qoldau AI API (v0.5.0).
 *
 * Создаёт 3 детей + 13 demo событий для Демо-профиль 1 при первом запуске.
 * v0.7.4: synthetic имена (Демо-профиль 1/2/3) вместо реальных.
 * Идемпотентно — если данные уже есть, не дублирует.
 *
 * Запуск:
 *   npm run seed          # standalone
 *   автоматически при start сервера
 */
import { prisma, disconnectPrisma } from './prisma.js';
import { childrenRepo } from '../repositories/children.js';
import { eventsRepo } from '../repositories/events.js';
import { getCache } from './cache.js';

export async function seed(): Promise<void> {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PROD_SEED !== 'true') {
    throw new Error('[seed] Refusing to seed production without ALLOW_PROD_SEED=true');
  }

  console.log('[seed] Starting...');

  // === Children ===
  console.log('[seed] Inserting children...');
  await childrenRepo.upsert({
    id: 'child-alikhan',
    name: 'Демо-профиль 1',
    age: 7,
    diagnosisLabel: 'РАС',
    currentState: 'спокойный',
    avatar: 'А',
  });
  await childrenRepo.upsert({
    id: 'child-mira',
    name: 'Демо-профиль 2',
    age: 5,
    diagnosisLabel: 'РАС',
    currentState: 'активная',
    avatar: 'М',
  });
  await childrenRepo.upsert({
    id: 'child-timur',
    name: 'Демо-профиль 3',
    age: 9,
    diagnosisLabel: 'РАС',
    currentState: 'сфокусирован',
    avatar: 'Т',
  });

  // === Privacy migration (v0.7.4) — synthetic имена в существующих данных ===
  // Если БД содержит старые имена (Алихан/Мира/Тимур, или "Ребёнок 1/2/3" из v0.7.3-v0.7.4 dev),
  // UPDATE на финальные "Демо-профиль 1/2/3".
  const nameMigrations: Array<{ from: string; to: string; id: string }> = [
    { id: 'child-alikhan', from: 'Алихан', to: 'Демо-профиль 1' },
    { id: 'child-mira', from: 'Мира', to: 'Демо-профиль 2' },
    { id: 'child-timur', from: 'Тимур', to: 'Демо-профиль 3' },
    { id: 'child-alikhan', from: 'Ребёнок 1', to: 'Демо-профиль 1' },
    { id: 'child-mira', from: 'Ребёнок 2', to: 'Демо-профиль 2' },
    { id: 'child-timur', from: 'Ребёнок 3', to: 'Демо-профиль 3' },
  ];
  for (const m of nameMigrations) {
    const existing = await prisma.child.findUnique({ where: { id: m.id } });
    if (existing && existing.name === m.from) {
      await prisma.child.update({ where: { id: m.id }, data: { name: m.to, avatar: m.to.replace('Демо-профиль ', '') } });
      console.log(`[seed] Migrated child ${m.id}: "${m.from}" → "${m.to}"`);
    }
  }

  // === Events (Демо-профиль 1, последние 4 дня) ===
  const eventCount = await eventsRepo.count();
  if (eventCount > 0) {
    console.log(`[seed] Events already exist (${eventCount}), skipping events seed`);
  } else {
        console.log('[seed] Inserting demo events for Демо-профиль 1...');
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const at = (offsetDays: number, hour: number, minute: number): Date => {
      const d = new Date(now - offsetDays * day);
      d.setHours(hour, minute, 0, 0);
      return d;
    };

    const events = [
      {
        childId: 'child-alikhan',
        type: 'water' as const,
        title: 'Выпил воду',
        description: '~150 мл',
        sourceRole: 'parent' as const,
        timestamp: at(0, 9, 0),
        payload: { amount: 150 },
      },
      {
        childId: 'child-alikhan',
        type: 'food' as const,
        title: 'Позавтракал',
        description: 'Каша с сыром',
        sourceRole: 'parent' as const,
        timestamp: at(0, 10, 30),
        payload: { meal: 'завтрак' },
      },
      {
        childId: 'child-alikhan',
        type: 'communication' as const,
        title: 'Сказал «ва»',
        description: 'Запрос воды. Подтверждено.',
        sourceRole: 'child' as const,
        timestamp: at(0, 11, 15),
        payload: { heard: 'ва', suggestion: 'вода' },
      },
      {
        childId: 'child-alikhan',
        type: 'sensory' as const,
        title: 'Закрывал уши',
        description: 'Шум в коридоре',
        sourceRole: 'tutor' as const,
        timestamp: at(0, 14, 20),
        payload: { trigger: 'шум' },
      },
      {
        childId: 'child-alikhan',
        type: 'aac_card' as const,
        title: '«ту-ту»',
        description: 'AAC карточка «туалет»',
        sourceRole: 'child' as const,
        timestamp: at(0, 16, 0),
      },
      {
        childId: 'child-alikhan',
        type: 'water' as const,
        title: 'Выпил воду',
        description: '~100 мл',
        sourceRole: 'parent' as const,
        timestamp: at(1, 9, 30),
      },
      {
        childId: 'child-alikhan',
        type: 'food' as const,
        title: 'Поел',
        description: 'Суп',
        sourceRole: 'tutor' as const,
        timestamp: at(1, 12, 0),
      },
      {
        childId: 'child-alikhan',
        type: 'behavior' as const,
        title: 'Плакал',
        description: 'Устал, просился отдыхать',
        sourceRole: 'tutor' as const,
        timestamp: at(1, 15, 30),
      },
      {
        childId: 'child-alikhan',
        type: 'calm_mode' as const,
        title: 'Спокойный режим',
        description: '2 минуты отдыха',
        sourceRole: 'child' as const,
        timestamp: at(1, 16, 0),
      },
      {
        childId: 'child-alikhan',
        type: 'toilet' as const,
        title: 'Сходил в туалет',
        description: 'Утро',
        sourceRole: 'parent' as const,
        timestamp: at(2, 10, 0),
      },
      {
        childId: 'child-alikhan',
        type: 'communication' as const,
        title: 'Использовал AAC «да»',
        description: 'Подтвердил желание гулять',
        sourceRole: 'child' as const,
        timestamp: at(2, 14, 0),
      },
      {
        childId: 'child-alikhan',
        type: 'food' as const,
        title: 'Позавтракал',
        description: 'Каша',
        sourceRole: 'parent' as const,
        timestamp: at(3, 9, 0),
      },
      {
        childId: 'child-alikhan',
        type: 'phrase' as const,
        title: 'Фраза: «Я хочу пить»',
        description: 'AAC фраза',
        sourceRole: 'child' as const,
        timestamp: at(3, 13, 0),
        payload: { phrase: 'Я хочу пить', source: 'phrase_builder' },
      },
    ];

    for (const evt of events) {
      await eventsRepo.create(evt);
    }
    console.log(`[seed] Created ${events.length} demo events`);
  }

  // Очищаем cache, чтобы новые данные были видны сразу
  await getCache().clear();

  const totalChildren = await prisma.child.count();
  const totalEvents = await eventsRepo.count();
  console.log(`[seed] Done. Children: ${totalChildren}, Events: ${totalEvents}`);
}

// Standalone CLI runner
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(async () => {
      await disconnectPrisma();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[seed] Failed:', err);
      await disconnectPrisma();
      process.exit(1);
    });
}
