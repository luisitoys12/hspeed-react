
'use client';

import { Newspaper } from 'lucide-react';
import NewsCard from '@/components/habbospeed/news-card';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { NewsArticle } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewsPage() {
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const newsRef = ref(db, 'news');
    const unsubscribe = onValue(newsRef, (snapshot) => {
      const data = snapshot.val();
      const articlesArray = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      articlesArray.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setNewsArticles(articlesArray);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
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
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[200px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))
        ) : (
          newsArticles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))
        )}
      </div>
       <p className="text-xs text-muted-foreground mt-4 text-center">Datos de noticias obtenidos desde Firebase Realtime Database.</p>
    </div>
  );
}
