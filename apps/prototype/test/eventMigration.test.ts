/**
 * Тесты миграции QoldauEvent v2 → v3 (BATCH A — schema formalization).
 *
 * Контракт:
 *   - Старые события без schemaVersion/occurredAt/recordedAt/source получают
 *     дефолты на основе timestamp и sourceRole.
 *   - sourceRole 'child' → source 'child_ui'.
 *   - sourceRole 'ai' / voice_observation → source 'voice'.
 *   - Остальные → source 'manual'.
 *   - Старые данные НЕ теряются и НЕ дублируются: id/title/description и
 *     прочие поля сохраняются как есть.
 */
import { describe, it, expect } from 'vitest';
import { migrateEvent, defaultSourceFromRole } from '@/store/useEventStore';

describe('event migration v2 → v3', () => {
  it('adds schemaVersion=3, occurredAt/recordedAt/timestamp preserved', () => {
    const old = {
      id: 'evt-1',
      childId: 'child-alikhan',
      type: 'food',
      title: 'Завтрак',
      description: 'Каша',
      timestamp: '2026-07-01T08:30:00',
      sourceRole: 'parent',
      status: 'confirmed',
    } as unknown as Record<string, unknown>;
    const migrated = migrateEvent(old);
    expect(migrated.id).toBe('evt-1');
    expect(migrated.title).toBe('Завтрак');
    expect(migrated.description).toBe('Каша');
    expect(migrated.timestamp).toBe('2026-07-01T08:30:00');
    expect(migrated.occurredAt).toBe('2026-07-01T08:30:00');
    expect(migrated.recordedAt).toBe('2026-07-01T08:30:00');
    expect(migrated.schemaVersion).toBe(3);
    expect(migrated.source).toBe('manual');
  });

  it('sourceRole "child" → source "child_ui"', () => {
    const old = {
      id: 'evt-2',
      childId: 'c1',
      type: 'aac_card',
      title: 'AAC',
      description: '...',
      timestamp: '2026-07-01T10:00:00',
      sourceRole: 'child',
      status: 'confirmed',
    };
    const migrated = migrateEvent(old);
    expect(migrated.source).toBe('child_ui');
  });

  it('sourceRole "ai" → source "voice"', () => {
    const old = {
      id: 'evt-3',
      childId: 'c1',
      type: 'voice_observation',
      title: 'Voice',
      description: '...',
      timestamp: '2026-07-01T10:00:00',
      sourceRole: 'ai',
      status: 'confirmed',
    };
    const migrated = migrateEvent(old);
    expect(migrated.source).toBe('voice');
  });

  it('missing timestamp → uses Date.now()', () => {
    const old = {
      id: 'evt-4',
      childId: 'c1',
      type: 'food',
      title: 'X',
      description: '...',
      sourceRole: 'parent',
      status: 'confirmed',
    };
    const migrated = migrateEvent(old);
    expect(migrated.timestamp).toBeTruthy();
    expect(migrated.occurredAt).toBeTruthy();
    expect(migrated.recordedAt).toBeTruthy();
    expect(migrated.schemaVersion).toBe(3);
  });

  it('preserves extra fields (linkedEventIds, payload)', () => {
    const old = {
      id: 'evt-5',
      childId: 'c1',
      type: 'behavior',
      title: 'Behavior',
      description: '...',
      timestamp: '2026-07-01T11:00:00',
      sourceRole: 'parent',
      status: 'confirmed',
      linkedEventIds: ['evt-3', 'evt-4'],
      payload: { foo: 'bar' },
    };
    const migrated = migrateEvent(old);
    expect(migrated.linkedEventIds).toEqual(['evt-3', 'evt-4']);
    expect((migrated.payload as Record<string, unknown>).foo).toBe('bar');
  });

  it('preserves existing schemaVersion if it was 3+', () => {
    const old = {
      id: 'evt-6',
      childId: 'c1',
      type: 'food',
      title: 'X',
      description: '...',
      timestamp: '2026-07-01T12:00:00',
      sourceRole: 'parent',
      status: 'confirmed',
      schemaVersion: 3,
      occurredAt: '2026-07-01T11:55:00',
      source: 'voice',
    };
    const migrated = migrateEvent(old);
    expect(migrated.schemaVersion).toBe(3);
    expect(migrated.occurredAt).toBe('2026-07-01T11:55:00');
    expect(migrated.source).toBe('voice');
  });
});

describe('defaultSourceFromRole helper', () => {
  it('child → child_ui', () => {
    expect(defaultSourceFromRole('child')).toBe('child_ui');
  });
  it('ai → voice', () => {
    expect(defaultSourceFromRole('ai')).toBe('voice');
  });
  it('parent → manual', () => {
    expect(defaultSourceFromRole('parent')).toBe('manual');
  });
  it('tutor → manual', () => {
    expect(defaultSourceFromRole('tutor')).toBe('manual');
  });
  it('specialist → manual', () => {
    expect(defaultSourceFromRole('specialist')).toBe('manual');
  });
  it('undefined → manual', () => {
    expect(defaultSourceFromRole(undefined)).toBe('manual');
  });
});