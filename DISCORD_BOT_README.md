
# Guía de Desarrollo: Bot de Discord para Habbospeed

Este documento sirve como plano y guía técnica para construir y desplegar el bot de Discord que se integra con la aplicación web de Habbospeed. El bot funcionará como una aplicación Node.js independiente, leyendo su configuración y estado directamente desde la Firebase Realtime Database gestionada a través del panel de administración de la web.

## Stack Tecnológico

- **Lenguaje:** JavaScript (Node.js)
- **Entorno:** Node.js v16.9.0 o superior
- **Librería de Discord:** [discord.js](https://discord.js.org/) (v14)
- **Librería de Firebase:** [firebase](https://www.npmjs.com/package/firebase) (v10 o superior)
- **Librería de Audio:** [@discordjs/voice](https://www.npmjs.com/package/@discordjs/voice) y `libsodium-wrappers`

## 1. Arquitectura y Flujo de Datos

El principio fundamental es la **separación de procesos**:

1.  **Aplicación Web (Next.js)**: Actúa como el **panel de control**. El administrador guarda la configuración del bot (token, IDs de canales, etc.) en Firebase.
2.  **Base de Datos (Firebase RTDB)**: Sirve como el **cerebro central y fuente de verdad**. Almacena la configuración y el estado en tiempo real (DJ actual, canción sonando).
3.  **Aplicación del Bot (Node.js)**: Es un **proceso de servidor persistente**. Se conecta a Discord y a Firebase. Lee la configuración de Firebase para saber cómo operar y lee el estado para informar a los usuarios.



## 2. Cómo Empezar (Desarrollo del Bot)

La estructura de archivos básicos para el bot ya ha sido creada en el directorio `/bot`.

### 2.1. Configuración Inicial

1.  **Navega al Directorio del Bot**:
    ```bash
    cd bot
    ```

2.  **Crea el Archivo `config.json`**:
    Dentro del directorio `/bot`, crea un archivo llamado `config.json` y añade el ID de cliente de tu bot y el ID de tu servidor de Discord. Necesitarás esto para registrar los comandos.
    ```json
    {
      "clientId": "EL_ID_DE_CLIENTE_DE_TU_BOT",
      "guildId": "EL_ID_DE_TU_SERVIDOR_DE_DISCORD"
    }
    ```

3.  **Instala las Dependencias**:
    ```bash
    npm install
    ```

4.  **Configura el Bot en la Web**:
    Ve a tu panel de administración en la web de Habbospeed (`/panel/config`), y rellena la sección "Integración con Discord" con:
    - El **token** de tu bot.
    - El **ID de tu servidor** (Guild ID).
    - El **ID del canal de anuncios**.
    - El **ID del canal de voz** para la música 24/7.

5.  **Registra los Comandos**:
    Ejecuta el siguiente comando para registrar los comandos de barra diagonal (como `/ping`) en tu servidor de Discord.
    ```bash
    node deploy-commands.js
    ```

6.  **Inicia el Bot**:
    Para iniciar el bot en modo de desarrollo (se reiniciará con cada cambio), usa:
    ```bash
    npm run dev
    ```
    Para iniciarlo en modo normal:
    ```bash
    npm start
    ```

## 3. Funcionalidades Detalladas

El archivo `index.js` ya contiene la lógica básica para conectarse a Firebase y Discord.

### 3.1. Música 24/7 en Canal de Voz

El bot ya está programado para:
1.  Leer el `voiceChannelId` y la `listenUrl` desde la configuración de Firebase.
2.  Usar la librería `@discordjs/voice` para unirse a ese canal de voz.
3.  Crear un `AudioPlayer` y un `AudioResource` para transmitir la radio en vivo.
4.  Intentar reconectarse si la transmisión se detiene.

### 3.2. Anuncios Automáticos (Webhooks)

La aplicación web ya se encarga de enviar notificaciones a través de webhooks para:
- Nuevas noticias.
- Nuevos eventos.
- Nuevas peticiones de usuarios.

Asegúrate de haber configurado la **URL del Webhook de Discord** en el panel de administración para que esta funcionalidad esté activa.

### 3.3. Comandos de Barra Diagonal (Slash Commands)

El bot está preparado para registrar y escuchar comandos. El archivo `deploy-commands.js` ya incluye un comando `/ping` de ejemplo. Puedes añadir más comandos fácilmente:

-   `/ahora`: Debería consultar la API de la radio y mostrar la información de la canción actual.
-   `/dj`: Debería leer desde `onAir` en Firebase para mostrar el DJ actual y el siguiente.

## 4. Despliegue y Alojamiento

**CRÍTICO:** **NUNCA** se debe ejecutar el bot en el mismo proceso que la aplicación web de Next.js. El bot debe ser alojado en un servicio que permita procesos de Node.js de larga duración.

-   **Opciones de Alojamiento**:
    -   Un VPS (DigitalOcean, Vultr, Linode).
    -   Plataformas como Heroku (con un Dyno de tipo "worker").
    -   Servicios de alojamiento de bots como [Discloud](https://discloud.app/).

-   **Variables de Entorno**: Para un entorno de producción, es crucial gestionar las credenciales de Firebase (el objeto `firebaseConfig`) a través de variables de entorno en tu servidor de alojamiento, en lugar de tenerlas directamente en el código.

---

Esta guía proporciona la estructura y la lógica necesarias para desplegar un bot de Discord robusto y totalmente integrado para Habbospeed.
