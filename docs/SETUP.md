# Qoldau AI Setup Notes

Canonical setup guide: [../SETUP.md](../SETUP.md).

Wave 0 release baseline: `integration/v1.0rc-pilot-ru`.

## Release Env Model

Backend/proxy env only:

- `OPENAI_API_KEY`
- `OPENAI_LLM_MODEL`
- `WHISPER_MODEL`
- optional `WHISPER_API_KEY`
- `CORS_ORIGIN`
- `SENTRY_DSN`
- rate/audio limits

Frontend/APK env only:

- `VITE_API_BASE_URL=https://<prod-proxy-url>`

Do not place AI/STT/LLM keys in frontend env, Capacitor config, Android resources, APK/AAB, docs, or git.

## Android Build

```powershell
.\scripts\build-android-release.ps1 -PROD_API_URL "https://<prod-proxy-url>" -Variant release
```

The production URL must be HTTPS. Localhost/LAN HTTP is for debug builds only.
