
"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { NewsArticle } from '@/lib/types';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Tag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// A simple markdown-to-html renderer
const Markdown = ({ content }: { content: string }) => {
    // Replace newlines with <br> tags
    const html = content.replace(/\n/g, '<br />');
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

export default function ArticleDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const articleRef = ref(db, `news/${id}`);
      const unsubscribe = onValue(articleRef, (snapshot) => {
        if (snapshot.exists()) {
          setArticle({ id, ...snapshot.val() });
        } else {
          setError("El artículo que buscas no existe o ha sido movido.");
        }
        setLoading(false);
      }, (err) => {
        console.error(err);
        setError("No se pudo cargar el artículo.");
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [id]);

  if (loading) {
    return <ArticleSkeleton />;
  }

  if (error) {
    return (
        <div className="container mx-auto p-4 md:p-8 text-center">
            <Card>
                <CardContent className="p-8">
                    <h2 className="text-xl font-bold text-destructive">{error}</h2>
                    <Button asChild className="mt-4">
                        <Link href="/news"><ArrowLeft className="mr-2 h-4 w-4" />Volver a Noticias</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  if (!article) {
    return null; 
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <article>
        <div className="mb-8">
            <Link href="/news" className="text-sm text-primary hover:underline flex items-center gap-1 mb-4">
                <ArrowLeft size={16} />
                Volver a todas las noticias
            </Link>
          <div className="relative aspect-video w-full mb-4">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="rounded-lg object-cover"
              unoptimized
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-2">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>{new Date(article.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <Tag size={14} />
                <Badge variant="secondary">{article.category}</Badge>
            </div>
          </div>
          <p className="text-lg text-muted-foreground">{article.summary}</p>
        </div>

        <div className="prose prose-invert prose-lg max-w-none text-foreground/90 leading-relaxed">
           <Markdown content={article.content} />
        </div>
      </article>
    </div>
  );
}

const ArticleSkeleton = () => (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="aspect-video w-full mb-4" />
        <Skeleton className="h-10 w-3/4 mb-2" />
        <div className="flex gap-4 mb-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-6 w-full mb-8" />
        <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <br />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/6" />
        </div>
    </div>
);
