#!/bin/sh
# docker/entrypoint.sh
# Runs Drizzle migrations (and optional seed) before starting the server.
# If migrations fail the container exits immediately — prevents a broken
# app from starting against an outdated schema.
set -e

echo "[entrypoint] Running database migrations..."
node docker/migrate-and-seed.cjs

echo "[entrypoint] Starting server on port ${PORT:-5000}..."
exec node dist/index.cjs
