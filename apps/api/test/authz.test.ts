import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import { aiRouter } from '../src/routes/ai';
import { authRouter } from '../src/routes/auth';
import { childrenRouter } from '../src/routes/children';
import { eventsRouter } from '../src/routes/events';
import { recordingsRouter } from '../src/routes/recordings';
import { prisma } from '../src/db/prisma';
import { authService } from '../src/services/authService';

describe('data route authorization', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRouter);
  app.use('/api/children', childrenRouter);
  app.use('/api/events', eventsRouter);
  app.use('/api/recordings', recordingsRouter);
  app.use('/api/ai', aiRouter);

  const previousRequireAuth = process.env.REQUIRE_AUTH;
  const previousJwtSecret = process.env.JWT_SECRET;
  const suffix = Date.now();
  const ownerEmail = `authz-owner-${suffix}@qoldau.test`;
  const foreignEmail = `authz-foreign-${suffix}@qoldau.test`;
  const tutorEmail = `authz-tutor-${suffix}@qoldau.test`;
  const grantedTutorEmail = `authz-granted-${suffix}@qoldau.test`;
  const ownerChildId = `authz-owner-child-${suffix}`;
  const foreignChildId = `authz-foreign-child-${suffix}`;

  let owner: { id: string; email: string; role: string };
  let foreign: { id: string; email: string; role: string };
  let tutor: { id: string; email: string; role: string };
  let ownerJwt = '';
  let foreignJwt = '';
  let tutorJwt = '';

  async function issueJwt(email: string) {
    const issued = await authService.requestMagicLink(email);
    const verified = await authService.verifyToken(issued.token);
    return verified.jwt;
  }

  beforeAll(async () => {
    process.env.REQUIRE_AUTH = 'true';
    process.env.JWT_SECRET = 'authz-test-secret';
    await prisma.$connect();

    owner = await prisma.user.create({ data: { email: ownerEmail, role: 'parent' } });
    foreign = await prisma.user.create({ data: { email: foreignEmail, role: 'parent' } });
    tutor = await prisma.user.create({ data: { email: tutorEmail, role: 'tutor' } });
    ownerJwt = await issueJwt(ownerEmail);
    foreignJwt = await issueJwt(foreignEmail);
    tutorJwt = await issueJwt(tutorEmail);

    await prisma.child.create({
      data: {
        id: ownerChildId,
        ownerUserId: owner.id,
        name: 'Owner child',
        age: 7,
      },
    });
    await prisma.child.create({
      data: {
        id: foreignChildId,
        ownerUserId: foreign.id,
        name: 'Foreign child',
        age: 8,
      },
    });
    await prisma.childAccess.create({
      data: {
        childId: ownerChildId,
        userId: tutor.id,
        role: 'tutor',
        grantedBy: owner.id,
      },
    });
    await prisma.event.create({
      data: {
        childId: ownerChildId,
        type: 'food',
        title: 'Lunch',
        description: 'Ate lunch',
        sourceRole: 'parent',
      },
    });
    await prisma.event.create({
      data: {
        childId: foreignChildId,
        type: 'sleep',
        title: 'Nap',
        description: 'Had a nap',
        sourceRole: 'parent',
      },
    });
  });

  afterAll(async () => {
    await prisma.childAccess.deleteMany({
      where: {
        OR: [
          { childId: { in: [ownerChildId, foreignChildId] } },
          { user: { email: { in: [ownerEmail, foreignEmail, tutorEmail, grantedTutorEmail] } } },
        ],
      },
    });
    await prisma.event.deleteMany({ where: { childId: { in: [ownerChildId, foreignChildId] } } });
    await prisma.recording.deleteMany({ where: { childId: { in: [ownerChildId, foreignChildId] } } });
    await prisma.child.deleteMany({ where: { id: { in: [ownerChildId, foreignChildId] } } });
    await prisma.magicToken.deleteMany({
      where: { user: { email: { in: [ownerEmail, foreignEmail, tutorEmail, grantedTutorEmail] } } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [ownerEmail, foreignEmail, tutorEmail, grantedTutorEmail] } },
    });
    if (previousRequireAuth === undefined) delete process.env.REQUIRE_AUTH;
    else process.env.REQUIRE_AUTH = previousRequireAuth;
    if (previousJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousJwtSecret;
    await prisma.$disconnect();
  });

  it('returns 401 for anonymous data routes when auth is required', async () => {
    const res = await request(app).get('/api/children');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ ok: false, error: 'unauthorized' });
  });

  it('scopes children lists to accessible children', async () => {
    const res = await request(app).get('/api/children').set('Authorization', `Bearer ${ownerJwt}`);
    expect(res.status).toBe(200);
    expect(res.body.children.map((child: { id: string }) => child.id)).toContain(ownerChildId);
    expect(res.body.children.map((child: { id: string }) => child.id)).not.toContain(foreignChildId);
  });

  it('returns 403 when a user reads a foreign child event collection', async () => {
    const res = await request(app)
      .get(`/api/events?childId=${foreignChildId}`)
      .set('Authorization', `Bearer ${ownerJwt}`);
    expect(res.status).toBe(403);
    expect(res.body).toEqual({ ok: false, error: 'forbidden' });
  });

  it('allows the owner to mutate child data routes', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${ownerJwt}`)
      .send({
        childId: ownerChildId,
        type: 'water',
        title: 'Water',
        description: 'Drank water',
        sourceRole: 'parent',
      });
    expect(res.status).toBe(201);
    expect(res.body.event.childId).toBe(ownerChildId);
  });

  it('allows tutor read access but forbids mutations', async () => {
    const read = await request(app)
      .get(`/api/events?childId=${ownerChildId}`)
      .set('Authorization', `Bearer ${tutorJwt}`);
    expect(read.status).toBe(200);
    expect(read.body.count).toBeGreaterThan(0);

    const write = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${tutorJwt}`)
      .send({
        childId: ownerChildId,
        type: 'food',
        title: 'Snack',
        description: 'Ate snack',
        sourceRole: 'tutor',
      });
    expect(write.status).toBe(403);
    expect(write.body).toEqual({ ok: false, error: 'forbidden' });
  });

  it('grants and revokes child access', async () => {
    const grant = await request(app)
      .post(`/api/children/${ownerChildId}/access`)
      .set('Authorization', `Bearer ${ownerJwt}`)
      .send({ email: grantedTutorEmail, role: 'tutor' });
    expect(grant.status).toBe(201);
    expect(grant.body.access.childId).toBe(ownerChildId);

    const grantedJwt = await issueJwt(grantedTutorEmail);
    const read = await request(app)
      .get(`/api/children/${ownerChildId}`)
      .set('Authorization', `Bearer ${grantedJwt}`);
    expect(read.status).toBe(200);

    const revoke = await request(app)
      .delete(`/api/children/${ownerChildId}/access/${grant.body.access.userId}`)
      .set('Authorization', `Bearer ${ownerJwt}`);
    expect(revoke.status).toBe(200);

    const readAfterRevoke = await request(app)
      .get(`/api/children/${ownerChildId}`)
      .set('Authorization', `Bearer ${grantedJwt}`);
    expect(readAfterRevoke.status).toBe(403);
  });

  it('extends /api/auth/me with accessible child ids', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${ownerJwt}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(ownerEmail);
    expect(res.body.childIds).toContain(ownerChildId);
  });

  it('does not require auth for AI proxy routes', async () => {
    const res = await request(app).get('/api/ai/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('forbids non-owner access management', async () => {
    const res = await request(app)
      .get(`/api/children/${ownerChildId}/access`)
      .set('Authorization', `Bearer ${foreignJwt}`);
    expect(res.status).toBe(403);
  });
});
