import { randomBytes, createHash } from 'node:crypto';
import { prisma } from '../db/prisma.js';
import { emailService } from './emailService.js';

const MAGIC_TOKEN_TTL_MS = 1000 * 60 * 15;
const DEFAULT_ACCESS_TOKEN_TTL_MS = 1000 * 60 * 15;
const DEFAULT_REFRESH_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const DEFAULT_JWT_SECRET = 'qoldau-dev-secret-do-not-use-in-prod';

function readTtlMs(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function getJwtSecret(): string {
  const s = process.env.JWT_SECRET?.trim();
  if (!s) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production');
    }
    console.warn('[auth] JWT_SECRET not set; using dev secret (insecure)');
    return DEFAULT_JWT_SECRET;
  }
  return s;
}

function appUrl(): string {
  return process.env.APP_URL?.trim().replace(/\/$/u, '') || 'http://localhost:5173';
}

function magicLink(token: string): string {
  return `${appUrl()}/#/auth/verify?token=${encodeURIComponent(token)}`;
}

function signJwt(payload: Record<string, unknown>, secret: string, ttlMs: number): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Date.now();
  const claims = { ...payload, iat: now, exp: now + ttlMs };
  const b64u = (obj: object) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const signingInput = `${b64u(header)}.${b64u(claims)}`;
  const sig = createHash('sha256').update(`${signingInput}.${secret}`).digest('base64url');
  return `${signingInput}.${sig}`;
}

function verifyJwt(token: string, secret: string): { ok: true; claims: Record<string, unknown> } | { ok: false; error: string } {
  const parts = token.split('.');
  if (parts.length !== 3) return { ok: false, error: 'malformed token' };
  const [h, p, s] = parts;
  const expected = createHash('sha256').update(`${h}.${p}.${secret}`).digest('base64url');
  if (expected !== s) return { ok: false, error: 'bad signature' };
  try {
    const claims = JSON.parse(Buffer.from(p, 'base64url').toString('utf8')) as { exp?: number };
    if (typeof claims.exp === 'number' && Date.now() > claims.exp) {
      return { ok: false, error: 'token expired' };
    }
    return { ok: true, claims };
  } catch {
    return { ok: false, error: 'malformed payload' };
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function emailDeliveryDisabledError(): Error & { status?: number } {
  const err = new Error('email_delivery_not_configured') as Error & { status?: number };
  err.status = 503;
  return err;
}

async function issueTokens(user: { id: string; email: string; role: string }) {
  const accessTtlMs = readTtlMs('ACCESS_TOKEN_TTL_MS', DEFAULT_ACCESS_TOKEN_TTL_MS);
  const refreshTtlMs = readTtlMs('REFRESH_TOKEN_TTL_MS', DEFAULT_REFRESH_TOKEN_TTL_MS);
  const accessToken = signJwt(
    { sub: user.id, email: user.email, role: user.role, tokenType: 'access' },
    getJwtSecret(),
    accessTtlMs,
  );
  const refreshToken = randomBytes(32).toString('base64url');
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + refreshTtlMs),
    },
  });
  return {
    accessToken,
    refreshToken,
    accessExpiresAt: new Date(Date.now() + accessTtlMs).toISOString(),
    refreshExpiresAt: new Date(Date.now() + refreshTtlMs).toISOString(),
  };
}

async function applyPendingInvites(email: string, userId: string): Promise<void> {
  const invites = await prisma.childInvite.findMany({
    where: { email, acceptedAt: null, revokedAt: null },
  });
  for (const invite of invites) {
    await prisma.childAccess.upsert({
      where: { userId_childId: { userId, childId: invite.childId } },
      create: {
        userId,
        childId: invite.childId,
        role: invite.role,
        grantedBy: invite.invitedBy,
      },
      update: { role: invite.role, grantedBy: invite.invitedBy, revokedAt: null },
    });
    await prisma.childInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    });
  }
}

export const authService = {
  async requestMagicLink(email: string): Promise<{
    ok: true;
    token?: string;
    expiresAt: string;
    devMagicUrl?: string;
    emailSent: boolean;
  }> {
    const e = email.trim().toLowerCase();
    if (!isValidEmail(e)) throw new Error('invalid email');

    if (process.env.NODE_ENV === 'production' && !emailService.shouldSend()) {
      throw emailDeliveryDisabledError();
    }

    const user = await prisma.user.upsert({
      where: { email: e },
      create: { email: e, role: 'parent' },
      update: {},
    });

    const token = randomBytes(24).toString('base64url');
    const expiresAt = new Date(Date.now() + MAGIC_TOKEN_TTL_MS);
    await prisma.magicToken.create({ data: { token, userId: user.id, expiresAt } });

    const link = magicLink(token);
    const shouldSend = process.env.NODE_ENV === 'production' && emailService.shouldSend();
    if (shouldSend) {
      await emailService.send({
        to: e,
        subject: 'Qoldau sign-in link',
        text: `Open this link to sign in to Qoldau: ${link}`,
      });
      return { ok: true, expiresAt: expiresAt.toISOString(), emailSent: true };
    }

    return {
      ok: true,
      token,
      expiresAt: expiresAt.toISOString(),
      devMagicUrl: link,
      emailSent: false,
    };
  },

  async verifyToken(token: string): Promise<{
    ok: true;
    accessToken: string;
    refreshToken: string;
    accessExpiresAt: string;
    refreshExpiresAt: string;
    jwt: string;
    user: { id: string; email: string; role: string };
  }> {
    if (!token || typeof token !== 'string') throw new Error('token required');

    const record = await prisma.magicToken.findUnique({ where: { token }, include: { user: true } });
    if (!record) throw new Error('token not found');
    if (record.usedAt) throw new Error('token already used');
    if (record.expiresAt.getTime() < Date.now()) throw new Error('token expired');

    await prisma.magicToken.update({ where: { token }, data: { usedAt: new Date() } });
    const user = { id: record.user.id, email: record.user.email, role: record.user.role };
    await applyPendingInvites(user.email, user.id);
    const tokens = await issueTokens(user);

    return {
      ok: true,
      ...tokens,
      jwt: tokens.accessToken,
      user,
    };
  },

  async refresh(refreshToken: string): Promise<{
    ok: true;
    accessToken: string;
    refreshToken: string;
    accessExpiresAt: string;
    refreshExpiresAt: string;
    jwt: string;
    user: { id: string; email: string; role: string };
  }> {
    const existing = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });
    if (!existing || existing.revokedAt || existing.expiresAt.getTime() < Date.now()) {
      throw new Error('invalid refresh token');
    }
    await prisma.refreshToken.update({ where: { token: refreshToken }, data: { revokedAt: new Date() } });
    const user = { id: existing.user.id, email: existing.user.email, role: existing.user.role };
    const tokens = await issueTokens(user);
    return { ok: true, ...tokens, jwt: tokens.accessToken, user };
  },

  async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  verifyJwtHeader(authHeader: string | undefined): { ok: true; user: { id: string; email: string; role: string } } | { ok: false; error: string } {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { ok: false, error: 'missing Bearer token' };
    }
    const token = authHeader.slice('Bearer '.length);
    const v = verifyJwt(token, getJwtSecret());
    if (!v.ok) return v;
    const claims = v.claims as { sub?: string; email?: string; role?: string; tokenType?: string };
    if (!claims.sub || !claims.email || !claims.role || claims.tokenType !== 'access') {
      return { ok: false, error: 'malformed claims' };
    }
    return { ok: true, user: { id: claims.sub, email: claims.email, role: claims.role } };
  },
};
