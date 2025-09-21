import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Newspaper } from 'lucide-react';
import { getNewsArticles } from '@/lib/data';
import Image from 'next/image';
import { Badge } from '../ui/badge';

export default async function LatestCampaigns() {
  const articles = await getNewsArticles();
  
  // Tomar solo los dos primeros artículos para la página de inicio
  const latestArticles = articles.slice(0, 2);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Newspaper className="text-primary" />
          Campañas y Eventos de Habbo
        </CardTitle>
        <CardDescription>
          Un vistazo a las últimas noticias y eventos directamente de la comunidad.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {latestArticles.map((article) => (
            <div key={article.id} className="flex items-start gap-4 group">
              <div className="relative w-24 h-24 md:w-32 md:h-20 flex-shrink-0">
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  className="rounded-md object-cover transition-transform group-hover:scale-105"
                  data-ai-hint={article.imageHint}
                />
              </div>
              <div className="flex-grow">
                <Badge variant="outline" className="mb-1 border-primary text-primary">{article.category}</Badge>
                <h3 className="font-bold font-headline text-base md:text-lg leading-tight group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 hidden md:block">
                  {article.summary}
                </p>
              </div>
            </div>
          ))}
        </div>
         <p className="text-xs text-muted-foreground mt-4 text-center">Datos de campañas simulados. Se requiere una API de noticias para datos en vivo.</p>
      </CardContent>
    </Card>
  );
}
