# Hspeed Backend API

Backend API REST para Hspeed React construido con Express.js, MongoDB y JWT.

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 20+
- MongoDB 7.0+

### Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar MongoDB (si no está corriendo)
sudo mongod --fork --logpath /var/log/mongodb.log --dbpath /data/db

# Cargar datos iniciales
npm run seed

# Iniciar servidor de desarrollo
npm run dev
```

### Scripts Disponibles

- `npm run dev` - Inicia el servidor en modo desarrollo con hot-reload
- `npm run build` - Compila TypeScript a JavaScript
- `npm start` - Inicia el servidor en producción
- `npm run seed` - Carga datos iniciales en la base de datos

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts       # Configuración de MongoDB
│   ├── controllers/
│   │   └── authController.ts # Controladores de autenticación
│   ├── middleware/
│   │   └── auth.ts           # Middleware de autenticación JWT
│   ├── models/               # Modelos de Mongoose
│   │   ├── User.ts
│   │   ├── News.ts
│   │   ├── Schedule.ts
│   │   ├── Event.ts
│   │   ├── Comment.ts
│   │   ├── Request.ts
│   │   ├── Config.ts
│   │   └── Poll.ts
│   ├── routes/               # Rutas de la API
│   │   ├── auth.ts
│   │   ├── news.ts
│   │   ├── schedule.ts
│   │   ├── events.ts
│   │   ├── requests.ts
│   │   ├── comments.ts
│   │   └── config.ts
│   ├── scripts/
│   │   └── seed.ts           # Script de seed
│   └── server.ts             # Punto de entrada
├── .env                      # Variables de entorno
├── .env.example              # Ejemplo de variables
├── package.json
├── tsconfig.json
└── nodemon.json
```

## 🔐 Autenticación

La API usa JWT (JSON Web Tokens) para autenticación.

### Registro
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "password123",
  "displayName": "Usuario"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

Respuesta:
```json
{
  "_id": "...",
  "email": "usuario@ejemplo.com",
  "displayName": "Usuario",
  "role": "pending",
  "approved": false,
  "speedPoints": 0,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Usar el Token

Incluye el token en el header `Authorization`:

```bash
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📡 Endpoints

### Health Check
```bash
GET /api/health
```

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuario actual (requiere auth)

### Noticias
- `GET /api/news` - Listar noticias
- `GET /api/news/:id` - Obtener noticia
- `POST /api/news` - Crear noticia (Admin)
- `PUT /api/news/:id` - Actualizar noticia (Admin)
- `DELETE /api/news/:id` - Eliminar noticia (Admin)

### Horarios
- `GET /api/schedule` - Listar horarios
- `POST /api/schedule` - Crear horario (Admin)
- `PUT /api/schedule/:id` - Actualizar horario (Admin)
- `DELETE /api/schedule/:id` - Eliminar horario (Admin)

### Eventos
- `GET /api/events` - Listar eventos
- `GET /api/events/:id` - Obtener evento
- `POST /api/events` - Crear evento (Admin)
- `PUT /api/events/:id` - Actualizar evento (Admin)
- `DELETE /api/events/:id` - Eliminar evento (Admin)

### Peticiones
- `GET /api/requests` - Listar peticiones (Auth)
- `POST /api/requests` - Crear petición
- `DELETE /api/requests/:id` - Eliminar petición (Auth)

### Comentarios
- `GET /api/comments/article/:articleId` - Comentarios de artículo
- `POST /api/comments` - Crear comentario (Auth)
- `DELETE /api/comments/:id` - Eliminar comentario (Auth)

### Configuración
- `GET /api/config` - Obtener configuración
- `PUT /api/config` - Actualizar configuración (Admin)

## 🔒 Roles y Permisos

### Roles
- `Admin` - Acceso total
- `DJ` - Acceso a panel de DJ
- `User` - Usuario normal
- `pending` - Usuario pendiente de aprobación

### Middleware
- `protect` - Requiere autenticación
- `admin` - Requiere rol Admin
- `approved` - Requiere cuenta aprobada

## 🗄️ Modelos de Datos

### User
```typescript
{
  email: string;
  password: string; // Hasheado con bcrypt
  displayName: string;
  role: 'Admin' | 'DJ' | 'User' | 'pending';
  approved: boolean;
  speedPoints: number;
  createdAt: Date;
}
```

### News
```typescript
{
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  imageHint: string;
  category: string;
  date: string;
  reactions: Map<string, number>;
  createdAt: Date;
}
```

### Schedule
```typescript
{
  day: string;
  startTime: string;
  endTime: string;
  show: string;
  dj: string;
}
```

### Event
```typescript
{
  title: string;
  server: string;
  date: string;
  time: string;
  roomName: string;
  roomOwner: string;
  host: string;
  imageUrl: string;
  imageHint: string;
  createdAt: Date;
}
```

## 🌍 Variables de Entorno

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hspeed
JWT_SECRET=tu-secreto-super-seguro
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:9002
```

## 🧪 Testing

```bash
# Probar health check
curl http://localhost:5000/api/health

# Probar registro
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","displayName":"Test User"}'

# Probar login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hspeed.com","password":"admin123"}'
```

## 📦 Dependencias Principales

- **express** - Framework web
- **mongoose** - ODM para MongoDB
- **jsonwebtoken** - Autenticación JWT
- **bcryptjs** - Hash de contraseñas
- **cors** - CORS middleware
- **helmet** - Seguridad HTTP headers
- **morgan** - Logger HTTP
- **dotenv** - Variables de entorno

## 🚀 Despliegue

### Heroku
```bash
heroku create hspeed-api
heroku addons:create mongolab
git push heroku main
```

### Railway
```bash
railway init
railway add mongodb
railway up
```

### Render
1. Conectar repositorio
2. Configurar build command: `npm install && npm run build`
3. Configurar start command: `npm start`
4. Agregar variables de entorno

## 📝 Notas

- Las contraseñas se hashean automáticamente con bcrypt antes de guardar
- Los tokens JWT expiran en 7 días por defecto
- CORS está configurado para aceptar requests del frontend
- Helmet agrega headers de seguridad HTTP
- Morgan registra todas las peticiones HTTP en consola
