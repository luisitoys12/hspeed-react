import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarCheck2, Info } from 'lucide-react';
import { getNewsArticles } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../ui/button';

export default async function ActiveEvents() {
  const allArticles = await getNewsArticles();
  
  // Filtrar y tomar solo el evento más reciente
  const latestEvent = allArticles.find(article => article.category.toUpperCase() === 'EVENTO');

  return (
    <div className="mt-8">
        {latestEvent ? (
        <Link href={`/news/${latestEvent.id}`} className="group block">
            <Card className="bg-gradient-to-tr from-primary/10 to-transparent transition-all group-hover:border-primary/50">
            <div className="grid md:grid-cols-[1fr_300px] items-center">
                <div className="p-6">
                <CardTitle className="flex items-center gap-2 font-headline text-primary mb-2">
                    <CalendarCheck2 />
                    Evento Fansite Activo
                </CardTitle>
                <h3 className="font-bold font-headline text-xl leading-tight text-foreground transition-colors mb-2">
                    {latestEvent.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                    {latestEvent.summary}
                </p>
                <Button variant="outline" size="sm">
                    Ver más detalles
                </Button>
                </div>
                <div className="relative w-full h-48 md:h-full rounded-b-lg md:rounded-r-lg md:rounded-b-none overflow-hidden">
                <Image
                    src={latestEvent.imageUrl}
                    alt={latestEvent.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    data-ai-hint={latestEvent.imageHint}
                    unoptimized
                />
                </div>
            </div>
            </Card>
        </Link>
        ) : (
        <Card>
            <CardContent className="p-6 text-center">
                <Info className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No hay ningún evento de fansite activo en este momento.</p>
            </CardContent>
        </Card>
        )}
    </div>
  );
}
