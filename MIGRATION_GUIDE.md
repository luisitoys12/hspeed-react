# Guía de Migración: Firebase → MongoDB + Express

## ✅ Cambios Implementados

### Backend (Nuevo)
Se ha creado un backend completo con:
- **Express.js** - Framework web
- **MongoDB** con Mongoose - Base de datos
- **JWT** - Autenticación
- **bcrypt** - Hash de contraseñas

**Ubicación:** `/backend`

### Modelos de Datos
Todos los modelos de Firebase han sido migrados a MongoDB:
- ✅ User (con autenticación)
- ✅ News
- ✅ Schedule
- ✅ Event
- ✅ Comment
- ✅ Request
- ✅ Config
- ✅ Poll

### API REST
Endpoints disponibles en `http://localhost:5000/api`:

#### Autenticación
- `POST /auth/register` - Registro de usuarios
- `POST /auth/login` - Inicio de sesión
- `GET /auth/me` - Obtener usuario actual

#### Noticias
- `GET /news` - Listar todas las noticias
- `GET /news/:id` - Obtener noticia por ID
- `POST /news` - Crear noticia (Admin)
- `PUT /news/:id` - Actualizar noticia (Admin)
- `DELETE /news/:id` - Eliminar noticia (Admin)

#### Horarios
- `GET /schedule` - Listar horarios
- `POST /schedule` - Crear horario (Admin)
- `PUT /schedule/:id` - Actualizar horario (Admin)
- `DELETE /schedule/:id` - Eliminar horario (Admin)

#### Eventos
- `GET /events` - Listar eventos
- `GET /events/:id` - Obtener evento por ID
- `POST /events` - Crear evento (Admin)
- `PUT /events/:id` - Actualizar evento (Admin)
- `DELETE /events/:id` - Eliminar evento (Admin)

#### Peticiones
- `GET /requests` - Listar peticiones (Autenticado)
- `POST /requests` - Crear petición
- `DELETE /requests/:id` - Eliminar petición (Autenticado)

#### Comentarios
- `GET /comments/article/:articleId` - Obtener comentarios de un artículo
- `POST /comments` - Crear comentario (Autenticado)
- `DELETE /comments/:id` - Eliminar comentario (Autenticado)

#### Configuración
- `GET /config` - Obtener configuración
- `PUT /config` - Actualizar configuración (Admin)

### Frontend
Se han actualizado:
- ✅ Sistema de autenticación (`src/hooks/use-auth.tsx`)
- ✅ Cliente API (`src/lib/api.ts`)
- ✅ Páginas de login y registro
- ✅ Variables de entorno (`.env.local`)

## 🚀 Cómo Usar

### 1. Iniciar MongoDB
```bash
sudo mongod --fork --logpath /var/log/mongodb.log --dbpath /data/db
```

### 2. Configurar Backend
```bash
cd backend
cp .env.example .env
# Editar .env con tus configuraciones
npm install
npm run seed  # Cargar datos iniciales
npm run dev   # Iniciar servidor
```

### 3. Configurar Frontend
```bash
# En la raíz del proyecto
cp .env.local.example .env.local  # Si existe
# O crear .env.local con:
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev
```

### 4. Acceder a la Aplicación
- Frontend: [https://9002--019ab4a0-e101-76da-8fc3-828dff257fb4.us-east-1-01.gitpod.dev](https://9002--019ab4a0-e101-76da-8fc3-828dff257fb4.us-east-1-01.gitpod.dev)
- Backend API: `http://localhost:5000/api`
- Health Check: `http://localhost:5000/api/health`

## 👤 Credenciales de Prueba

Después de ejecutar `npm run seed`:

**Administrador:**
- Email: `admin@hspeed.com`
- Password: `admin123`

**DJ:**
- Email: `dj@hspeed.com`
- Password: `dj123456`

## 📋 Tareas Pendientes

### Componentes que Necesitan Actualización
Los siguientes componentes aún usan Firebase y deben ser actualizados para usar la nueva API:

1. **Noticias**
   - `src/app/news/page.tsx`
   - `src/app/news/[id]/page.tsx`
   - Componentes relacionados en `src/components/habbospeed/`

2. **Horarios**
   - `src/app/schedule/page.tsx`
   - `src/components/habbospeed/schedule-display.tsx`

3. **Eventos**
   - Componentes de eventos
   - `src/components/habbospeed/events-*.tsx`

4. **Panel de DJ**
   - `src/app/dj-panel/`
   - `src/components/dj-panel/`

5. **Panel de Admin**
   - `src/app/panel/`
   - Todos los componentes de administración

6. **Comentarios y Reacciones**
   - `src/components/habbospeed/comments-section.tsx`
   - Sistema de reacciones en noticias

7. **Peticiones de Usuario**
   - `src/app/request/page.tsx`
   - `src/components/dj-panel/song-requests.tsx`

8. **Configuración**
   - `src/components/habbospeed/hero-slideshow.tsx`
   - Componentes que usan config

### Funcionalidades Adicionales a Implementar

1. **Reacciones en Noticias**
   - Crear modelo `UserReaction` en MongoDB
   - Endpoints para agregar/quitar reacciones
   - Actualizar componentes del frontend

2. **Sistema de Votaciones (Polls)**
   - Endpoints para polls
   - Modelo `PollVote` para tracking de votos
   - Componentes de votación

3. **Copa Habbospeed**
   - Modelos para equipos, partidos, goleadores
   - Endpoints CRUD
   - Componentes de visualización

4. **Sistema de Premios (Awards)**
   - Modelos para categorías, nominaciones, votos
   - Endpoints de votación
   - Componentes de awards

5. **Notificaciones Push**
   - Implementar sistema de notificaciones sin Firebase
   - Considerar alternativas: OneSignal, Pusher, o WebSockets

6. **Likes a DJs**
   - Modelo para tracking de likes
   - Cooldown system
   - Endpoints y componentes

7. **Gestión de Usuarios (Admin)**
   - Endpoint para listar usuarios
   - Aprobar/rechazar usuarios
   - Cambiar roles
   - Panel de administración

## 🗑️ Archivos Firebase a Eliminar (Opcional)

Una vez que toda la funcionalidad esté migrada:

```bash
# Archivos de configuración Firebase
rm src/lib/firebase.ts
rm src/lib/firebase-admin.ts

# Actualizar package.json para remover:
# - firebase
# - firebase-admin (si existe)

npm uninstall firebase
```

## 🔧 Configuración de Producción

### MongoDB Atlas (Recomendado)
1. Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear cluster gratuito
3. Obtener connection string
4. Actualizar `MONGODB_URI` en `.env`

### Variables de Entorno Producción

**Backend (.env):**
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hspeed
JWT_SECRET=tu-secreto-super-seguro-cambiar-en-produccion
JWT_EXPIRE=7d
NODE_ENV=production
FRONTEND_URL=https://tu-dominio.com
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com/api
```

## 📚 Recursos

- [Express.js Docs](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## 🆘 Soporte

Si encuentras problemas:
1. Verifica que MongoDB esté corriendo
2. Revisa los logs del backend: `tail -f /tmp/backend.log`
3. Verifica las variables de entorno
4. Asegúrate de que los puertos 5000 y 9002 estén disponibles
