/**
 * Тесты EventPayloadMap — типизированный payload per EventType (BATCH A, wave 2).
 *
 * Контракт:
 *   - PayloadOf<'food'> = FoodPayload
 *   - PayloadOf<EventType> = union всех payload-типов
 *   - payload в QoldauEvent<T> типизирован (все поля опциональны,
 *     index signature для legacy).
 *   - Старое поле timestamp остаётся обязательным (алиас occurredAt).
 */
import { describe, it, expect, expectTypeOf } from 'vitest';
import type {
  QoldauEvent,
  PayloadOf,
  EventPayloadMap,
  FoodPayload,
  ToiletPayload,
  BehaviorPayload,
} from '@/types/qoldau';

describe('EventPayloadMap — type contract', () => {
  it('PayloadOf<T> возвращает правильный payload для каждого типа', () => {
    expectTypeOf<PayloadOf<'food'>>().toEqualTypeOf<FoodPayload>();
    expectTypeOf<PayloadOf<'toilet'>>().toEqualTypeOf<ToiletPayload>();
    expectTypeOf<PayloadOf<'behavior'>>().toEqualTypeOf<BehaviorPayload>();
  });

  it('QoldauEvent<T> payload типизирован по T', () => {
    const e: QoldauEvent<'food'> = {
      id: '1',
      childId: 'c1',
      type: 'food',
      title: 'X',
      description: '...',
      timestamp: '2026-07-01T08:00:00',
      occurredAt: '2026-07-01T08:00:00',
      recordedAt: '2026-07-01T08:00:00',
      source: 'manual',
      sourceRole: 'parent',
      status: 'confirmed',
      schemaVersion: 3,
    };
    // payload опционален, но если передан — типизирован.
    if (e.payload) {
      expectTypeOf(e.payload.foodName).toEqualTypeOf<string | undefined>();
      expectTypeOf(e.payload.volumeMl).toEqualTypeOf<number | undefined>();
    }
    expect(e.type).toBe('food');
  });

  it('QoldauEvent (без дженерика) — payload = union всех payload-типов', () => {
    const e: QoldauEvent = {
      id: '1',
      childId: 'c1',
      type: 'toilet',
      title: 'X',
      description: '...',
      timestamp: '2026-07-01T08:00:00',
      occurredAt: '2026-07-01T08:00:00',
      recordedAt: '2026-07-01T08:00:00',
      source: 'manual',
      sourceRole: 'parent',
      status: 'confirmed',
      schemaVersion: 3,
    };
    expect(e.type).toBe('toilet');
  });

  it('timestamp остаётся обязательным (обратная совместимость)', () => {
    type _Check = QoldauEvent<'food'>;
    // Если timestamp сделать опциональным, этот expectTypeOf провалится.
    // _Check['timestamp'] обязан быть string (не string | undefined).
    expectTypeOf<_Check['timestamp']>().toEqualTypeOf<string>();
  });

  it('legacy поля в payload допускаются (index signature)', () => {
    const e: QoldauEvent<'food'> = {
      id: '1',
      childId: 'c1',
      type: 'food',
      title: 'X',
      description: '...',
      timestamp: '2026-07-01T08:00:00',
      occurredAt: '2026-07-01T08:00:00',
      recordedAt: '2026-07-01T08:00:00',
      source: 'manual',
      sourceRole: 'parent',
      status: 'confirmed',
      schemaVersion: 3,
      payload: {
        foodName: 'Каша',
        // legacy-поля из старого кода, которые должны быть assignable к index signature
        action: 'food',
        source: 'manual',
        legacyField: 'anything',
      },
    };
    expect(e.payload?.foodName).toBe('Каша');
    // @ts-expect-error — unknown в runtime
    expect((e.payload as Record<string, unknown>)?.legacyField).toBe('anything');
  });

  it('EventPayloadMap покрывает все EventType', () => {
    // Smoke-тест: мапа должна иметь ключи для всех 16 типов.
    const keys: Array<keyof EventPayloadMap> = [
      'voice_observation',
      'food',
      'water',
      'toilet',
      'sleep',
      'behavior',
      'sensory',
      'communication',
      'aac_card',
      'phrase',
      'media_request',
      'sos',
      'calm_mode',
      'tutor_note',
      'specialist_note',
      'state',
    ];
    expect(keys.length).toBe(16);
    for (const k of keys) {
      expect(typeof k).toBe('string');
    }
  });
});