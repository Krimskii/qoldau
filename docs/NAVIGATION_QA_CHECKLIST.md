# Navigation QA Checklist — Qoldau AI

> Чек-лист для проверки навигации и responsive перед релизом.
> Каждый пункт должен быть ✓.

## 1. Все экраны открываются

- [ ] Все routes из `src/config/navigation.ts` зарегистрированы в `router.tsx`.
- [ ] Никаких "Cannot GET /xyz" при ручном вводе URL.
- [ ] `/` редиректит на `/overview` (см. `router.tsx`).
- [ ] `*` (unknown route) редиректит на `/overview`.

## 2. У каждого экрана есть выход

- [ ] Каждый route имеет `fallbackPath` в `RouteMeta` (не пустой).
- [ ] `BackButton` используется во всех back-кнопках (не inline `navigate(-1)`).
- [ ] Focus-экраны (recording, full-screen) имеют либо back, либо AppShell header.
- [ ] Child UI: `/child/*` fallback — `/child/home` (кроме Interface Guide → `/overview`).
- [ ] Parent UI: `/parent/*` fallback — `/parent/home` или `/parent/events`.
- [ ] Tutor UI: `/tutor/*` fallback — `/tutor/home`.
- [ ] Specialist UI: `/specialist/*` fallback — `/specialist/dashboard`.

## 3. BottomNav помещается

- [ ] На 390px (iPhone 14) — все 5 элементов parent nav помещаются.
- [ ] Центральная + кнопка не перекрывает контент (`pb-28` в AppShell).
- [ ] Активный пункт виден (текст + иконка).
- [ ] Нет горизонтального скролла на 360px (узкий mobile).
- [ ] Tutor nav: 4 элемента (без дублей).
- [ ] Specialist nav: 4 элемента, помещаются на tablet.

## 4. Child screen имеет «Домой»/«Назад»

- [ ] Каждый `/child/*` имеет либо back-button, либо крупную CTA «Домой».
- [ ] CallMom / SOS доступен с `/child/home` (CTA «Позвать маму»).
- [ ] CalmMode имеет «Выйти» / «Стало спокойнее» / «Домой».
- [ ] ChildSpeak имеет «Домой» + «Да/Нет/Сказать ещё».
- [ ] PhraseBuilder имеет «Очистить» + «Отправить» + back.
- [ ] ChildChoice имеет «Назад» + «Домой».
- [ ] ChildInterfaceGuide имеет «Вернуться в Overview» + «Открыть детский интерфейс».

## 5. Demo-flow без тупиков

- [ ] Start demo → шаг 1 открывается.
- [ ] Next step → переходит на следующий route.
- [ ] Previous step → возвращается на предыдущий.
- [ ] Exit demo → возвращает на `/overview`.
- [ ] Reset demo → очищает EventStore + role, не ломает навигацию.
- [ ] Step 7 EventDetails открывает существующий event (evt-1-5).
- [ ] Demo не показывает "Событие не найдено".
- [ ] Demo step 18 (Возврат в Overview) показывает корректное состояние.

## 6. Responsive проверки

Проверить на ширине: 360 / 390 / 430 / 768 / 1024 / 1440.

- [ ] Нет horizontal scroll ни на одном breakpoint.
- [ ] Bottom nav не закрывает нижние CTA (min-h-20 + pb-28 в AppShell).
- [ ] Длинные labels не обрезаются (использовать truncate или text-wrap).
- [ ] 4-колончные grids (ChildCards) помещаются на 360px.
- [ ] Specialist tabs/chips помещаются на 768px.
- [ ] Bottom nav центрируется на desktop (max-w-430 panel).
- [ ] Hero/CTA не "прыгает" при resize.

## 7. AppShell header

- [ ] "Домой" (сердечко) ведёт на `/overview`.
- [ ] Колокольчик → `/parent/notifications` (для всех ролей сейчас).
- [ ] Sticky header не перекрывает top контента (`pt-4` в main).
- [ ] На focus-экранах (showNav=false) header всё равно виден и работает.

## 8. BottomNav — проверка каждого role

### Parent (5 элементов)
- [ ] Главная → `/parent/home`
- [ ] События → `/parent/events`
- [ ] + → `/parent/voice`
- [ ] Аналитика → `/parent/analytics`
- [ ] Профиль → `/parent/profile`

### Tutor (4 элемента)
- [ ] Главная → `/tutor/home`
- [ ] AI → `/tutor/ai-review` (НЕ `/tutor/voice` или дубль)
- [ ] Отчёт → `/tutor/report`
- [ ] Профиль → `/tutor/child-profile`

### Specialist (4 элемента)
- [ ] Главная → `/specialist/dashboard`
- [ ] События → `/specialist/events`
- [ ] ABC → `/specialist/abc`
- [ ] Отчёты → `/specialist/reports`

### Child
- [ ] (нет BottomNav — не нужен по спеке v0.3.9)

## 9. Безопасность (no regressions)

- [ ] BackButton не нарушает SPA-навигацию (нет window.location).
- [ ] Fallback не ведёт на 404 (все fallback — валидные routes).
- [ ] Нет бесконечной навигационной петли (A → B → A).

## 10. Документация актуальна

- [ ] `docs/NAVIGATION_MAP.md` синхронизирован с `src/config/navigation.ts`.
- [ ] При добавлении нового route — добавить в `navigation.ts` и `NAVIGATION_MAP.md`.
- [ ] При изменении fallback — обновить оба места.

## Как запустить проверку

1. Открыть `/overview`, перейти в каждую роль.
2. Пройти все экраны через BottomNav.
3. На каждом экране нажать back — должен вернуть туда, откуда пришли.
4. Сбросить demo, пройти все 18 шагов.
5. Открыть DevTools → Responsive → попробовать 360 / 390 / 430 / 768.
6. Проверить, что на каждом breakpoint нет горизонтального скролла.

## Что в v0.3.9 исправлено

- ✅ `BackButton` с fallback через navigation config.
- ✅ `PageHeader` использует BackButton (раньше голый `navigate(-1)`).
- ✅ BottomNav дубль `/tutor/ai-review` убран.
- ✅ Все routes зарегистрированы в `src/config/navigation.ts` с fallback.