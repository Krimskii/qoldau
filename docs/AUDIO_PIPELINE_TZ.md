# Audio Pipeline TZ

## Goal

Build a production-ready bounded module inside `apps/api` that accepts an audio
recording from the app, runs speech-to-text, sends the transcript through the LLM
parser, persists the recording/events, broadcasts realtime updates, and returns
the structured result to the frontend.

This is intentionally a modular monolith for now, not a separate microservice.
The module boundaries must make it easy to move the processing step into a queue
worker later.

## Public API

`POST /api/audio/ingest`

Initial MVP contract uses JSON/base64 because the current STT service already
accepts base64 audio. Multipart upload can be added later without changing the
pipeline service.

Request:

```ts
{
  audioBase64: string;
  mimeType?: string;
  childId: string;
  sourceRole: 'parent' | 'child' | 'tutor' | 'specialist';
  durationSec?: number;
  language?: 'ru' | 'kk' | 'en' | 'auto';
  mode?: 'observation' | 'child_speech' | 'tutor_note';
}
```

Response:

```ts
{
  ok: true;
  jobId: string;
  status: 'completed';
  recording: {
    id: string;
    childId: string;
    label: string;
    durationSec: number;
    transcript: string;
    sttSource: string;
    createdAt: string;
  };
  ai: {
    source: string;
    model: string;
    insight: string;
    clarificationQuestions: Array<{ id?: string; text: string; reason?: string }>;
  };
  events: Array<Record<string, unknown>>;
}
```

## Pipeline

1. Validate input: audio, childId, sourceRole, size, duration.
2. Run STT through the existing `sttService`.
3. Run transcript parsing through the existing `llmService`.
4. Persist a recording through `recordingsRepo`.
5. Persist parsed events through `eventsRepo`.
6. Broadcast saved events through `realtimeService`.
7. Return transcript, recording, AI metadata, and saved events.

## Design Constraints

- Existing `/api/stt`, `/api/ai`, `/api/events`, `/api/recordings` must remain
  compatible.
- No external API keys are required for the first implementation; mock fallbacks
  must continue to work.
- Do not log raw audio or transcript in production.
- The API should be sync for MVP but return `jobId/status` so async processing
  can be added later.
- Keep module files under `apps/api/src/modules/audio-pipeline`.

## Acceptance Criteria

- `POST /api/audio/ingest` works without external keys in mock mode.
- A recording is created.
- Parsed events are created and visible via `GET /api/events?childId=...`.
- Realtime event broadcasts are emitted for created events.
- Frontend can call the endpoint through a dedicated audio API client.
- Existing app build/typecheck remains clean.
