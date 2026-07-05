# Ticket — MiniMax — v1.5 Дизайн A: отзывчивость (D1) + сенсорный регулятор (D2)

> Дизайн-направление: [DESIGN_RESEARCH.md](../DESIGN_RESEARCH.md) §5.2–5.3.
> Зона: **только `apps/prototype/**`.** База: `integration/v1.5`.
> Цель: минимал стал живым и настраиваемым под ребёнка — БЕЗ декоративного перегруза.

```
git switch integration/v1.5 && git pull
git switch -c feature/v1.5-sensory-responsive
```
Два коммита (D1 → D2), после каждого typecheck+test+build зелёные.

---

## Коммит 1 — D1: отзывчивость на каждое детское действие
Каждый тап = мгновенная тёплая обратная связь. Раскладку НЕ меняем.
1. **Единый паттерн тапа** — расширить `QoldauActionCard`, `QoldauIconCard`,
   `NeedCard` и карточки ChildHome/CalmMode:
   - нажатие: `active:scale-[0.96]` + мягкая подсветка-ring (200мс);
   - на тап: вызвать `speak(label)` (уже есть) + опц. гаптик
     `navigator.vibrate?.(10)` — **гейтить по сенсорному режиму** (см. D2);
   - «готово»: короткий добрый знак (галочка/спарк) ≤360мс, без фейерверков.
2. **«Дышащее» покойное состояние** главной CTA «Позвать маму»:
   `qoldau-soft-pulse` (opacity+scale ≤1.05), **гейтить** по motion-настройке +
   `prefers-reduced-motion` (в calm/reduced — выключено).
3. Никаких новых картинок/маскотов — только отклик и озвучка.

**Критерий:** тап любой карточки → scale + подсветка + озвучка (+гаптик в playful);
на детских экранах нет статичной «мёртвости».

---

## Коммит 2 — D2: сенсорный регулятор (calm / standard / playful)
Семья задаёт уровень стимуляции под ребёнка. **Один переключатель меняет
насыщенность цвета, движение, звук/гаптик — раскладка неизменна.**

1. **`useChildSettingsStore`**: добавить `sensoryMode: 'calm'|'standard'|'playful'`
   (default `'standard'`, persist).
2. **Корень детского UI** (обёртка child-роутов / ChildLayout): проставить
   `data-sensory={sensoryMode}` на контейнер.
3. **`src/styles/sensory.css`** — scoped CSS-переменные + применение:
   ```css
   [data-sensory="calm"]     { --child-saturation: .72; --child-motion: 0; }
   [data-sensory="standard"] { --child-saturation: 1;   --child-motion: 1; }
   [data-sensory="playful"]  { --child-saturation: 1.12;--child-motion: 1; }
   .child-root { filter: saturate(var(--child-saturation)); }
   ```
   Анимации/pulse гейтить по `--child-motion` (0 → выключены) И `prefers-reduced-motion`.
4. **Звук/гаптик по режиму:** calm = TTS тише/опц., без гаптика; standard = TTS вкл;
   playful = TTS + гаптик + опц. мягкий звуковой cue.
5. **UI выбора** в `ChildSettingsSheet` (родитель): segmented «Спокойный / Стандарт /
   Игривый» + 1-строчный хинт под каждым, живой превью.
6. **Персонализация (playful):** аватар+имя ребёнка в `ChildTopBar` показывать в
   режиме playful; в calm — скрыто (чище).

**Критерий:** переключение режима заметно меняет насыщенность/движение/звук;
раскладка та же (предсказуемость); calm уважает reduced-motion.

## Тесты
- `useChildSettingsStore`: default `standard`, persist, переключение.
- sensory.css применяется: `data-sensory` → корректные CSS-переменные (снапшот/DOM-тест).

## Проверки / push / отчёт
```
cd apps/prototype && npm run typecheck && npm test && npm run build
git push -u origin feature/v1.5-sensory-responsive
```
Отчёт: файлы по коммиту; вывод проверок; что видно (тап откликается+озвучивает;
регулятор меняет вид; раскладка не менялась; reduced-motion уважается).

---
## Следующие (после этого — очередь B, C)
- **B** — детская Главная пиксель-в-пиксель (Claude распишет спеку).
- **C** — взрослый мир (родитель/специалист): чистка демо-насыщенности, дизайн-язык
  инсайтов v1.5 (Claude распишет спеку).
