
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

type Article = {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  imageHint: string;
  category: string;
  date: string;
};

type NewsCardProps = {
  article: Article;
};

export default function NewsCard({ article }: NewsCardProps) {
  return (
    <Link href={`/news/${article.id}`} className="flex">
        <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1 w-full">
        <CardHeader className="p-0">
            <div className="relative aspect-[2/1] md:aspect-video">
            <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover"
                data-ai-hint={article.imageHint}
                unoptimized
            />
            </div>
        </CardHeader>
        <CardContent className="p-6 flex-grow">
            <Badge variant="outline" className="mb-2 border-primary text-primary">{article.category}</Badge>
            <CardTitle className="font-headline text-lg md:text-xl mb-2">{article.title}</CardTitle>
            <CardDescription className="text-sm">{article.summary}</CardDescription>
        </CardContent>
        <CardFooter>
            <p className="text-sm text-muted-foreground">{new Date(article.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </CardFooter>
        </Card>
    </Link>
  );
}
