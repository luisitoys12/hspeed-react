# 🚀 Guía de Despliegue en cPanel — hspeed-react

Este proyecto es una **aplicación full-stack** (React + TypeScript + Vite en el frontend, Node.js/Express en el servidor). Esta guía cubre tres estrategias de despliegue según las capacidades de tu cPanel.

---

## 📋 Requisitos Previos

Antes de comenzar, verifica en tu cPanel que tienes disponible alguna de las siguientes opciones:

- **Node.js App** (en la sección "Software" o "Setup Node.js App") — **recomendado para full-stack**
- **File Manager** o acceso **FTP/SFTP**
- **Terminal SSH** (en "Advanced" → "Terminal")
- Tu dominio o subdominio configurado en cPanel

---

## 🏗️ Opción A — Deploy Full-Stack con Node.js App (Recomendada)

> Usa esta opción si tu cPanel tiene la sección **"Setup Node.js App"** (común en Namecheap, Hostinger, A2 Hosting, etc.)

### Paso 1 — Preparar el Build Localmente

En tu máquina local (o en el servidor de CI), ejecuta:

```bash
# Instalar dependencias
npm install

# Compilar el frontend (genera la carpeta dist/ o client/dist/)
npm run build
```

Verifica que el build se genere correctamente. La carpeta `dist/` o `client/dist/` debe existir después del build.

### Paso 2 — Subir archivos al servidor

**Opción 2a — Vía File Manager de cPanel:**
1. Abre **cPanel → File Manager**
2. Navega a `public_html/` (o a la carpeta de tu subdominio, p. ej. `public_html/app/`)
3. Crea una carpeta nueva, p. ej. `hspeed/`
4. Sube **todos** los archivos del proyecto (excepto `node_modules/`) usando el botón **Upload**
5. O sube un archivo `.zip` y extráelo dentro del File Manager

**Opción 2b — Vía SFTP (recomendado para proyectos grandes):**
```bash
# Desde tu terminal local (ajusta usuario, host y ruta)
rsync -avz --exclude='node_modules' --exclude='.git' \
  ./ usuario@tudominio.com:~/public_html/hspeed/
```

### Paso 3 — Configurar Node.js App en cPanel

1. En cPanel, abre **"Setup Node.js App"**
2. Haz clic en **"Create Application"**
3. Rellena los campos:

   | Campo | Valor |
   |-------|-------|
   | **Node.js version** | 18.x o 20.x (LTS) |
   | **Application mode** | Production |
   | **Application root** | `/home/TU_USUARIO/public_html/hspeed` |
   | **Application URL** | `tudominio.com` o `app.tudominio.com` |
   | **Application startup file** | `dist/index.js` (ver nota abajo) |

   > ⚠️ **Nota sobre el startup file:** Si tu servidor está en TypeScript, cPanel no puede ejecutarlo directamente. Tienes dos opciones:
   > - Compila el servidor con `npx tsc` y apunta al archivo `.js` resultante (p. ej. `dist/server/index.js`)
   > - O usa `tsx` como runner: instálalo con `npm install tsx` y configura el startup file como un script que invoque `tsx server/index.ts`

4. Haz clic en **"Create"**

### Paso 4 — Instalar dependencias en el servidor

Después de crear la app, cPanel mostrará un botón **"Run NPM Install"** — haz clic en él. Alternativamente, desde la Terminal SSH:

```bash
cd ~/public_html/hspeed
npm install --production
```

### Paso 5 — Configurar Variables de Entorno

En la sección de la app en "Setup Node.js App", hay un campo para **Environment Variables**. Agrega las variables de tu `.env`:

```
NODE_ENV=production
DATABASE_URL=mysql://usuario:password@localhost/tu_base_de_datos
PORT=3000
# ... demás variables de tu .env
```

> 💡 También puedes crear un archivo `.env` directamente en `~/public_html/hspeed/.env` vía File Manager o SSH.

### Paso 6 — Arrancar la aplicación

Haz clic en el botón **"Start"** (o el ícono ▶) dentro de "Setup Node.js App". Verifica que el estado cambie a **"Running"**.

---

## 🌐 Opción B — Deploy Solo Frontend (Static SPA)

> Usa esta opción si **no** tienes Node.js App disponible, o si quieres servir solo el frontend y conectarte a una API externa.

### Paso 1 — Hacer el Build

```bash
npm install
npm run build
```

El resultado estará en `dist/` (o `client/dist/` según la configuración de Vite).

### Paso 2 — Subir a public_html

1. Sube **solo el contenido** de la carpeta `dist/` al directorio `public_html/` de tu dominio (o a una subcarpeta).
2. No subas el código fuente, solo los archivos compilados.

### Paso 3 — Configurar Rewrite para React Router

Como es una SPA (Single Page App), todas las rutas deben redirigir a `index.html`. Crea un archivo `.htaccess` en `public_html/` con este contenido:

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]
```

> Este archivo ya puede estar incluido en tu `dist/` si Vite está configurado para generarlo. De lo contrario, créalo manualmente vía File Manager.

---

## 🔄 Opción C — Deploy con Git Pull desde cPanel

> Para automatizar actualizaciones futuras directamente desde tu repositorio GitHub.

### Paso 1 — Activar Git Version Control en cPanel

1. Abre **cPanel → Git™ Version Control**
2. Haz clic en **"Create"**
3. Configura:

   | Campo | Valor |
   |-------|-------|
   | **Clone URL** | `https://github.com/luisitoys12/hspeed-react.git` |
   | **Repository Path** | `/home/TU_USUARIO/repos/hspeed-react` |
   | **Repository Name** | `hspeed-react` |

4. Haz clic en **"Create"**

### Paso 2 — Configurar el Deploy Hook (`.cpanel.yml`)

Crea un archivo `.cpanel.yml` en la raíz de tu repositorio:

```yaml
---
deployment:
  tasks:
    - export DEPLOYPATH=/home/TU_USUARIO/public_html/hspeed
    - /bin/cp -R $HOME/repos/hspeed-react/. $DEPLOYPATH
    - cd $DEPLOYPATH && npm install --production
    - cd $DEPLOYPATH && npm run build
```

> ⚠️ Reemplaza `TU_USUARIO` con tu nombre de usuario real de cPanel.

Haz commit y push de este archivo al repositorio para que cPanel lo detecte automáticamente en cada pull.

### Paso 3 — Hacer Pull y Deploy

En cPanel → Git™ Version Control → tu repo → **"Pull or Deploy"** → **"Update from Remote"** y luego **"Deploy HEAD Commit"**.

---

## 🗄️ Configuración de Base de Datos en cPanel

Si el proyecto usa Drizzle ORM (detectado por `drizzle.config.ts`):

1. **Crear base de datos:** cPanel → **MySQL® Databases** → crear una nueva base de datos y usuario
2. **Asignar permisos:** Asignar el usuario a la base de datos con todos los privilegios
3. **Actualizar `.env`:**
   ```
   DATABASE_URL=mysql://usuario_db:password@localhost/nombre_db
   ```
4. **Correr migraciones** desde SSH:
   ```bash
   cd ~/public_html/hspeed
   npx drizzle-kit migrate
   ```

---

## 🌍 Configurar Dominio o Subdominio

Si quieres servir la app desde un **subdominio** (ej. `app.tudominio.com`):

1. cPanel → **Subdomains** → crear `app.tudominio.com` apuntando a `public_html/hspeed`
2. En "Setup Node.js App", asegúrate de que la **Application URL** coincida con el subdominio

---

## 🔒 SSL / HTTPS

1. cPanel → **SSL/TLS** → **"Let's Encrypt™ SSL"** → emitir certificado para tu dominio/subdominio
2. O activa **"AutoSSL"** si tu hosting lo soporta

---

## 🛠️ Solución de Problemas Comunes

| Problema | Solución |
|----------|---------|
| Error 500 al cargar la app | Revisa los logs: cPanel → Logs → **Error Log** |
| Página en blanco (SPA) | Asegúrate de que el `.htaccess` tiene la regla de rewrite |
| `node_modules` faltando | Corre `npm install` desde SSH o usa "Run NPM Install" en cPanel |
| Puerto incorrecto | cPanel Node.js App asigna un puerto interno; usa `process.env.PORT` en el servidor |
| TypeScript no corre | Compila primero con `npx tsc` y apunta al `.js` resultante |
| Variables de entorno vacías | Verifica que el `.env` esté en la raíz y que Node.js App las tenga configuradas |

---

## 📁 Estructura del Proyecto Relevante

```
hspeed-react/
├── client/          ← Frontend React (fuentes)
├── server/          ← Backend Node.js/Express (fuentes)
├── shared/          ← Tipos y utilidades compartidas
├── dist/            ← Build compilado (generado por `npm run build`)
├── .cpanel.yml      ← Configuración de deploy automático (crear si usas Opción C)
├── drizzle.config.ts← Configuración ORM (migraciones de DB)
├── package.json
└── vite.config.ts
```

---

## 📌 Resumen Rápido

```
cPanel tiene "Setup Node.js App"?
  ✅ SÍ → Usa Opción A (full-stack)
  ❌ NO + solo quieres el frontend → Usa Opción B (static)
  🔄 Quieres auto-deploy desde GitHub → Usa Opción C (Git cPanel)
```

---

*Guía generada para el repositorio [luisitoys12/hspeed-react](https://github.com/luisitoys12/hspeed-react)*
