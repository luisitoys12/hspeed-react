# ⚡ Habbospeed - Sitio de Fans de Habbo

Bienvenido al repositorio oficial de **Habbospeed**, una moderna aplicación web para la fansite de radio de Habbo.es. Este proyecto está construido con un enfoque moderno y en tiempo real, utilizando React + Vite para el frontend y Express + Supabase como backend.

---

## ✨ Descripción General

Habbospeed no es solo un sitio web, sino una plataforma dinámica donde los administradores pueden gestionar el contenido en vivo sin necesidad de editar código. Desde las noticias y los horarios de los DJs hasta las salas destacadas y las alianzas, todo se controla desde un panel de administración centralizado que se comunica directamente con Supabase PostgreSQL.

### Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Framework** | React 19 + Vite 7 |
| **Lenguaje** | TypeScript |
| **Estilos** | Tailwind CSS v3 + ShadCN/UI |
| **Backend** | Express.js (Node.js) |
| **Base de Datos** | Supabase (PostgreSQL) |
| **Autenticación** | JWT (bcryptjs) |
| **Routing** | Wouter (hash-based) |
| **State Management** | TanStack Query v5 |
| **Alojamiento** | Netlify |

---

## 🔥 Funcionalidades Implementadas

La plataforma cuenta con un robusto conjunto de características:

### Gestión de Contenido Dinámico
- **Carrusel Principal**: Administra las diapositivas de la página de inicio desde la base de datos.
- **Noticias y Guías**: CRUD completo para crear, editar y eliminar artículos con imágenes y categorías.
- **Horarios de Radio**: Gestiona la programación semanal de los DJs.
- **Equipo de la Fansite**: Muestra usuarios registrados con rol aprobado y su página pública.
- **Temáticas**: 5 temas visuales (default, circo, habboween, navidad, playa) controlados desde el admin.

### Panel de Administración (`/panel`)
- **Acceso Restringido**: Solo los usuarios con rol de administrador pueden acceder.
- **Control Centralizado**: Gestión de noticias, eventos, horarios, usuarios, configuración, temas y más.
- **Gestión de Usuarios**: Aprobar registros, cambiar roles (admin, dj, user, pending), dar SpeedPoints.

### Panel DJ (`/djpanel`)
- **Acceso para DJs y Admins**: Los DJs pueden gestionar su turno sin necesitar permisos de admin.
- **Estado en Vivo**: DJ actual, siguiente DJ, mensaje/nota del turno.
- **Peticiones**: Ver y gestionar peticiones de canciones, saludos, gritos y declaraciones.
- **SpeedPoints**: Dar puntos a usuarios participantes directamente desde el panel.

### Interactividad para Usuarios
- **Autenticación**: Sistema de registro e inicio de sesión con JWT.
- **Sistema de Comentarios**: Los usuarios registrados pueden comentar en noticias, mostrando su **cabeza de avatar Habbo**.
- **Chat en Vivo**: Chat en la página de inicio con avatares Habbo en tiempo real.
- **Mensajes Privados**: Sistema de mensajería entre usuarios con contador de no leídos.
- **Verificación de Badges**: Verifica que un badge de Habbo pertenece realmente al usuario consultando la API oficial.
- **Foro**: Sistema de foro con categorías, hilos y respuestas.

### Integraciones con Habbo
- **Habbo Imager**: Generador de avatares con la versión moderna de Habbo Imaging.
- **Buscador de Placas/Badges**: Búsqueda en tiempo real usando la API de HabboAssets.
- **Marketplace**: Historial de precios del Marketplace de Habbo con datos reales.
- **Radio en Vivo**: Reproductor flotante conectado a AzuraCast con DJ actual y avatar.

---

## 🚀 Próximas Actualizaciones (Hoja de Ruta)

El proyecto está en constante evolución:

- **Perfiles de Usuario Públicos**: Página de perfil personal con avatar, placas y logros.
- **Gamificación y Logros**: Sistema de puntos y ranking por actividad.
- **Dashboard de Estadísticas**: Métricas de usuarios, comentarios y actividad.
- **Editor WYSIWYG**: Editor de texto enriquecido para noticias.
- **Notificaciones en Tiempo Real**: Alertas cuando un DJ inicia transmisión.
- **Reacciones**: Posibilidad de reaccionar a noticias y comentarios.

---

## 🛠️ Cómo Empezar (Para Desarrolladores)

### 1. Clona el Repositorio
```bash
git clone https://github.com/luisitoys12/hspeed-react.git
cd hspeed-react
```

### 2. Instala las Dependencias
```bash
npm install
```

### 3. Configura las Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto con las credenciales de Supabase:
```env
DATABASE_URL=postgresql://usuario:password@host:puerto/postgres
```

### 4. Ejecuta el Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5000`.

### 5. Build para Producción
```bash
npm run build
node dist/index.cjs
```

---

## 📁 Estructura del Proyecto

```
hspeed-react/
├── client/                  # Frontend React
│   ├── src/
│   │   ├── components/      # Componentes reutilizables (TopNavBar, Footer, Radio, etc.)
│   │   ├── pages/           # Páginas (HomePage, NewsPage, DJPanelPage, AdminPanel, etc.)
│   │   ├── hooks/           # Custom hooks (useAuth, useTheme, etc.)
│   │   └── lib/             # Utilidades y queryClient
│   └── index.html
├── server/                  # Backend Express
│   ├── routes.ts            # API endpoints
│   ├── storage.ts           # Capa de datos Supabase
│   └── index.ts             # Server entry point
├── shared/                  # Tipos y esquemas compartidos
│   └── schema.ts            # 19 tablas Drizzle/Zod
└── dist/                    # Build de producción
```

---

## 📊 Base de Datos (19 tablas)

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios con roles (admin, dj, user, pending) |
| `news` | Noticias y artículos |
| `events` | Eventos de la comunidad |
| `schedule` | Programación semanal de radio |
| `comments` | Comentarios en noticias |
| `polls` | Encuestas activas |
| `config` | Configuración general del sitio |
| `themes` | Temas visuales |
| `forum_categories` | Categorías del foro |
| `forum_threads` | Hilos del foro |
| `forum_posts` | Respuestas del foro |
| `marketplace_items` | Ítems del marketplace |
| `badge_collection` | Colección de badges |
| `requests` | Peticiones de canciones/saludos |
| `team_members` | Miembros del equipo |
| `dj_panel` | Estado del panel DJ |
| `chat_messages` | Mensajes del chat en vivo |
| `private_messages` | Mensajes privados |
| `verified_badges` | Badges verificados por usuario |

---

## 🔑 Credenciales de Admin

- **Email**: `admin@habbospeed.com`
- **Contraseña**: `admin123`

> ⚠️ Cambia estas credenciales en producción.

---

## 📄 Legal

HabboSpeed es un fansite no oficial. No está afiliado, respaldado ni conectado con Sulake Corporation Oy. Habbo® es una marca registrada de Sulake Corporation Oy.

---

© 2026 HabboSpeed. Todos los derechos reservados.

¡Gracias por tu interés en Habbospeed! ⚡
