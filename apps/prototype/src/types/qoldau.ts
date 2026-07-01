export type UserRole = 'parent' | 'child' | 'tutor' | 'specialist' | 'overview';

export type EventType =
  | 'voice_observation'
  | 'food'
  | 'water'
  | 'toilet'
  | 'sleep'
  | 'behavior'
  | 'sensory'
  | 'communication'
  | 'aac_card'
  | 'phrase'
  | 'media_request'
  | 'sos'
  | 'calm_mode'
  | 'tutor_note'
  | 'specialist_note'
  | 'state';

export type EventStatus = 'draft' | 'ai_parsed' | 'confirmed' | 'corrected' | 'rejected';

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  diagnosisLabel: string;
  currentState: string;
  avatar?: string;
  mainSignals: Signal[];
}

export interface Signal {
  id: string;
  signal: string;
  kind: 'sound' | 'word' | 'gesture' | 'behavior' | 'aac';
  possibleMeaning: string;
  confidence: number;
  confirmedCount: number;
  lastSeenAt: string;
}

export interface QoldauEvent {
  id: string;
  childId: string;
  type: EventType;
  title: string;
  description: string;
  timestamp: string;
  sourceRole: 'parent' | 'child' | 'tutor' | 'specialist' | 'device' | 'ai';
  status: EventStatus;
  confidence?: number;
  rawText?: string;
  linkedEventIds?: string[];
  tags?: string[];
  payload?: Record<string, unknown>;
}

export interface VoiceObservation {
  id: string;
  childId: string;
  speakerRole: 'parent' | 'tutor' | 'specialist';
  audioUrl?: string;
  transcript: string;
  durationSeconds: number;
  parsedEventIds: string[];
  aiSummary: string;
  confirmationStatus: 'pending' | 'confirmed' | 'edited';
}

export interface AIInsight {
  id: string;
  childId: string;
  relatedEventIds: string[];
  type:
    | 'pattern'
    | 'possible_trigger'
    | 'communication_hint'
    | 'toilet_prediction'
    | 'sensory_hint'
    | 'care_summary';
  text: string;
  confidence: number;
  status: 'suggested' | 'confirmed' | 'dismissed';
}

export interface NotificationItem {
  id: string;
  childId: string;
  title: string;
  description: string;
  type: 'aac' | 'sos' | 'report' | 'ai_review' | 'device';
  createdAt: string;
  isRead: boolean;
}

export interface QuickAction {
  id: string;
  type: EventType;
  label: string;
  icon: string;
  color: string;
}
