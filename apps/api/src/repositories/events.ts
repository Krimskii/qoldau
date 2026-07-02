/**
 * Events repository (v0.5.0) — Prisma + cache layer.
 *
 * Заменяет in-memory store из v0.4.0. API не изменился (routes работают как раньше).
 * Кеш: 30 сек на `events:list:*`, инвалидируется при create/update/delete.
 */
import { prisma } from '../db/prisma.js';
import { getCache } from '../db/cache.js';

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

export type EventStatus = 'pending' | 'confirmed' | 'rejected';
export type SourceRole = 'parent' | 'child' | 'tutor' | 'specialist' | 'device' | 'ai';

export interface EventInput {
  childId: string;
  type: EventType;
  title: string;
  description: string;
  sourceRole: SourceRole;
  timestamp?: Date;
  status?: EventStatus;
  confidence?: number;
  rawText?: string;
  linkedEventIds?: string[];
  payload?: Record<string, unknown>;
}

export interface EventRecord extends EventInput {
  id: string;
  timestamp: Date;
  status: EventStatus;
}

const CACHE_TTL_SEC = 30;

function cacheKey(childId?: string): string {
  return `events:list:${childId ?? 'all'}`;
}

async function invalidateCache(childId?: string): Promise<void> {
  const cache = getCache();
  await cache.del(cacheKey(childId));
  if (childId) await cache.del(cacheKey());
}

export const eventsRepo = {
  async list(filter?: { childId?: string }): Promise<EventRecord[]> {
    const cache = getCache();
    const key = cacheKey(filter?.childId);
    const cached = await cache.get<EventRecord[]>(key);
    if (cached) {
      return cached;
    }

    const events = await prisma.event.findMany({
      where: filter?.childId ? { childId: filter.childId } : undefined,
      orderBy: { timestamp: 'desc' },
    });

    const serialized: EventRecord[] = events.map((e) => ({
      id: e.id,
      childId: e.childId,
      type: e.type as EventType,
      title: e.title,
      description: e.description,
      timestamp: e.timestamp,
      sourceRole: e.sourceRole as SourceRole,
      status: e.status as EventStatus,
      confidence: e.confidence ?? undefined,
      rawText: e.rawText ?? undefined,
      linkedEventIds: e.linkedEventIds ? JSON.parse(e.linkedEventIds) : undefined,
      payload: e.payload ? JSON.parse(e.payload) : undefined,
    }));

    await cache.set(key, serialized, CACHE_TTL_SEC);
    return serialized;
  },

  async get(id: string): Promise<EventRecord | null> {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return null;
    return {
      id: event.id,
      childId: event.childId,
      type: event.type as EventType,
      title: event.title,
      description: event.description,
      timestamp: event.timestamp,
      sourceRole: event.sourceRole as SourceRole,
      status: event.status as EventStatus,
      confidence: event.confidence ?? undefined,
      rawText: event.rawText ?? undefined,
      linkedEventIds: event.linkedEventIds ? JSON.parse(event.linkedEventIds) : undefined,
      payload: event.payload ? JSON.parse(event.payload) : undefined,
    };
  },

  async create(input: EventInput): Promise<EventRecord> {
    const event = await prisma.event.create({
      data: {
        childId: input.childId,
        type: input.type,
        title: input.title,
        description: input.description,
        sourceRole: input.sourceRole,
        timestamp: input.timestamp ?? new Date(),
        status: input.status ?? 'confirmed',
        confidence: input.confidence,
        rawText: input.rawText,
        linkedEventIds: input.linkedEventIds ? JSON.stringify(input.linkedEventIds) : null,
        payload: input.payload ? JSON.stringify(input.payload) : null,
      },
    });
    await invalidateCache(input.childId);

    return {
      id: event.id,
      childId: event.childId,
      type: event.type as EventType,
      title: event.title,
      description: event.description,
      timestamp: event.timestamp,
      sourceRole: event.sourceRole as SourceRole,
      status: event.status as EventStatus,
      confidence: event.confidence ?? undefined,
      rawText: event.rawText ?? undefined,
      linkedEventIds: input.linkedEventIds,
      payload: input.payload,
    };
  },

  async update(id: string, patch: Partial<EventInput>): Promise<EventRecord | null> {
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) return null;

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(patch.type !== undefined && { type: patch.type }),
        ...(patch.title !== undefined && { title: patch.title }),
        ...(patch.description !== undefined && { description: patch.description }),
        ...(patch.sourceRole !== undefined && { sourceRole: patch.sourceRole }),
        ...(patch.status !== undefined && { status: patch.status }),
        ...(patch.confidence !== undefined && { confidence: patch.confidence }),
        ...(patch.rawText !== undefined && { rawText: patch.rawText }),
        ...(patch.linkedEventIds !== undefined && {
          linkedEventIds: JSON.stringify(patch.linkedEventIds),
        }),
        ...(patch.payload !== undefined && { payload: JSON.stringify(patch.payload) }),
      },
    });
    // Полная инвалидация кеша — childId мог измениться
    const cache = getCache();
    await cache.clear();

    return {
      id: event.id,
      childId: event.childId,
      type: event.type as EventType,
      title: event.title,
      description: event.description,
      timestamp: event.timestamp,
      sourceRole: event.sourceRole as SourceRole,
      status: event.status as EventStatus,
      confidence: event.confidence ?? undefined,
      rawText: event.rawText ?? undefined,
      linkedEventIds: patch.linkedEventIds ?? (event.linkedEventIds ? JSON.parse(event.linkedEventIds) : undefined),
      payload: patch.payload ?? (event.payload ? JSON.parse(event.payload) : undefined),
    };
  },

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.event.delete({ where: { id } });
      const cache = getCache();
      await cache.clear();
      return true;
    } catch {
      return false;
    }
  },

  async count(): Promise<number> {
    return prisma.event.count();
  },

  async clearAll(): Promise<number> {
    const { count } = await prisma.event.deleteMany();
    const cache = getCache();
    await cache.clear();
    return count;
  },
};