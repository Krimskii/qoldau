/**
 * Smoke tests для auth flow.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { authRouter } from '../src/routes/auth';
import { prisma } from '../src/db/prisma';

describe('Auth flow', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRouter);

  const testEmail = `test-${Date.now()}@qoldau.test`;

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    // Cleanup test users
    await prisma.magicToken.deleteMany({ where: { user: { email: testEmail } } });
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.$disconnect();
  });

  it('rejects invalid email', async () => {
    const res = await request(app).post('/api/auth/request-magic-link').send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  it('issues magic-token for valid email', async () => {
    const res = await request(app).post('/api/auth/request-magic-link').send({ email: testEmail });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.expiresAt).toBeDefined();
    expect(res.body.devMagicUrl).toContain('/auth/verify?token=');
  });

  it('verifies valid token and returns JWT', async () => {
    const issue = await request(app).post('/api/auth/request-magic-link').send({ email: testEmail });
    const token = issue.body.token;

    const res = await request(app).post('/api/auth/verify').send({ token });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.jwt).toBeDefined();
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.user.role).toBe('parent');
  });

  it('rejects already-used token', async () => {
    const issue = await request(app).post('/api/auth/request-magic-link').send({ email: testEmail });
    const token = issue.body.token;
    await request(app).post('/api/auth/verify').send({ token });
    // Second attempt should fail
    const res = await request(app).post('/api/auth/verify').send({ token });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('already used');
  });

  it('rejects nonexistent token', async () => {
    const res = await request(app).post('/api/auth/verify').send({ token: 'nonexistent-token-12345' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('not found');
  });

  it('GET /me with valid JWT returns user', async () => {
    const issue = await request(app).post('/api/auth/request-magic-link').send({ email: testEmail });
    const token = issue.body.token;
    const verify = await request(app).post('/api/auth/verify').send({ token });
    const jwt = verify.body.jwt;

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${jwt}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testEmail);
  });

  it('GET /me without JWT returns 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});