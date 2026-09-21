# 🚀 Manual de Migración a Servidor VPS (Producción)

> Guía técnica paso a paso para desplegar **HabboSpeed 2026** en un servidor VPS con Ubuntu/Debian, PM2, Nginx y SSL.

---

## 📋 1. Requisitos Mínimos del Servidor

* **Sistema Operativo:** Ubuntu 22.04 LTS o 24.04 LTS (o Debian 12)
* **CPU:** 1 vCPU (2 vCPUs recomendado)
* **Memoria RAM:** 2 GB mínimo (4 GB recomendado)
* **Espacio en Disco:** 25 GB SSD
* **Dominio Apuntado:** Registros DNS tipo `A` apuntando a la IP pública de tu servidor (ej. `tudominio.com` y `radio.tudominio.com`).

---

## 🛠️ 2. Instalación de Paquetes Base

Conéctate vía SSH a tu servidor y actualiza los paquetes:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential nginx ufw
```

### Instalar Node.js 20 LTS:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

Verifica las versiones:
```bash
node -v    # v20.x.x
npm -v     # v10.x.x
pm2 -v     # v5.x.x
```

---

## 📥 3. Clonación y Compilación del Código

Crea la carpeta de la aplicación en `/var/www/` y clona el repositorio:

```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/luisitoys12/hspeed-react.git
sudo chown -R $USER:$USER /var/www/hspeed-react
cd hspeed-react
```

### Instalar dependencias y compilar el frontend y backend:
```bash
npm install
npm run build
```

---

## ⚙️ 4. Configuración de PM2 para Ejecución 24/7

Crea el archivo de configuración de PM2 `ecosystem.config.cjs`:

```javascript
module.exports = {
  apps: [
    {
      name: "hspeed-web",
      script: "dist/index.cjs",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
        HOST: "127.0.0.1"
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "1G"
    },
    {
      name: "hspeed-radio",
      script: "script/azuracast-server.cjs",
      env: {
        NODE_ENV: "production",
        PORT: 8005
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "500M"
    }
  ]
};
```

Inicia los servicios y guarda el estado para que arranquen automáticamente si el servidor se reinicia:

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
# (Copia y pega el comando que te indique la terminal para habilitar el servicio systemd)
```

---

## 🌐 5. Configuración de Nginx como Reverse Proxy

Crea un archivo de configuración para tu dominio en `/etc/nginx/sites-available/habbospeed.conf`:

```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    client_max_body_size 50M;

    # Frontend y API Backend de HabboSpeed
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Stream de Radio (opcional si usas el servidor integrado en 8005)
    location /listen/ {
        proxy_pass http://127.0.0.1:8005;
        proxy_set_header Host $host;
        proxy_buffering off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

Habilita el sitio y prueba la sintaxis:
```bash
sudo ln -s /etc/nginx/sites-available/habbospeed.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 6. Certificado SSL Gratuito con Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```
Certbot configurará automáticamente la renovación periódica y la redirección a HTTPS.

---

## 🛡️ 7. Configuración de Firewall (UFW)

Asegúrate de permitir únicamente los puertos necesarios:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 🔄 8. Procedimiento de Actualización Futura

Cuando realices cambios en GitHub y desees aplicarlos en tu servidor VPS:

```bash
cd /var/www/hspeed-react
git pull origin main
npm install
npm run build
pm2 restart all
```
El sitio se actualizará con 0 segundos de tiempo de inactividad (Zero-Downtime).
