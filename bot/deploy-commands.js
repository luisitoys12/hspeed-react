
const { REST, Routes } = require('discord.js');

// --- Instrucciones ---
// 1. Crea un archivo `config.json` en este directorio (`/bot`).
// 2. Añade tu clientId y guildId de Discord en ese archivo.
//    {
//      "clientId": "TU_CLIENT_ID_DE_DISCORD",
//      "guildId": "TU_ID_DE_SERVIDOR"
//    }
// 3. Añade el token de tu bot en el panel de admin de tu web Habbospeed.
// 4. Ejecuta `node deploy-commands.js` en tu terminal para registrar los comandos.

const { clientId, guildId } = require('./config.json');
const { firebaseConfig } = require('../src/lib/firebase');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

const commands = [
	{
		name: 'ping',
		description: 'Responde con Pong!',
	},
    // --- Comandos Futuros ---
    // { name: 'ahora', description: 'Muestra qué canción está sonando.' },
    // { name: 'dj', description: 'Muestra el DJ actual y el siguiente.' },
    // { name: 'oyentes', description: 'Muestra cuántos están escuchando la radio.' },
];

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

async function getTokenFromFirebase() {
    const tokenRef = ref(db, 'config/discordBot/token');
    const snapshot = await get(tokenRef);
    if (!snapshot.exists()) {
        throw new Error("No se encontró el token del bot en Firebase. Asegúrate de guardarlo en el panel de configuración de la web.");
    }
    return snapshot.val();
}

(async () => {
    try {
        const token = await getTokenFromFirebase();
        const rest = new REST({ version: '10' }).setToken(token);

        console.log('Iniciando la actualización de comandos de aplicación (/).');
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );
        console.log('Comandos de aplicación (/) recargados exitosamente.');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();
