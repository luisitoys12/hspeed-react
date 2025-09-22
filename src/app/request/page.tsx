import SongRequestForm from '@/components/habbospeed/song-request-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music } from 'lucide-react';

export default function RequestPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 flex justify-center items-start">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-xl md:text-2xl">
            <Music className="text-primary" />
            Haz tu Petición
          </CardTitle>
          <CardDescription>
            ¿Quieres escuchar tu canción, enviar un saludo o participar en un concurso? ¡Este es tu lugar!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SongRequestForm />
        </CardContent>
      </Card>
    </div>
  );
}
