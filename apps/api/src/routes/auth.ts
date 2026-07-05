/**
 * /api/auth — magic-link auth (v0.6.0 stub, no SMTP).
 *
 * POST /api/auth/request-magic-link { email } → { ok, token, expiresAt, devMagicUrl }
 * POST /api/auth/verify { token }            → { ok, jwt, user }
 * GET  /api/auth/me                          → { ok, user } (требует Authorization: Bearer ...)
 *
 * Magic-link emails НЕ отправляются (нет SMTP / Resend).
 * В dev-mode токен возвращается в ответе, чтобы можно было пройти flow без почтового сервера.
 */
import { Router } from 'express';
import { authService } from '../services/authService';
import { authRateLimit } from '../middleware/rateLimit';
import { childrenRepo } from '../repositories/children';

export const authRouter = Router();

authRouter.post('/request-magic-link', authRateLimit, async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ ok: false, error: 'email required' });
  }
  try {
    const result = await authService.requestMagicLink(email);
    res.json(result);
  } catch (err) {
    res.status(400).json({
      ok: false,
      error: err instanceof Error ? err.message : 'request failed',
    });
  }
});

authRouter.post('/verify', authRateLimit, async (req, res) => {
  const { token } = req.body as { token?: string };
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ ok: false, error: 'token required' });
  }
  try {
    const result = await authService.verifyToken(token);
    res.json(result);
  } catch (err) {
    res.status(400).json({
      ok: false,
      error: err instanceof Error ? err.message : 'verify failed',
    });
  }
});

authRouter.get('/me', async (req, res, next) => {
  const result = authService.verifyJwtHeader(req.headers.authorization);
  if (!result.ok) {
    return res.status(401).json({ ok: false, error: result.error });
  }
  try {
    const childIds = await childrenRepo.accessibleIds(result.user.id);
    res.json({ ok: true, user: result.user, childIds });
  } catch (err) {
    next(err);
  }
});
