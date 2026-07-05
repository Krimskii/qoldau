# Backend Deploy Runbook

## v1.6 P0: Durable PostgreSQL Persistence

The API now uses PostgreSQL for production/staging persistence. SQLite is kept only for local/CI tests via `apps/api/prisma/schema.test.prisma`.

### Required Environment

Set these on Railway before deploy:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://USER:PASS@HOST:PORT/DB?schema=public
DIRECT_DATABASE_URL=postgresql://USER:PASS@HOST:PORT/DB?schema=public
JWT_SECRET=<rotated-production-secret>
REQUIRE_AUTH=true
OPENAI_API_KEY=<server-side-key>
```

If Railway provides PgBouncer, use the pooled URL for `DATABASE_URL` and the direct URL for `DIRECT_DATABASE_URL`. If there is no pooler, set both to the same Postgres URL.

`REQUIRE_AUTH=false` is rejected at startup in production. Keep AI/audio/health routes public
as before, but `/api/children`, `/api/events`, and `/api/recordings` require Bearer JWTs.

### Deploy Command

Use Prisma migrations, never `db push`, for production:

```bash
cd apps/api
npm ci
npm run build
npm run db:deploy
npm start
```

Equivalent single start command for Railway:

```bash
npm run start:prod
```

`start:prod` runs `prisma migrate deploy` and then starts `dist/index.js`.

### Health Checks

Liveness:

```bash
curl https://<api-host>/api/health
```

Readiness, including DB connectivity:

```bash
curl https://<api-host>/api/ready
```

Expected ready response:

```json
{
  "ok": true,
  "readiness": "ready",
  "database": { "ok": true, "provider": "postgresql" }
}
```

### Durable Persistence Check

1. Create a child/event through the API or seed a staging-only demo dataset.
2. Redeploy the Railway service.
3. Call the same read endpoint again.
4. The row must still exist. If it disappeared, the service is not using managed Postgres.

### Seeds

`npm run seed` is dev/staging-only. It is idempotent and skips demo events when events already exist, but do not run it automatically against production user data.
