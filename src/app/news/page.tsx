import { Newspaper } from 'lucide-react';
import { newsArticles } from '@/lib/data';
import NewsCard from '@/components/habbospeed/news-card';

export default function NewsPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl md:text-4xl font-headline font-bold">
          <Newspaper className="h-8 w-8 text-primary" />
          Habbo News & Guides
        </h1>
        <p className="text-muted-foreground mt-2">
            The latest news, guides, and analysis from the Habbo community.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsArticles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
