# Phase 2 Backlog (после v0.7.4)

> Production-ready функции, которые НЕ делаем в Stage 1 demo MVP.
> Приоритизация по impact × effort.

## 1. Multi-tenant Auth (v0.7.6)

**Цель:** каждый user (parent/tutor/specialist) видит только свои события.

**Scope:**
- `User.email` foreign key в `Event` (Prisma schema)
- `requireAuth` middleware на /api/events/*, /api/recordings/*
- `requireOwnership` middleware (event.childId → user's children)
- Frontend `useAuthStore` уже готов (JWT), добавить auto-attach к API
- Family/group model (один parent владеет несколькими детьми, tutor назначен на child)

**Effort:** 2-3 дня. **Impact:** High (для multi-user production).

## 2. Audit Log (v0.7.8)

**Цель:** track кто создал/изменил event, GDPR compliance.

**Scope:**
- `AuditEvent` Prisma model: id, userId, action (create/update/delete), entityType, entityId, timestamp, ipAddress
- Prisma middleware → auto-log на Event.create/update/delete
- `GET /api/audit/events?userId=...` для specialists
- 90-day retention (auto-purge)

**Effort:** 1 день. **Impact:** Medium.

## 3. GDPR Endpoints (v0.7.8)

**Цель:** user data export + account deletion (GDPR Art. 15, 17).

**Scope:**
- `GET /api/users/me/export` — JSON со всеми данными (events, recordings, child profiles)
- `DELETE /api/users/me` — cascade delete + audit log + email confirmation
- Cookie consent banner
- Privacy policy page (legal text)
- 30-day grace period для backup cleanup

**Effort:** 1-2 дня. **Impact:** High (если в EU).

## 4. Production Cloud Storage (Phase 2)

**Цель:** заменить SQLite на managed Postgres + S3 для voice recordings.

**Scope:**
- Postgres (Neon / Supabase / RDS)
- Prisma migration `provider = "postgresql"`
- S3 / R2 / GCS для audio blobs (recordings > 1MB)
- Signed URLs для playback
- Backup policy (daily snapshots, 30-day retention)
- CDN для static assets

**Effort:** 1-2 недели. **Impact:** High для production.

## 5. Payment Integration (Phase 2)

**Цель:** SaaS billing (Stripe).

**Scope:**
- Stripe SDK
- Subscription tiers (Free / Pro / Specialist)
- `Subscription` Prisma model (userId, stripeCustomerId, plan, status, periodEnd)
- Webhooks: customer.subscription.updated, invoice.paid
- Frontend: pricing page, upgrade flow, billing portal
- Usage limits (events per month, AI parse quota)

**Effort:** 1-2 недели. **Impact:** Critical для монетизации.

## 6. Push Notifications (Phase 2)

**Цель:** real-time alerts (PWA + Capacitor).

**Scope:**
- Service Worker push API
- FCM / APNs (Capacitor Push plugin)
- Notification preferences per user
- Per-child triggers: "Нет событий от N часов", "Паттерн изменился"
- Quiet hours (ночь)

**Effort:** 1 неделя. **Impact:** Medium.

## 7. Wearable Integration (Phase 2)

**Цель:** сбор данных с Apple Watch / Fitbit / Oura.

**Scope:**
- HealthKit integration (iOS)
- Fitbit / Google Fit API
- Heart rate, sleep, activity → suggestions в Qoldau
- Privacy consent flow
- Sync frequency config

**Effort:** 2-3 недели. **Impact:** Low для MVP (нет hardware).

## 8. GPS / Geozones (Phase 2)

**Цель:** location-aware reminders.

**Scope:**
- Browser Geolocation API
- Custom geozones (parent sets: "школа", "дом")
- Reminders при входе/выходе
- Battery-efficient background tracking

**Effort:** 1 неделя. **Impact:** Low (privacy concerns).

## 9. Production Deployment

**Цель:** SaaS deployment в production-grade infrastructure.

**Scope:**
- Multi-region (EU/US/Asia)
- CI/CD с auto-deploy
- Health checks + auto-scaling
- Database replication + failover
- DDoS protection (Cloudflare)
- WAF rules
- Penetration test
- HIPAA-like compliance (если решили идти в healthcare)

**Effort:** 2-4 недели. **Impact:** Critical для launch.

## 10. Real-time Collaboration (WebSocket уже готов)

**Цель:** multiple users видят events в realtime.

**Scope:**
- Frontend: `useRealtimeEvents` уже реализован (v0.7.2)
- Backend: `realtimeService` broadcast готов
- Нужно: интегрировать в /parent/events, /tutor/home, /specialist/dashboard
- Notification sound при новом event
- "Кто сейчас онлайн" indicator

**Effort:** 2-3 дня. **Impact:** Medium (UX upgrade).

## 11. Magic-link Email SMTP (Phase 2)

**Цель:** реальная отправка email с magic-link.

**Scope:**
- Resend SDK / Nodemailer + SMTP
- Email template с брендингом
- Unsubscribe link
- Resend rate limit handling
- Bounce handling

**Effort:** 0.5 дня. **Impact:** Medium (без этого auth dev-only).

## 12. Capacitor APK (Phase 2)

**Цель:** native Android APK для Google Play.

**Scope:**
- Android SDK + Gradle signing
- `npx cap sync android` + `gradle build`
- App icon + splash screen
- App Store assets (screenshots, descriptions)
- Push notifications integration
- Deep links (qoldau://event/123)

**Effort:** 1-2 недели. **Impact:** High для distribution.

## 13. iOS Native (Phase 2)

**Scope:** iOS Capacitor + App Store submission.

**Effort:** 2-3 недели (включая Apple Developer Program).

## 14. AI Improvements (Phase 2)

**Цель:** real Claude API integration + custom models.

**Scope:**
- Real Anthropic Claude (заменить mock когда есть `ANTHROPIC_API_KEY`)
- Real Whisper API (заменить Web Speech fallback)
- Custom fine-tuned model для РАС-specific patterns
- Multilingual (English, Kazakh, etc.)
- A/B testing разных prompts

**Effort:** 1-2 недели. **Impact:** High.

## 15. Data Analytics (Phase 2)

**Scope:**
- Aggregated dashboards (parent, tutor, specialist)
- Privacy-friendly analytics (Plausible / PostHog)
- Heatmaps, funnels, retention
- A/B testing framework

**Effort:** 1-2 недели.

## 16. Internationalization (Phase 2)

**Scope:**
- Расширить i18n на 100% строк (сейчас 250 ключей × 3 языка)
- Добавить en, kk уже есть
- РТЛ языки (арабский, иврит)
- Regional date/time formatting

**Effort:** 2-3 недели.

---

## Приоритизация (impact × effort)

| # | Задача | Impact | Effort | Priority |
|---|--------|--------|--------|----------|
| 5 | Payment | Critical | 1-2w | 🔴 P0 |
| 4 | Production Cloud Storage | High | 1-2w | 🔴 P0 |
| 1 | Multi-tenant Auth | High | 2-3d | 🟠 P1 |
| 11 | Magic-link Email | Medium | 0.5d | 🟠 P1 |
| 14 | AI Real Integration | High | 1-2w | 🟠 P1 |
| 10 | WebSocket Realtime UX | Medium | 2-3d | 🟡 P2 |
| 2 | Audit Log | Medium | 1d | 🟡 P2 |
| 3 | GDPR Endpoints | High (EU) | 1-2d | 🟡 P2 |
| 12 | Capacitor APK | High | 1-2w | 🟡 P2 |
| 9 | Production Deployment | Critical | 2-4w | 🟡 P2 (launch) |
| 15 | Data Analytics | Medium | 1-2w | 🟢 P3 |
| 16 | i18n expansion | Low | 2-3w | 🟢 P3 |
| 6 | Push Notifications | Medium | 1w | 🟢 P3 |
| 7 | Wearable | Low | 2-3w | ⚪ P4 (no hw) |
| 8 | GPS / Geozones | Low | 1w | ⚪ P4 (privacy) |
| 13 | iOS Native | High | 2-3w | ⚪ P4 (later) |

**MVP launch critical path:** 1 → 4 → 5 → 9 (4-6 недель total).

---

## Что НЕ в backlog (out of scope)

- E2E encryption (HTTPS достаточно)
- HIPAA compliance (не медицинский продукт)
- Medical device certification (FDA, CE)
- Native desktop apps
- VR/AR interfaces
- Social features (sharing events public)
- AI training on user data
- Children under 13 (COPPA) — explicitly out of scope
- Genetic data integration
- IoT devices (beyond wearable)
