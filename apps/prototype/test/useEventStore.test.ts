/**
 * Тесты useEventStore — events + optimistic writes.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useEventStore } from '@/store/useEventStore';

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

  it('deleteEvent removes from list', () => {
    const created = useEventStore.getState().addEvent({
      type: 'food',
      title: 'To delete',
      description: '...',
      childId: 'child-alikhan',
      timestamp: new Date().toISOString(),
      sourceRole: 'parent',
    });
    useEventStore.getState().deleteEvent(created.id);
    expect(useEventStore.getState().events).toEqual([]);
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
});