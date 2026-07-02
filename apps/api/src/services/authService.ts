/**
 * authService — magic-link flow (v0.6.0 stub).
 *
 * - requestMagicLink(email): создаёт/находит User, генерирует одноразовый токен.
 *   Без email-отправки (SMTP/Resend не подключён) — токен возвращается в ответе
 *   для ручного тестирования / dev-mode.
 * - verifyToken(token): помечает токен used, возвращает JWT + user.
 *
 * JWT_SECRET опционален. Если не задан — используется dev-secret (с warning).
 * В production ОБЯЗАТЕЛЬНО задать JWT_SECRET.
 */
import { randomBytes, createHash } from 'node:crypto';
import { prisma } from '../db/prisma';

const TOKEN_TTL_MS = 1000 * 60 * 15; // 15 минут
const DEFAULT_JWT_SECRET = 'qoldau-dev-secret-do-not-use-in-prod';

function getJwtSecret(): string {
  const s = process.env.JWT_SECRET?.trim();
  if (!s) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production');
    }
    console.warn('[auth] JWT_SECRET not set — using dev secret (insecure)');
    return DEFAULT_JWT_SECRET;
  }
  return s;
}

/** Простой HMAC-like JWT (HS256, no extra deps). Не для prod-edge cases, но OK для demo. */
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

export const authService = {
  /**
   * Создаёт magic-link токен. Если email не существует — создаёт User.
   * Возвращает token + expiresAt + devMagicUrl (для удобства тестирования без SMTP).
   */
  async requestMagicLink(email: string): Promise<{
    ok: true;
    token: string;
    expiresAt: string;
    devMagicUrl: string;
  }> {
    const e = email.trim().toLowerCase();
    if (!isValidEmail(e)) {
      throw new Error('invalid email');
    }

    const user = await prisma.user.upsert({
      where: { email: e },
      create: { email: e, role: 'parent' },
      update: {},
    });

    const token = randomBytes(24).toString('base64url');
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    await prisma.magicToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      ok: true,
      token,
      expiresAt: expiresAt.toISOString(),
      devMagicUrl: `http://localhost:5173/auth/verify?token=${token}`,
    };
  },

  /** Обменивает magic-token на JWT. */
  async verifyToken(token: string): Promise<{
    ok: true;
    jwt: string;
    user: { id: string; email: string; role: string };
  }> {
    if (!token || typeof token !== 'string') {
      throw new Error('token required');
    }

    const record = await prisma.magicToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!record) throw new Error('token not found');
    if (record.usedAt) throw new Error('token already used');
    if (record.expiresAt.getTime() < Date.now()) throw new Error('token expired');

    await prisma.magicToken.update({
      where: { token },
      data: { usedAt: new Date() },
    });

    const secret = getJwtSecret();
    const jwt = signJwt({ sub: record.user.id, email: record.user.email, role: record.user.role }, secret, TOKEN_TTL_MS);

    return {
      ok: true,
      jwt,
      user: {
        id: record.user.id,
        email: record.user.email,
        role: record.user.role,
      },
    };
  },

  /** Middleware helper — проверяет Authorization header. */
  verifyJwtHeader(authHeader: string | undefined): { ok: true; user: { id: string; email: string; role: string } } | { ok: false; error: string } {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { ok: false, error: 'missing Bearer token' };
    }
    const token = authHeader.slice('Bearer '.length);
    const v = verifyJwt(token, getJwtSecret());
    if (!v.ok) return v;
    const claims = v.claims as { sub?: string; email?: string; role?: string };
    if (!claims.sub || !claims.email || !claims.role) {
      return { ok: false, error: 'malformed claims' };
    }
    return { ok: true, user: { id: claims.sub, email: claims.email, role: claims.role } };
  },
};