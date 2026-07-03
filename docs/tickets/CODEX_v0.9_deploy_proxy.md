# Ticket — Codex — v0.9 deploy stateless proxy

> Готовый промпт для Codex. База: `integration/v0.8-stateless-pipeline`.
> См. [ROADMAP_V1.md](../ROADMAP_V1.md).

---

Ты работаешь в проекте Qoldau AI. Роль: Backend / deploy engineer.

Базовая ветка: `integration/v0.8-stateless-pipeline`
Создай ветку: `feature/v0.9-deploy-proxy`

## Цель
Задеплоить stateless AI-прокси в прод по HTTPS, чтобы APK семей ходил на него.
Backend уже stateless (без БД/auth/realtime). Нужен только рантайм + ключи + лимиты.

## Строгие границы
МОЖНО: `apps/api/**`, `apps/api/Dockerfile`, `docs/DEPLOYMENT.md` (раздел proxy),
`apps/prototype/src/api/audio.ts` (только чистка shim, см. п.5).
НЕЛЬЗЯ: `pages/**`, `components/**`, UI, docs handoff/roadmap (зона Claude).

## Задачи
1. `git switch integration/v0.8-stateless-pipeline && git pull`
   `git switch -c feature/v0.9-deploy-proxy`

2. **Деплой-конфиг** (Railway или Render — по существующему `docs/DEPLOYMENT.md`):
   - проверить `apps/api/Dockerfile` — стартует stateless-прокси (без prisma migrate,
     без seed, без socket.io);
   - `PORT` из env; `/api/health` отвечает для healthcheck платформы;
   - env-переменные в дашборде: `ANTHROPIC_API_KEY`, `WHISPER_API_KEY`,
     `ANTHROPIC_MODEL`, `WHISPER_MODEL`, `CORS_ORIGIN`, `SENTRY_DSN`, `NODE_ENV=production`.

3. **Лимиты/бюджет** (прод, реальные деньги):
   - подтвердить `audioIngestRateLimit` активен;
   - кап длительности/размера аудио;
   - разумный per-IP лимит запросов/мин;
   - graceful-ошибки STT/LLM (структурированный JSON, не 500).

4. **Sentry** включён на backend через `SENTRY_DSN` (opt-in, без ключа — off).

5. **Cleanup shim**: убрать мёртвый `recording` fallback в
   `apps/prototype/src/api/audio.ts` (VoiceObservation на него больше не завязан).
   Проверить, что фронт-тесты/typecheck остаются зелёными.

6. **Медицинские формулировки** — не вводить запрещённых (см. `docs/SAFETY_WORDING.md`).

7. Проверки:
   ```
   cd apps/api && npm run typecheck && npm test
   cd ../prototype && npm run typecheck && npm test && npm run build
   ```

8. Commit + push:
   ```
   git add apps/api apps/prototype/src/api docs/DEPLOYMENT.md
   git commit -m "feat(deploy): stateless proxy prod config + Sentry + shim cleanup"
   git push -u origin feature/v0.9-deploy-proxy
   ```

## Финальный отчёт
- branch, commit SHA, files changed
- прод-URL прокси (после деплоя) + вывод `curl <url>/api/health`, `/api/ai/health`, `/api/stt/health`
- какие лимиты выставлены (rate, audio cap)
- убран ли shim
- какие проверки прошли
- что нужно для APK: `VITE_API_BASE_URL=<прод-URL>`
