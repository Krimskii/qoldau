# Versioning

## Current Version: v0.3.0 (Release)

## Version History

| Version | Type | Summary |
|---------|------|---------|
| v0.3.0 | Release | Full Demo MVP — 3 children, 60+ events over 7 days, all Parent/Child/Tutor/Specialist flows filled, presentation polish, MVP_WALKTHROUGH doc. |
| v0.2.1 | Hotfix | Demo step targets stable seeded event; EventStatus labels map to real types; Parent voice flow creates confirmed events only on ClarifyingQuestions; expanded Event Timeline filters; Tailwind class audit. |
| v0.2.0 | Release | Demo-ready MVP — Guided Demo Mode, improved Overview, Event Timeline, EventDetails, CommunicationProfile, TutorReport, SpecialistDashboard. |
| v0.1.1 | Hotfix | Event Timeline persistence, role switching, CareDiary / BehaviorSensory through EventStore, Child/Tutor event creation, safety wording. |
| v0.1.0 | Initial MVP | Frontend MVP / mockup with Parent, Child, Tutor, Specialist roles. |

## Versioning Rules

- **Major (X.0.0)** — architecture change, breaking flows, large refactors.
- **Minor (0.X.0)** — release with new demo-ready capabilities.
- **Patch (0.0.X)** — hotfix: bug fixes, label corrections, demo flow repairs, TypeScript tightening.

## Hotfix Criteria (Patch)

- Demo step broken or leads to "not found"
- Status / label mismatch
- Parent / Child / Tutor / Specialist flow creates wrong events
- Dead-end button without feedback
- TypeScript strict mode violations
- Tailwind utility classes that don't resolve

Hotfixes must NOT add:
- new backend integrations
- new auth / payment
- new state machines
- new product features beyond bugfix scope