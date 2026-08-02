# Docker Setup

Guía para levantar HabboSpeed con Docker: la app (Node/Express + build de Vite) y, opcionalmente, un Postgres local.

## Prerrequisitos

- Docker Engine
- Docker Compose (v2, el que trae `docker compose`)

## Quick Start

Desde la carpeta `docker/`:

```bash
cd docker
docker compose up --build
```

Esto levanta:

- **`db`**: Postgres 16 local (puerto `5432`), con healthcheck.
- **`app`**: build de producción (multi-stage) de la app, en el puerto `5000`. Al arrancar corre `docker/migrate-and-seed.cjs` (aplica migraciones pendientes en `server/migrations/` y crea el usuario admin) y luego inicia el servidor.

La app queda disponible en <http://localhost:5000>.

> No hay perfiles `dev`/`prod` ni `Dockerfile.dev`/`Dockerfile.prod`: hay un único `Dockerfile` (multi-stage) en la raíz del repo y un único `docker-compose.yml` en `docker/`.

## Variables de entorno

El servicio `app` en `docker-compose.yml` ya trae valores por defecto para desarrollo local. Para sobreescribirlos, crea un archivo `docker/.env` (no versionado) o exporta las variables antes de levantar el compose:

| Variable | Descripción | Default en compose |
|----------|-------------|---------------------|
| `NODE_ENV` | Entorno | `production` |
| `PORT` | Puerto interno del contenedor | `5000` |
| `HOST` | Interfaz a la que hace bind el server | `0.0.0.0` |
| `DATABASE_URL` | Cadena de conexión Postgres | `postgres://hspeed:hspeed@db:5432/hspeed` (el `db` local) |
| `PGSSL` | `false` desactiva SSL en la conexión a Postgres | `false` |
| `JWT_SECRET` | Secreto para firmar JWT | `habbospeed_secret_key_2026` (⚠️ cámbialo en producción) |

**Importante sobre `PGSSL`:** el Postgres local del contenedor `db` no tiene SSL habilitado, así que el compose fuerza `PGSSL=false`. Si en cambio apuntas `DATABASE_URL` a un proveedor gestionado (Supabase, Neon), **quita `PGSSL` o ponlo en `true`**, porque esos proveedores exigen SSL — con `PGSSL=false` el intento de conexión será rechazado.

## Usar una base de datos externa (Supabase/Neon) en vez de la local

```bash
cd docker
DATABASE_URL="postgresql://usuario:password@tu-host-supabase:5432/postgres" \
PGSSL=true \
docker compose up --build app
```

(Solo el servicio `app`; puedes omitir el `db` local con `docker compose up --build app` sin `depends_on` bloqueante, o simplemente ignorar el contenedor `db` que igual queda arriba sin usarse.)

## Inicialización de la base de datos

En cada arranque del contenedor `app`, `docker/migrate-and-seed.cjs`:

1. Crea la tabla `schema_migrations` si no existe.
2. Aplica cualquier migración pendiente de `server/migrations/*.sql` (en orden, y solo las que no se hayan aplicado antes).
3. Crea el usuario admin si todavía no existe:
   - Email: `admin@habbospeed.com`
   - Password: `admin123`

   ⚠️ Cambia esta contraseña inmediatamente después del primer login en un entorno real.

## Health check

`GET /api/health` responde `200 OK` con `{ status: "ok", db: "up" | "down" | "disabled", uptime }`. Es lo que usan el `HEALTHCHECK` del `Dockerfile` y el `healthcheck` del servicio `app` en `docker-compose.yml` para saber si el contenedor está listo.

## Notas

- El `Dockerfile` usa un build multi-stage: la etapa `builder` compila cliente (Vite) y servidor (esbuild, bundle a `dist/index.cjs`); la imagen final solo copia `dist/`, `docker/migrate-and-seed.cjs` y `server/migrations/`, e instala solo dependencias de producción.
- `docker-compose.yml` sobreescribe el `CMD` del Dockerfile con `node docker/migrate-and-seed.cjs && node dist/index.cjs` para correr migraciones antes de arrancar. Si corres la imagen suelta con `docker run` (sin compose), **no se ejecutan migraciones automáticamente** — tendrías que correrlas a mano o replicar ese comando.
- Para reconstruir tras cambios de código: `docker compose up --build`.
- Para ver logs: `docker compose logs -f app` (o `db`).

## Archivos relevantes

- `Dockerfile` (raíz del repo) — build multi-stage de la app.
- `docker/docker-compose.yml` — servicios `db` + `app`.
- `docker/migrate-and-seed.cjs` — lógica de migraciones y seed del admin.
- `.dockerignore` — excluye `node_modules`, `.git`, `.env*`, etc. del contexto de build.

## Troubleshooting

### El contenedor `app` no arranca / se reinicia en bucle

```bash
docker compose logs app
```

Casos típicos:

- **`no encryption/SSL/pgsql: SSL/TLS required` o similar**: estás apuntando a Supabase/Neon con `PGSSL=false` (o sin setearlo estando en `false` por default). Pon `PGSSL=true`.
- **`ECONNREFUSED` a `db:5432`**: el contenedor `db` todavía no está healthy; `app` tiene `depends_on: db: condition: service_healthy`, así que normalmente espera solo, pero si `db` nunca queda healthy revisa sus logs (`docker compose logs db`).

### Migraciones fallan

Revisa que el SQL en `server/migrations/*.sql` sea válido y que el usuario de la base de datos tenga permisos para crear tablas. El script aplica los archivos en orden alfabético y registra cada uno en `schema_migrations`, así que una migración fallida se puede corregir y se reintentará en el siguiente arranque (no quedó marcada como aplicada).

### El health check nunca pasa a "healthy"

Prueba manualmente desde otro contenedor o desde el host (si publicaste el puerto):

```bash
curl -i http://localhost:5000/api/health
```

Si responde `db: "down"` pero `status: "ok"`, la app está arriba pero no logra hablarle a Postgres — revisa `DATABASE_URL` y `PGSSL`.

## Más información

- [Documentación de Docker](https://docs.docker.com/)
- [Imagen de PostgreSQL en Docker Hub](https://hub.docker.com/_/postgres)
