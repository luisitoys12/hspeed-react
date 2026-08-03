# ─────────────────────────────────────────────────────────────
# Stage 1 – Builder
# Installs ALL deps (including devDeps) and produces the build.
# Node 22 alpine matches the original; .npmrc enables legacy-peer-deps.
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Skip git-hook setup and Playwright browser download during install
ENV HUSKY=0
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Layer-cache: copy manifests first, install, THEN copy sources
COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund

# VITE_* vars must be present at build-time so Vite can embed them
# in the client bundle.  Pass them as --build-arg from CI.
# NEVER put secrets (DATABASE_URL, JWT_SECRET, etc.) here.
ARG VITE_API_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

COPY . .
# npm run build runs script/build.mjs which:
#   1. Builds frontend with Vite  → dist/public/
#   2. Bundles server with esbuild → dist/index.cjs
RUN npm run build


# ─────────────────────────────────────────────────────────────
# Stage 2 – Production runtime
# Lean image: only prod deps + built artifacts.
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
# HOST=0.0.0.0 is REQUIRED for Docker — without it the server
# binds to 127.0.0.1 and the port is unreachable from outside the container.
ENV HOST=0.0.0.0
ENV PORT=5000
ENV HUSKY=0
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Production deps only (no devDeps → smaller image)
COPY package.json package-lock.json .npmrc ./
RUN npm ci --omit=dev --no-audit --no-fund

# Built artifacts from stage 1
COPY --from=builder /app/dist ./dist

# Migration/seed tooling (runs before server starts)
COPY docker/migrate-and-seed.cjs ./docker/migrate-and-seed.cjs
COPY docker/entrypoint.sh ./docker/entrypoint.sh
COPY server/migrations ./server/migrations

RUN chmod +x ./docker/entrypoint.sh

EXPOSE 5000

# Healthcheck hits /api/health — the endpoint registered in server/routes.ts
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "\
    require('http').get(\
      'http://127.0.0.1:'+(process.env.PORT||5000)+'/api/health',\
      r => process.exit(r.statusCode===200?0:1)\
    ).on('error',()=>process.exit(1))"

# entrypoint.sh: runs migrations, then starts the server
CMD ["./docker/entrypoint.sh"]
