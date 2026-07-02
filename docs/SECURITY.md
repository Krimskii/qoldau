# Qoldau AI — Security Policy (v0.6.4)

> Безопасность данных, аутентификация, rate-limiting, env vars.

---

## 1. Threat model

**Qoldau AI** — приложение для родителей детей с РАС. Данные — наблюдения за ребёнком (еда, вода, туалет, сон, поведение, сенсорные реакции, коммуникация). Это **персональные данные о ребёнке** — обрабатываются бережно.

**Основные риски:**

1. **Утечка PII** — если злоумышленник получит доступ к API, он увидит события с детскими именами, диагнозами, паттернами поведения
2. **Brute-force auth** — без rate-limit можно перебирать magic-token'ы
3. **Injection** — Prisma защищает от SQL injection, но body input не валидируется
4. **Prompt injection** — AI парсер может получать adversarial input (родитель или злоумышленник вставит prompt injection в транскрипт)
5. **JWT secret leak** — если `JWT_SECRET` утечёт, любой может подделать токены
6. **Cost overrun** — без rate-limit можно задолбать Anthropic API (дорого)

**Вне scope** (на текущем этапе):
- E2E encryption между клиентом и сервером (нет — данные идут plain по HTTPS)
- Medical-grade security (это не медицинский продукт)
- GDPR compliance audit (TODO перед production в EU)

---

## 2. Authentication

### Magic-link flow (v0.6.0)

```
Client                 API                   DB
  |                    |                    |
  | POST /auth/        |                    |
  |  request-magic-    |                    |
  |  link {email}      |                    |
  |------------------->|                    |
  |                    | upsert User        |
  |                    |------------------->|
  |                    | create MagicToken  |
  |                    | (token, expiresAt) |
  |                    |------------------->|
  | {token, devMagicUrl}                    |
  |<-------------------|                    |
  |                    |                    |
  | (production: email sent with magicUrl)  |
  |                    |                    |
  | GET /auth/verify?token=...              |
  |------------------->|                    |
  |                    | find MagicToken    |
  |                    |------------------->|
  |                    | check expiresAt    |
  |                    | mark usedAt=now    |
  |                    |------------------->|
  | {jwt, user}        |                    |
  |<-------------------|                    |
```

### JWT

- **Алгоритм:** HS256 (HMAC-SHA256)
- **TTL:** 8 часов (server token TTL — 15 мин, но client кеширует дольше для UX)
- **Payload:** `{ sub: userId, email, role, iat, exp }`
- **Secret:** `JWT_SECRET` env var, **обязателен в production** (минимум 32 символа)
- **Storage:** `localStorage` ключ `qoldau-auth-v1` (XSS risk — см. §5)

**Регенерация ключа:** при ротации `JWT_SECRET` все активные токены становятся невалидными, пользователи должны re-login.

### Dev-mode без SMTP

`requestMagicLink` возвращает токен + `devMagicUrl` в ответе. В production нужно:
1. Подключить email provider (Resend, SES, SendGrid)
2. Отправить `magicUrl` пользователю
3. Убрать `devMagicUrl` из response (или оставить только в NODE_ENV=development)

---

## 3. Authorization

### Текущая модель

В v0.6.4 — `userId` есть, но **event queries не фильтруются по userId**. Это TODO перед multi-tenant production. Сейчас все события видны всем аутентифицированным пользователям.

### Что нужно для production

- Каждый Event должен иметь `ownerId` (или familyId)
- Middleware `requireAuth` + `requireOwnership` на /events, /recordings
- Frontend — `Authorization: Bearer <jwt>` header на все API calls

---

## 4. Rate limiting (v0.6.3)

| Endpoint | Лимит | Window | Назначение |
|----------|-------|--------|------------|
| `POST /api/auth/request-magic-link` | 10 | 15 мин | Anti-bruteforce magic-link |
| `POST /api/auth/verify` | 10 | 15 мин | Anti-bruteforce verify |
| `POST /api/ai/parse` | 30 | 1 мин | Anti-spam AI (cost control) |
| `POST /api/stt/transcribe` | 20 | 1 мин | Anti-spam Whisper (cost control) |

Express-rate-limit использует `req.ip` — в production за reverse-proxy (nginx) нужно настроить `app.set('trust proxy', 1)` чтобы IP брался из `X-Forwarded-For`.

---

## 5. Data validation

### Body input
- Magic-link: `email` — regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- AI parse: `transcript` — `string`, обязательное
- Events: `type` — whitelist (food/water/toilet/sleep/sensory/behavior/communication/state)
- Все остальные поля — `Record<string, unknown>` без строгой валидации (TODO)

### SQL injection
- Prisma ORM использует prepared statements — **safe by default**
- Не использовать `$queryRawUnsafe` без параметризации

### XSS
- React экранирует по умолчанию
- ⚠️ **localStorage** — JWT хранится plain (XSS risk). Mitigations:
  - CSP headers (helmet уже добавляет)
  - No third-party scripts (только Vite bundle)
  - Subresource Integrity для external CDN (если будут)

### Prompt injection
- AI system prompt жёстко ограничивает типы событий и формулировки
- Но adversarial input в transcript может попытаться «вытащить» system prompt
- TODO: добавить input sanitization перед передачей в Claude

---

## 6. Environment variables

### Обязательные в production

| Variable | Required | Notes |
|----------|----------|-------|
| `JWT_SECRET` | ✅ | ≥32 chars, rotate quarterly |
| `DATABASE_URL` | ✅ | Postgres в prod (не SQLite!) |
| `CORS_ORIGIN` | ✅ | Whitelist доменов (comma-separated) |
| `NODE_ENV` | ✅ | `production` (для strict проверок) |

### Опциональные (opt-in integrations)

| Variable | Default | Effect |
|----------|---------|--------|
| `ANTHROPIC_API_KEY` | пусто | Без ключа → mock AI; с ключом → Claude |
| `WHISPER_API_KEY` | пусто | Без ключа → mock STT; с ключом → Whisper |
| `REDIS_URL` | пусто | Без → in-memory cache; с → Redis |

### Что НИКОГДА не коммитим

- `.env` (есть в `.gitignore`)
- `JWT_SECRET`
- API ключи
- `prisma/dev.db` (real children's data)
- `prisma/test.db` (test fixtures with real emails)

---

## 7. HTTPS & CORS

- **HTTPS обязателен в production** (Let's Encrypt / Cloudflare)
- `CORS_ORIGIN` whitelist:
  ```
  CORS_ORIGIN=https://qoldau.example.com,https://www.qoldau.example.com
  ```
- Helmet добавляет security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- CSP headers — TODO добавить после стабилизации UI

---

## 8. Logging & monitoring

### Текущее
- `morgan` — HTTP access log в stdout
- `console.error` в catch блоках
- Нет централизованного логирования (TODO)

### Production рекомендации
- **Sentry** для error tracking (capture unhandled exceptions)
- **Pino/Winston** для structured JSON logs
- **PostHog / Plausible** для analytics (privacy-friendly)
- **Anthropic Console** для LLM usage monitoring
- **OpenAI Dashboard** для Whisper cost tracking

### Что НЕ логируем
- Полные transcripts (PII)
- Email адреса (или hash)
- JWT tokens
- Magic tokens

---

## 9. Data retention

- **Demo data** (seed) — пересоздаётся при каждом `prisma migrate reset`
- **Real user data** — хранится бессрочно, пока user не запросит delete (TODO)
- **JWT tokens** — истекают через 8 часов, после чего требуется re-login
- **Magic tokens** — 15 мин TTL, single-use (помечаются `usedAt`)

### GDPR / deletion (TODO)
- Endpoint `DELETE /api/users/:id` (cascade delete events + recordings)
- Email notification «account deleted»
- Backup cleanup через 30 дней

---

## 10. Reporting vulnerabilities

**НЕ** создавайте public GitHub issues для security багов.

Пишите на: `security@qoldau.example.com` (TODO настроить, пока — DM maintainer'ам)

Response time: 48 часов. Critical fixes — в течение 7 дней.

---

## 11. Compliance checklist (production launch)

- [ ] HTTPS enforced (HSTS header)
- [ ] `JWT_SECRET` ≥ 32 chars, ротация документирована
- [ ] `CORS_ORIGIN` whitelist точный (без `*`)
- [ ] Rate limits активны (включая auth)
- [ ] Email magic-link отправляется через проверенный provider
- [ ] Backups БД автоматические (daily, offsite)
- [ ] Sentry / error tracking настроен
- [ ] Dependencies: `npm audit` clean, Dependabot enabled
- [ ] CSP headers configured
- [ ] Privacy policy опубликована
- [ ] Cookie consent banner (если используем cookies)
- [ ] GDPR data export endpoint
- [ ] GDPR data deletion endpoint
- [ ] Penetration test проведён (для healthcare-adjacent)
- [ ] Security review проведён перед launch

---

## 12. Known limitations (v0.6.4)

1. **No event-level auth** — все аутентифицированные пользователи видят все события (TODO)
2. **JWT в localStorage** — XSS risk (TODO: httpOnly cookies)
3. **No CSRF protection** — пока нет state-changing GET endpoints, но POST/PATCH/DELETE уязвимы
4. **No password reset** — только magic-link (single factor)
5. **No 2FA** — для production с PII нужен TOTP
6. **No audit log** — кто какое событие создал/изменил, не трекается
7. **No encryption at rest** — БД plain (encryption at rest — задача cloud provider)
8. **Mock fallback data** содержит реальные детские имена (Алихан, Мира, Тимур) — нужно заменить на synthetic
