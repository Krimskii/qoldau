# QOLDAU AI — План поставки Части A (разделение труда)

> Как реализуем функциональную завершённость v1.0.x → готовый к Wave 0 APK.
> Производная от [WORKPLAN.md](WORKPLAN.md) (что) и [STRATEGY.md](STRATEGY.md) (зачем).
> Дата: июль 2026. Принцип: **Claude — только ответственные задачи** (архитектура,
> контракты, интеграция, гейты, релиз); реализацию делают MiniMax и Codex.

## Разделение труда (RACI)

| Пакет работ | Делает (R) | Приёмка (A) | Зона |
|---|---|---|---|
| Батч 6 · чистый старт реальной семьи (demo↔real) | **MiniMax** | Claude (дизайн+приёмка) | `apps/prototype` |
| Батч 3 · AAC TTS «говорящие карточки» + логирование | **MiniMax** | Claude | `apps/prototype` |
| Батч 4 · демо-гид не наезжает на живые экраны | **MiniMax** | Claude | `apps/prototype` |
| Батч 5 · экраны на реальных данных (Reports и др.) | **MiniMax** | Claude | `apps/prototype` |
| AI-качество разбора + контрактный тест ingest | **Codex** | Claude | `apps/api` |
| Архитектура, контракты, тикеты | **Claude** | Claude | `docs` |
| Интеграция (`--no-ff` merge), гейты качества | **Claude** | Claude | integration |
| Верификация в браузере + сборка APK | **Claude** | Claude | — |
| Release/PR, синк docs | **Claude** | Claude | `docs` |
| On-device QA, ретрансляция тикетов агентам, деплой-триггеры | **Owner** | Owner | — |

**Что Claude НЕ делает:** прикладной код фич (отдаётся MiniMax/Codex). Исключение —
если агент застопорился, Claude берёт код на себя по явному запросу владельца.

## Последовательность (два параллельных трека, зоны не пересекаются)

```
Track API  (Codex,  apps/api)      ┐
  feature/v1.0.x-ai-quality        │  параллельно, 0 overlap
Track UI   (MiniMax, apps/prototype)┘
  feature/v1.0.x-functional-buttons
    коммиты: 6 (clean start) → 3 (AAC TTS) → 4 (tour) → 5 (real data)
```

1. Оба трека стартуют от `release/v1.0rc-wave0-gate` (HEAD с per-device сторами).
2. **Порядок внутри UI-ветки:** Батч 6 первым (foundational, Wave-0 блокер), затем 3→4→5.
3. Claude сводит каждый трек `--no-ff` в `release/v1.0rc-wave0-gate` по мере готовности
   (сначала тот, что готов; конфликтов нет — зоны разные).
4. После обоих merge → Claude собирает **новый подписанный APK** → Owner ставит и гоняет QA.

## Гейты качества (Claude, на каждый merge)
- [ ] Зоны не пересеклись (Codex только `apps/api`, MiniMax только `apps/prototype`).
- [ ] `typecheck` + `test` + `build` зелёные в обоих приложениях (сейчас api 28 / фронт 27).
- [ ] Проверка **по коду**, не по отчётам агента (grep фактических изменений).
- [ ] Медицинские формулировки — чисто (SAFETY_WORDING).
- [ ] Секретов/артефактов в git нет; `.env`/keystore/apk не трекаются.
- [ ] Браузер-верификация ключевого поведения (TTS слышно, тур не наезжает,
      реальная семья стартует с пустой лентой, числа из стора).

## Definition of Done — «следующая стадия» (функционально-полный Wave-0 APK)
- Все 6 батчей + AI-качество влиты в `release/v1.0rc-wave0-gate`, гейты зелёные.
- Новый подписанный APK с прод-URL; on-device QA по [QA_PLAN_V1.md](QA_PLAN_V1.md) пройден:
  каждый интерактивный элемент делает осмысленное действие или честно помечен, тупиков нет.
- Реальная семья: чистый старт, голос→событие, детский AAC озвучивает и логирует.
- → снять Draft с [PR #2](https://github.com/Krimskii/qoldau/pull/2), решить master↔integration, merge.

## После этого — Часть B (v1.5) начинается с архитектурного долга
Первой задачей v1.5 (до аналитики): формализовать схему `QoldauEvent`
(`schemaVersion`, `occurredAt`/`recordedAt`, типизированный `payload`) +
интерфейс `EventStorage` (STRATEGY §6.2–6.3). Затем паттерн-движок, golden-set, ATEC.

---
*Тикеты: `docs/tickets/MINIMAX_v1.0.x_functional_buttons.md`,
`docs/tickets/MINIMAX_v1.0.x_real_family_clean_start.md`,
`docs/tickets/CODEX_v1.0.x_ai_quality_contract.md`.*
