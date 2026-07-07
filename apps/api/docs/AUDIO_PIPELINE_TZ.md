# Audio pipeline

Qoldau supports two audio flows:

1. Split flow for the app: client records audio, stores the blob locally, sends base64 audio to `/api/stt/transcribe`, and optionally sends the transcript to `/api/ai/parse`.
2. Combined flow for backend convenience: `/api/audio/ingest` runs STT and AI parsing in one request and returns transcript, parsed events, and insight.

For production mobile/web clients, prefer the split flow when the recording needs to survive offline or sync across devices. Sync only sends recording metadata (`label`, `durationSec`, `transcript`, `mimeType`, timestamps, tombstone); the server does not store the audio blob.
