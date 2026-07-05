# MiniMax — v1.5+ E3: Specialist surface production

> **Автор:** MiniMax · **Дата:** 2026-07-05 · **База:** `integration/v1.5`
> **Цель:** i18n для всех 7 specialist-страниц + убрать 5 «следующая версия» stubs
> в `Reports.tsx` (главное).
> **Связь:** Шаг 3 из `MINIMAX_PRODUCTION_READINESS_PLAN.md` (E3).
> **Бранч:** `feature/v1.5-E3-specialist-prod`

---

## 0. Контекст

7 страниц specialist: Dashboard / Events / ABC / Communication / Care / Support / Reports.
Главная боль: **5 кнопок «Другие отчёты»** в `Reports.tsx` → toast «появится в
следующей версии» (явный next-version stub). Убираем / делаем честно.

Плюс ~30 строк хардкод-русского в JSX (FILTERS в SpecialistEvents, hardcoded
массивы в SupportPlan, hardcoded примеры в CommunicationProfile, hardcoded
шаблоны в CarePatterns, hardcoded метки в ABCAnalysis).

---

## 1. Изменения

### 1.1 `pages/specialist/Reports.tsx` — убрать 5 «следующая версия» stubs
- Удалить блок «Другие отчёты» с 4 кнопками → они вводили в заблуждение.
- Оставить только реальные отчёты (текущий preview + Скачать PDF + Отправить).
- Или: оставить кнопки, но переименовать «Доступно в следующей версии» →
  «Все отчёты» с фильтром по периоду.

**Выбор:** удалить кнопки-стабы. Они не функциональны, только вредят UX.

### 1.2 i18n для всех 7 specialist-страниц
Создать namespace `specialist.*` в ru/kk/en:
- `specialist.nav` (dashboard/events/abc/communication/patterns/supportPlan/reports)
- `specialist.dashboard` (KPI labels, periods, AI summary)
- `specialist.events` (PageHeader, FILTERS, empty state)
- `specialist.abc` (PageHeader, A/B/C labels, explanation, insights)
- `specialist.communication` (PageHeader, categories, AI observation)
- `specialist.carePatterns` (PageHeader, summary, time-of-day, pattern cards)
- `specialist.supportPlan` (PageHeader, schedule, sensory, what helps, to try, to confirm)
- `specialist.reports` (PageHeader, sections 1-4, period label, empty state, KPI labels)

---

## 2. Ключи i18n — высокоуровнево

```json
{
  "specialist": {
    "nav": { "dashboard": "...", "events": "...", "abc": "...", "communication": "...", "patterns": "...", "supportPlan": "...", "reports": "..." },
    "dashboard": { "title": "...", "period7": "7 дней", "period14": "14 дней", "period30": "30 дней" },
    "events": { "title": "...", "subtitle": "{{count}} событий", "filterAll": "Все", "filterParent": "Родитель", "filterChild": "Ребёнок", "filterTutor": "Тьютор", "filterSpecialist": "Специалист", "empty": "Нет событий этого источника", "emptyHint": "Попробуйте другой фильтр" },
    "abc": { "title": "...", "subtitle": "{{name}} · триггеры и последствия", "whatIsAbc": "Что такое ABC", "abcExplanation": "...", "triggersLabel": "Триггеров", "incidentsLabel": "Случаев", "reactionsLabel": "Реакций", "chainTitle": "Цепочка наблюдений", "beforeLabel": "До", "whatLabel": "Что", "afterLabel": "После", "noData": "Нет данных", "patternsTitle": "Примеры паттернов (демо)", "patternsHint": "...", "insightText": "..." },
    "communication": { "title": "...", "subtitle": "{{name}} · {{count}} сигналов", "aiObservation": "AI наблюдение", "aiNeutral": "Это наблюдение, не диагноз. Нужно подтвердить.", "signalsTitle": "Сигналы ребёнка", "frequency": "Частота", "signalsCount": "Сигналов", "confirmed": "Подтверждённых", "toCheck": "Проверить", "demoBadge": "примеры (демо)" },
    "carePatterns": { "title": "...", "subtitle": "{{name}} · связь событий", "summaryFood": "Еда", "summaryWater": "Вода", "summaryToilet": "Туалет", "summarySensory": "Сенсорика", "timeOfDay": "В какое время суток сложнее всего", "timeOfDayHint": "Сенсорные реакции и нервозность — по времени дня.", "morning": "Утро (6-12)", "day": "День (12-17)", "evening": "Вечер (17-21)", "night": "Ночь (21-6)", "hardestTime": "Самое сложное время:", "patterns": "Связи событий (гипотезы)", "bigPicture": "Общая картина", "bigPictureText": "...", "openTimeline": "Открыть Event Timeline", "openTimelineHint": "..." },
    "supportPlan": { "title": "...", "subtitle": "{{name}}, {{age}} лет", "warning": "...", "visualSchedule": "Визуальное расписание", "sensorySupport": "Сенсорная поддержка", "whatHelps": "Что помогает", "toTry": "Что стоит попробовать", "toConfirm": "Что подтвердить наблюдениями", "discussTitle": "Что обсудить со специалистом:", "discussBody": "..." },
    "reports": { "title": "...", "subtitle": "По данным Event Timeline", "header": "Qoldau AI · Отчёт", "weekly": "Недельный", "section1Title": "Итоги недели", "section2Title": "Ключевые показатели", "section3Title": "Ключевые наблюдения", "section4Title": "Что можно попробовать", "kpiAac": "AAC / фраз", "kpiCalm": "Спокойный режим", "kpiNew": "Новых сигналов", "perWeek": "за неделю", "emptyObs": "Пока нет наблюдений", "noData": "Пока мало наблюдений — добавьте голосом или AAC-карточкой, и здесь появятся итоги недели. Это наблюдения, не диагноз.", "withData": "Зафиксировано {{total}} событий за неделю от родителя, тьютора и ребёнка. Это наблюдения, не диагноз. Можно продолжить наблюдать, чтобы увидеть динамику.", "shareCopied": "Текст отчёта скопирован", "shareFailed": "Не удалось скопировать", "shareUnavailable": "Поделиться недоступно на этом устройстве", "downloadPdf": "Скачать PDF", "send": "Отправить", "disclaimer": "Qoldau AI — профиль наблюдений, не медицинское устройство.", "shareText": "Профиль наблюдений {{name}} (Qoldau). Это наблюдения, не диагноз.", "shareTitle": "Qoldau — отчёт наблюдений" }
  }
}
```

---

## 3. Главное изменение — Reports.tsx

**Было:**
```tsx
{/* Другие типы отчётов — клик показывает toast (в Wave 0 не генерируются) */}
<section>
  <h3>Другие отчёты</h3>
  <div className="grid grid-cols-2">
    {REPORT_TYPES.map((type) => (
      <button onClick={() => showToast(`«${type.title}» появится в следующей версии`, 'info')}>
```

**Стало:** удалить весь блок. Оставить только реальные действия (Скачать PDF / Отправить).

---

## 4. DoD
- [x] Все 7 specialist страниц используют `t('specialist.*')`.
- [x] Reports.tsx — 5 кнопок «появится в следующей версии» удалены.
- [x] typecheck ✓ test ✓ build ✓.
- [x] i18n ru/kk/en покрытие.
- [x] 0 inline-hex в моих JSX.