# QOLDAU AI — Worktree-структура (изоляция агентов)

> Убирает коллизии общего рабочего каталога: у каждого агента свой каталог и своя
> ветка. Один git-репозиторий (общие объекты/refs), три рабочих дерева.

## Структура
| Каталог | Ветка | Кто | Зона |
|---|---|---|---|
| `C:\Users\user\qoldau` | `integration/v1.5` | **Claude** | интеграция, docs, релиз, сборка APK |
| `C:\Users\user\qoldau-fe` | `work/frontend` | **MiniMax** | `apps/prototype/**` |
| `C:\Users\user\qoldau-be` | `work/backend` | **Codex** | `apps/api/**` |

**Правило:** ветку нельзя одновременно держать в двух worktree — это и есть защита.
Каждый работает у себя, коммиты не залезают на чужую ветку.

## Рабочий цикл агента (MiniMax / Codex)
В СВОЁМ каталоге (`qoldau-fe` или `qoldau-be`):
```
git fetch origin
git switch -c feature/<тикет> origin/integration/v1.5   # свежая ветка от интеграции
# ... работа только в своей зоне ...
npm run typecheck && npm test && npm run build           # в apps/<своё>
git push -u origin feature/<тикет>
```
Отчёт → Claude сводит `feature/<тикет>` в `integration/v1.5` из главного каталога.

## Первый запуск (node_modules ставятся отдельно в каждом worktree)
```
cd C:\Users\user\qoldau-fe\apps\prototype && npm install   # (уже сделано Claude)
cd C:\Users\user\qoldau-be\apps\api        && npm install   # (уже сделано Claude)
```
`.env` файлы (gitignored) в новый worktree не копируются — тесты идут на mock,
для реального прогона агент кладёт свой `.env` локально.

## Claude (главный каталог)
- Держит `integration/v1.5`, сводит ветки агентов `--no-ff`, гоняет гейты, собирает APK.
- НЕ переключается на ветки агентов (они заняты в их worktree) — работает только с
  `integration/v1.5` и origin-ветками агентов при merge.

## Полезное
```
git worktree list          # показать все рабочие деревья
git worktree remove <path> # удалить worktree (когда не нужен)
```
Стэши общие для репозитория — видны из любого worktree (`git stash list`).

## Заметка
B-начало MiniMax (ChildHome/tokens) сохранено в стэшах `minimax-B-childhome-wip` /
`minimax-B-tokens-wip` — MiniMax может применить/сослаться в своём worktree, либо
переделать B по спеке `docs/tickets/MINIMAX_v1.5_B_childhome_spec.md` начисто.
