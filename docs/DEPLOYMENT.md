# Deployment Guide (v0.6.0)

## Stateless AI proxy deployment (v0.9)

Use this section for the APK-backed pilot. The backend is a stateless AI proxy:
it accepts audio, runs STT + LLM parsing, and returns transcript/events/insight
to the app. It does not store family data and does not require DB, auth, seed,
Prisma migrate, Redis, or realtime sockets at runtime.

Recommended platform: Railway or Render, deployed from `apps/api/Dockerfile`.

### v1.0 Railway runbook: execute production deploy

Owner-only dashboard steps:

1. Open [Railway](https://railway.com/) and create a new project.
2. Choose **Deploy from GitHub repo** and select `Krimskii/qoldau`.
3. Select branch `feature/v1.0-deploy-execute` for the first verification deploy.
   After merge, switch the service branch to the production integration/main branch.
4. Set the service root directory to `apps/api`.
5. Railway will read `apps/api/railway.json` and build from `apps/api/Dockerfile`.
6. In **Settings -> Networking**, generate a public domain. Copy the HTTPS URL.
7. In **Variables**, add the env vars below. Do not commit their values to git.
8. Wait until deploy is green and the healthcheck `/api/health` passes.

Required production variables:

| Name | Required | Notes |
| --- | --- | --- |
| `NODE_ENV` | yes | `production` |
| `ANTHROPIC_API_KEY` | yes | entered by owner in Railway dashboard |
| `WHISPER_API_KEY` | yes | entered by owner in Railway dashboard |
| `ANTHROPIC_MODEL` | yes | example: `claude-3-5-haiku-20241022` |
| `WHISPER_MODEL` | yes | example: `whisper-1` |
| `CORS_ORIGIN` | yes | include APK origin: `capacitor://localhost`; add web domains comma-separated |
| `SENTRY_DSN` | optional | empty keeps Sentry disabled |
| `AUDIO_INGEST_RATE_LIMIT_PER_MIN` | yes | recommended pilot value: `10` |
| `AUDIO_MAX_MB` | optional | default `25` |
| `JSON_BODY_LIMIT` | optional | default `35mb` |

Verification commands after Railway gives the public URL:

```bash
curl https://<proxy-url>/api/health
curl https://<proxy-url>/api/ai/health
curl https://<proxy-url>/api/stt/health
curl https://<proxy-url>/api/audio/health
```

Expected production modes:

- `/api/ai/health`: `mode` should be `claude`/`anthropic`, not `mock`.
- `/api/stt/health`: `mode` should be `whisper`, not `mock`.
- `/api/audio/health`: should include `maxAudioMb` and `rateLimitPerMin`.

Sentry privacy check:

- `sendDefaultPii` is disabled.
- Request body, headers, cookies, query string, `audioBase64`, `transcript`,
  `childName`, and `childId` are stripped before sending events.
- Do not add transcripts or child names to manual `captureException` context.

APK build variable:

```bash
VITE_API_BASE_URL=https://<proxy-url>
```

### Railway / Render settings

| Setting | Value |
| --- | --- |
| Root directory | `apps/api` |
| Runtime | Dockerfile |
| Start command | image default: `node dist/index.js` |
| Healthcheck path | `/api/health` |
| Public URL | HTTPS URL from Railway/Render |

### Required environment variables

| Name | Example / note |
| --- | --- |
| `NODE_ENV` | `production` |
| `PORT` | platform-provided, fallback `4000` |
| `CORS_ORIGIN` | comma-separated allowed origins, e.g. `capacitor://localhost,https://qoldau.example.com` |
| `WHISPER_API_KEY` | STT provider key |
| `WHISPER_MODEL` | default `whisper-1` |
| `ANTHROPIC_API_KEY` | LLM provider key |
| `ANTHROPIC_MODEL` | default from backend config |
| `SENTRY_DSN` | optional; empty disables Sentry |

### Budget and safety limits

| Name | Default | Purpose |
| --- | ---: | --- |
| `AUDIO_MAX_MB` | `25` | rejects oversized audio before STT/LLM spend |
| `JSON_BODY_LIMIT` | `35mb` | Express body parser cap |
| `AUDIO_INGEST_RATE_LIMIT_PER_MIN` | `10` | per-IP limit for `/api/audio/ingest` |

`/api/audio/ingest` returns structured JSON for recoverable pipeline errors:
`{ "ok": false, "code": "...", "error": "..." }`.

### Smoke checks after deploy

```bash
curl https://<proxy-url>/api/health
curl https://<proxy-url>/api/ai/health
curl https://<proxy-url>/api/stt/health
curl https://<proxy-url>/api/audio/health
```

The APK build must point to the deployed proxy:

```bash
VITE_API_BASE_URL=https://<proxy-url>
```

Полный гайд по деплою Qoldau AI в production. Три варианта на выбор.

---

## Структура

Qoldau AI — монорепо с двумя приложениями:

```
qoldau/
├── apps/
│   ├── prototype/      # Frontend SPA (React + Vite)
│   └── api/             # Backend API (Express + TS)
├── docs/                # Документация
└── docker-compose.yml   # Локальная full-stack разработка
```

**Frontend** — статический SPA, деплоится куда угодно.
**Backend** — Node.js сервер, требует runtime.

---

## Вариант 1: Vercel (frontend) + Railway (backend) — рекомендуемый для MVP

### Frontend на Vercel

1. Залейте репозиторий на GitHub.
2. Зайдите на [vercel.com](https://vercel.com), New Project → Import из GitHub.
3. **Root Directory:** `apps/prototype`
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. **Environment Variables:**
   - `VITE_API_BASE_URL` = `https://your-api.up.railway.app` (URL backend после деплоя)

Vercel автоматически делает HTTPS, CDN, и preview-деплои для каждого PR.

### Backend на Railway

1. Зайдите на [railway.app](https://railway.app), New Project → Deploy from GitHub.
2. Выберите репозиторий, **Root Directory:** `apps/api`.
3. Railway определит Dockerfile автоматически.
4. **Variables:**
   - `PORT` = `4000` (Railway подставит автоматически через `$PORT`)
   - `CORS_ORIGIN` = URL вашего фронта на Vercel
   - `NODE_ENV` = `production`
5. **Deploy** → через 2-3 минуты получите публичный URL.
6. Скопируйте URL → вставьте в `VITE_API_BASE_URL` фронта → re-deploy фронта.

**Стоимость:** Vercel free tier + Railway free tier (500ч/мес, $5 кредитов) = **$0–5/мес** для MVP.

---

## Вариант 2: Single VPS (Docker) — для self-hosted / приватного деплоя

### Требования

- Linux VPS (Ubuntu 22.04+, 1GB RAM минимум)
- Docker + Docker Compose
- Домен (опционально, можно без)

### Шаги

```bash
# 1. Клонируем репозиторий
git clone https://github.com/your-org/qoldau.git
cd qoldau

# 2. Собираем и запускаем backend
docker compose up -d --build

# 3. Собираем frontend
cd apps/prototype
npm ci
npm run build
# dist/ — статические файлы
cd ../..

# 4. Раздаём frontend через nginx
sudo apt install -y nginx
sudo cp -r apps/prototype/dist/* /var/www/qoldau/

# 5. Конфиг nginx (reverse proxy)
sudo nano /etc/nginx/sites-available/qoldau
```

```nginx
server {
  listen 80;
  server_name your-domain.com;

  # Frontend (SPA)
  root /var/www/qoldau;
  index index.html;

  # SPA routing — все неизвестные пути идут на index.html
  location / {
    try_files $uri /index.html;
  }

  # Backend API
  location /api/ {
    proxy_pass http://localhost:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
  }
}
```

```bash
# 6. Активируем конфиг
sudo ln -s /etc/nginx/sites-available/qoldau /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 7. SSL через Let's Encrypt (опционально)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

**Стоимость:** VPS от $5/мес (Hetzner, DO, Vultr).

---

## Вариант 3: GitHub Pages (только frontend)

Для быстрого preview/demo без backend.

### Шаги

1. Добавьте workflow `.github/workflows/deploy-frontend.yml`:

```yaml
name: Deploy frontend
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - working-directory: apps/prototype
        run: |
          npm ci
          npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: apps/prototype/dist
      - uses: actions/deploy-pages@v4
        with:
          artifact: artifacts
```

2. В GitHub: Settings → Pages → Source = "GitHub Actions".
3. Frontend задеплоится на `https://your-org.github.io/qoldau/`.

**Проблема:** SPA routing на GitHub Pages требует 404 fallback. Создайте `apps/prototype/public/404.html` = копию `index.html`.

**Без backend:** оставьте `VITE_API_BASE_URL` пустым — фронт будет работать на localStorage.

---

## Переменные окружения (продакшен)

### Frontend

| Name | Value | Notes |
| ---- | ----- | ----- |
| `VITE_API_BASE_URL` | `https://api.your-domain.com` | URL backend |

### Backend

| Name | Value | Notes |
| ---- | ----- | ----- |
| `PORT` | `4000` | или `$PORT` для Railway |
| `CORS_ORIGIN` | URL фронта (comma-separated если несколько) | |
| `NODE_ENV` | `production` | для combined-логов |

---

## CI/CD (опционально)

GitHub Actions для автодеплоя на каждое изменение в `main`:

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: |
          cd apps/api
          npm ci
          npm run build
      - name: Deploy to Railway
        run: railway up
        env: { RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }} }

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: |
          cd apps/prototype
          npm ci
          npm run build
      - name: Deploy to Vercel
        run: vercel deploy --prod --yes --token=${{ secrets.VERCEL_TOKEN }}
```

---

## Мониторинг (Phase 2)

- **Logs:** `docker compose logs -f api` (для self-hosted)
- **Uptime:** [UptimeRobot](https://uptimerobot.com/) (free, 50 monitors)
- **Errors:** [Sentry](https://sentry.io/) (free, 5K events/мес)
- **Analytics:** [Plausible](https://plausible.io/) (privacy-friendly)

---

## Checklist перед запуском

- [ ] `VITE_API_BASE_URL` указывает на production backend
- [ ] `CORS_ORIGIN` включает URL фронта
- [ ] `NODE_ENV=production` на backend
- [ ] SSL/HTTPS включён
- [ ] `.env` файлы НЕ закоммичены (только `.env.example`)
- [ ] Health check проходит: `curl https://api/api/health`
- [ ] Frontend загружается, события сохраняются и синхронизируются

---

## Troubleshooting

### CORS error в браузере

```
Access to fetch at 'https://api...' from origin 'https://...'
has been blocked by CORS policy
```

**Fix:** добавить URL фронта в `CORS_ORIGIN` на backend.

### 502 Bad Gateway (VPS)

**Fix:** проверить `docker compose ps`, `docker compose logs api`.

### Frontend не подключается к backend

**Fix:** проверить `VITE_API_BASE_URL` (без trailing slash!) и `CORS_ORIGIN`.

### Данные не синхронизируются

**Fix:** открыть DevTools → Network, посмотреть запросы к `/api/*`. Если 4xx — проверить payload shape.
