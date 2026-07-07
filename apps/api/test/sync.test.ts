import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import { authRouter } from '../src/routes/auth';
import { syncRouter } from '../src/routes/sync';
import { prisma } from '../src/db/prisma';
import { authService } from '../src/services/authService';

describe('Sync API', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRouter);
  app.use('/api/sync', syncRouter);

  const suffix = Date.now();
  const ownerEmail = `sync-owner-${suffix}@qoldau.test`;
  const foreignEmail = `sync-foreign-${suffix}@qoldau.test`;
  const childId = `sync-child-${suffix}`;
  const foreignChildId = `sync-foreign-child-${suffix}`;
  const previousRequireAuth = process.env.REQUIRE_AUTH;
  const previousJwtSecret = process.env.JWT_SECRET;
  let ownerJwt = '';
  let foreignJwt = '';
  let ownerId = '';
  let foreignId = '';

  async function issueJwt(email: string) {
    const issued = await authService.requestMagicLink(email);
    const verified = await authService.verifyToken(issued.token!);
    return verified.accessToken;
  }

  beforeAll(async () => {
    process.env.REQUIRE_AUTH = 'true';
    process.env.JWT_SECRET = 'sync-test-secret';
    await prisma.$connect();
    const owner = await prisma.user.create({ data: { email: ownerEmail, role: 'parent' } });
    const foreign = await prisma.user.create({ data: { email: foreignEmail, role: 'parent' } });
    ownerId = owner.id;
    foreignId = foreign.id;
    ownerJwt = await issueJwt(ownerEmail);
    foreignJwt = await issueJwt(foreignEmail);
    await prisma.child.create({ data: { id: childId, ownerUserId: owner.id, name: 'Sync child', age: 7 } });
    await prisma.child.create({ data: { id: foreignChildId, ownerUserId: foreign.id, name: 'Foreign child', age: 8 } });
  });

  afterAll(async () => {
    await prisma.event.deleteMany({ where: { childId: { in: [childId, foreignChildId] } } });
    await prisma.recording.deleteMany({ where: { childId: { in: [childId, foreignChildId] } } });
    await prisma.child.deleteMany({ where: { id: { in: [childId, foreignChildId] } } });
    await prisma.refreshToken.deleteMany({ where: { userId: { in: [ownerId, foreignId] } } });
    await prisma.magicToken.deleteMany({ where: { userId: { in: [ownerId, foreignId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [ownerId, foreignId] } } });
    if (previousRequireAuth === undefined) delete process.env.REQUIRE_AUTH;
    else process.env.REQUIRE_AUTH = previousRequireAuth;
    if (previousJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousJwtSecret;
    await prisma.$disconnect();
  });

  it('push creates, updates, deletes, and pull returns deltas with tombstones', async () => {
    const t1 = '2026-07-06T00:00:00.000Z';
    const create = await request(app)
      .post('/api/sync/push')
      .set('Authorization', `Bearer ${ownerJwt}`)
      .send({
        events: [{ id: `sync-event-${suffix}`, childId, type: 'food', title: 'Food', description: 'Ate', sourceRole: 'parent', updatedAt: t1 }],
        recordings: [{
          id: `sync-rec-${suffix}`,
          childId,
          label: 'Voice',
          durationSec: 3,
          transcript: 'Ребёнок попросил воды.',
          mimeType: 'audio/webm;codecs=opus',
          updatedAt: t1,
        }],
      });
    expect(create.status).toBe(200);
    expect(create.body.applied).toBe(2);

    const duplicate = await request(app)
      .post('/api/sync/push')
      .set('Authorization', `Bearer ${ownerJwt}`)
      .send({ events: [{ id: `sync-event-${suffix}`, childId, updatedAt: t1 }] });
    expect(duplicate.status).toBe(200);
    expect(duplicate.body.applied).toBe(0);
    expect(duplicate.body.conflicts).toEqual([]);

    const older = await request(app)
      .post('/api/sync/push')
      .set('Authorization', `Bearer ${ownerJwt}`)
      .send({ events: [{ id: `sync-event-${suffix}`, childId, title: 'Old', updatedAt: '2026-07-05T00:00:00.000Z' }] });
    expect(older.body.conflicts[0]).toEqual(expect.objectContaining({ entity: 'event', id: `sync-event-${suffix}` }));

    const newer = await request(app)
      .post('/api/sync/push')
      .set('Authorization', `Bearer ${ownerJwt}`)
      .send({ events: [{ id: `sync-event-${suffix}`, childId, title: 'New', updatedAt: '2026-07-07T00:00:00.000Z' }] });
    expect(newer.body.applied).toBe(1);

    const tombstone = await request(app)
      .post('/api/sync/push')
      .set('Authorization', `Bearer ${ownerJwt}`)
      .send({ events: [{ id: `sync-event-${suffix}`, childId, updatedAt: '2026-07-08T00:00:00.000Z', deletedAt: '2026-07-08T00:00:00.000Z' }] });
    expect(tombstone.body.applied).toBe(1);

    const pull = await request(app)
      .get(`/api/sync/pull?childId=${childId}&since=2026-07-01T00:00:00.000Z`)
      .set('Authorization', `Bearer ${ownerJwt}`);
    expect(pull.status).toBe(200);
    expect(pull.body.events.some((event: { id: string; deletedAt?: string }) => event.id === `sync-event-${suffix}` && event.deletedAt)).toBe(true);
    expect(pull.body.recordings).toContainEqual(expect.objectContaining({
      id: `sync-rec-${suffix}`,
      transcript: 'Ребёнок попросил воды.',
      mimeType: 'audio/webm;codecs=opus',
    }));
    expect(JSON.stringify(pull.body.recordings)).not.toContain('audioId');
    expect(pull.body.children.some((child: { id: string }) => child.id === childId)).toBe(true);
    expect(pull.body.serverTime).toBeDefined();
  });

  it('rejects sync push events with non-canonical event types', async () => {
    const response = await request(app)
      .post('/api/sync/push')
      .set('Authorization', `Bearer ${ownerJwt}`)
      .send({
        events: [{
          id: `sync-invalid-type-${suffix}`,
          childId,
          type: 'safety_call',
          title: 'Invalid',
          description: 'Should be rejected',
          sourceRole: 'parent',
          updatedAt: '2026-07-06T00:00:00.000Z',
        }],
      });

    expect(response.status).toBe(400);
    expect(response.body.ok).toBe(false);
    expect(response.body.issues[0]).toEqual(expect.objectContaining({ path: 'events.0.type' }));

    const stored = await prisma.event.findUnique({ where: { id: `sync-invalid-type-${suffix}` } });
    expect(stored).toBeNull();
  });

  it('accepts the full canonical product taxonomy in sync push', async () => {
    const canonicalProductTypes = [
      'tutor_note',
      'specialist_note',
      'voice_observation',
      'aac_card',
      'communication',
      'calm_mode',
      'media_request',
      'sos',
      'phrase',
    ];

    const response = await request(app)
      .post('/api/sync/push')
      .set('Authorization', `Bearer ${ownerJwt}`)
      .send({
        events: canonicalProductTypes.map((type, index) => ({
          id: `sync-taxonomy-${type}-${suffix}`,
          childId,
          type,
          title: type,
          description: type,
          sourceRole: 'parent',
          updatedAt: `2026-07-06T00:00:${String(index).padStart(2, '0')}.000Z`,
        })),
      });

    expect(response.status).toBe(200);
    expect(response.body.applied).toBe(canonicalProductTypes.length);
  });

  it('pull returns legacy event types without read-time validation', async () => {
    const legacyId = `sync-legacy-type-${suffix}`;
    await prisma.event.create({
      data: {
        id: legacyId,
        childId,
        type: 'legacy_custom',
        title: 'Legacy',
        description: 'Old data',
        sourceRole: 'parent',
        updatedAt: new Date('2026-07-09T00:00:00.000Z'),
      },
    });

    const pull = await request(app)
      .get(`/api/sync/pull?childId=${childId}&since=2026-07-01T00:00:00.000Z`)
      .set('Authorization', `Bearer ${ownerJwt}`);

    expect(pull.status).toBe(200);
    expect(pull.body.events).toContainEqual(expect.objectContaining({ id: legacyId, type: 'legacy_custom' }));
  });

  it('forbids pulling and pushing a foreign child', async () => {
    const pull = await request(app)
      .get(`/api/sync/pull?childId=${foreignChildId}`)
      .set('Authorization', `Bearer ${ownerJwt}`);
    expect(pull.status).toBe(403);

    const push = await request(app)
      .post('/api/sync/push')
      .set('Authorization', `Bearer ${foreignJwt}`)
      .send({ events: [{ id: `bad-${suffix}`, childId, updatedAt: '2026-07-06T00:00:00.000Z' }] });
    expect(push.status).toBe(403);
  });
});
