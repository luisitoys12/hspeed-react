# 🐳 Despliegue con Docker & Docker Compose

> Guía completa para compilar y ejecutar **HabboSpeed** en contenedores Docker de producción con PostgreSQL y migraciones automáticas.

---

## 🌟 1. Características del Despliegue Docker

* **Build Multi-Stage Optimizado:** El `Dockerfile` genera un artefacto ligero separando la fase de compilación (Vite + esbuild) del runtime de producción.
* **Auto-Migraciones y Seed:** Al iniciar, se ejecutan las migraciones SQL pendientes y se siembra la cuenta de administrador oficial automáticamente.
* **PostgreSQL 16 Integrado:** Base de datos con comprobación de salud (`healthcheck`) y volúmenes persistentes.
* **Compatibilidad con Bases Externas:** Compatible con PostgreSQL local o servicios gestionados en la nube (Supabase, Neon, AWS RDS).

```mermaid
flowchart TD
    subgraph Host ["Máquina Anfitriona"]
        User["🌐 Navegador Web (Puerto 5000)"]
    end

    subgraph DockerCompose ["Docker Compose Stack"]
        subgraph AppContainer ["Contenedor: app (Node.js 20)"]
            Migration["1. docker/migrate-and-seed.cjs"]
            Server["2. Servidor Web (dist/index.cjs)"]
            Migration --> Server
        end

        subgraph DBContainer ["Contenedor: db (Postgres 16)"]
            Volume[("Volumen Persistente\nhspeed_db_data")]
        end
    end

    User --> Server
    Server -->|Puerto 5432| DBContainer
```

---

## ⚡ 2. Inicio Rápido con Docker Compose

### Prerrequisitos
* **Docker Engine** (24.x o superior)
* **Docker Compose v2** (`docker compose`)

### Ejecución
Desde la raíz del proyecto o desde la carpeta `docker/`:

```bash
cd docker
docker compose up --build -d
```

### Servicios iniciados:
1. **`db`**: Servidor PostgreSQL 16 escuchando internamente en el puerto `5432`.
2. **`app`**: Aplicación compilada de HabboSpeed en el puerto `5000`.

Abre tu navegador en:  
👉 **[http://localhost:5000](http://localhost:5000)**

---

## 📋 3. Variables de Entorno

Puedes personalizar la configuración creando un archivo `docker/.env` (no versionado) o exportando las variables en tu terminal:

| Variable | Descripción | Valor por Defecto |
| :--- | :--- | :--- |
| `NODE_ENV` | Entorno de ejecución | `production` |
| `PORT` | Puerto interno del contenedor | `5000` |
| `HOST` | Dirección de enlace de red | `0.0.0.0` |
| `DATABASE_URL` | Cadena de conexión a PostgreSQL | `postgres://hspeed:hspeed@db:5432/hspeed` |
| `PGSSL` | Forzar o desactivar SSL en la base de datos | `false` (local) / `true` (nube) |
| `JWT_SECRET` | Clave secreta para firmar tokens de sesión | `habbospeed_secret_key_2026` |

> ⚠️ **Advertencia Importante sobre `PGSSL`:**  
> Si apuntas `DATABASE_URL` a un proveedor externo como **Supabase** o **Neon**, debes configurar `PGSSL=true`, ya que estos servicios requieren cifrado TLS obligatorio.

---

## 🌐 4. Usar Base de Datos Externa (Supabase / Neon)

Si prefieres usar una base de datos remota sin levantar el contenedor `db` local:

```bash
cd docker
DATABASE_URL="postgresql://postgres:tu_password@tu-host.supabase.co:5432/postgres" \
PGSSL=true \
docker compose up --build app
```

---

## 🔐 5. Usuario Administrador Inicial

Durante el primer arranque del contenedor `app`, el script `docker/migrate-and-seed.cjs` genera las credenciales de acceso:

* **Email:** `admin@habbospeed.com`
* **Contraseña:** `admin123`
* **Rango:** `admin` (acceso completo a `/panel` y `/djpanel`)

*(Recuerda cambiar la contraseña desde el panel de perfil una vez desplegado en producción).*

---

## 🛠️ 6. Comandos de Gestión y Diagnóstico

### Ver logs en tiempo real:
```bash
# Logs de la aplicación web
docker compose logs -f app

# Logs de la base de datos
docker compose logs -f db
```

### Comprobar estado y healthcheck:
```bash
docker compose ps
```

### Detener los servicios:
```bash
docker compose down
```

### Reiniciar y reconstruir imágenes tras cambios:
```bash
docker compose up --build -d
```
