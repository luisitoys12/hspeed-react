# Docker Setup

This guide explains how to run Habbospeed using Docker with a local PostgreSQL database.

## Prerequisites

- Docker Engine
- Docker Compose

## Quick Start

### Development (with hot-reload)

```bash
docker compose --profile dev up --build
```

This will start:
- PostgreSQL database on port 5432
- The application on port 5000 (with Vite hot-reload)

The application will be available at <http://localhost:5000>

### Production (optimized build)

```bash
docker compose --profile prod up --build
```

This builds a production-ready image and runs it.

## Environment Variables

Copy `.env.example` to `.env` and adjust the values.

The following environment variables are used:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development or production) | `development` |
| `PORT` | Port to bind the application | `5000` |
| `HOST` | Host to bind to | `0.0.0.0` |
| `DATABASE_URL` | PostgreSQL connection string (format: `postgresql://user:password@host:port/db`) | `postgresql://habspeed:habspeed@postgres:5432/habspeed` |
| `PGSSL` | Set to `false` to disable SSL for local Docker connections | `false` |
| `JWT_SECRET` | Secret for signing JWT tokens | (required) |
| `SESSION_SECRET` | Secret for session encryption | (required) |
| `AZURACAST_URL` | Optional URL to your AzuraCast instance | (empty) |
| `AZURACAST_API_KEY` | Optional API key for AzuraCast | (empty) |

## Database Initialization

On first startup, the entrypoint script will:

1. Wait for PostgreSQL to be ready
2. Run any pending migrations (located in `server/migrations/`)
3. Seed an admin user:
   - Email: `admin@habbospeed.com`
   - Password: `admin123`

## Health Check

A healthcheck endpoint is available at `GET /api/health` which returns `200 OK` when the service is ready.

## Notes

- The AzuraCast integration is optional and requires the external service to be running.
- The Docker setup uses a multi-stage build for production to minimize image size.
- The application runs as a non-root user for security.
- To rebuild images after changes, use `--build` flag.
- To see logs, add `-f` to follow or use `docker compose logs`.

## Customizing

If you need to modify the Docker setup, edit the following files:

- `docker-compose.yml` - defines services and profiles
- `Dockerfile.dev` - development image (hot-reload)
- `Dockerfile.prod` - production multi-stage build
- `docker/entrypoint.sh` - waits for DB, runs migrations/seed, starts app
- `docker/migrate-and-seed.cjs` - migration and seeding logic

## Troubleshooting

### Container fails to start

Check the logs:

```bash
docker compose logs
```

### Database connection errors

Ensure the `DATABASE_URL` matches the service name `postgres` and the credentials in `docker-compose.yml`.

### Migrations fail

Check that the migration SQL is valid and that the database user has permissions to create tables.

## Further Reading

- [Docker documentation](https://docs.docker.com/)
- [PostgreSQL Docker image](https://hub.docker.com/_/postgres)
