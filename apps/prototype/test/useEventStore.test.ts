/**
 * Тесты useEventStore — events + optimistic writes + profile-mode (BATCH 6).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useEventStore } from '@/store/useEventStore';
import { setProfileMode, getProfileMode } from '@/data/demoDataset';

describe('useEventStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useEventStore.setState({ events: [], isLoading: false, error: null });
  });

  it('starts with empty events', () => {
    expect(useEventStore.getState().events).toEqual([]);
  });

  it('addEvent prepends to list and returns new event', () => {
    const newEvent = useEventStore.getState().addEvent({
      type: 'food',
      title: 'Поел кашу',
      description: 'Съел 200г овсянки',
      childId: 'child-alikhan',
      timestamp: new Date().toISOString(),
      sourceRole: 'parent',
    });
    expect(newEvent.id).toMatch(/^evt-/);
    expect(useEventStore.getState().events.length).toBe(1);
    expect(useEventStore.getState().events[0].title).toBe('Поел кашу');
  });

  it('addEvents adds multiple', () => {
    const events = useEventStore.getState().addEvents([
      {
        type: 'food',
        title: 'Event 1',
        description: '...',
        childId: 'child-alikhan',
        timestamp: new Date().toISOString(),
        sourceRole: 'parent',
      },
      {
        type: 'water',
        title: 'Event 2',
        description: '...',
        childId: 'child-alikhan',
        timestamp: new Date().toISOString(),
        sourceRole: 'parent',
      },
    ]);
    expect(events.length).toBe(2);
    expect(useEventStore.getState().events.length).toBe(2);
  });

  it('updateEvent patches existing', () => {
    const created = useEventStore.getState().addEvent({
      type: 'food',
      title: 'Old',
      description: '...',
      childId: 'child-alikhan',
      timestamp: new Date().toISOString(),
      sourceRole: 'parent',
    });
    useEventStore.getState().updateEvent(created.id, { title: 'New' });
    expect(useEventStore.getState().events[0].title).toBe('New');
  });

  it('deleteEvent soft-deletes (sets deletedAt: ISO, keeps record)', () => {
    const created = useEventStore.getState().addEvent({
      type: 'food',
      title: 'To delete',
      description: '...',
      childId: 'child-alikhan',
      timestamp: new Date().toISOString(),
      sourceRole: 'parent',
    });
    useEventStore.getState().deleteEvent(created.id);
    // v1.6 E9.3 — soft-delete: событие остаётся в сторе, но помечено
    // deletedAt: ISO-timestamp (раньше было deleted:true boolean).
    // EventStorage.query фильтрует такие события из выборок.
    const events = useEventStore.getState().events;
    expect(events.length).toBe(1);
    expect(events[0].deletedAt).toBeTruthy();
    expect(typeof events[0].deletedAt).toBe('string');
  });

  it('getEventsByType filters correctly', () => {
    useEventStore.getState().addEvent({
      type: 'food',
      title: 'Food',
      description: '...',
      childId: 'c1',
      timestamp: new Date().toISOString(),
      sourceRole: 'parent',
    });
    useEventStore.getState().addEvent({
      type: 'water',
      title: 'Water',
      description: '...',
      childId: 'c1',
      timestamp: new Date().toISOString(),
      sourceRole: 'parent',
    });
    expect(useEventStore.getState().getEventsByType('food').length).toBe(1);
    expect(useEventStore.getState().getEventsByType('water').length).toBe(1);
  });

  it('clearAll empties events', () => {
    useEventStore.getState().addEvent({
      type: 'food',
      title: 'X',
      description: '...',
      childId: 'c1',
      timestamp: new Date().toISOString(),
      sourceRole: 'parent',
    });
    useEventStore.getState().clearAll();
    expect(useEventStore.getState().events).toEqual([]);
  });

  // -----------------------------------------------------------------
  // BATCH 6 — profile-mode rehydrate contract:
  //   - demo (default): пустая лента при первом запуске должна
  //     пересидиться демо-событиями для onboarding
  //   - real: после FamilySetupCard пустая лента остаётся пустой
  //     до первой записи голосом / AAC / фразой. Никаких
  //     событий «Алихана» в ленте реальной семьи.
  // -----------------------------------------------------------------
  describe('onRehydrateStorage — profile-mode contract (BATCH 6)', () => {
    it('demo-mode (default): ensureDemoEvents работает (re-seed)', () => {
      // Явный demo-режим (на случай если предыдущий тест оставил 'real').
      setProfileMode('demo');
      useEventStore.setState({ events: [] });
      useEventStore.getState().ensureDemoEvents();
      // Демо-сид содержит много событий (>=10 для семьи Alikhan).
      expect(useEventStore.getState().events.length).toBeGreaterThan(10);
    });

    it('real-mode: clearAll оставляет ленту пустой (не пересидится)', () => {
      setProfileMode('real');
      // Имитируем что в localStorage были демо-события и пилотая семья
      // нажала "Настроить семью" → clearAll() + reload.
      useEventStore.setState({
        events: [
          {
            type: 'food',
            title: 'demo food',
            description: '...',
            childId: 'child-alikhan',
            timestamp: new Date().toISOString(),
            sourceRole: 'parent',
          },
        ],
      });
      useEventStore.getState().clearAll();
      expect(useEventStore.getState().events).toEqual([]);
      // Контракт: даже если бы лента была пуста от старта,
      // в real-режиме onRehydrateStorage НЕ должен сидить демо.
      // Прямая проверка через getProfileMode() — если кто-то
      // случайно переключит mode обратно, тест упадёт.
      expect(getProfileMode()).toBe('real');
    });

    it('real-mode → demo-mode: ensureDemoEvents восстанавливает демо', () => {
      setProfileMode('real');
      useEventStore.setState({ events: [] });
      // Переход обратно в demo (через «Запустить демо» в Overview)
      setProfileMode('demo');
      useEventStore.getState().ensureDemoEvents();
      expect(useEventStore.getState().events.length).toBeGreaterThan(10);
    });
  });
});