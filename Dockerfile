# syntax=docker/dockerfile:1

# ---------- Base ----------
# Node provides the runtime that Next.js / Prisma CLIs expect (Node shebangs),
# while Bun (copied from the official image, no network needed) is used as a fast
# package manager and script runner. Alpine needs openssl + libc6-compat for Prisma.
FROM node:20-alpine AS base
# Optional proxy support for networks behind a corporate proxy. Pass with:
#   docker compose build --build-arg HTTPS_PROXY=http://host:port
ARG HTTP_PROXY=""
ARG HTTPS_PROXY=""
ARG NO_PROXY=""
ENV HTTP_PROXY=${HTTP_PROXY} \
    HTTPS_PROXY=${HTTPS_PROXY} \
    NO_PROXY=${NO_PROXY} \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=oven/bun:1-alpine /usr/local/bin/bun /usr/local/bin/bun
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

# ---------- Dependencies ----------
FROM base AS deps
COPY package.json ./
# Prisma schema is needed because the "postinstall" script runs "prisma generate".
COPY prisma ./prisma
# Resilient install for flaky / intercepting networks (proxy, VPN, antivirus TLS
# inspection). The cache mount keeps already-downloaded packages across retries and
# rebuilds; low concurrency avoids the parallel-download corruption seen as
# "Integrity check failed for tarball".
RUN --mount=type=cache,target=/root/.bun/install/cache \
    sh -c 'n=0; until bun install --network-concurrency 2; do \
      n=$((n+1)); \
      if [ "$n" -ge 5 ]; then echo "bun install failed after $n attempts"; exit 1; fi; \
      echo "bun install attempt $n failed, retrying in 10s..."; sleep 10; \
    done'

# ---------- Build ----------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# `bun run build` runs `prisma generate && next build`.
RUN bun run build

# ---------- Runner ----------
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
# DATABASE_URL (PostgreSQL) is provided at runtime via docker-compose.yml or the host env.

# Run as a non-root user.
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Copy the built app and the dependencies required at runtime (Prisma CLI + engines
# are needed so the entrypoint can apply the schema to the database).
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
  && mkdir -p /app/public/uploads \
  && chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["bun", "run", "start"]
