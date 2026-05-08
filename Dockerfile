# ── Stage 1: Install dependencies ────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# ── Stage 2: Production image ─────────────────────────────────────────────────
FROM node:20-alpine

RUN addgroup -S meditrack && adduser -S meditrack -G meditrack

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

RUN chown -R meditrack:meditrack /app
USER meditrack

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["node", "src/server.js"]
