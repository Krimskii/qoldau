# Event model

`Event.type` stays a database `String` for backwards compatibility, but API writes use the canonical taxonomy from `src/domain/eventTypes.ts`.

## Canonical event types

Canonical types are accepted from product surfaces such as timeline actions, AAC flows, sync push, and manual event create/update:

`food`, `water`, `toilet`, `sleep`, `behavior`, `sensory`, `communication`, `aac_card`, `voice_observation`, `phrase`, `media_request`, `sos`, `calm_mode`, `tutor_note`, `specialist_note`, `state`.

Unknown types are rejected on write. Sync `POST /api/sync/push` rejects the whole invalid batch with `400` before applying data.

Reads remain permissive: `GET /api/sync/pull` and event reads can return legacy rows whose `type` is not canonical, so older data is not lost or hidden.

## Parser event types

The AI transcript parser intentionally emits only a subset of canonical event types:

`food`, `water`, `sleep`, `toilet`, `sensory`, `behavior`, `communication`, `state`.

That parser subset is controlled by the LLM prompt/schema in `src/services/llmService.ts`. Do not extend it just because the product taxonomy grows; parser output should change only together with prompt, schema, and eval updates.
