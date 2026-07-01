/**
 * Типы событий и дочерние enum'ы, зеркалирующие `apps/prototype/src/types/qoldau.ts`.
 * В Phase 2 будут импортироваться из shared пакета `@qoldau/types`.
 */

export type EventType =
  | 'food'
  | 'water'
  | 'toilet'
  | 'sleep'
  | 'behavior'
  | 'sensory'
  | 'communication'
  | 'aac_card'
  | 'voice_observation'
  | 'phrase'
  | 'media_request'
  | 'sos'
  | 'tutor_note'
  | 'calm_mode'
  | 'state';

export type SignalKind = 'sound' | 'word' | 'gesture' | 'behavior' | 'aac';

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  diagnosisLabel?: string;
  currentState?: string;
  avatar?: string;
}