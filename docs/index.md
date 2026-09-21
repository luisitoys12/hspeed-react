# 🏨 HabboSpeed Documentation Hub

<div align="center">

![HabboSpeed Banner](../client/public/hspeed-hero-banner.png)

### 🌟 Plataforma Integral Fansite & Radio 24/7 para Habbo Hotel
*Documentación técnica, guías de despliegue, arquitectura y manuales de migración.*

[![Release](https://img.shields.io/badge/Release-v3.5.0%20Turnkey-emerald?style=for-the-badge&logo=github)](https://github.com/luisitoys12/hspeed-react/releases/tag/v3.5.0)
[![Node](https://img.shields.io/badge/Node.js-18%2B%20%7C%2020%2B-green?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![Vite](https://img.shields.io/badge/Frontend-Vite%20%2B%20React%2018-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![AzuraCast](https://img.shields.io/badge/Radio-AzuraCast%20%2F%20Icecast-blueviolet?style=for-the-badge&logo=soundcharts)](https://azuracast.com)
[![License](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)](../LICENSE)

</div>

---

## 📚 Índice de Documentación

| Guía / Manual | Descripción | Audiencia |
| :--- | :--- | :--- |
| ⚡ **[Guía de Inicio Rápido](../GUIA_INSTALACION_Y_MIGRACION.md)** | Instalación en 1 clic para PC (`start-all.bat` / `start-all.sh`), cuentas por defecto y verificación de radio. | Desarrolladores / Usuarios |
| 📻 **[Sistema de Radio & Streaming](./radio-streaming.md)** | Configuración de AzuraCast, Icecast, software DJ (BUTT, Mixxx), APIs `nowplaying` y modal privado. | Locutores / DJs / Administradores |
| 🚀 **[Migración y Despliegue en VPS](./migration-vps.md)** | Despliegue en servidores Ubuntu/Debian con Nginx, SSL Let's Encrypt y PM2. | SysAdmins / DevOps |
| 🐳 **[Guía Docker & Docker Compose](./docker.md)** | Despliegue contenerizado multi-stage con Postgres y migraciones automáticas. | Desarrolladores / DevOps |
| 🏛️ **[Arquitectura del Sistema](./architecture.md)** | Visión técnica de Frontend (Vite/React), Backend (Express/TypeScript), ORM y base de datos. | Arquitectos / Desarrolladores |
| 🌐 **[Despliegue en cPanel](./CPANEL_DEPLOY.md)** | Configuración en servidores compartidos o cPanel con Node.js selector. | Webmasters |
| 🧪 **[Herramientas & Tests Automatizados](./TOOLING.md)** | Ejecución de suites E2E Playwright (`npm run verify:ui`), linters y optimización de bundles. | QA / Desarrolladores |

---

## 🗺️ Mapa de Arquitectura Visual

```mermaid
flowchart TD
    subgraph Client ["🖥️ Frontend (React 18 + Vite)"]
        UI["🎨 Interfaz HabboSpeed (Tailwind + shadcn)"]
        Widget["📻 HabboRadioWidget (Dynamic Audio Stream)"]
        Panels["🎛️ Paneles Staff (Admin / DJ Panel)"]
    end

    subgraph Backend ["⚙️ Backend (Express + TypeScript)"]
        Router["🔀 API Router (/api/*)"]
        AuthMiddleware["🛡️ Auth & Token Middleware"]
        Storage["💾 Storage Layer (PostgreSQL / MemStorage)"]
    end

    subgraph RadioServices ["🎧 Servicios de Radio"]
        AzuraServer["📡 AzuraCast Server (Puerto 8005)"]
        StreamOut["🎵 Stream MP3 (/listen/habboradio/radio.mp3)"]
        NowPlaying["📊 API NowPlaying (/api/nowplaying/1)"]
    end

    UI --> Router
    Panels --> Router
    Router --> Storage
    Router --> AuthMiddleware
    Widget -.-> StreamOut
    Widget -.-> NowPlaying
    AzuraServer --> StreamOut
    AzuraServer --> NowPlaying
```

---

## ⚡ Comandos Rápidos del Proyecto

```bash
# 1. Iniciar todo el stack (Radio en 8005 + Web en 5000)
npm run start:all

# 2. Iniciar solo el servidor web en modo desarrollo
npm run dev

# 3. Iniciar solo el servidor de radio AzuraCast
npm run radio

# 4. Correr la suite de verificación automatizada Playwright
npm run verify:ui

# 5. Compilar el proyecto para producción
npm run build
```

---

<div align="center">
  <sub>HabboSpeed Fansite & Radio 2026 · Desarrollado para la comunidad de Habbo Hotel.</sub>
</div>
