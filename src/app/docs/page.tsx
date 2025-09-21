import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, Database, GitBranch, Terminal, Wind, Settings, Cloud, Flame } from 'lucide-react';
import Link from 'next/link';

export default function DocsPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl md:text-4xl font-headline font-bold">
          <BookOpen className="h-8 w-8 text-primary" />
          Documentación para Desarrolladores
        </h1>
        <p className="text-muted-foreground mt-2">
            Una guía para configurar y trabajar en el proyecto Ekus FM.
        </p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><GitBranch /> Descripción General del Proyecto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Este proyecto es el sitio web para Ekus FM, una fansite de radio para la comunidad de Habbo.es. Está construido con Next.js y utiliza tecnologías modernas para ofrecer una experiencia rápida y atractiva.</p>
            <div>
              <h3 className="font-bold mb-2">Stack Tecnológico:</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>Framework:</strong> Next.js (con App Router)</li>
                <li><strong>UI:</strong> React, TypeScript, Tailwind CSS, ShadCN/UI</li>
                <li><strong>Inteligencia Artificial:</strong> Genkit con Google AI (Gemini)</li>
                <li><strong>Configuración y Datos:</strong> Firebase (Firestore)</li>
                <li><strong>Audio Stream:</strong> Azuracast</li>
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
                    <pre className="bg-muted p-2 rounded-md text-sm mt-1"><code>git clone &lt;URL_DEL_REPOSITORIO&gt;<br/>cd &lt;NOMBRE_DEL_DIRECTORIO&gt;</code></pre>
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
            <CardDescription>Para funcionalidades como la página de configuración, es necesario configurar Firebase.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-4">
                <li>
                    <p><strong>Ve a la <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Consola de Firebase</a> y crea un nuevo proyecto.</strong></p>
                </li>
                 <li>
                    <p><strong>Añade una aplicación web a tu proyecto:</strong></p>
                    <p className="text-muted-foreground text-sm mt-1">En el panel de tu proyecto, haz clic en el icono web (<code></></code>) para iniciar el proceso de configuración.</p>
                </li>
                <li>
                    <p><strong>Copia el objeto de configuración de Firebase:</strong></p>
                    <p>Firebase te proporcionará un objeto `firebaseConfig`. Cópialo. Se verá así:</p>
                    <pre className="bg-muted p-2 rounded-md text-sm mt-1"><code>
const firebaseConfig = &#123;
  apiKey: "AIza...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
&#125;;
                    </code></pre>
                </li>
                <li>
                    <p><strong>Crea el archivo de configuración en tu proyecto:</strong></p>
                    <p>Crea un nuevo archivo en <code>src/lib/firebase-config.js</code> y pega el objeto `firebaseConfig` dentro, exportándolo.</p>
                     <pre className="bg-muted p-2 rounded-md text-sm mt-1"><code>
// src/lib/firebase-config.js
export const firebaseConfig = &#123;
  // ... tu configuración aquí
&#125;;
                    </code></pre>
                </li>
                 <li>
                    <p><strong>Activa Firestore:</strong></p>
                    <p className="text-muted-foreground text-sm mt-1">En el menú de Firebase, ve a "Firestore Database", crea una base de datos y comienza en "modo de prueba" (te permitirá leer/escribir sin configurar reglas de seguridad por ahora).</p>
                </li>
            </ol>
            <div className="mt-4 text-center p-4 bg-muted rounded-lg border-2 border-dashed">
                <p className="text-sm text-muted-foreground">La aplicación intentará leer desde la colección 'config' en Firestore para las URLs de Azuracast. Necesitarás añadir estos documentos manualmente por ahora.</p>
           </div>
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
                    <p className="text-muted-foreground text-sm mt-1">Asegúrate de que tu código esté en un repositorio de GitHub (puede ser público o privado).</p>
                </li>
                <li>
                    <p><strong>Regístrate en <a href="https://www.netlify.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Netlify</a> usando tu cuenta de GitHub.</strong></p>
                </li>
                 <li>
                    <p><strong>Crea un nuevo sitio desde Git:</strong></p>
                    <p className="text-muted-foreground text-sm mt-1">En tu panel de Netlify, haz clic en "Add new site" {'>'} "Import an existing project". Conéctate a GitHub y selecciona el repositorio de tu proyecto.</p>
                </li>
                <li>
                    <p><strong>Configura los ajustes de construcción:</strong></p>
                    <p className="text-muted-foreground text-sm mt-1">Netlify detectará automáticamente que es un proyecto de Next.js y usará la configuración de <code>netlify.toml</code>. Los ajustes por defecto deberían funcionar.</p>
                </li>
                 <li>
                    <p><strong>Añade tus variables de entorno:</strong></p>
                    <p className="text-muted-foreground text-sm mt-1">Ve a "Site settings" {'>'} "Build & deploy" {'>'} "Environment" y añade la variable <code>GEMINI_API_KEY</code> con su valor correspondiente. Haz lo mismo para cualquier otra variable que necesites en producción.</p>
                </li>
                 <li>
                    <p><strong>¡Despliega!</strong></p>
                    <p className="text-muted-foreground text-sm mt-1">Haz clic en "Deploy site". Netlify construirá y desplegará tu aplicación. ¡Y listo!</p>
                </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings /> Otras Configuraciones</CardTitle>
          </Header>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-bold flex items-center gap-2 mb-2"><Wind /> Configuración de Azuracast</h3>
              <p className="text-muted-foreground">La configuración del reproductor de radio (URLs de la API y de escucha) ahora se gestiona desde la página de <Link href="/panel/config" className="text-primary underline">Configuración</Link>. Estos valores se leerán desde tu base de datos de Firebase.</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>El avatar por defecto para el AutoDJ es <strong>estacionkusfm</strong>. Cuando un DJ está en vivo, su nombre de Habbo se usará para obtener el avatar.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold flex items-center gap-2 mb-2"><Database /> Base de Datos (Datos de Ejemplo)</h3>
              <p className="text-muted-foreground">Actualmente, la aplicación usa datos de ejemplo (mock data) desde <code>src/lib/data.ts</code> para el horario, equipo y noticias. Para usar una base de datos real, puedes adaptar el patrón de Firebase o seguir las instrucciones para MongoDB en <code>MONGODB_SETUP.md</code>.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    