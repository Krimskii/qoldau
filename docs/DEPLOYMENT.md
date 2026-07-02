# Deployment Guide (v0.6.0)

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