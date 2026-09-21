# Multi-stage Dockerfile for hspeed-react v1
# Builder: installs deps and creates production build
FROM node:22-alpine AS builder
WORKDIR /app

ENV HUSKY=0
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV NODE_ENV=production

# Install build deps separately for better layer caching
COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund

# Copy source files
COPY . .

# Build client
RUN npm run build:client 2>/dev/null || npm run build

# Production image
FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV HUSKY=0
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Install only production deps
COPY package.json package-lock.json .npmrc ./
RUN npm ci --omit=dev --no-audit --no-fund

# Copy built artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||5000)+'/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "dist/index.cjs"]
