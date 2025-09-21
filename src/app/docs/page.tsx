import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, Database, GitBranch, Terminal, Wind, Settings, Cloud } from 'lucide-react';

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
                <li><strong>Audio Stream:</strong> Azuracast</li>
                <li><strong>Alojamiento:</strong> Netlify</li>
                <li><strong>Base de Datos (Opcional):</strong> MongoDB (ver `MONGODB_SETUP.md`)</li>
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
            <CardTitle className="flex items-center gap-2"><Settings /> Configuración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-bold flex items-center gap-2 mb-2"><Wind /> Configuración de Azuracast</h3>
              <p className="text-muted-foreground">La configuración del reproductor de radio se encuentra en <code>src/components/habbospeed/player.tsx</code>.</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>La URL para obtener los metadatos (canción actual, oyentes, etc.) es: <code className="bg-muted px-1 rounded">https://radio.kusmedios.lat/api/nowplaying/ekus-fm</code>.</li>
                  <li>El avatar por defecto para el AutoDJ es <strong>estacionkusfm</strong>. Cuando un DJ está en vivo, su nombre de Habbo se usará para obtener el avatar.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold flex items-center gap-2 mb-2"><Database /> Base de Datos</h3>
              <p className="text-muted-foreground">Actualmente, la aplicación usa datos de ejemplo (mock data) desde <code>src/lib/data.ts</code>. Para usar una base de datos real como MongoDB, sigue las instrucciones en el archivo <code>MONGODB_SETUP.md</code>.</p>
            </div>
            <div>
              <h3 className="font-bold flex items-center gap-2 mb-2"><Cloud /> Despliegue en Netlify</h3>
              <p className="text-muted-foreground">El proyecto está configurado para desplegarse en Netlify. Simplemente conecta tu repositorio a un nuevo sitio en Netlify. La configuración se encuentra en <code>netlify.toml</code> y los ajustes de construcción usarán `npm run build` automáticamente.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
