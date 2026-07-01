# Qoldau AI backend API (v0.4.0)
# Multi-stage build для минимального prod-образа.

# ===== Stage 1: build =====
FROM node:22-alpine AS builder
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci

# Build TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Strip devDependencies
RUN npm prune --omit=dev

# ===== Stage 2: runtime =====
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Копируем только production-ready артефакты
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Healthcheck — пингует /api/health каждые 30с
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT}/api/health || exit 1

EXPOSE 4000

CMD ["node", "dist/index.js"]