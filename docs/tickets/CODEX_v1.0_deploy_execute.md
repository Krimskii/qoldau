# Ticket — Codex — v1.0 execute deploy (prod proxy)

> База: `integration/v0.9-pilot-ru`. Deploy-конфиг уже готов (v0.9). Здесь —
> фактический деплой + прод-URL. См. [ROADMAP_V1.md](../ROADMAP_V1.md),
> [PRIVACY_CONSENT_PILOT.md](../PRIVACY_CONSENT_PILOT.md).

---

Ты работаешь в проекте Qoldau AI. Роль: Backend / deploy engineer.

Базовая ветка: `integration/v0.9-pilot-ru`
Создай ветку: `feature/v1.0-deploy-execute`

## Цель
Реально задеплоить stateless AI-прокси в прод по HTTPS и вернуть прод-URL, чтобы
APK семей на него ходил.

> ⚠️ Часть шагов — действия владельца в дашборде (аккаунт, оплата, ввод секретных
> ключей). Ты готовишь автоматизацию + пошаговый runbook и **проверяешь**
> результат; ключи в репозиторий не коммитить.

## Строгие границы
МОЖНО: `apps/api/**` (deploy-манифесты: `railway.json`/`render.yaml`, Dockerfile),
`docs/DEPLOYMENT.md`.
НЕЛЬЗЯ: UI, `pages/**`, `components/**`, docs handoff/roadmap/privacy/QA.

## Задачи
1. `git switch integration/v0.9-pilot-ru && git pull`
   `git switch -c feature/v1.0-deploy-execute`

2. **Deploy-манифест** для выбранной платформы (Railway рекомендуется):
   - `railway.json` (или `render.yaml`): build из Dockerfile, healthcheck
     `/api/health`, `PORT` из env, рестарт-политика;
   - убедиться, что старт = stateless (без migrate/seed/socket.io).

3. **Runbook в `docs/DEPLOYMENT.md`** — точные шаги владельцу:
   - создать проект на Railway → deploy from GitHub (ветка/интеграция);
   - env-переменные (значения владелец вводит сам, НЕ в git):
     **`OPENAI_API_KEY`** (один ключ на STT+LLM), `OPENAI_LLM_MODEL`, `WHISPER_MODEL`,
     `CORS_ORIGIN`, `SENTRY_DSN`, `NODE_ENV=production`, `AUDIO_INGEST_RATE_LIMIT_PER_MIN`;
   - как получить публичный HTTPS-URL.

4. **После деплоя — верификация** (владелец даёт URL):
   ```
   curl https://<url>/api/health
   curl https://<url>/api/ai/health     # ожидается mode:"openai"
   curl https://<url>/api/stt/health    # ожидается mode:"whisper"
   curl https://<url>/api/audio/health  # maxAudioMb/rateLimitPerMin
   ```
   Приложить вывод в отчёт.

5. **CORS**: `CORS_ORIGIN` включает домен фронта/APK-origin (для Capacitor —
   локальная схема; проверить, что запросы с устройства проходят).

6. **Sentry**: подтвердить, что при заданном `SENTRY_DSN` ошибки летят; в payload
   **нет PII ребёнка** (имена/транскрипты). Если есть — вычистить.

## Проверки
```
cd apps/api && npm run typecheck && npm test
```

## Commit + push
```
git add apps/api docs/DEPLOYMENT.md
git commit -m "feat(deploy): prod deploy manifest + runbook + verification"
git push -u origin feature/v1.0-deploy-execute
```

## Финальный отчёт
- branch, commit SHA
- **прод-URL** + вывод 4 health-curl
- какие env выставлены (без значений)
- CORS ок для APK?
- Sentry без PII ребёнка?
- **что нужно для APK:** `VITE_API_BASE_URL=https://<url>`
