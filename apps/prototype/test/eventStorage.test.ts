/**
 * Тесты EventStorage — интерфейс чтения/записи событий (BATCH B).
 *
 * Контракт:
 *   - getAll() возвращает все не-удалённые события
 *   - query() фильтрует по childId / types / since / until / limit
 *   - since/until сравниваются с occurredAt (v3), fallback на timestamp
 *   - soft-delete (remove) НЕ удаляет из стора, но скрывает в query/getAll
 *   - put/putMany делают upsert, без дублей
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useEventStore } from '@/store/useEventStore';
import { eventStorage } from '@/lib/storage/eventStorage';

describe('EventStorage — query/getAll', () => {
  beforeEach(() => {
    localStorage.clear();
    useEventStore.setState({
      events: [],
      clarifyingAnswers: {},
      apiMode: false,
    });
  });

  it('getAll() returns all non-deleted events', () => {
    useEventStore.getState().addEvent({
      type: 'food',
      title: 'X',
      description: '...',
      childId: 'c1',
      sourceRole: 'parent',
    });
    expect(eventStorage.getAll().length).toBe(1);
  });

  it('query({ childId }) фильтрует по childId', () => {
    useEventStore.getState().addEvent({
      type: 'food',
      title: 'A',
      description: '...',
      childId: 'c1',
      sourceRole: 'parent',
    });
    useEventStore.getState().addEvent({
      type: 'food',
      title: 'B',
      description: '...',
      childId: 'c2',
      sourceRole: 'parent',
    });
    const out = eventStorage.query({ childId: 'c1' });
    expect(out.length).toBe(1);
    expect(out[0].childId).toBe('c1');
  });

  it('query({ types }) фильтрует по типам', () => {
    useEventStore.getState().addEvent({
      type: 'food',
      title: 'A',
      description: '...',
      childId: 'c1',
      sourceRole: 'parent',
    });
    useEventStore.getState().addEvent({
      type: 'water',
      title: 'B',
      description: '...',
      childId: 'c1',
      sourceRole: 'parent',
    });
    const out = eventStorage.query({ types: ['food'] });
    expect(out.length).toBe(1);
    expect(out[0].type).toBe('food');
  });

  it('query({ since, until }) фильтрует по occurredAt-диапазону', () => {
    const old = '2026-01-01T10:00:00.000Z';
    const middle = '2026-02-01T10:00:00.000Z';
    const recent = '2026-03-01T10:00:00.000Z';
    useEventStore.getState().addEvents([
      {
        type: 'food',
        title: 'old',
        description: '...',
        childId: 'c1',
        occurredAt: old,
        recordedAt: old,
        timestamp: old,
        source: 'manual',
        sourceRole: 'parent',
        schemaVersion: 3,
      },
      {
        type: 'food',
        title: 'middle',
        description: '...',
        childId: 'c1',
        occurredAt: middle,
        recordedAt: middle,
        timestamp: middle,
        source: 'manual',
        sourceRole: 'parent',
        schemaVersion: 3,
      },
      {
        type: 'food',
        title: 'recent',
        description: '...',
        childId: 'c1',
        occurredAt: recent,
        recordedAt: recent,
        timestamp: recent,
        source: 'manual',
        sourceRole: 'parent',
        schemaVersion: 3,
      },
    ]);
    // since = 2026-01-15, until = 2026-02-15 — только middle.
    const out = eventStorage.query({
      since: '2026-01-15T00:00:00.000Z',
      until: '2026-02-15T00:00:00.000Z',
    });
    expect(out.length).toBe(1);
    expect(out[0].title).toBe('middle');
  });

  it('query({ limit }) возвращает top-N по recordedAt desc', () => {
    const t1 = '2026-01-01T10:00:00.000Z';
    const t2 = '2026-01-02T10:00:00.000Z';
    const t3 = '2026-01-03T10:00:00.000Z';
    useEventStore.getState().addEvents([
      {
        type: 'food',
        title: '1',
        description: '...',
        childId: 'c1',
        occurredAt: t1,
        recordedAt: t1,
        timestamp: t1,
        source: 'manual',
        sourceRole: 'parent',
        schemaVersion: 3,
      },
      {
        type: 'food',
        title: '2',
        description: '...',
        childId: 'c1',
        occurredAt: t2,
        recordedAt: t2,
        timestamp: t2,
        source: 'manual',
        sourceRole: 'parent',
        schemaVersion: 3,
      },
      {
        type: 'food',
        title: '3',
        description: '...',
        childId: 'c1',
        occurredAt: t3,
        recordedAt: t3,
        timestamp: t3,
        source: 'manual',
        sourceRole: 'parent',
        schemaVersion: 3,
      },
    ]);
    const out = eventStorage.query({ limit: 2 });
    expect(out.length).toBe(2);
    expect(out[0].title).toBe('3'); // самый свежий
    expect(out[1].title).toBe('2');
  });

  it('soft-delete (remove) скрывает событие в query', () => {
    const created = useEventStore.getState().addEvent({
      type: 'food',
      title: 'X',
      description: '...',
      childId: 'c1',
      sourceRole: 'parent',
    });
    expect(eventStorage.getAll().length).toBe(1);
    eventStorage.remove(created.id);
    // После soft-delete query/getAll НЕ возвращает событие.
    expect(eventStorage.getAll().length).toBe(0);
    expect(eventStorage.query().length).toBe(0);
    // Но стор по-прежнему содержит событие (с deleted=true).
    const inStore = useEventStore.getState().events.find((e) => e.id === created.id);
    expect(inStore).toBeTruthy();
    expect(inStore?.deleted).toBe(true);
  });
});

describe('EventStorage — write API', () => {
  beforeEach(() => {
    localStorage.clear();
    useEventStore.setState({ events: [], clarifyingAnswers: {}, apiMode: false });
  });

  it('put() добавляет новое событие', () => {
    eventStorage.put({
      id: 'manual-1',
      childId: 'c1',
      type: 'food',
      title: 'Manual',
      description: '...',
      timestamp: '2026-07-01T08:00:00',
      occurredAt: '2026-07-01T08:00:00',
      recordedAt: '2026-07-01T08:00:00',
      source: 'manual',
      sourceRole: 'parent',
      status: 'confirmed',
      schemaVersion: 3,
    });
    expect(eventStorage.getAll().length).toBe(1);
    expect(eventStorage.getAll()[0].id).toBe('manual-1');
  });

  it('put() с тем же id — обновляет (upsert, без дублей)', () => {
    const e1 = {
      id: 'manual-2',
      childId: 'c1',
      type: 'food' as const,
      title: 'Old',
      description: '...',
      timestamp: '2026-07-01T08:00:00',
      occurredAt: '2026-07-01T08:00:00',
      recordedAt: '2026-07-01T08:00:00',
      source: 'manual' as const,
      sourceRole: 'parent' as const,
      status: 'confirmed' as const,
      schemaVersion: 3,
    };
    eventStorage.put(e1);
    eventStorage.put({ ...e1, title: 'New' });
    const all = eventStorage.getAll();
    expect(all.length).toBe(1);
    expect(all[0].title).toBe('New');
  });

  it('putMany() — батч-апсерт', () => {
    const batch = [
      {
        id: 'batch-1',
        childId: 'c1',
        type: 'food' as const,
        title: 'A',
        description: '...',
        timestamp: '2026-07-01T08:00:00',
        occurredAt: '2026-07-01T08:00:00',
        recordedAt: '2026-07-01T08:00:00',
        source: 'manual' as const,
        sourceRole: 'parent' as const,
        status: 'confirmed' as const,
        schemaVersion: 3,
      },
      {
        id: 'batch-2',
        childId: 'c1',
        type: 'water' as const,
        title: 'B',
        description: '...',
        timestamp: '2026-07-01T08:30:00',
        occurredAt: '2026-07-01T08:30:00',
        recordedAt: '2026-07-01T08:30:00',
        source: 'manual' as const,
        sourceRole: 'parent' as const,
        status: 'confirmed' as const,
        schemaVersion: 3,
      },
    ];
    eventStorage.putMany(batch);
    expect(eventStorage.getAll().length).toBe(2);
  });

  it('update() патчит поля', () => {
    const created = useEventStore.getState().addEvent({
      type: 'food',
      title: 'Before',
      description: '...',
      childId: 'c1',
      sourceRole: 'parent',
    });
    eventStorage.update(created.id, { title: 'After' });
    const e = eventStorage.getAll()[0];
    expect(e.title).toBe('After');
  });

  it('clear() стирает все события', () => {
    useEventStore.getState().addEvent({
      type: 'food',
      title: 'X',
      description: '...',
      childId: 'c1',
      sourceRole: 'parent',
    });
    eventStorage.clear();
    expect(eventStorage.getAll().length).toBe(0);
  });

  it('export() возвращает копию не-удалённых событий', () => {
    const created = useEventStore.getState().addEvent({
      type: 'food',
      title: 'X',
      description: '...',
      childId: 'c1',
      sourceRole: 'parent',
    });
    eventStorage.remove(created.id);
    expect(eventStorage.export().length).toBe(0);
  });
});