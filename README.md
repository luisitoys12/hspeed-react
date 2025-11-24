# 🎵 Habbospeed - Radio Fansite para Habbo

<div align="center">

![Habbospeed Logo](https://i.imgur.com/u31XFxN.png)

**La plataforma definitiva para fansites de radio Habbo**

[![Next.js](https://img.shields.io/badge/Next.js-15.3-black?logo=next.js)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?logo=mongodb)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.18-blue?logo=express)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)

[Demo](https://9002--019ab4a0-e101-76da-8fc3-828dff257fb4.us-east-1-01.gitpod.dev) · [Documentación](./MIGRATION_GUIDE.md) · [Reportar Bug](https://github.com/luisitoys12/hspeed-react/issues)

</div>

---

## ✨ Características Principales

### 🎙️ **Radio en Vivo**
- **Reproductor flotante** con controles completos
- **Integración con Azuracast y ZenoFM**
- **Información en tiempo real** de canciones y DJs
- **Media Session API** para controles del sistema
- **Visualización de oyentes** en tiempo real

### 📰 **Sistema de Noticias**
- **Editor completo** con soporte Markdown
- **Categorías personalizables** (Eventos, Copa, Noticias)
- **Sistema de reacciones** (❤️ 🎉 🤔 👍)
- **Comentarios en tiempo real**
- **Imágenes optimizadas** con Next.js Image

### 📅 **Gestión de Horarios**
- **Programación semanal** de DJs
- **Vista por días** con horarios detallados
- **Información de programas** y presentadores
- **Actualización en tiempo real**

### 🎉 **Sistema de Eventos**
- **Calendario de eventos** de Habbo
- **Detalles completos** (sala, anfitrión, fecha, hora)
- **Countdown en tiempo real** hasta el evento
- **Integración con salas** de Habbo

### 👥 **Gestión de Equipo**
- **Perfiles de DJs** con avatares de Habbo
- **Sistema de roles** (Admin, DJ, User)
- **Aprobación de usuarios** por administradores
- **Speed Points** - Sistema de puntos gamificado

### 🏆 **Sistema de Premios**
- **Votaciones anuales** para DJs y comunidad
- **Categorías personalizables**
- **Sistema anti-fraude** (un voto por categoría)
- **Resultados en tiempo real**

### ⚽ **Copa Habbospeed**
- **Tabla de posiciones** automática
- **Estadísticas de equipos** (PJ, PG, PE, PP, GF, GC, DG, PTS)
- **Tabla de goleadores**
- **Próximos partidos** con countdown

### 🎨 **Herramientas de Comunidad**
- **Generador de nombres** con IA (Google Gemini)
- **Diseñador de avatares** Habbo
- **Calculadora de trueques**
- **Ranking de DJs** con sistema de likes
- **Encuestas interactivas**

### 🛠️ **Panel de Administración**
- **Dashboard completo** con analíticas
- **Gestión de noticias** (CRUD completo)
- **Gestión de eventos** y horarios
- **Gestión de usuarios** y permisos
- **Configuración de radio** (URLs, webhooks)
- **Sistema de notificaciones** push
- **Gestión de alianzas** y salas destacadas

### 🔐 **Autenticación y Seguridad**
- **JWT Authentication** seguro
- **Bcrypt** para hash de contraseñas
- **Roles y permisos** granulares
- **Protección de rutas** en frontend y backend
- **Validación de datos** con Zod

---

## 🚀 Inicio Rápido

### Prerrequisitos

```bash
Node.js 20+
MongoDB 7.0+
npm o yarn
```

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/luisitoys12/hspeed-react.git
cd hspeed-react
```

2. **Instalar dependencias del frontend**
```bash
npm install
```

3. **Instalar dependencias del backend**
```bash
cd backend
npm install
```

4. **Configurar variables de entorno**

**Frontend (`.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_AI_API_KEY=tu-api-key-de-google-ai
```

**Backend (`backend/.env`):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hspeed
JWT_SECRET=tu-secreto-super-seguro-cambiar-en-produccion
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:9002
```

5. **Iniciar MongoDB**
```bash
sudo mongod --fork --logpath /var/log/mongodb.log --dbpath /data/db
```

6. **Cargar datos iniciales**
```bash
cd backend
npm run seed
```

7. **Iniciar servidores**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
npm run dev
```

8. **Acceder a la aplicación**
- Frontend: [http://localhost:9002](http://localhost:9002)
- Backend API: [http://localhost:5000/api](http://localhost:5000/api)

### 👤 Credenciales de Prueba

**Administrador:**
- Email: `admin@hspeed.com`
- Password: `admin123`

**DJ:**
- Email: `dj@hspeed.com`
- Password: `dj123456`

---

## 📁 Estructura del Proyecto

```
hspeed-react/
├── backend/                    # Backend API (Express + MongoDB)
│   ├── src/
│   │   ├── config/            # Configuración de BD
│   │   ├── controllers/       # Controladores
│   │   ├── middleware/        # Middleware (auth, etc)
│   │   ├── models/            # Modelos de Mongoose
│   │   ├── routes/            # Rutas de la API
│   │   ├── scripts/           # Scripts (seed, etc)
│   │   └── server.ts          # Punto de entrada
│   ├── .env                   # Variables de entorno
│   └── package.json
│
├── src/
│   ├── app/                   # App Router de Next.js
│   │   ├── (auth)/           # Rutas de autenticación
│   │   ├── api/              # API Routes
│   │   ├── panel/            # Panel de administración
│   │   ├── dj-panel/         # Panel de DJs
│   │   └── ...               # Páginas públicas
│   │
│   ├── components/
│   │   ├── habbospeed/       # Componentes específicos
│   │   ├── layout/           # Layout components
│   │   └── ui/               # Componentes UI (shadcn)
│   │
│   ├── hooks/                # Custom hooks
│   │   └── use-auth.tsx      # Hook de autenticación
│   │
│   ├── lib/
│   │   ├── api.ts            # Cliente API REST
│   │   ├── actions.ts        # Server Actions
│   │   ├── types.ts          # TypeScript types
│   │   └── utils.ts          # Utilidades
│   │
│   └── ai/                   # Flujos de IA (Genkit)
│
├── public/                   # Archivos estáticos
├── .env.local               # Variables de entorno frontend
├── next.config.mjs          # Configuración de Next.js
├── tailwind.config.ts       # Configuración de Tailwind
└── package.json
```

---

## 🎯 Características Únicas para Fansites Habbo

### 1. **Integración Completa con Habbo**
- Avatares en tiempo real desde Habbo Imaging API
- Links directos a salas de Habbo
- Información de usuarios de Habbo
- Badges y furnis del catálogo oficial

### 2. **Sistema de Radio Profesional**
- Compatible con Azuracast y ZenoFM
- Reproductor flotante que persiste entre páginas
- Controles de media del sistema operativo
- Visualización de artwork de canciones

### 3. **Gamificación**
- **Speed Points**: Sistema de puntos por participación
- **Ranking de DJs**: Likes y popularidad
- **Premios anuales**: Votaciones de la comunidad
- **Copa Habbospeed**: Competencia de fútbol

### 4. **Herramientas con IA**
- **Generador de nombres** con Google Gemini
- **Resumen de noticias** automático
- Sugerencias inteligentes de contenido

### 5. **Comunidad Activa**
- Sistema de comentarios en noticias
- Peticiones de canciones en tiempo real
- Encuestas interactivas
- Formulario de contacto

### 6. **Panel de Administración Completo**
- Dashboard con métricas
- Gestión de contenido (CRUD)
- Gestión de usuarios y permisos
- Configuración de radio
- Sistema de notificaciones

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 15.3** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utility-first
- **shadcn/ui** - Componentes UI
- **Radix UI** - Primitivos accesibles
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas
- **Genkit** - Framework de IA de Google

### Backend
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación
- **Bcrypt** - Hash de contraseñas
- **Helmet** - Seguridad HTTP
- **Morgan** - Logger HTTP
- **CORS** - Cross-Origin Resource Sharing

### DevOps
- **Docker** - Containerización
- **Gitpod** - Entorno de desarrollo en la nube
- **MongoDB Atlas** - Base de datos en la nube (producción)

---

## 📚 API Endpoints

Ver documentación completa en [backend/README.md](./backend/README.md)

---

## 🚀 Despliegue

Ver guía completa de despliegue en [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

---

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 👨‍💻 Autor

**Luis** - [@luisitoys12](https://github.com/luisitoys12)

---

## 🙏 Agradecimientos

- [Habbo](https://www.habbo.com/) por la inspiración
- [shadcn/ui](https://ui.shadcn.com/) por los componentes UI
- [Vercel](https://vercel.com/) por Next.js
- [MongoDB](https://www.mongodb.com/) por la base de datos
- Comunidad de Habbo España

---

<div align="center">

**Hecho con ❤️ para la comunidad de Habbo**

⭐ Si te gusta este proyecto, dale una estrella en GitHub!

</div>
