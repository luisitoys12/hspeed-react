
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, Database, GitBranch, Terminal, Wind, Settings, Cloud, Flame, DatabaseZap, Bot, Sprout } from 'lucide-react';
import Link from 'next/link';

export default function DocsPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <BookOpen className="h-8 w-8 text-primary" />
          Documentación para Desarrolladores
        </h1>
        <p className="text-muted-foreground mt-2">
            Una guía para configurar y trabajar en el proyecto Habbospeed.
        </p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><GitBranch /> Descripción General del Proyecto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Este proyecto es el sitio web para Habbospeed, una fansite de radio para la comunidad de Habbo.es. Está construido con Next.js y utiliza tecnologías modernas para ofrecer una experiencia rápida y atractiva.</p>
            <div>
              <h3 className="font-bold mb-2">Stack Tecnológico:</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>Framework:</strong> Next.js (con App Router)</li>
                <li><strong>UI:</strong> React, TypeScript, Tailwind CSS, ShadCN/UI</li>
                <li><strong>Inteligencia Artificial:</strong> Genkit con Google AI (Gemini)</li>
                <li><strong>Base de Datos y Auth:</strong> Firebase (Authentication, Realtime Database)</li>
                <li><strong>Audio Stream:</strong> Azuracast / ZenoFM</li>
                <li><strong>APIs Externas:</strong> Puhekupla, HabboAssets</li>
                <li><strong>Alojamiento:</strong> Netlify</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Terminal /> Cómo Empezar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-4">
                <li>
                    <p><strong>Clonar el repositorio y moverse al directorio:</strong></p>
                    <pre className="bg-muted p-2 rounded-md text-sm mt-1 overflow-x-auto"><code>git clone &lt;URL_DEL_REPOSITORIO&gt;<br/>cd &lt;NOMBRE_DEL_DIRECTORIO&gt;</code></pre>
                </li>
                <li>
                    <p><strong>Instalar dependencias:</strong></p>
                    <pre className="bg-muted p-2 rounded-md text-sm mt-1"><code>npm install</code></pre>
                </li>
                 <li>
                    <p><strong>Configurar variables de entorno:</strong></p>
                    <p>Crea un archivo llamado <code>.env</code> en la raíz del proyecto y añade tu clave de API de Google AI:</p>
                    <pre className="bg-muted p-2 rounded-md text-sm mt-1"><code>GEMINI_API_KEY="TU_API_KEY_AQUÍ"</code></pre>
                    <p className="text-muted-foreground text-sm mt-1">Puedes obtener una clave de API desde Google AI Studio.</p>
                </li>
                <li>
                    <p><strong>Ejecutar el servidor de desarrollo:</strong></p>
                    <pre className="bg-muted p-2 rounded-md text-sm mt-1"><code>npm run dev</code></pre>
                    <p className="text-muted-foreground text-sm mt-1">La aplicación estará disponible en <a href="http://localhost:9002" className="text-primary underline">http://localhost:9002</a>.</p>
                </li>
            </ol>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Flame /> Configuración de Firebase</CardTitle>
            <CardDescription>Para funcionalidades como la autenticación y la base de datos, es necesario configurar Firebase.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-4">
                <li>
                    <p><strong>Ve a la <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Consola de Firebase</a> y crea un nuevo proyecto.</strong></p>
                </li>
                 <li>
                    <p><strong>Añade una aplicación web a tu proyecto:</strong></p>
                    <p className="text-muted-foreground text-sm mt-1">En el panel de tu proyecto, haz clic en el icono web (<code>&lt;/&gt;</code>) para iniciar el proceso de configuración.</p>
                </li>
                <li>
                    <p><strong>Copia el objeto de configuración de Firebase:</strong></p>
                    <p>Firebase te proporcionará un objeto `firebaseConfig`. Cópialo y pégalo en el archivo `src/lib/firebase.ts`. Asegúrate de añadir la URL de tu Realtime Database.</p>
                    <pre className="bg-muted p-2 rounded-md text-sm mt-1 overflow-x-auto"><code>
{`// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database"; // Importar

const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "...",
  projectId: "...",
  // Añade la URL de tu Realtime Database aquí
  databaseURL: "https://<TU-PROYECTO>-default-rtdb.firebaseio.com", 
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getDatabase(app); // Exportar instancia de DB

export { app, auth, db };`}
                    </code></pre>
                </li>
                 <li>
                    <p><strong>Activa Authentication y Realtime Database:</strong></p>
                    <p className="text-muted-foreground text-sm mt-1">En tu consola de Firebase, ve a las secciones "Authentication" y "Realtime Database" y actívalas. Comienza ambas en "modo de prueba" para permitir el acceso durante el desarrollo.</p>
                </li>
            </ol>
            <div className="mt-4 text-center p-4 bg-muted rounded-lg border-2 border-dashed">
                <p className="text-sm text-muted-foreground">La aplicación intentará leer/escribir en la ruta 'config' en Realtime Database. Los datos se crearán automáticamente si no existen.</p>
           </div>
          </CardContent>
        </Card>

         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bot /> Integración con Bot de Discord</CardTitle>
                <CardDescription>
                Cómo conectar un bot de Discord externo con la configuración de tu web.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p>La aplicación está preparada para integrarse con un bot de Discord. Puedes gestionar las credenciales y IDs del bot desde la página de <Link href="/panel/config" className="text-primary underline">Ajustes Generales</Link>. Tu bot (que debe ser una aplicación Node.js separada) puede leer esta configuración directamente desde Firebase.</p>
                <p className='text-sm text-muted-foreground'>A continuación, un ejemplo de cómo un bot de Discord podría leer la configuración:</p>
                <pre className="bg-muted p-2 rounded-md text-sm mt-1 overflow-x-auto"><code>
{`// Ejemplo para un bot en Node.js con 'firebase' y 'discord.js'
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, onValue } = require('firebase/database');
const { Client, GatewayIntentBits } = require('discord.js');

// 1. Configuración de Firebase (debe coincidir con la de tu app web)
const firebaseConfig = { /* ... tu config ... */ };
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 2. Cliente de Discord
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

// 3. Leer la configuración desde Firebase
const configRef = ref(db, 'config/discordBot');
onValue(configRef, (snapshot) => {
    const config = snapshot.val();
    if (config && config.token) {
        console.log('Configuración del bot cargada. Iniciando sesión...');
        
        // Inicia sesión con el token guardado en la web
        client.login(config.token).catch(err => {
            console.error("Error al iniciar sesión con el bot:", err);
        });

        client.on('ready', () => {
            console.log(\`¡Bot \${client.user.tag} está en línea!\`);
            // Aquí iría la lógica para unirse al canal de voz,
            // anunciar la canción, etc., usando los otros IDs de la config.
        });
    } else {
        console.log("No se encontró la configuración del bot en Firebase. El bot no se iniciará.");
    }
});`}
                        </code></pre>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><DatabaseZap /> Usando Firebase Realtime Database</CardTitle>
                <CardDescription>
                Una base de datos NoSQL alojada en la nube para almacenar y sincronizar datos en tiempo real.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p>La aplicación está configurada para usar Realtime Database para la configuración, el equipo y los horarios. El siguiente es un ejemplo funcional de cómo interactuar con ella.</p>
                <pre className="bg-muted p-2 rounded-md text-sm mt-1 overflow-x-auto"><code>
{`'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase'; // Asegúrate que exportas 'db'
import { ref, onValue, set } from 'firebase/database';

function RealtimeComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Escuchar cambios en la ruta 'test/data'
    const dataRef = ref(db, 'test/data');
    const unsubscribe = onValue(dataRef, (snapshot) => {
      const value = snapshot.val();
      setData(value);
    });

    // Limpiar el listener cuando el componente se desmonte
    return () => unsubscribe();
  }, []);

  const writeData = () => {
    // Escribir datos en la ruta 'test/data'
    const dataRef = ref(db, 'test/data');
    set(dataRef, { message: \`Hola mundo en \${new Date().toLocaleTimeString()}\` });
  };

  return (
    <div>
      <p>Dato en tiempo real: {JSON.stringify(data)}</p>
      <button onClick={writeData}>Escribir en DB</button>
    </div>
  );
}`}
                        </code></pre>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Cloud /> Despliegue en Netlify</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Este proyecto está pre-configurado para un despliegue sencillo en Netlify. El archivo <code>netlify.toml</code> en la raíz del proyecto le dice a Netlify cómo construir y servir tu sitio.</p>
            <ol className="list-decimal list-inside space-y-4">
                <li>
                    <p><strong>Sube tu proyecto a un repositorio de GitHub.</strong></p>
                </li>
                <li>
                    <p><strong>Regístrate en <a href="https://www.netlify.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Netlify</a> usando tu cuenta de GitHub.</strong></p>
                </li>
                 <li>
                    <p><strong>Crea un nuevo sitio desde Git y selecciona tu repositorio.</strong></p>
                </li>
                <li>
                    <p><strong>Añade tus variables de entorno:</strong></p>
                    <p className="text-muted-foreground text-sm mt-1">Ve a "Site settings" {'>'} "Build & deploy" {'>'} "Environment" y añade la variable <code>GEMINI_API_KEY</code>. Haz lo mismo para las variables de entorno de tu configuración de Firebase si las usas (recomendado para producción).</p>
                </li>
                 <li>
                    <p><strong>¡Despliega!</strong> Netlify construirá y desplegará tu aplicación.</p>
                </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings /> Otras Configuraciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-bold flex items-center gap-2 mb-2"><Sprout /> Speed Origins</h3>
              <p className="text-muted-foreground">La página <Link href="/origins" className="text-primary underline">Origins</Link> muestra datos de las campañas y placas de Habbo Origins. Utiliza los componentes `LatestCampaigns` y `LatestBadges` con el `hotel` prop establecido a `"origin"`. Los proxies de API (`/api/campaigns` y `/api/badges`) aceptan un parámetro de hotel para buscar en el hotel correcto.</p>
            </div>
            <div>
              <h3 className="font-bold flex items-center gap-2 mb-2"><Wind /> Configuración del Servicio de Radio</h3>
              <p className="text-muted-foreground">La configuración del reproductor de radio (servicio, URLs de la API y de escucha) ahora se gestiona desde la página de <Link href="/panel/config" className="text-primary underline">Configuración</Link> y se guarda en Firebase Realtime Database.</p>
            </div>
            <div>
              <h3 className="font-bold flex items-center gap-2 mb-2"><Database /> Base de Datos (Datos de Ejemplo)</h3>
              <p className="text-muted-foreground">La aplicación está migrando de datos de ejemplo a Firebase Realtime Database. Secciones como el horario y las noticias aún pueden usar datos locales temporalmente.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
