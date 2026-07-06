# Ticket — MiniMax — v1.6 E9: Front-end интеграция Sync (auth-логин + облачная синхронизация)

> Зона: **только `apps/prototype/**`.** База: `integration/v1.5` (там весь фронт E1-E8 +
> бэкенд P2 sync API уже на проде). Ветка: `feature/v1.6-fe-sync`.
> **Бэкенд готов** (задеплоен): `/api/auth/*` (magic-link, refresh, logout, /me→childIds),
> `/api/sync/pull?childId=&since=`, `/api/sync/push` (LWW по updatedAt, tombstones через
> deletedAt), все за `Authorization: Bearer <jwt>`. E7.5 уже подмешивает Bearer и обрабатывает
> 401/403 за флагом `VITE_REQUIRE_AUTH`. Задача — довести это до **реального рабочего sync**.
>
> **КРИТИЧНО — не сломать демо/local-first:** всё новое за флагом (`VITE_ENABLE_SYNC`/
> `VITE_REQUIRE_AUTH`). Без логина приложение работает как раньше (локально). Sync —
> ОПЦИОНАЛЬНЫЙ слой поверх local-first, не замена.

## Про тестирование (важно про окружение)
В **проде** email-доставка выключена (`EMAIL_PROVIDER=none` → `request-magic-link` даёт 503),
поэтому реальный логин по email в проде пока НЕ работает — это ОК, включат позже. **Тестировать
против локального dev-бэкенда** (`apps/api`, `npm run dev`): там `EMAIL_PROVIDER=none` в dev
возвращает `devMagicUrl`/токен прямо в ответе → можно пройти логин без почты. Поднять локальный
Postgres или использовать тестовую БД по `docs/BACKEND_DEPLOY.md`.

---

## E9.1 — Auth-стор и рабочий логин
- **`store/useAuthStore.ts`** (persist): `jwt` (access), `refreshToken`, `user {id,email,role,
  childIds}`, `status`. Экшены: `requestMagicLink(email)`, `verify(token)`, `refresh()`,
  `logout()`.
- **LoginPage → VerifyPage flow:** email → `POST /api/auth/request-magic-link`. В dev ответ
  содержит `devMagicUrl`/token → авто-подставить в VerifyPage (для демо-логина без почты).
  verify → сохранить jwt+refresh+user. Состояния/ошибки (`ErrorState`), i18n ru/kk/en.
- **`api/client.ts`:** брать jwt из useAuthStore; на **401** — попытка `refresh()`, при неудаче
  → logout + (если `VITE_REQUIRE_AUTH`) редирект `/auth/login?returnTo=`. В демо (нет jwt) —
  local-first без принуждения.
- «Продолжить как демо» — остаётся (без логина, local-only).

## E9.2 — Sync engine (ядро)
- **`lib/sync/syncService.ts`** — движок:
  - **pull:** `GET /api/sync/pull?childId=&since=<lastSyncedAt>` → применить изменения в
    локальные сторы (`useEventStore`/recordings/children): upsert по `id`, удалять по
    `deletedAt` (tombstone). Сохранить `serverTime` как новый `lastSyncedAt` (per child).
  - **push:** собрать локальные изменения с `updatedAt > lastPushedAt` (нужно локально
    трекать `updatedAt`/`deletedAt` на записях — добавить в модель стора) → `POST /api/sync/push`
    батчем. Обработать ответ: `applied`/`conflicts` (сервер LWW — при конфликте взять серверную
    версию из следующего pull).
  - **reconcile:** порядок push→pull (или pull→push→pull) — выбрать и задокументировать;
    идемпотентность по `id` (сервер не создаёт дубли).
- **Триггеры:** при логине; при возврете приложения на передний план (Capacitor
  `App` resume); дебаунс после локальной мутации (напр. 3-5с); ручная кнопка «Синхронизировать».
- **Офлайн-очередь:** локальные изменения копятся; при появлении сети+jwt — sync. Не терять
  данные при офлайне.
- **Скоуп по ребёнку:** sync по `selectedChildId` (из E7.3 `useCurrentChild`) и доступным
  `user.childIds`.

## E9.3 — Локальные модели: updatedAt/deletedAt/soft-delete
- Добавить в записи сторов (events/recordings/children) поля `updatedAt` (ISO), `deletedAt?`.
  Все локальные create/update ставят `updatedAt=now`; удаление = soft-delete (`deletedAt=now`),
  UI скрывает удалённые. Это нужно для корректного push и LWW.
- Миграция локального стора (persist version bump) — не потерять существующие локальные данные.

## E9.4 — UI статуса синхронизации
- Компонент **`SyncStatusBadge`** (в шапке/профиле): «Синхронизировано · только что» /
  «Синхронизация…» / «Офлайн» / «Ошибка · повторить» / «Демо (без входа)». Токены, i18n, a11y.
- В профиле: «Войти для синхронизации» (если демо) / email+logout (если вошёл), кнопка
  «Синхронизировать сейчас», время последней синхронизации.

## E9.5 — Конфликты и целостность
- Сервер = source of truth при конфликте (LWW по updatedAt) — после push всегда делать pull,
  локальная версия перезаписывается серверной при конфликте.
- Не смешивать данные ролей/детей: только доступные `childIds`.
- Тесты (моки `api`): pull применяет upsert+tombstone; push шлёт локальную дельту; 401→refresh→
  retry; офлайн→очередь→sync при онлайне; демо-режим без jwt не дёргает sync; конфликт берёт
  серверную версию.

## Флаги / обратная совместимость
- `VITE_ENABLE_SYNC` (или переиспользовать `VITE_REQUIRE_AUTH`): выкл по умолчанию → чистый
  local-first демо. Вкл → показывается логин/sync. APK-сборка по умолчанию демо (как сейчас).
- Не ломать существующие 255 fe-тестов.

## Проверки / отчёт
```
cd apps/prototype && npm run typecheck && npm test && npm run build
git push -u origin feature/v1.6-fe-sync
```
Отчёт: файлы; как протестировано против dev-бэка (скрин логина+sync); матрица тестов sync;
подтверждение — (1) демо/local-first не сломан (флаг выкл); (2) логин→jwt→sync работает в dev;
(3) pull/push/tombstone/конфликт/офлайн-очередь; (4) 401→refresh; (5) 0 хардкод-hex, i18n,
a11y. Что осталось на прод-активацию (email-инфра).
