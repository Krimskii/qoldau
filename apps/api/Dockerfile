# Qoldau AI stateless AI proxy.
# Multi-stage production build for the API runtime.

FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma

# Prisma generate is build-only for legacy compiled modules.
# Runtime startup does not run Prisma migrate, seed, or socket.io.
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000
ENV AUDIO_MAX_MB=25
ENV AUDIO_INGEST_RATE_LIMIT_PER_MIN=10
ENV JSON_BODY_LIMIT=35mb

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT}/api/health || exit 1

EXPOSE 4000

CMD ["node", "dist/index.js"]
