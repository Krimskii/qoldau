# Qoldau AI — Roadmap to v1.0 (Pilot MVP)

Единый источник для трёх агентов (Codex / MiniMax / Claude). База: интеграция
`integration/v0.7.6-real-voice-pipeline`. См. также [AGENT_WORKFLOW.md](AGENT_WORKFLOW.md).

## Зафиксированный scope (решения владельца)

| Развилка | Решение |
| --- | --- |
| Модель данных | **Per-device**: данные семьи локально (localStorage). Backend = stateless AI-прокси. |
| Языки | **RU-only** для пилота (i18n-инфра остаётся, поддерживаем только RU). |
| AI | **Real Claude + Whisper** с лимитами/квотами (не mock). |
| Дистрибуция | Android APK → ~20 семей (Google Play Internal Testing или прямой APK). |

## Целевая архитектура v1.0

```
Телефон семьи (Capacitor APK, RU)
  ├─ данные локально (localStorage) — БЕЗ облачного синка
  └─ голос → POST https://<proxy>/api/audio/ingest
                 └─ Whisper STT → Claude LLM → { transcript, events[], insight, questions }
                 └─ STATELESS: без записи в БД, без auth, без realtime
  ← события сохраняются на устройстве, показываются в Event Timeline
```

**Что убрано осознанно** (per-device делает это ненужным):
- WebSocket/socket.io realtime — на одном устройстве синк между ролями не нужен.
  Это закрывает 5 багов из код-ревью удалением, а не починкой.
- Postgres / multi-tenant / enforced-auth — данные per-device, нечему протекать.
- Серверное хранение событий — pipeline stateless; фронт вставляет события локально.

## Вехи и тикеты

### v0.8.0 — Упрощение до stateless (Codex ведёт)
- **CODEX** `feature/v0.8-stateless-proxy` (`apps/api/**`):
  audio pipeline → stateless (убрать DB-write + broadcast, вернуть распарсенные
  события в ответе); rate-limit + payload cap + бюджет-гварды на `/api/audio/ingest`,
  STT, LLM; убрать/выключить socket.io realtime. Обновить контракт ответа.
- **MINIMAX** `feature/v0.8-local-events` (`pages/**`, `components/**`):
  убрать `useRealtimeEvents` из `EventTimeline`; локальная вставка события =
  единственный путь (снимается дедуп-сложность).
- **CLAUDE**: интеграция `--no-ff`, обновить `CURRENT_ARCHITECTURE.md` (stateless),
  ре-ревью изменений.

### v0.9.0 — Полировка MVP
- **MINIMAX**: RU-аудит всех страниц (чистый русский, без хардкод-заглушек);
  финальный дизайн-проход (padding / touch-targets / tokens); онбординг
  «первый запуск → настройка семьи» вместо демо-лендинга.
- **CODEX**: деплой stateless-прокси (Railway/Render): HTTPS, env-ключи,
  `/api/*/health`.
- **CLAUDE**: приватность/согласие (детские данные — юридический минимум),
  QA-план по ролям.

### v1.0.0 — Pilot release
- **CODEX**: real Claude + Whisper в проде с квотами + Sentry-мониторинг +
  cost-гварды (лимит длительности аудио, лимит запросов).
- **MINIMAX**: финальный UX всех ролей — loading / empty / error состояния.
- **CLAUDE**: Android release-сборка (подпись готова, keystore локально) →
  Internal Testing; `VITE_API_BASE_URL` → прод-прокси; сквозной QA + ручной
  smoke с микрофоном; Draft→Ready PR в master.

## Гварды (чтобы агенты не ломали друг друга)
1. Контракт-first: Codex публикует контракт до того, как MiniMax его потребляет.
2. Один агент = одна ветка = своя зона файлов (см. AGENT_WORKFLOW.md §3).
3. Коммит в том же шаге, где правишь — незакоммиченное гибнет при чужом `git switch`.
4. Интеграцию делает только Claude через `--no-ff` в порядке Codex → MiniMax → docs.
5. `master` — только через Draft PR после зелёной сборки + ручного smoke.
6. DoD на задачу: `typecheck ✓ · tests ✓ · build ✓ · нет medical claims · нет секретов · отчёт`.

## Definition of Done для v1.0
- [ ] Голос → Whisper → Claude → Event → Timeline работает end-to-end на реальном устройстве.
- [ ] Fallback (нет сети / нет микрофона) не ломает приложение.
- [ ] Backend stateless, с лимитами, задеплоен по HTTPS, Sentry включён.
- [ ] Данные семьи локальные, между семьями ничего не пересекается.
- [ ] RU-интерфейс без заглушек; дизайн консистентен; тач-таргеты ≥44px.
- [ ] Android APK подписан, ставится, `VITE_API_BASE_URL` → прод-прокси.
- [ ] Нет запрещённых medical claims; disclaimer «не диагностирует» на месте.
- [ ] Сквозной QA по всем 4 ролям пройден вручную.
