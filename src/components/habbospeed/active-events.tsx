import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarCheck2 } from 'lucide-react';
import { getNewsArticles } from '@/lib/data';
import Image from 'next/image';
import { Badge } from '../ui/badge';
import Link from 'next/link';

export default async function ActiveEvents() {
  const allArticles = await getNewsArticles();
  
  // Filtrar solo los artículos que son eventos
  const events = allArticles.filter(article => article.category.toUpperCase() === 'EVENTO').slice(0, 3);

  if (events.length === 0) {
    return null; // No mostrar nada si no hay eventos
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <CalendarCheck2 className="text-primary" />
          Eventos Activos
        </CardTitle>
        <CardDescription>
          ¡Participa en los últimos eventos de la comunidad y gana premios!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {events.map((event) => (
           <Link href={`/news/${event.id}`} key={event.id} className="group">
                <Card className="overflow-hidden h-full flex flex-col">
                    <div className="relative aspect-video">
                        <Image
                            src={event.imageUrl}
                            alt={event.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            data-ai-hint={event.imageHint}
                            unoptimized
                        />
                    </div>
                    <div className="p-4 flex-grow flex flex-col">
                        <h3 className="font-bold font-headline text-base leading-tight group-hover:text-primary transition-colors flex-grow">
                        {event.title}
                        </h3>
                         <p className="text-xs text-muted-foreground mt-2">
                            {new Date(event.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                </Card>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
