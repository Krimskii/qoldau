# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] — 2026-07-01

### Added

#### Guided Demo Mode
- **Demo Mode button** on Overview page
- **Visual step indicator** at bottom of screen
- **18-step guided tour**: Overview → Parent → Child → Tutor → Specialist → Overview
- **Navigation controls**: Back / Next / Exit
- **Auto-navigation** to demo steps
- New store: `useDemoStore` with state management

#### Event Timeline (improved)
- **Filters** by event type: all / food / toilet / sensory / communication / behavior / sleep / state
- **Grouping** by time of day: morning / afternoon / evening / night
- **Source badges**: parent / child / tutor / AI
- **Status badges**: confirmed / needs verification / edited
- **AI observation** at top: "Похоже, сегодня несколько событий связаны с шумом..."

#### EventDetails (improved)
- Event source display
- Original phrase / card visualization
- Related events with navigation
- Cautious AI hypothesis
- "What to try" suggestions
- Action buttons: Edit / Related / Add to report

#### CommunicationProfile (improved)
- Signal list with meanings
- Confidence as cautious indicator (high/medium/low)
- Sources of confirmations
- Event count and last seen
- AI observation and recommendations

#### TutorReport (improved)
- 7-day summary with KPIs
- "Copy report" button (copies to clipboard)
- "Send to parent" button
- Neutral wording: "наблюдалась нервозность" not "проблемное поведение"
- AI recommendation with safety disclaimer

#### SpecialistDashboard (improved)
- **KPI cards** with period selector (7/14/30 days)
- Event count, new signals, communications, confirmation rate
- AI summary with safety wording
- Quick links to all sections
- Repeating situations list
- "What helped" section

#### Toast notifications
- In-app feedback (no browser alerts)
- Types: success, error, info, warning
- Auto-dismiss after 3 seconds
- New store: `useToastStore`
- New component: `ToastContainer`

### Documentation
- **DEMO_SCRIPT.md**: 10-15 minute demo script for investors, parents, tutors, specialists
  - Step-by-step walkthrough
  - Key talking points
  - Safety disclaimers
  - FAQ answers
  - Prohibited medical claims list

---

## [0.1.1] — 2026-07-01

### Added
- **Event Timeline persistence**: Events now saved to `useEventStore` and persist across navigation
- **Voice observation flow**: Parent can record voice → AI review → clarify → save events
- **Child card events**: AAC cards create events in EventStore with in-app feedback
- **Tutor event creation**: Tutor voice flow creates events with sourceRole: tutor
- **CareDiary integration**: Now reads from EventStore (food/water/toilet events)
- **BehaviorSensory integration**: Now reads from EventStore (behavior/sensory events)
- **Clarifying questions**: Answers saved with events

### Changed
- **Safety wording**: All AI insights now use cautious language
  - "Похоже..." instead of definitive statements
  - "Возможно..." for hypotheses
  - "Это наблюдение, не диагноз." as required footer
  - "Можно обсудить со специалистом." for recommendations
- **TypeScript fixes**: Removed NodeJS.Timeout, using ReturnType<typeof setInterval>
- **Role switching**: Overview role cards now call setRole before navigation

### Fixed
- **Timer in VoiceObservation**: Uses useRef instead of window property
- **Event creation**: Events properly mapped from AI parsed observation
- **Clarifying answers**: Properly stored and attached to events

### Technical
- New stores: `useVoiceObservationStore`, `useClarifyingStore`
- `useEventStore` expanded with addEvents, getEventsByTypeAndDate

---

## [0.1.0] — 2026-07-01

### Added
- Initial MVP prototype release
- **Overview**: Landing page with role selection
- **Parent Interface** (11 pages):
  - Home with voice CTA and quick actions
  - Voice observation recording
  - AI review flow
  - Clarifying questions
  - Event timeline
  - Event details
  - Care diary (food/water/toilet)
  - Behavior & sensory tracking
  - AI chat assistant
  - Analytics dashboard
  - Profile & settings
- **Child Interface** (8 pages):
  - Home with large action cards
  - AAC quick cards
  - Favorites (videos/music)
  - Voice input
  - Phrase builder
  - Calm mode
  - Call parent
  - Progress tracking
- **Tutor Interface** (5 pages):
  - Home with hints
  - Voice observation
  - AI review
  - Parent report
  - Child profile
- **Specialist Interface** (7 pages):
  - Dashboard with metrics
  - Events timeline
  - ABC analysis
  - Communication profile
  - Care patterns
  - Support plan
  - Reports
- **Architecture**:
  - TypeScript types (qoldau.ts)
  - Zustand stores (role, events, app)
  - Mock STT layer
  - Mock AI parser
  - Mock API
  - Tailwind CSS with design tokens
  - React Router v6
- **Documentation**:
  - README.md
  - TECH_DECISIONS.md
  - PRODUCT_BRIEF.md
  - DATA_MODEL.md
  - ROUTES.md
  - VERSIONING.md
