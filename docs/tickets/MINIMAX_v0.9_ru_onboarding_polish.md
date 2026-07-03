# Ticket — MiniMax — v0.9 RU-audit + onboarding + design polish

> Готовый промпт для MiniMax. База: `integration/v0.8-stateless-pipeline`.
> Можно вести параллельно с Codex (зоны не пересекаются). См. [ROADMAP_V1.md](../ROADMAP_V1.md).

---

Ты работаешь в проекте Qoldau AI. Роль: Frontend / UI / UX engineer.

Базовая ветка: `integration/v0.8-stateless-pipeline`
Создай ветку: `feature/v0.9-ru-onboarding-polish`

## Цель
Довести интерфейс до pilot-качества для RU-семей: чистый русский без заглушек,
онбординг «первый запуск → настройка семьи», финальная консистентность дизайна.

## Строгие границы
МОЖНО: `pages/**`, `components/**`, `i18n/**` (RU), `data/demoDataset.ts`.
НЕЛЬЗЯ: `apps/api/**`, `api/audio.ts`, `hooks/use*Recorder*`, STT/LLM, docs.

## Задачи
1. `git switch integration/v0.8-stateless-pipeline && git pull`
   `git switch -c feature/v0.9-ru-onboarding-polish`

2. **RU-аудит всех страниц** (пилот = RU-only):
   - пройтись по `pages/**` — не осталось ли хардкод-заглушек, английского текста,
     placeholder'ов, «Демо-профиль N» на видных местах;
   - убедиться, что везде осторожные формулировки (наблюдение, не диагноз);
   - i18n оставить (инфра), но поддерживаем и вычищаем только RU.

3. **Онбординг первого запуска**:
   - при первом старте (нет сохранённого имени ребёнка) вести на настройку семьи
     (`FamilySetupCard` / профиль), а не на демо-лендинг;
   - после настройки — обычный флоу. Демо-режим оставить доступным отдельной кнопкой.

4. **Финальный дизайн-проход** (consistency):
   - padding/spacing единообразны (page = `px-5`);
   - тач-таргеты интерактива ≥44px (детский UI — крупнее);
   - цвета только через токены дизайн-системы (без хардкод-хексов);
   - loading / empty / error состояния на ключевых страницах (Timeline, Voice, роли).

5. **Осторожные формулировки**: «Похоже…», «Возможно…», «Нужно подтвердить»,
   «Это наблюдение, не диагноз». Запрещённые medical claims не вводить
   (см. `docs/SAFETY_WORDING.md`).

6. Проверки:
   ```
   cd apps/prototype && npm run typecheck && npm test && npm run build
   ```

7. Commit + push:
   ```
   git add apps/prototype/src/pages apps/prototype/src/components apps/prototype/src/i18n apps/prototype/src/data
   git commit -m "feat(ux): RU polish + first-run onboarding + design consistency"
   git push -u origin feature/v0.9-ru-onboarding-polish
   ```

## Финальный отчёт
- branch, commit SHA, files changed
- какие страницы затронуты RU-аудитом
- как работает первый запуск (онбординг)
- что поправлено по дизайну (padding/touch/tokens/состояния)
- какие проверки прошли
