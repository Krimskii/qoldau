import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { assertChildAccess } from '../middleware/requireChildAccess.js';
import { validateBody } from '../middleware/validateBody.js';
import { syncPushBodySchema } from '../validation/requestSchemas.js';

export const syncRouter = Router();

syncRouter.use(requireAuth);

const sinceSchema = z.string().datetime({ offset: true }).optional();

function parseJson(value: string | null): unknown {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function serializeEvent(event: Awaited<ReturnType<typeof prisma.event.findMany>>[number]) {
  return {
    id: event.id,
    childId: event.childId,
    type: event.type,
    title: event.title,
    description: event.description,
    timestamp: event.timestamp.toISOString(),
    sourceRole: event.sourceRole,
    status: event.status,
    confidence: event.confidence ?? undefined,
    rawText: event.rawText ?? undefined,
    linkedEventIds: parseJson(event.linkedEventIds),
    payload: parseJson(event.payload),
    updatedAt: event.updatedAt.toISOString(),
    deletedAt: event.deletedAt?.toISOString(),
  };
}

function serializeRecording(recording: Awaited<ReturnType<typeof prisma.recording.findMany>>[number]) {
  return {
    id: recording.id,
    childId: recording.childId,
    label: recording.label,
    durationSec: recording.durationSec,
    transcript: recording.transcript ?? undefined,
    mimeType: recording.mimeType ?? undefined,
    timestamp: recording.timestamp.toISOString(),
    updatedAt: recording.updatedAt.toISOString(),
    deletedAt: recording.deletedAt?.toISOString(),
  };
}

function serializeChild(child: Awaited<ReturnType<typeof prisma.child.findMany>>[number]) {
  return {
    id: child.id,
    ownerUserId: child.ownerUserId,
    name: child.name,
    age: child.age,
    diagnosisLabel: child.diagnosisLabel ?? undefined,
    currentState: child.currentState ?? undefined,
    avatar: child.avatar ?? undefined,
    createdAt: child.createdAt.toISOString(),
    updatedAt: child.updatedAt.toISOString(),
    deletedAt: child.deletedAt?.toISOString(),
  };
}

function isNewer(incoming: Date, existing: Date): boolean {
  return incoming.getTime() > existing.getTime();
}

function isSameVersion(incoming: Date, existing: Date): boolean {
  return incoming.getTime() === existing.getTime();
}

syncRouter.get('/pull', async (req, res, next) => {
  try {
    const childId = typeof req.query.childId === 'string' ? req.query.childId : undefined;
    if (!childId) return res.status(400).json({ ok: false, error: 'childId required' });
    const sinceResult = sinceSchema.safeParse(typeof req.query.since === 'string' ? req.query.since : undefined);
    if (!sinceResult.success) return res.status(400).json({ ok: false, error: 'invalid since' });
    if (!(await assertChildAccess(req.user!.id, childId, 'read'))) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }
    const since = sinceResult.data ? new Date(sinceResult.data) : new Date(0);
    const [events, recordings, children] = await Promise.all([
      prisma.event.findMany({ where: { childId, updatedAt: { gt: since } }, orderBy: { updatedAt: 'asc' } }),
      prisma.recording.findMany({ where: { childId, updatedAt: { gt: since } }, orderBy: { updatedAt: 'asc' } }),
      prisma.child.findMany({ where: { id: childId, updatedAt: { gt: since } }, orderBy: { updatedAt: 'asc' } }),
    ]);
    res.json({
      ok: true,
      events: events.map(serializeEvent),
      recordings: recordings.map(serializeRecording),
      children: children.map(serializeChild),
      serverTime: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

syncRouter.post('/push', validateBody(syncPushBodySchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof syncPushBodySchema>;
    let applied = 0;
    const conflicts: Array<{ entity: 'event' | 'recording' | 'child'; id: string; serverUpdatedAt: string }> = [];

    for (const item of body.events ?? []) {
      if (!(await assertChildAccess(req.user!.id, item.childId, 'write'))) {
        return res.status(403).json({ ok: false, error: 'forbidden' });
      }
      const incomingUpdatedAt = new Date(item.updatedAt);
      const existing = await prisma.event.findUnique({ where: { id: item.id } });
      if (existing && !isNewer(incomingUpdatedAt, existing.updatedAt)) {
        if (!isSameVersion(incomingUpdatedAt, existing.updatedAt)) {
          conflicts.push({ entity: 'event', id: item.id, serverUpdatedAt: existing.updatedAt.toISOString() });
        }
        continue;
      }
      await prisma.event.upsert({
        where: { id: item.id },
        create: {
          id: item.id,
          childId: item.childId,
          type: item.type ?? 'voice_observation',
          title: item.title ?? '',
          description: item.description ?? '',
          timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
          sourceRole: item.sourceRole ?? 'parent',
          status: item.status ?? 'confirmed',
          confidence: item.confidence,
          rawText: item.rawText,
          linkedEventIds: item.linkedEventIds ? JSON.stringify(item.linkedEventIds) : null,
          payload: item.payload ? JSON.stringify(item.payload) : null,
          updatedAt: incomingUpdatedAt,
          deletedAt: item.deletedAt ? new Date(item.deletedAt) : null,
        },
        update: {
          type: item.type,
          title: item.title,
          description: item.description,
          timestamp: item.timestamp ? new Date(item.timestamp) : undefined,
          sourceRole: item.sourceRole,
          status: item.status,
          confidence: item.confidence,
          rawText: item.rawText,
          linkedEventIds: item.linkedEventIds ? JSON.stringify(item.linkedEventIds) : undefined,
          payload: item.payload ? JSON.stringify(item.payload) : undefined,
          updatedAt: incomingUpdatedAt,
          deletedAt: item.deletedAt ? new Date(item.deletedAt) : null,
        },
      });
      applied += 1;
    }

    for (const item of body.recordings ?? []) {
      if (!(await assertChildAccess(req.user!.id, item.childId, 'write'))) {
        return res.status(403).json({ ok: false, error: 'forbidden' });
      }
      const incomingUpdatedAt = new Date(item.updatedAt);
      const existing = await prisma.recording.findUnique({ where: { id: item.id } });
      if (existing && !isNewer(incomingUpdatedAt, existing.updatedAt)) {
        if (!isSameVersion(incomingUpdatedAt, existing.updatedAt)) {
          conflicts.push({ entity: 'recording', id: item.id, serverUpdatedAt: existing.updatedAt.toISOString() });
        }
        continue;
      }
      await prisma.recording.upsert({
        where: { id: item.id },
        create: {
          id: item.id,
          childId: item.childId,
          label: item.label ?? '',
          durationSec: item.durationSec ?? 0,
          transcript: item.transcript,
          mimeType: item.mimeType,
          timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
          updatedAt: incomingUpdatedAt,
          deletedAt: item.deletedAt ? new Date(item.deletedAt) : null,
        },
        update: {
          label: item.label,
          durationSec: item.durationSec,
          transcript: item.transcript,
          mimeType: item.mimeType,
          timestamp: item.timestamp ? new Date(item.timestamp) : undefined,
          updatedAt: incomingUpdatedAt,
          deletedAt: item.deletedAt ? new Date(item.deletedAt) : null,
        },
      });
      applied += 1;
    }

    for (const item of body.children ?? []) {
      const existing = await prisma.child.findUnique({ where: { id: item.id } });
      if (existing && !(await assertChildAccess(req.user!.id, item.id, 'owner'))) {
        return res.status(403).json({ ok: false, error: 'forbidden' });
      }
      const incomingUpdatedAt = new Date(item.updatedAt);
      if (existing && !isNewer(incomingUpdatedAt, existing.updatedAt)) {
        if (!isSameVersion(incomingUpdatedAt, existing.updatedAt)) {
          conflicts.push({ entity: 'child', id: item.id, serverUpdatedAt: existing.updatedAt.toISOString() });
        }
        continue;
      }
      await prisma.child.upsert({
        where: { id: item.id },
        create: {
          id: item.id,
          ownerUserId: req.user!.id,
          name: item.name ?? '',
          age: item.age ?? 0,
          diagnosisLabel: item.diagnosisLabel,
          currentState: item.currentState,
          avatar: item.avatar,
          updatedAt: incomingUpdatedAt,
          deletedAt: item.deletedAt ? new Date(item.deletedAt) : null,
        },
        update: {
          name: item.name,
          age: item.age,
          diagnosisLabel: item.diagnosisLabel,
          currentState: item.currentState,
          avatar: item.avatar,
          updatedAt: incomingUpdatedAt,
          deletedAt: item.deletedAt ? new Date(item.deletedAt) : null,
        },
      });
      applied += 1;
    }

    res.json({ ok: true, applied, conflicts, serverTime: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});
