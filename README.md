# 🏨 HabboSpeed — Fansite Habbo

> Fansite completa para la comunidad Habbo hispanohablante. Radio en vivo, noticias, eventos, foro, marketplace de furnis y más — todo en un solo lugar.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-latest-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?logo=postgresql&logoColor=white)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-3.1-orange.svg)](#-changelog)

---

## 📋 Descripción

**HabboSpeed** es una plataforma web full-stack orientada a la comunidad de jugadores de Habbo Hotel. Incluye reproductor de radio integrado (Azuracast/ZenoFM), sistema de noticias con reacciones, calendario de eventos, foro comunitario, explorador de badges, marketplace de furnis y un panel de administración completo.

---

## 📌 Changelog

### v3.1

- ✨ **Nueva sección Feria** (`/feria`): hub de herramientas con Catálogo de Logros, Buscador de Precios de Mercado (batch) y Ranking de Pesca + estado del Derby (Habbo Origins), más accesos directos a Hot Looks y Buscador de Grupos.
- 🐛 Fix: imágenes de noticias no se mostraban por no pasar por el proxy de imágenes.
- 🐛 Fix: furnis con imagen rota cuando el fallback venía de HabboAssets (host no estaba en el allowlist del proxy).
- 🐛 Fix: Hot Looks siempre mostraba datos de relleno porque la API de Habbo responde XML y se intentaba parsear como JSON.
- 🛠️ Panel admin: las categorías del foro ahora se pueden **editar** y **eliminar**, no solo crear.
- 🧭 Navegación: "Feria" agregado al menú superior y al sidebar.

---

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | Vite + React 18 + TypeScript |
| **UI Components** | shadcn/ui + Tailwind CSS v3 |
| **Backend** | Express.js + Node.js |
| **ORM** | Drizzle ORM |
| **Base de datos** | PostgreSQL (Supabase) |
| **Autenticación** | JWT + bcrypt |
| **Radio** | Azuracast / ZenoFM API |
| **Deploy** | Netlify (frontend) + configuración Docker |

---

## 🗂️ Estructura del Proyecto

```
hspeed-react/
├── client/          # Frontend React + Vite
├── server/          # Backend Express + API routes
├── shared/          # Tipos y schemas compartidos
├── docker/          # Configuración Docker
├── netlify/         # Funciones serverless Netlify
├── script/          # Scripts utilitarios
├── docs/            # Documentación adicional
├── drizzle.config.ts
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

---

## ✨ Funcionalidades

### Páginas Públicas
- **Home** (`/`) — Hero slideshow, reproductor de radio, últimos badges, noticias y eventos
- **Noticias** (`/news`) — Lista y detalle de noticias con sistema de reacciones
- **Eventos** (`/events`) — Calendario de eventos próximos en Habbo
- **Programación** (`/schedule`) — Grilla de turnos de DJs
- **Equipo** (`/team`) — Presentación del staff de HabboSpeed
- **Comunidad** (`/community`) — Hub de sub-secciones comunitarias
- **Badge Browser** (`/badges`) — Explorador de badges con integración Habbo API
- **Marketplace** (`/marketplace`) — Rastreador de precios de furnis en tiempo real
- **Imager** (`/imager`) — Generador de avatares Habbo con opciones personalizadas
- **Foro** (`/forum`) — Categorías, hilos y posts con moderación
- **Contacto** (`/contact`) — Formulario de contacto
- **Perfil** (`/profile/:username`) — Perfil de usuario con datos Habbo

### Panel de Administración (`/panel`)
- Dashboard con estadísticas generales
- Gestión de Noticias, Eventos y Programación
- Administración de Usuarios (roles: `admin`, `dj`, `user`, `pending`)
- Configuración del radio y apariencia del sitio
- Moderación del foro

---

## 🌐 APIs Externas

| API | Uso |
|-----|-----|
| `habbo.es/api/public/users` | Perfil de usuario Habbo |
| `habbo.es/habbo-imaging/avatarimage` | Imágenes de avatares |
| `habboassets.com/api/v1/badges` | Últimos badges publicados |
| `habboapi.site/api/market` | Historial de precios del marketplace |
| `api.habboemotion.com/public/badges/new` | Badge emotions |
| **Azuracast / ZenoFM** | Stream de radio en vivo |

---

## 🗄️ Esquema de Base de Datos

Las tablas principales manejadas con **Drizzle ORM**:

- `users` — Usuarios con roles y puntos de velocidad (`speed_points`)
- `news` — Noticias con reacciones JSONB
- `events` — Eventos con sala, host y fecha
- `schedule` — Programación de DJs por día
- `comments` — Comentarios de artículos
- `polls` — Encuestas activas
- `config` — Configuración global del sitio (radio, slideshow, webhooks Discord)
- `forum_categories`, `forum_threads`, `forum_posts` — Sistema de foro
- `marketplace_items` — Items con historial de precios JSONB
- `badge_collection` — Colección de badges por hotel
- `requests` — Solicitudes de canciones y saludos al radio
- `team_members` — Miembros del equipo

---

## 🛠️ Instalación y Desarrollo

### Requisitos
- Node.js 18+
- PostgreSQL (o cuenta Supabase)
- npm o pnpm

### Setup

```bash
# Clonar el repositorio
git clone https://github.com/luisitoys12/hspeed-react.git
cd hspeed-react

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales (DATABASE_URL, JWT_SECRET, etc.)

# Ejecutar migraciones con Drizzle
npm run db:push

# Iniciar en modo desarrollo
npm run dev
```

### Docker

```bash
# Levantar con Docker
docker-compose -f docker/docker-compose.yml up
```

---

## 🎨 Tema Visual

El diseño está inspirado en la estética de Habbo Hotel con modo oscuro:

```css
--background: hsl(224, 71%, 4%)    /* Navy profundo */
--card:       hsl(220, 70%, 10%)   /* Azul oscuro */
--primary:    hsl(262, 84%, 54%)   /* Púrpura #7c3aed */
--secondary:  hsl(215, 28%, 17%)   /* Azul grisáceo */
--foreground: hsl(213, 31%, 91%)   /* Texto claro */
```

---

## 📦 Deploy

- **Frontend**: Netlify (configuración en `netlify.toml`)
- **Backend**: Docker + cualquier VPS / Fly.io / Kamatera
- **Base de datos**: Supabase (PostgreSQL gestionado)

---

## 🤝 Contribuir

1. Fork del repositorio
2. Crea una rama: `git checkout -b feature/mi-feature`
3. Commit de cambios: `git commit -m 'feat: agrega mi feature'`
4. Push: `git push origin feature/mi-feature`
5. Abre un Pull Request

> **Reportar bugs**: Usa [Jam](https://jam.dev) para grabar el bug con contexto completo (video + logs de consola + red) y abre un Issue en GitHub con el link del Jam adjunto.

---

## 👤 Autor

**Luis Martinez Sandoval** — [EstacionKusMedios](https://estacionkusmedios.org)  
GitHub: [@luisitoys12](https://github.com/luisitoys12)

---

## 📄 Licencia

MIT © EstacionKusMedios
