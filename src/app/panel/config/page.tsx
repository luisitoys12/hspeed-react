import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings, Radio, Link as LinkIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function ConfigPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <Settings className="h-8 w-8 text-primary" />
          Configuración de la Estación
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestiona las URLs y otros ajustes importantes para Ekus FM.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <Radio />
            Configuración de Azuracast
          </CardTitle>
          <CardDescription>
            Introduce las URLs para la API de Azuracast y el stream de la radio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="api-url" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              URL de la API Now Playing
            </Label>
            <Input id="api-url" defaultValue="https://radio.kusmedios.lat/api/nowplaying/ekus-fm" />
            <p className="text-sm text-muted-foreground">
              Esta URL se usa para obtener la información de la canción actual, el DJ y los oyentes.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="listen-url" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              URL del Stream de Audio
            </Label>
            <Input id="listen-url" defaultValue="http://radio.kusmedios.lat/listen/ekus-fm/radio.mp3" />
             <p className="text-sm text-muted-foreground">
              Esta es la URL que los usuarios usarán para escuchar la radio en directo.
            </p>
          </div>
          <div className="flex justify-end">
            <Button>Guardar Cambios</Button>
          </div>
           <div className="mt-4 text-center p-4 bg-muted rounded-lg border-2 border-dashed">
                <p className="text-sm text-muted-foreground">Nota: La funcionalidad de guardado es un marcador de posición. Para una implementación completa, estos valores se guardarían y leerían desde Firebase (Firestore o Remote Config).</p>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
