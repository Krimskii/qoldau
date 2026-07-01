/**
 * In-memory store для Qoldau AI API (v0.4.0).
 *
 * Phase 1: всё в памяти (process restart → данные теряются).
 * Phase 2 (будущее): замена на PostgreSQL/Redis с тем же интерфейсом.
 *
 * Shape полностью совпадает с Zustand stores на фронте
 * (`useEventStore`, `useRecordingsStore`), чтобы API был drop-in заменой.
 */
import { nanoid } from 'nanoid';
import type { QoldauEvent, EventType } from './types.js';

// ===================== TYPES =====================

export type EventStatus = 'pending' | 'confirmed' | 'rejected';
export type SourceRole = 'parent' | 'child' | 'tutor' | 'specialist' | 'device' | 'ai';

export interface EventInput {
  childId: string;
  type: EventType;
  title: string;
  description: string;
  timestamp?: string;
  sourceRole: SourceRole;
  status?: EventStatus;
  confidence?: number;
  rawText?: string;
  linkedEventIds?: string[];
  payload?: Record<string, unknown>;
}

export interface EventRecord extends EventInput {
  id: string;
  timestamp: string;
  status: EventStatus;
}

export interface RecordingInput {
  childId: string;
  label: string;
  durationSec: number;
}

export interface RecordingRecord extends RecordingInput {
  id: string;
  timestamp: string;
}

// ===================== SEED =====================

/**
 * Сид демо-данных при первом старте API.
 * Совпадает с `demoDataset.ts` на фронте (50+ событий за 7 дней для Алихана).
 */
function seedEvents(): EventRecord[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const make = (
    offsetDays: number,
    hour: number,
    minute: number,
    data: Omit<EventInput, 'timestamp'>,
  ): EventRecord => {
    const ts = new Date(now - offsetDays * day).toISOString().replace(/T.*/, `T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00.000Z`);
    return {
      ...data,
      id: `evt-seed-${offsetDays}-${hour}-${minute}`,
      timestamp: ts,
      status: 'confirmed',
    };
  };

  return [
    make(0, 9, 0,  { childId: 'child-alikhan', type: 'water', title: 'Выпил воду', description: '~150 мл', sourceRole: 'parent', payload: { amount: 150 } }),
    make(0, 10, 30, { childId: 'child-alikhan', type: 'food', title: 'Позавтракал', description: 'Каша с сыром', sourceRole: 'parent', payload: { meal: 'завтрак' } }),
    make(0, 11, 15, { childId: 'child-alikhan', type: 'communication', title: 'Сказал «ва»', description: 'Запрос воды. Подтверждено.', sourceRole: 'child', payload: { heard: 'ва', suggestion: 'вода' } }),
    make(0, 14, 20, { childId: 'child-alikhan', type: 'sensory', title: 'Закрывал уши', description: 'Шум в коридоре', sourceRole: 'tutor', payload: { trigger: 'шум' } }),
    make(0, 16, 0, { childId: 'child-alikhan', type: 'aac_card', title: '«ту-ту»', description: 'AAC карточка «туалет»', sourceRole: 'child' }),
    make(1, 9, 30, { childId: 'child-alikhan', type: 'water', title: 'Выпил воду', description: '~100 мл', sourceRole: 'parent' }),
    make(1, 12, 0, { childId: 'child-alikhan', type: 'food', title: 'Поел', description: 'Суп', sourceRole: 'tutor' }),
    make(1, 15, 30, { childId: 'child-alikhan', type: 'behavior', title: 'Плакал', description: 'Устал, просился отдыхать', sourceRole: 'tutor' }),
    make(1, 16, 0, { childId: 'child-alikhan', type: 'calm_mode', title: 'Спокойный режим', description: '2 минуты отдыха', sourceRole: 'child' }),
    make(2, 10, 0, { childId: 'child-alikhan', type: 'toilet', title: 'Сходил в туалет', description: 'Утро', sourceRole: 'parent' }),
    make(2, 14, 0, { childId: 'child-alikhan', type: 'communication', title: 'Использовал AAC «да»', description: 'Подтвердил желание гулять', sourceRole: 'child' }),
    make(3, 9, 0, { childId: 'child-alikhan', type: 'food', title: 'Позавтракал', description: 'Каша', sourceRole: 'parent' }),
    make(3, 13, 0, { childId: 'child-alikhan', type: 'phrase', title: 'Фраза: «Я хочу пить»', description: 'AAC фраза', sourceRole: 'child', payload: { phrase: 'Я хочу пить', source: 'phrase_builder' } }),
  ];
}

// ===================== STORE =====================

class MemoryStore {
  private events: Map<string, EventRecord> = new Map();
  private recordings: Map<string, RecordingRecord> = new Map();
  private seeded = false;

  private ensureSeeded() {
    if (this.seeded) return;
    this.seeded = true;
    const seed = seedEvents();
    for (const evt of seed) this.events.set(evt.id, evt);
  }

  // ===== Events =====

  listEvents(filter?: { childId?: string }): EventRecord[] {
    this.ensureSeeded();
    let arr = Array.from(this.events.values());
    if (filter?.childId) arr = arr.filter((e) => e.childId === filter.childId);
    return arr.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  getEvent(id: string): EventRecord | undefined {
    this.ensureSeeded();
    return this.events.get(id);
  }

  createEvent(input: EventInput): EventRecord {
    const record: EventRecord = {
      ...input,
      id: `evt-${nanoid(10)}`,
      timestamp: input.timestamp ?? new Date().toISOString(),
      status: input.status ?? 'confirmed',
    };
    this.events.set(record.id, record);
    return record;
  }

  updateEvent(id: string, patch: Partial<EventInput>): EventRecord | undefined {
    const existing = this.events.get(id);
    if (!existing) return undefined;
    const updated: EventRecord = {
      ...existing,
      ...patch,
      id: existing.id,
      childId: existing.childId,
      timestamp: existing.timestamp,
    };
    this.events.set(id, updated);
    return updated;
  }

  deleteEvent(id: string): boolean {
    return this.events.delete(id);
  }

  // ===== Recordings =====

  listRecordings(filter?: { childId?: string }): RecordingRecord[] {
    let arr = Array.from(this.recordings.values());
    if (filter?.childId) arr = arr.filter((r) => r.childId === filter.childId);
    return arr.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  createRecording(input: RecordingInput): RecordingRecord {
    const record: RecordingRecord = {
      ...input,
      id: `rec-${nanoid(10)}`,
      timestamp: new Date().toISOString(),
    };
    this.recordings.set(record.id, record);
    return record;
  }

  deleteRecording(id: string): boolean {
    return this.recordings.delete(id);
  }

  // ===== Stats =====

  stats() {
    return {
      events: this.events.size,
      recordings: this.recordings.size,
    };
  }

  /** Полная очистка (для reset endpoint). */
  clear() {
    this.events.clear();
    this.recordings.clear();
    this.seeded = false;
  }
}

export const store = new MemoryStore();