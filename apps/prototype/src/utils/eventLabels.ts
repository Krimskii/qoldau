import { EventStatus, EventType } from '@/types/qoldau';

/**
 * Single source of truth for displaying EventStatus / sourceRole / type in UI.
 * Maps only to real values defined in `src/types/qoldau.ts`.
 */

export type SourceRole = 'parent' | 'child' | 'tutor' | 'specialist' | 'device' | 'ai';

interface StatusDisplay {
  label: string;
  className: string; // tailwind classes — only colors defined in tailwind.config.js
}

interface TypeDisplay {
  label: string;
  className: string;
}

interface SourceDisplay {
  label: string;
  className: string;
}

const STATUS_MAP: Record<EventStatus, StatusDisplay> = {
  draft: { label: 'Черновик', className: 'bg-bg text-muted border border-line' },
  ai_parsed: { label: 'Нужно проверить', className: 'bg-yellow-soft text-yellow' },
  confirmed: { label: 'Подтверждено', className: 'bg-green-soft text-green' },
  corrected: { label: 'Исправлено', className: 'bg-blue-soft text-blue' },
  rejected: { label: 'Отклонено', className: 'bg-coral-soft text-coral' },
};

const TYPE_MAP: Record<EventType, TypeDisplay> = {
  voice_observation: { label: 'Голос', className: 'bg-teal-soft text-teal' },
  food: { label: 'Питание', className: 'bg-green-soft text-green' },
  water: { label: 'Вода', className: 'bg-blue-soft text-blue' },
  toilet: { label: 'Туалет', className: 'bg-blue-soft text-blue' },
  sleep: { label: 'Сон', className: 'bg-purple-soft text-purple' },
  behavior: { label: 'Поведение', className: 'bg-yellow-soft text-yellow' },
  sensory: { label: 'Сенсорика', className: 'bg-yellow-soft text-yellow' },
  communication: { label: 'Коммуникация', className: 'bg-purple-soft text-purple' },
  aac_card: { label: 'AAC', className: 'bg-teal-soft text-teal' },
  phrase: { label: 'Фраза', className: 'bg-teal-soft text-teal' },
  media_request: { label: 'Медиа', className: 'bg-purple-soft text-purple' },
  sos: { label: 'SOS', className: 'bg-coral-soft text-coral' },
  calm_mode: { label: 'Спокойствие', className: 'bg-blue-soft text-blue' },
  tutor_note: { label: 'Тьютор', className: 'bg-purple-soft text-purple' },
  specialist_note: { label: 'Специалист', className: 'bg-blue-soft text-blue' },
  state: { label: 'Состояние', className: 'bg-teal-soft text-teal' },
};

const SOURCE_MAP: Record<SourceRole, SourceDisplay> = {
  parent: { label: 'Родитель', className: 'bg-teal-soft text-teal' },
  child: { label: 'Ребёнок', className: 'bg-coral-soft text-coral' },
  tutor: { label: 'Тьютор', className: 'bg-purple-soft text-purple' },
  specialist: { label: 'Специалист', className: 'bg-blue-soft text-blue' },
  device: { label: 'Устройство', className: 'bg-bg text-muted border border-line' },
  ai: { label: 'AI', className: 'bg-blue-soft text-blue' },
};

export function getEventStatusLabel(status: EventStatus): string {
  return STATUS_MAP[status]?.label ?? status;
}

export function getEventStatusClassName(status: EventStatus): string {
  return STATUS_MAP[status]?.className ?? 'bg-bg text-muted border border-line';
}

export function getEventTypeLabel(type: EventType): string {
  return TYPE_MAP[type]?.label ?? type;
}

export function getEventTypeClassName(type: EventType): string {
  return TYPE_MAP[type]?.className ?? 'bg-bg text-muted border border-line';
}

export function getEventSourceLabel(sourceRole: string): string {
  return SOURCE_MAP[sourceRole as SourceRole]?.label ?? sourceRole;
}

export function getEventSourceClassName(sourceRole: string): string {
  return SOURCE_MAP[sourceRole as SourceRole]?.className ?? 'bg-bg text-muted border border-line';
}

export function getStatusIcon(status: EventStatus): string {
  switch (status) {
    case 'confirmed': return '✓';
    case 'ai_parsed': return '?';
    case 'corrected': return '✎';
    case 'rejected': return '✕';
    case 'draft': return '○';
  }
}