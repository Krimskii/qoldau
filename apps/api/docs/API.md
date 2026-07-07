# API notes

## Audio paths

The client can use either split calls or the combined ingest endpoint:

- Canonical client flow for stored recordings: keep the audio blob client-side (IndexedDB), call `POST /api/stt/transcribe` with `{ audio, mimeType, language? }`, then call `POST /api/ai/parse` with the returned transcript when event extraction is needed.
- `POST /api/audio/ingest` remains a convenience one-step pipeline for `audio -> STT -> AI parse`. It does not replace the split flow and should not be used to upload durable server audio storage.

`/api/stt/transcribe` accepts base64 audio or a data URL. Browser MediaRecorder mime types such as `audio/webm;codecs=opus` and `audio/mp4` are forwarded to Whisper so the multipart filename/content type match the actual container.

## Recording sync

`POST /api/sync/push` and `GET /api/sync/pull` sync recording metadata only:

```json
{
  "id": "local-recording-id",
  "childId": "child-id",
  "label": "Voice note",
  "durationSec": 12,
  "transcript": "Optional STT transcript",
  "mimeType": "audio/webm;codecs=opus",
  "updatedAt": "2026-07-07T00:00:00.000Z",
  "deletedAt": null
}
```

No `audioId`, raw base64, or server-side audio blob is part of sync. The audio file remains client-owned.
