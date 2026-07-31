<div align="center">

# 🏨 HabboSpeed

**Fansite completo para la comunidad Habbo en español**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v3-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

</div>

---

## 📖 Descripción

HabboSpeed es un fansite para la comunidad Habbo con radio streaming integrada, foro, marketplace de muebles, explorador de badges, sistema de noticias, eventos, y panel de administración completo. Inspirado en el diseño de sitios como HabboRadio, HabboFans y RubyXD.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | Vite + React 18 + TypeScript |
| **UI** | Tailwind CSS v3 + shadcn/ui |
| **Routing** | Wouter |
| **Estado / Cache** | TanStack Query (React Query) |
| **Backend** | Express.js + Node.js |
| **ORM** | Drizzle ORM |
| **Base de datos** | PostgreSQL (Supabase) |
| **Auth** | JWT + bcrypt |
| **Radio** | Azuracast / ZenoFM API |
| **Deploy** | Netlify (frontend) + Docker |

---

## 🎨 Tema Visual

Diseño dark inspirado en Habbo con toques pixel art:

- **Fondo:** Deep navy/purple — `hsl(224, 71%, 4%)`
- **Cards:** `hsl(220, 70%, 10%)`
- **Acento primario:** Purple — `hsl(262, 84%, 54%)` (`#7c3aed`)
- **Texto:** `hsl(213, 31%, 91%)`

---

## 📄 Páginas

### Públicas
| Ruta | Descripción |
|------|-------------|
| `/` | Home — radio player, últimas badges, noticias, eventos |
| `/news` | Listado de noticias |
| `/news/:id` | Detalle de noticia |
| `/events` | Próximos eventos |
| `/schedule` | Parrilla de programación DJs |
| `/team` | Equipo del fansite |
| `/badges` | Explorador de badges Habbo |
| `/marketplace` | Tracker de precios de muebles |
| `/imager` | Generador de avatares Habbo |
| `/forum` | Foro — categorías, hilos, posts |
| `/profile/:username` | Perfil de usuario |
| `/radio` | Reproductor de radio dedicado |
| `/futbol-hub` | Hub de contenido fútbol |
| `/rooms` | Rooms |
| `/vip` | Zona VIP |
| `/contact` | Formulario de contacto |
| `/login` `/register` | Autenticación |

### Panel de Administración
| Ruta | Descripción |
|------|-------------|
| `/panel` | Dashboard con estadísticas |
| `/panel` → Users | Gestión de usuarios y roles |
| `/panel` → News | CRUD de noticias |
| `/panel` → Events | CRUD de eventos |
| `/panel` → Schedule | Gestión de parrilla |
| `/panel` → Config | Configuración del sitio y radio |
| `/panel` → Forum | Moderación del foro |
| `/djpanel` | Panel exclusivo para DJs |

---

## 🗄️ Base de Datos

Esquema gestionado con **Drizzle ORM** conectado a Supabase (PostgreSQL).

<details>
<summary>Ver tablas del esquema</summary>

- **users** — id, email, password_hash, display_name, habbo_username, avatar_url, role (admin/dj/user/pending), approved, speed_points
- **news** — id, title, summary, content, image_url, category, reactions (jsonb), author_id
- **events** — id, title, server, date, time, room_name, room_owner, host
- **schedule** — id, day, start_time, end_time, show_name, dj_name
- **comments** — id, article_id, author_id, content
- **polls** — id, title, options (jsonb), is_active
- **config** — radio_service, api_url, listen_url, slideshow (jsonb), discord_webhooks (jsonb)
- **forum_categories** / **forum_threads** / **forum_posts**
- **marketplace_items** — item_name, class_name, current_price, avg_price, price_history (jsonb)
- **badge_collection** — code, name, hotel, category, image_url
- **requests** — type (saludo/grito/concurso/cancion/declaracion), details, user_name
- **team_members** — display_name, habbo_username, role, motto

</details>

---

## 🌐 APIs Externas

| API | Uso |
|-----|-----|
| `habbo.es/api/public/users` | Perfil de usuario Habbo |
| `habbo.es/habbo-imaging/avatarimage` | Avatar del usuario |
| `habboassets.com/api/v1/badges` | Últimas badges por hotel |
| `habboapi.site/api/market/history` | Historial de precios marketplace |
| `api.habboemotion.com/public/badges/new` | Badges nuevas |
| Azuracast / ZenoFM | Now playing, DJ info, listeners |

---

## 🚀 Setup Local

### Prerequisitos
- Node.js 18+
- PostgreSQL (o cuenta Supabase)
- Variables de entorno configuradas

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/luisitoys12/hspeed-react.git
cd hspeed-react

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Ejecutar migraciones de base de datos
npm run db:push

# Iniciar en desarrollo
npm run dev
```

### Variables de entorno requeridas

```env
# Base de datos
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Auth
JWT_SECRET=tu_jwt_secret_aqui

# Jam SDK (bug reporting)
VITE_JAM_API_KEY=tu_api_key_de_jam
VITE_BUILD_VERSION=1.0.0
```

---

## 🐳 Docker

```bash
# Build y run con Docker Compose
docker compose up --build

# O usando el Dockerfile directamente
docker build -t hspeed-react .
docker run -p 3000:3000 hspeed-react
```

---

## 🐛 Reportar Bugs

Este proyecto usa **[Jam](https://jam.dev)** para reportes de bugs con video, logs de consola y red automáticos.

**→ [Grabar un bug ahora](https://recorder.jam.dev/th2ntbe)**

O abre un [GitHub Issue](https://github.com/luisitoys12/hspeed-react/issues/new/choose) usando las plantillas disponibles.

---

## 🤝 Contribuir

1. Fork del repositorio
2. Crea tu rama: `git checkout -b feat/nombre-feature`
3. Commit: `git commit -m 'feat: descripción'`
4. Push: `git push origin feat/nombre-feature`
5. Abre un Pull Request

---

## 📝 Licencia

Proyecto privado — © 2025 [EstacionKusMedios](https://estacionkusmedios.org)

---

<div align="center">
Hecho con ❤️ por <a href="https://github.com/luisitoys12">Luis Martinez</a> · <a href="https://estacionkusmedios.org">EstacionKusMedios</a>
</div>
