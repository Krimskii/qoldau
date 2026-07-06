# Ticket — Codex — v1.6 P2.1: разрешить EMAIL_PROVIDER=none в проде (deploy без email-инфры)

> Зона: **только `apps/api/**`.** Ветка: продолжить **`feature/v1.6-be-p2-auth-sync`**
> (чтобы вошло в P2 одним куском) — новый коммит поверх P2. Небольшая правка.
>
> **Зачем:** P2 сейчас имеет startup fail-fast — в проде `EMAIL_PROVIDER=none` запрещён
> (`config/env.ts`: `throw '[env] EMAIL_PROVIDER=none is not allowed in production'`). Из-за
> этого P2 нельзя задеплоить, пока не поднята email-инфра (Resend/SMTP+APP_URL). Но фронт
> sync/логин ЕЩЁ не использует — деплоить с email рано. Нужно, чтобы P2 **стартовал в проде
> без email**, сохраняя безопасность.

## Что сделать
1. **`config/env.ts`:** для `EMAIL_PROVIDER=none` (или не задан) в production — **заменить
   `throw` на `console.warn`** (напр. `[env] EMAIL_PROVIDER=none — email-доставка отключена,
   magic-link/инвайты недоступны, cloud-логин выключен`). Приложение стартует.
   - Оставить fail-fast, если `EMAIL_PROVIDER=resend|smtp`, но НЕ хватает `APP_URL`/
     `RESEND_API_KEY`/`SMTP_*` (это реальная мисконфигурация — падать правильно).
   - Проверку «none | resend | smtp» (валидное значение) сохранить.
2. **Безопасность `requestMagicLink` при provider=none:** НЕ возвращать сырой magic-token в
   ответе в **production** (сейчас dev его отдаёт как `devMagicUrl`). При `EMAIL_PROVIDER=none`:
   - dev/test — как есть (devMagicUrl/токен, демо без почты);
   - **production — вернуть `{ ok:false, error:'email_delivery_not_configured' }` (или 503)**,
     токен НЕ создавать/НЕ отдавать. То есть в проде без email логин по magic-link просто
     недоступен (это ок — фронт демо/local-first), но утечки токена нет.
3. Всё остальное P2 (sync API, refresh/logout, invites, схема) — без изменений.

## Поведение после P2.1 (что деплоится в прод)
- Прод стартует с `EMAIL_PROVIDER=none` (или без переменной) → приложение живо, sync-код
  присутствует, data-роуты остаются за authz (401), демо/local-first работает.
- Когда позже поднимут email: выставить `EMAIL_PROVIDER=resend` + `APP_URL` + `RESEND_API_KEY`
  → magic-link/инвайты/логин включаются без изменения кода.

## Проверки / отчёт
```
cd apps/api && npm run typecheck && npm test && npm run eval
npm run build && node dist/index.js   # ДОЛЖЕН стартовать с EMAIL_PROVIDER=none в NODE_ENV=production
prisma validate
git push origin feature/v1.6-be-p2-auth-sync
```
Тесты: (a) prod + EMAIL_PROVIDER=none → env-load НЕ бросает, сервер стартует; (b) prod+none +
`requestMagicLink` → НЕ отдаёт токен (`email_delivery_not_configured`); (c) provider=resend без
RESEND_API_KEY → всё ещё fail-fast; (d) регресс sync/authz/AI-proxy. Отчёт: диффы env.ts/
authService, подтверждение `node dist` старта с none в проде, матрица email-поведения.
