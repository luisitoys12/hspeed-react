# Multi-stage Dockerfile for hspeed-react
# Builder: installs deps and creates production build
FROM node:22-alpine AS builder
WORKDIR /app

# Skip git-hook setup (husky) and Playwright browser download during install
ENV HUSKY=0
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Install build deps (.npmrc needed for legacy-peer-deps=true)
COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund

# Copy sources and build
COPY . .
RUN npm run build

# Production image
FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
# Bind to all interfaces so the port is reachable from the host
ENV HOST=0.0.0.0
ENV HUSKY=0
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Install only production deps
COPY package.json package-lock.json .npmrc ./
RUN npm ci --omit=dev --no-audit --no-fund

# Copy built artifacts
COPY --from=builder /app/dist ./dist

# Copy migration/seed tooling for the entrypoint
COPY docker/migrate-and-seed.cjs ./docker/migrate-and-seed.cjs
COPY server/migrations ./server/migrations

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||5000)+'/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "dist/index.cjs"]
