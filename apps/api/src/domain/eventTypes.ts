import { z } from 'zod';

export const CANONICAL_EVENT_TYPES = [
  'food',
  'water',
  'toilet',
  'sleep',
  'behavior',
  'sensory',
  'communication',
  'aac_card',
  'voice_observation',
  'phrase',
  'media_request',
  'sos',
  'calm_mode',
  'tutor_note',
  'specialist_note',
  'state',
] as const;

export type CanonicalEventType = (typeof CANONICAL_EVENT_TYPES)[number];

export const canonicalEventTypeSchema = z.enum(CANONICAL_EVENT_TYPES);

// AI parser output is a strict subset of the product event taxonomy.
export const PARSER_EVENT_TYPES = [
  'food',
  'water',
  'sleep',
  'toilet',
  'sensory',
  'behavior',
  'communication',
  'state',
] as const satisfies readonly CanonicalEventType[];

export function isCanonicalEventType(value: unknown): value is CanonicalEventType {
  return typeof value === 'string' && (CANONICAL_EVENT_TYPES as readonly string[]).includes(value);
}
