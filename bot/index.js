
const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, onValue } = require('firebase/database');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');

// --- Carga la configuración de Firebase desde el proyecto principal ---
// ¡IMPORTANTE! Asegúrate de que las credenciales en `../src/lib/firebase.ts` sean correctas.
// Para producción, es mejor usar variables de entorno para estas credenciales.
const { firebaseConfig } = require('../src/lib/firebase');

// --- Inicialización de Firebase y Discord ---
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ] 
});

let botConfig = {};
let voiceConnection = null;
const audioPlayer = createAudioPlayer();

// --- Lógica Principal del Bot ---

// 1. Escuchar cambios en la configuración de Firebase
const configRef = ref(db, 'config');
onValue(configRef, (snapshot) => {
    const newConfig = snapshot.val();
    if (!newConfig) {
        console.log("Esperando configuración desde Firebase...");
        return;
    }

    const hasChanged = JSON.stringify(botConfig) !== JSON.stringify(newConfig);
    botConfig = newConfig;

    console.log('Configuración de Firebase cargada/actualizada.');

    // Iniciar sesión solo si no está listo y hay un token
    if (botConfig.discordBot?.token && !client.isReady()) {
        console.log('Token detectado. Iniciando sesión en Discord...');
        client.login(botConfig.discordBot.token).catch(err => {
            console.error("Error al iniciar sesión:", err.message);
        });
    }

    // (Re)conectar al canal de voz si la configuración ha cambiado y el bot está listo
    if (client.isReady() && hasChanged) {
        console.log("La configuración cambió, re-evaluando la conexión de voz.");
        setupVoiceConnection();
    }
});


// 2. Cuando el bot esté listo
client.once(Events.ClientReady, readyClient => {
	console.log(`¡Listo! Conectado como ${readyClient.user.tag}`);
    // Configurar la conexión de voz inicial
    setupVoiceConnection();
});


// 3. Función para unirse al canal de voz y reproducir
function setupVoiceConnection() {
    if (!botConfig.discordBot?.guildId || !botConfig.discordBot?.voiceChannelId || !botConfig.listenUrl) {
        console.warn("Configuración de voz incompleta en Firebase. No se puede unir al canal.");
        // Si ya hay una conexión, la destruimos.
        if (voiceConnection) {
            voiceConnection.destroy();
            voiceConnection = null;
        }
        return;
    }

    const guild = client.guilds.cache.get(botConfig.discordBot.guildId);
    if (!guild) {
        console.error(`El bot no está en el servidor con ID: ${botConfig.discordBot.guildId}`);
        return;
    }

    try {
        console.log(`Intentando unirse al canal de voz: ${botConfig.discordBot.voiceChannelId}`);
        const connection = joinVoiceChannel({
            channelId: botConfig.discordBot.voiceChannelId,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
        });

        voiceConnection = connection;

        // Suscribir el reproductor a la conexión
        connection.subscribe(audioPlayer);
        
        // Crear el recurso de audio y reproducirlo
        playStream();

        console.log(`Conectado al canal de voz y reproduciendo desde ${botConfig.listenUrl}`);
    } catch(error) {
        console.error("Error al unirse al canal de voz:", error);
    }
}

function playStream() {
    if (!botConfig.listenUrl) {
        console.log("No hay URL de stream para reproducir.");
        return;
    }
    try {
        const resource = createAudioResource(botConfig.listenUrl);
        audioPlayer.play(resource);
    } catch (error) {
        console.error("Error al crear el recurso de audio:", error);
    }
}

// 4. Manejo de errores y reconexión del reproductor
audioPlayer.on(AudioPlayerStatus.Idle, () => {
    console.log('El stream de audio quedó inactivo. Intentando reconectar en 5 segundos...');
    setTimeout(() => {
        playStream();
    }, 5000);
});

audioPlayer.on('error', error => {
	console.error('Error en el AudioPlayer:', error.message);
    // Intentar reconectar después de un breve retraso
    setTimeout(() => {
        playStream();
    }, 5000);
});


// 5. Manejo de Comandos (Ejemplo simple)
client.commands = new Collection();
// En un bot real, cargarías dinámicamente los archivos de comandos aquí.
// Por ahora, un comando simple para demostrar.
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	
    if (interaction.commandName === 'ping') {
		await interaction.reply('¡Pong!');
	}
});

console.log("Bot iniciado. Esperando configuración de Firebase para iniciar sesión.");
