# Guía de Desarrollo: Bot de Discord para Habbospeed

Este documento sirve como plano y guía técnica para construir el bot de Discord que se integra con la aplicación web de Habbospeed. El bot funcionará como una aplicación Node.js independiente, leyendo su configuración y estado directamente desde la Firebase Realtime Database gestionada a través del panel de administración de la web.

## Stack Tecnológico Propuesto

- **Lenguaje:** JavaScript / TypeScript
- **Entorno:** Node.js
- **Librería de Discord:** [discord.js](https://discord.js.org/) (v14)
- **Librería de Firebase:** [firebase](https://www.npmjs.com/package/firebase) (para la base de datos en tiempo real)
- **Librería de Audio:** [@discordjs/voice](https://www.npmjs.com/package/@discordjs/voice) (para la música 24/7)

## 1. Arquitectura y Flujo de Datos

El principio fundamental es la **separación de procesos**:

1.  **Aplicación Web (Next.js)**: Actúa como el **panel de control**. El administrador guarda la configuración del bot (token, IDs de canales, etc.) en Firebase.
2.  **Base de Datos (Firebase RTDB)**: Sirve como el **cerebro central y fuente de verdad**. Almacena la configuración y el estado en tiempo real (DJ actual, canción sonando).
3.  **Aplicación del Bot (Node.js)**: Es un **proceso de servidor persistente**. Se conecta a Discord y a Firebase. Lee la configuración de Firebase para saber cómo operar y lee el estado para informar a los usuarios.



## 2. Funcionalidades Principales

### 2.1. Conexión y Configuración Dinámica

Al arrancar, el bot debe:
1.  Conectarse a Firebase Realtime Database.
2.  Leer la ruta `config/discordBot` para obtener su token, el ID del servidor (guild) y los IDs de los canales.
3.  Usar el `token` para iniciar sesión en Discord. Si no hay token en la base de datos, el bot debe esperar y reintentar, en lugar de fallar.

**Ejemplo de código (Node.js + Firebase v9):**

```javascript
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';
import { Client, GatewayIntentBits } from 'discord.js';

// Configuración de Firebase (debe coincidir con la de la app web)
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "hspeed-fan.firebaseapp.com",
  projectId: "hspeed-fan",
  databaseURL: "https://hspeed-fan-default-rtdb.firebaseio.com",
  // ... resto de la config
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

const configRef = ref(db, 'config/discordBot');

onValue(configRef, (snapshot) => {
    const config = snapshot.val();
    if (config && config.token && !client.isReady()) {
        console.log('Configuración del bot detectada. Iniciando sesión...');
        client.login(config.token).catch(err => {
            console.error("Error al iniciar sesión con el bot:", err.message);
        });
    } else if (!config || !config.token) {
        console.log("Esperando configuración del bot desde Firebase...");
    }
});

client.on('ready', () => {
    console.log(`¡Bot ${client.user.tag} está en línea!`);
    // Aquí se inician las demás funcionalidades
});
```

### 2.2. Música 24/7 en Canal de Voz

Una vez que el bot está en línea y la configuración existe:

1.  Debe buscar el `voiceChannelId` en la configuración de Firebase.
2.  Usar la librería `@discordjs/voice` para unirse a ese canal de voz.
3.  Leer la `listenUrl` de la ruta `config/`.
4.  Crear un `AudioPlayer` y un `AudioResource` para transmitir la radio en vivo de forma continua.
5.  Implementar lógica de reconexión automática en caso de que la conexión de voz falle.

**Ejemplo de código (usando @discordjs/voice):**

```javascript
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';

// ... dentro del listener de onValue o client.on('ready')
const config = snapshot.val();
const guild = client.guilds.cache.get(config.guildId);
if (!guild) return console.log("El bot no está en el servidor especificado.");

const connection = joinVoiceChannel({
    channelId: config.voiceChannelId,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
});

const player = createAudioPlayer();
const resource = createAudioResource(config.listenUrl); // La URL del stream de la radio

player.play(resource);
connection.subscribe(player);

player.on(AudioPlayerStatus.Idle, () => {
    // La transmisión se detuvo, intentar reconectar o volver a reproducir
    console.log('Stream inactivo, volviendo a reproducir...');
    const newResource = createAudioResource(config.listenUrl);
    player.play(newResource);
});
```

### 2.3. Anuncios de "Ahora Suena"

Esta es una de las funciones más importantes.

1.  El bot debe consultar periódicamente (ej. cada 15-30 segundos) la URL de la API de la radio (`config/apiUrl`).
2.  Debe mantener un registro de la última canción anunciada para no enviar mensajes duplicados.
3.  Cuando detecte un cambio de canción, debe:
    a. Buscar el `announcementChannelId` en la configuración.
    b. Obtener el canal de texto correspondiente.
    c. Construir y enviar un mensaje `Embed` atractivo que incluya:
        - Título de la canción y artista.
        - Imagen de la carátula (`song.art`).
        - DJ actual (leyendo desde `onAir/currentDj` en Firebase).
        - Número de oyentes.
        - Un pie de página que diga "Habbospeed - Tu radio, tu comunidad".

**Ejemplo de mensaje `Embed`:**



### 2.4. Comandos de Barra Diagonal (Slash Commands)

El bot debe registrar comandos de barra diagonal para permitir la interacción del usuario.

-   `/ahora`: Muestra la información de la canción que está sonando actualmente. (Responde de forma efímera).
-   `/dj`: Muestra quién es el DJ actual y quién es el siguiente, leyendo desde `onAir` en Firebase.
-   `/oyentes`: Muestra el número actual de oyentes.
-   `/pedir [tipo] [mensaje]`: (Funcionalidad avanzada) Podría permitir a los usuarios hacer peticiones directamente desde Discord, las cuales el bot escribiría en la ruta `userRequests` de Firebase para que aparezcan en el panel de DJ.

## 3. Despliegue y Alojamiento

-   **NUNCA** se debe ejecutar el bot en el mismo proceso que la aplicación web de Next.js.
-   El bot debe ser alojado en un servicio que permita procesos de larga duración, como:
    -   Un VPS (DigitalOcean, Vultr, Linode).
    -   Plataformas como Heroku (con un Dyno de tipo "worker").
    -   Servicios de alojamiento de bots como [Discloud](https://discloud.app/).
-   Las credenciales de Firebase y el token del bot deben gestionarse de forma segura, idealmente a través de variables de entorno en el servidor de alojamiento.

---

Esta guía proporciona la estructura y la lógica necesarias para construir un bot de Discord robusto y totalmente integrado para Habbospeed. El desarrollador que tome este proyecto tendrá una hoja de ruta clara para el éxito.