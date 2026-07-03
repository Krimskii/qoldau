# Ticket — MiniMax — v1.0 consent gate + data controls

> База: `integration/v0.9-pilot-ru`. Спека: [PRIVACY_CONSENT_PILOT.md](../PRIVACY_CONSENT_PILOT.md).
> Можно параллельно с Codex deploy (зоны не пересекаются).

---

Ты работаешь в проекте Qoldau AI. Роль: Frontend / UI / privacy UX engineer.

Базовая ветка: `integration/v0.9-pilot-ru`
Создай ветку: `feature/v1.0-consent-gate`

## Цель
Экран согласия родителя ДО первой записи (детские данные) + управление данными.
Реализовать по спеке `docs/PRIVACY_CONSENT_PILOT.md` §2, §3, §4.

## Строгие границы
МОЖНО: `pages/**`, `components/**`, `i18n/**` (RU), `store/**` (только новый
consent-стор/флаг). НЕЛЬЗЯ: `apps/api/**`, `api/audio.ts`, `hooks/use*Recorder*`,
STT/LLM, docs.

## Задачи
1. `git switch integration/v0.9-pilot-ru && git pull`
   `git switch -c feature/v1.0-consent-gate`

2. **Consent-gate** (одноразовый, до первой записи):
   - показывается при первом заходе в запись, если согласие не сохранено;
   - текст по спеке §2 (простым языком, RU): не медицинское устройство, не
     диагностирует; данные — на устройстве; аудио → прокси → Whisper/Claude, на
     сервере не хранится; чекбокс «Я родитель/представитель и даю согласие»;
   - кнопка «Продолжить» активна только при отмеченном чекбоксе;
   - согласие сохраняется в `localStorage` (напр. `qoldau-consent-v1`), экран
     больше не показывается.

3. **Мини-политика** (§4) — доступна из приложения (профиль/настройки), ссылка со
   экрана согласия. Текст взять из спеки §4.

4. **Управление данными** (privacy DoD):
   - «Очистить данные» в настройках/профиле — стирает локальные данные ребёнка
     (события, имя, согласие) из localStorage, с подтверждением.

5. **i18n RU** для новых строк (kk/en — по желанию, но не блокер пилота).

6. **Осторожные формулировки**, без medical claims (`docs/SAFETY_WORDING.md`).

7. Проверки:
   ```
   cd apps/prototype && npm run typecheck && npm test && npm run build
   ```

## Commit + push
```
git add apps/prototype/src/pages apps/prototype/src/components apps/prototype/src/i18n apps/prototype/src/store
git commit -m "feat(privacy): parental consent gate + clear-data control"
git push -u origin feature/v1.0-consent-gate
```

## Финальный отчёт
- branch, commit SHA, files changed
- как проверить consent-gate (первый запуск → запись)
- где мини-политика и «Очистить данные»
- сохраняется ли согласие (не показывается повторно)
- какие проверки прошли
