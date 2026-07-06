import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import { authRouter } from '../src/routes/auth';
import { childrenRouter } from '../src/routes/children';
import { prisma } from '../src/db/prisma';
import { authService } from '../src/services/authService';

describe('Auth P2 refresh/logout and invites', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRouter);
  app.use('/api/children', childrenRouter);

  const suffix = Date.now();
  const ownerEmail = `p2-owner-${suffix}@qoldau.test`;
  const inviteEmail = `p2-invite-${suffix}@qoldau.test`;
  const childId = `p2-auth-child-${suffix}`;
  const previousRequireAuth = process.env.REQUIRE_AUTH;
  const previousJwtSecret = process.env.JWT_SECRET;
  const previousEmailProvider = process.env.EMAIL_PROVIDER;

  async function issue(email: string) {
    const link = await authService.requestMagicLink(email);
    return authService.verifyToken(link.token!) as Promise<{
      accessToken: string;
      refreshToken: string;
      jwt: string;
      user: { id: string; email: string; role: string };
    }>;
  }

  beforeAll(async () => {
    process.env.REQUIRE_AUTH = 'true';
    process.env.JWT_SECRET = 'auth-p2-secret';
    process.env.EMAIL_PROVIDER = 'none';
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.childAccess.deleteMany({ where: { childId } });
    await prisma.childInvite.deleteMany({ where: { childId } });
    await prisma.child.deleteMany({ where: { id: childId } });
    await prisma.refreshToken.deleteMany({
      where: { user: { email: { in: [ownerEmail, inviteEmail] } } },
    });
    await prisma.magicToken.deleteMany({
      where: { user: { email: { in: [ownerEmail, inviteEmail] } } },
    });
    await prisma.user.deleteMany({ where: { email: { in: [ownerEmail, inviteEmail] } } });
    if (previousRequireAuth === undefined) delete process.env.REQUIRE_AUTH;
    else process.env.REQUIRE_AUTH = previousRequireAuth;
    if (previousJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousJwtSecret;
    if (previousEmailProvider === undefined) delete process.env.EMAIL_PROVIDER;
    else process.env.EMAIL_PROVIDER = previousEmailProvider;
    await prisma.$disconnect();
  });

  it('request -> verify returns access and refresh tokens', async () => {
    const link = await request(app).post('/api/auth/request-magic-link').send({ email: ownerEmail });
    const auth = await request(app).post('/api/auth/verify').send({ token: link.body.token });
    expect(auth.status).toBe(200);
    expect(auth.body.accessToken).toBeDefined();
    expect(auth.body.refreshToken).toBeDefined();
    expect(auth.body.jwt).toBe(auth.body.accessToken);
  });

  it('refresh rotates token and logout invalidates refresh token', async () => {
    const auth = await issue(ownerEmail);
    const refreshed = await request(app).post('/api/auth/refresh').send({ refreshToken: auth.refreshToken });
    expect(refreshed.status).toBe(200);
    expect(refreshed.body.accessToken).toBeDefined();
    expect(refreshed.body.refreshToken).not.toBe(auth.refreshToken);

    const reused = await request(app).post('/api/auth/refresh').send({ refreshToken: auth.refreshToken });
    expect(reused.status).toBe(401);

    const logout = await request(app).post('/api/auth/logout').send({ refreshToken: refreshed.body.refreshToken });
    expect(logout.status).toBe(200);
    const afterLogout = await request(app).post('/api/auth/refresh').send({ refreshToken: refreshed.body.refreshToken });
    expect(afterLogout.status).toBe(401);
  });

  it('expired access token returns 401', async () => {
    const oldTtl = process.env.ACCESS_TOKEN_TTL_MS;
    process.env.ACCESS_TOKEN_TTL_MS = '1';
    const auth = await issue(ownerEmail);
    await new Promise((resolve) => setTimeout(resolve, 5));
    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${auth.accessToken}`);
    expect(me.status).toBe(401);
    if (oldTtl === undefined) delete process.env.ACCESS_TOKEN_TTL_MS;
    else process.env.ACCESS_TOKEN_TTL_MS = oldTtl;
  });

  it('email access invite binds on first login', async () => {
    const ownerAuth = await issue(ownerEmail);
    await prisma.child.upsert({
      where: { id: childId },
      create: { id: childId, ownerUserId: ownerAuth.user.id, name: 'Invite child', age: 6 },
      update: {},
    });

    const invite = await request(app)
      .post(`/api/children/${childId}/access`)
      .set('Authorization', `Bearer ${ownerAuth.accessToken}`)
      .send({ email: inviteEmail, role: 'tutor' });
    expect(invite.status).toBe(202);

    const invitedAuth = await issue(inviteEmail);
    const read = await request(app).get(`/api/children/${childId}`).set('Authorization', `Bearer ${invitedAuth.accessToken}`);
    expect(read.status).toBe(200);
  });
});
