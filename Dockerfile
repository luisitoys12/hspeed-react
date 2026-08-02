# Multi-stage Dockerfile for hspeed-react
# Builder: installs deps and creates production build
FROM node:20-alpine AS builder
WORKDIR /app

# Install build deps
COPY package.json package-lock.json ./
RUN npm ci

# Copy sources and build
COPY . .
RUN npm run build

# Production image
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

# Install only production deps
COPY package.json package-lock.json ./
RUN npm ci --production --no-audit --no-fund

# Copy built artifacts
COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/index.cjs"]

