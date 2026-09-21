# 📖 HabboSpeed 2026 - Guía Completa de Instalación, Uso y Migración

Bienvenido a la documentación oficial de despliegue y migración de **HabboSpeed 2026**. Esta guía contiene todo lo necesario para levantar el proyecto en cualquier computadora personal o migrarlo a un servidor VPS en producción.

---

## ⚡ 1. Inicio Rápido en PC Local (Windows, Mac o Linux)

### Requisitos Previos
* **Node.js**: Versión 18 o superior ([Descargar Node.js](https://nodejs.org/))
* **npm**: Incluido con Node.js

### Paso a Paso
1. **Clonar o descargar el repositorio:**
   ```bash
   git clone https://github.com/luisitoys12/hspeed-react.git
   cd hspeed-react
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar todo con un solo comando o archivo:**
   * **En Windows**: Doble clic en `start-all.bat` (o ejecuta `npm run start:all` en la terminal).
   * **En Linux / Mac**: `./start-all.sh` (o ejecuta `npm run start:all`).

4. **Abrir en el navegador:**
   * Web HabboSpeed: [http://localhost:5000](http://localhost:5000)
   * Servidor de Radio AzuraCast: [http://localhost:8005](http://localhost:8005)

---

## 🔐 2. Credenciales y Cuentas por Defecto

El sistema incluye usuarios preconfigurados con rangos y permisos:

| Rol | Usuario Habbo | Email | Contraseña | Acceso |
| :--- | :--- | :--- | :--- | :--- |
| **Fundador / Admin** | `habbospeed` | `admin@habbospeed.com` | `admin123` | Todo el sitio, `/panel` y `/djpanel` |
| **DJ Oficial** | `ser03z-51` | `ser03z@habbospeed.com` | `dj123` | Radio, `/djpanel` y pedidos |
| **Moderador Staff** | `MOD-sweet` | `mod@habbospeed.com` | `admin123` | Foros, reportes y `/panel` |

> 💡 **Nota:** Si estás en modo desarrollo/storage local, el sistema auto-autentica la sesión de `habbospeed` para que puedas configurar inmediatamente los paneles sin bloqueos.

---

## 📻 3. Arquitectura del Sistema de Radio

El proyecto cuenta con un entorno de radio totalmente funcional y desacoplado:

1. **Servidor AzuraCast Local (`script/azuracast-server.cjs`):**
   * Corre en el puerto `8005`.
   * Entrega la API estándar de AzuraCast: `GET http://localhost:8005/api/nowplaying/1`.
   * Entrega el stream de audio continuo en formato MP3: `GET http://localhost:8005/listen/habboradio/radio.mp3`.
2. **Reproductor en Portada (`HabboRadioWidget.tsx`):**
   * Resuelve dinámicamente el stream activo (túnel remoto, URL configurada o fallback local).
   * No requiere CORS para audio directo (`crossOrigin` optimizado para evitar caídas).
   * Incluye control de volumen, estado al aire de DJ (`habbospeed`), contador de oyentes y botón para solicitar canciones.
3. **Panel de DJ (`/djpanel`):**
   * Permite actualizar en tiempo real el DJ al aire, próximo DJ, programa y mensaje.
   * Incluye la tarjeta privada con los datos de conexión para transmitir en vivo con software como BUTT, Mixxx o SAM Broadcaster (Host, Puerto, Mount `/live`, Contraseña).

---

## 🌐 4. Acceso Remoto con Túneles Cloudflare (Opcional)

Si necesitas compartir la web o la radio con amigos o DJs remotos sin abrir puertos en tu router:

1. Descarga **cloudflared** ([Guía oficial de Cloudflare](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)).
2. Abre dos terminales:
   * **Terminal 1 (Web):**
     ```bash
     cloudflared tunnel --url http://127.0.0.1:5000
     ```
   * **Terminal 2 (Radio):**
     ```bash
     cloudflared tunnel --url http://127.0.0.1:8005
     ```
3. Copia las URLs generadas (`.trycloudflare.com`) y colócalas en el Panel de Administración (`/panel`) o en `/api/config`.

---

## 🧪 5. Verificación Automatizada (Tests UI y Radio)

Para comprobar que todo el frontend, reproductor y rutas funcionan en tu equipo sin pantallas negras ni errores:

```bash
npm run verify:ui
```
Este comando ejecutará un navegador automatizado (Playwright) que:
* Valida la carga inmediata de la portada (sin esqueletos negros).
* Hace clic en el botón de reproducción de la radio y valida audio activo (`readyState: 4`).
* Comprueba las rutas `/radio`, `/djpanel`, `/admin`, `/news`, `/team` y `/feria`.
* Guarda capturas de pantalla automáticas en la carpeta `screenshots/`.

---

## 🚀 6. Guía de Migración a Servidor VPS (Producción)

Cuando decidas subir este proyecto a un VPS (DigitalOcean, Hetzner, AWS, Linode, etc.):

### A. Preparación del Servidor (Ubuntu 22.04 / 24.04 LTS)
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### B. Despliegue de la Aplicación
```bash
cd /var/www
sudo git clone https://github.com/luisitoys12/hspeed-react.git
cd hspeed-react
sudo npm install
npm run build
```

### C. Configuración con PM2
Inicia el servidor web y el servidor de radio (o tu AzuraCast real en Docker):
```bash
# Iniciar servidor web en puerto 5000
pm2 start "npm start" --name "hspeed-web"

# Iniciar servidor de radio en puerto 8005
pm2 start "node script/azuracast-server.cjs" --name "hspeed-radio"

pm2 save
pm2 startup
```

### D. Proxy Inverso con Nginx y Certificado SSL (HTTPS)
Crea `/etc/nginx/sites-available/habbospeed.conf`:
```nginx
server {
    server_name tu-dominio.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /listen/ {
        proxy_pass http://127.0.0.1:8005;
        proxy_set_header Host $host;
    }
}
```
Habilita el sitio y genera tu certificado gratis:
```bash
sudo ln -s /etc/nginx/sites-available/habbospeed.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

---

## 📞 Soporte
Si tienes dudas sobre el código, componentes o personalización, consulta el historial de commits o los archivos en `server/mem-storage.ts` y `client/src/App.tsx`.
