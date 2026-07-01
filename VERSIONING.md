# Versioning Strategy

Qoldau AI использует **SemVer** (Semantic Versioning).

## Version Format

```
v{major}.{minor}.{patch}
```

Пример: `v1.0.0`

## Version Lifecycle

### v0.x.x — Prototype/MVP
- Быстрые итерации
- API может меняться
- Публичный релиз для тестирования

### v1.0.0 — Production Ready
- Стабильный API
- Breaking changes с мажорным обновлением

## Branching Model

```
main          — стабильные релизы
├── develop   — активная разработка
├── v0.x.x    — версионные теги
└── feature/* — фичи
```

## Release Notes

Каждый релиз документируется в:
- CHANGELOG.md
- GitHub Releases
- Теги: `git tag -a v1.0.0 -m "Release v1.0.0"`

## Changelog Format

```markdown
## [1.0.0] — 2026-07-01

### Added
- Initial MVP features

### Changed
- Improvements

### Fixed
- Bug fixes
```

## Current Version

Текущая версия: **v0.1.0** (Prototype MVP)

### v0.1.0 — MVP Prototype
- Voice-first родительский интерфейс
- Детский интерфейс (AAC)
- Тьюторский интерфейс
- Специалистский интерфейс
- Overview страница
- Mock STT layer
- Mock AI parser
- Event Timeline data model
