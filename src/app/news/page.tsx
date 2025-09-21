import { Newspaper } from 'lucide-react';
import { getNewsArticles } from '@/lib/data';
import NewsCard from '@/components/habbospeed/news-card';

export default async function NewsPage() {
  const newsArticles = await getNewsArticles();
  
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <Newspaper className="h-8 w-8 text-primary" />
          Noticias y Guías de Habbo
        </h1>
        <p className="text-muted-foreground mt-2">
            Las últimas noticias, guías y análisis de la comunidad Habbo.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsArticles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
       <p className="text-xs text-muted-foreground mt-4 text-center">Datos de noticias simulados. Se requiere API para datos en vivo.</p>
    </div>
  );
}
