# MiniMax — v1.5+ E2: Tutor surface production

> **Автор:** MiniMax · **Дата:** 2026-07-05 · **База:** `integration/v1.5`
> **Цель:** довести tutor surface до production-ready — i18n для всех
> user-facing строк + honest state для `TutorReport.handleSend` (не выдавать
> фейковое «Отчёт отправлен родителю»).
> **Связь:** Шаг 2 из `MINIMAX_PRODUCTION_READINESS_PLAN.md` (E2).
> **Зависимости:** E1 (✅ LoginPage i18n уже настроен).
> **Бранч:** `feature/v1.5-E2-tutor-production`
> **После:** merge в `integration/v1.5` после ревью.

---

## 0. Контекст

### Текущее состояние (по аудиту)
- 5 экранов: `TutorHome`, `TutorVoice`, `TutorAIReview`, `TutorReport`, `TutorChildProfile`.
- **~30 строк хардкод-русского** в JSX (особенно `TutorHome.HINTS`, `TutorVoice.examples`,
  `TutorAIReview` все user-facing строки, `TutorReport` целиком).
- 🚨 **`TutorReport.handleSend` — fake action**: показывает toast `'Отчёт отправлен родителю'`,
  но фактически НИЧЕГО не отправляет. Это обман пользователя.
- `TutorReport` «Что помогло» и «Что стоит подтвердить дома» — hardcoded массивы,
  помечены как «примеры (демо)».

### Что хотим
1. **Все user-facing строки tutor** в `tutor.*` namespace (ru/kk/en).
2. **`TutorReport.handleSend`** — honest state: показывает «Отправка отчёта родителю
   появится в следующей версии. Отчёт можно скопировать для отправки вручную.»
   вместо фейкового успеха.
3. **«Что помогло» и «Что стоит подтвердить дома»** — оставить hardcoded (это
   реальный demo-контент, уже помечен «примеры (демо)»), но добавить явно
   помеченную кнопку «Скопировать» (уже есть — `handleCopy`) как основное действие.
4. **`TutorVoice.examples`** — это примеры для подсказки тьютору; переводим в i18n
   `tutor.voice.examples` (массив строк).
5. **`TutorHome.HINTS`** — аналогично `tutor.home.hints`.
6. **`TutorChildProfile`** — массивы `whatHelps/avoidList/preferences` переводим в i18n
   `tutor.childProfile.*`.
7. **`ChildSelector`** — НЕ трогаем (используется в нескольких ролях, отдельный тикет).

### Принципы
- **Не ломать** существующие тесты, typecheck, build.
- **Чистый i18n** — никаких inline-строк в JSX.
- **Honest state** — фейковое «Отчёт отправлен» заменяем на «функция в разработке».
- **Demo-маркеры** — на hardcoded массивах (что помогло / что подтвердить) оставляем.

---

## 1. Файлы изменений

### 1.1 `apps/prototype/src/i18n/locales/{ru,kk,en}.json`
Добавить namespace `tutor.*` (подробные ключи — секция 2).

### 1.2 `apps/prototype/src/pages/tutor/TutorHome.tsx`
- Заменить хардкод `HINTS` на `t('tutor.home.hints', { returnObjects: true })`.
- Перевести: `PageHeader.title`, `subtitle`, `Расписание`, `Наговорить событие`,
  `Подсказки для ...`, `Общие рекомендации · примеры (демо)`, `Мои последние наблюдения`,
  `Пока нет наблюдений за сегодня`, `Профиль ребёнка`, `Отчёт родителю`.

### 1.3 `apps/prototype/src/pages/tutor/TutorVoice.tsx`
- Заменить хардкод `examples` на `t('tutor.voice.examples', { returnObjects: true })`.
- Перевести: `PageHeader.title`, `subtitle`, `aria-label`, `Опишите, что произошло`,
  `Примеры наблюдений`, `Остановить запись`.

### 1.4 `apps/prototype/src/pages/tutor/TutorAIReview.tsx`
- Перевести: `AI обрабатывает…`, `PageHeader`, `Расшифровка`, `Что произошло`,
  `AI не выделил событий. Можно сохранить общую заметку.`,
  `Сохранено в Event Timeline`, `К отчёту`, `Не сохранять`, `Нет данных для сохранения`,
  `Без сохранения`.
- Default insight текст → `t('tutor.aiReview.defaultInsight')`.

### 1.5 `apps/prototype/src/pages/tutor/TutorReport.tsx`
- **Honest state**: `handleSend` → toast "Отправка появится в следующей версии" + переход
  копирования (то же, что `handleCopy`).
- Перевести: `PageHeader`, `Всего`, `Хороших`, `Внимания`, `События`, `Событий пока нет`,
  `Что помогло`, `Что стоит подтвердить дома`, `Отчёт скопирован в буфер обмена`,
  `Не удалось скопировать`, `Скопировать отчёт`, `Отправить родителю`, disclaimer,
  текст отчёта (`generateReportText`).

### 1.6 `apps/prototype/src/pages/tutor/TutorChildProfile.tsx`
- Заменить хардкод `whatHelps/avoidList/preferences` на `t('tutor.childProfile.whatHelps', { returnObjects: true })` и т.д.
- Перевести: `PageHeader`, `Ключевые сигналы`, `Что помогает`, `Чего избегать`,
  `Предпочтения`, `Коммуникационный профиль →`, disclaimer.

---

## 2. i18n ключи (полный список)

### ru.json — добавить в конец секции `tutor` (создать)
```json
{
  "tutor": {
    "nav": {
      "home": "Тьютор",
      "voice": "Запись наблюдения",
      "aiReview": "AI-разбор",
      "report": "Отчёт родителю",
      "childProfile": "Профиль ребёнка"
    },
    "home": {
      "today": "Сегодня",
      "statusHint": "Общие рекомендации · примеры (демо)",
      "schedule": "Расписание",
      "voiceCta": "Наговорить событие",
      "voiceCtaAria": "Наговорить событие",
      "hintsTitle": "Подсказки для {{childName}}",
      "hints": [
        "Перед переходом — предупреждайте за 1–2 минуты.",
        "Пауза 2–3 минуты часто помогает при нервозности.",
        "Используйте визуальное расписание для занятий.",
        "AAC карточки «Туалет» и «Вода» подтверждены ребёнком."
      ],
      "recentTitle": "Мои последние наблюдения",
      "recentEmpty": "Пока нет наблюдений за сегодня",
      "childProfileBtn": "Профиль ребёнка",
      "reportBtn": "Отчёт родителю"
    },
    "voice": {
      "title": "Запись наблюдения",
      "subtitle": "Говорите обычным языком",
      "startAria": "Начать запись",
      "stopAria": "Остановить запись",
      "hint": "Опишите, что произошло на занятии. AI предложит структуру.",
      "examplesTitle": "Примеры наблюдений",
      "examples": [
        "Использовал визуальное расписание, переходы прошли спокойнее",
        "Закрывал уши при громкой музыке, наушники помогли",
        "Попросил паузу — помогло"
      ]
    },
    "aiReview": {
      "processing": "AI обрабатывает…",
      "transcript": "Расшифровка",
      "whatHappened": "Что произошло",
      "noEvents": "AI не выделил событий. Можно сохранить общую заметку.",
      "defaultInsight": "Это наблюдение, не диагноз. Можно обсудить со специалистом.",
      "save": "Сохранить в Event Timeline",
      "toReport": "К отчёту",
      "skip": "Не сохранять",
      "savedToast": "Сохранено в Event Timeline",
      "noDataToast": "Нет данных для сохранения",
      "skippedToast": "Без сохранения"
    },
    "report": {
      "title": "Отчёт родителю",
      "subtitle": "Сводка за 7 дней",
      "total": "Всего",
      "positive": "Хороших",
      "attention": "Внимания",
      "eventsTitle": "События",
      "empty": "Событий пока нет",
      "whatHelped": "Что помогло",
      "whatHelpedDemo": "примеры (демо)",
      "toClarify": "Что стоит подтвердить дома",
      "disclaimer": "Формулировки нейтральные. Это наблюдения, не оценка. Не являются медицинским диагнозом.",
      "copy": "Скопировать отчёт",
      "send": "Отправить родителю",
      "sendInDevelopment": "Отправка появится в следующей версии. Скопируйте отчёт и отправьте родителю удобным способом.",
      "copied": "Отчёт скопирован в буфер обмена",
      "copyFailed": "Не удалось скопировать",
      "reportHeader": "📋 Отчёт тьютора за {{date}}\n\n",
      "reportTotal": "Всего событий: {{count}}\n",
      "reportPositive": "Хороших моментов: {{count}}\n",
      "reportAttention": "Требуют внимания: {{count}}\n",
      "reportEventsHeader": "📅 События:\n",
      "reportEventLine": "• {{time}} — {{title}}\n",
      "reportFooter": "\n💡 Похоже, ребёнок хорошо использовал паузы и визуальные подсказки. Это наблюдение, не диагноз.\n---\nОтправлено через Qoldau AI"
    },
    "childProfile": {
      "keySignals": "Ключевые сигналы",
      "whatHelps": "Что помогает",
      "avoid": "Чего избегать",
      "preferences": "Предпочтения",
      "whatHelpsList": ["Пауза 2–3 мин", "Тихое место", "Визуальное расписание", "Наушники с тихой музыкой", "AAC карточки"],
      "avoidList": [
        "Резкие переходы между активностями",
        "Громкие групповые занятия без наушников",
        "Длинные инструкции без визуальной поддержки"
      ],
      "preferencesList": [
        "Любит конструкторы",
        "Предпочитает короткие задания",
        "Хорошо реагирует на похвалу",
        "Спокойнее работает в первой половине дня"
      ],
      "commProfile": "Коммуникационный профиль →",
      "disclaimer": "Это профиль наблюдений, не медицинский диагноз. Все формулировки осторожные.",
      "confirmedCount": "{{count}} раз"
    }
  }
}
```

### kk.json — аналогично, переводы на казахский.
### en.json — аналогично, переводы на английский.

---

## 3. Тесты

### 3.1 Новый файл `apps/prototype/test/tutorSurface.test.tsx`

```tsx
/**
 * Тесты tutor surface (v1.5+ E2):
 * - TutorReport.handleSend показывает honest "в разработке" вместо fake "отправлено".
 * - TutorHome переводит HINTS из i18n.
 * - TutorVoice переводит examples из i18n.
 * - TutorChildProfile переводит whatHelps/avoid/preferences из i18n.
 * - i18n ru/kk/en покрытие: tutor.* существует во всех файлах.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ru from '@/i18n/locales/ru.json';
import kk from '@/i18n/locales/kk.json';
import en from '@/i18n/locales/en.json';
// ... импорты TutorReport, TutorHome и т.д.

describe('tutor surface (E2)', () => {
  it('TutorReport: handleSend показывает honest toast (не fake "отправлено")', async () => {
    // mock useToastStore
    const showToast = vi.fn();
    // ...
    render(<MemoryRouter><TutorReport /></MemoryRouter>);
    await userEvent.click(screen.getByRole('button', { name: /отправить родителю/i }));
    expect(showToast).toHaveBeenCalledWith(
      expect.stringMatching(/отправка появится|следующей версии/i),
      'info',
    );
  });

  it('tutor.* существует во всех 3 локалях', () => {
    for (const [locale, data] of [['ru', ru], ['kk', kk], ['en', en]] as const) {
      expect(data, locale).toHaveProperty('tutor.home.hints');
      expect(data, locale).toHaveProperty('tutor.voice.examples');
      expect(data, locale).toHaveProperty('tutor.childProfile.whatHelpsList');
      expect(data, locale).toHaveProperty('tutor.report.sendInDevelopment');
    }
  });
});
```

### 3.2 Регрессия
- Все 177 существующих тестов должны остаться зелёными.
- `npm test -- --run` ≥177 ✓.

---

## 4. Definition of Done

- [ ] Все 5 экранов используют `useTranslation()` и `t('tutor.*')`.
- [ ] 0 inline-русских строк в JSX tutor-страниц.
- [ ] `TutorReport.handleSend` — honest toast (НЕ фейковое «отправлено»).
- [ ] i18n ru/kk/en покрытие для всех новых ключей.
- [ ] Тесты: +5-8 новых (tutorSurface.test.tsx).
- [ ] `npm run typecheck` ✓
- [ ] `npm test -- --run` ✓ (185+ тестов)
- [ ] `npm run build` ✓
- [ ] Коммит + push к `feature/v1.5-E2-tutor-production`.
- [ ] PR открыт.

---

## 5. Риски и откат

- **Риск:** некоторые hardcoded массивы (TutorHome.HINTS, TutorVoice.examples) переедут
  в i18n — разработчики больше не смогут править без перезапуска dev-server. **Митигация:**
  i18n в Vite HMR работает прозрачно.
- **Риск:** `TutorReport.handleSend` — пользователь может потерять иллюзию «отправил».
  **Митигация:** добавлена явная подсказка «Скопируйте отчёт и отправьте вручную».
- **Откат:** revert коммита.

---

## 6. Что НЕ делаем в E2

- Реальная отправка отчёта (email/telegram) — backend Codex, phase 2.
- Авторизация tutor-аккаунта (multi-tenant) — phase 2.
- Локализация `ChildSelector` — отдельный тикет (общий компонент).
- Локализация `data/mockTutor.ts` (если нужна) — phase 2.
- Полный перевод `kk`/`en` для не-tutor ролей — E5.

---

## 7. Прогресс

- [x] Спека написана.
- [ ] Бранч создан.
- [ ] i18n ru/kk/en.
- [ ] TutorHome refactor.
- [ ] TutorVoice refactor.
- [ ] TutorAIReview refactor.
- [ ] TutorReport refactor (honest state).
- [ ] TutorChildProfile refactor.
- [ ] Тесты.
- [ ] typecheck + test + build.
- [ ] Commit + push + PR.