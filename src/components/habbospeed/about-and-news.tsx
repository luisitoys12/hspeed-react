
'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart, Newspaper, Radio } from 'lucide-react';
import { NewsArticle } from '@/lib/types';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';

type AboutAndNewsProps = {
  initialNews: { [key: string]: Omit<NewsArticle, 'id'> };
};

export default function AboutAndNews({ initialNews }: AboutAndNewsProps) {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(initialNews) {
            const newsArray = Object.keys(initialNews)
                .map(key => ({ id: key, ...initialNews[key] }))
                .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 2); // Get latest 2 articles
            setNews(newsArray);
        }
        setLoading(false);
    }, [initialNews])

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Radio className="text-primary" /> ¿Por qué Elegirnos?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm flex-grow">
                <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
                    <Heart className="h-5 w-5 text-primary flex-shrink-0" />
                    <p className="text-muted-foreground">
                        Somos una fansite oficial con DJs apasionados, eventos exclusivos y una dedicación total a nuestros oyentes.
                    </p>
                </div>
                 <div className="mt-4">
                    <h3 className="font-headline flex items-center gap-2 mb-2"><Newspaper className="text-primary"/> Últimas Noticias</h3>
                    <div className="space-y-3">
                        {loading ? <Skeleton className="h-20 w-full" /> : news.map(article => (
                            <Link href={`/news/${article.id}`} key={article.id} className="flex items-center gap-3 group p-2 rounded-lg hover:bg-muted">
                                <Image src={article.imageUrl} alt={article.title} width={64} height={64} className="rounded-md object-cover aspect-square" unoptimized/>
                                <div className="min-w-0">
                                    <p className="font-bold truncate group-hover:text-primary">{article.title}</p>
                                    <Badge variant="secondary">{article.category}</Badge>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
