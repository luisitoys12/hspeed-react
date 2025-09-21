import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getNewsArticles } from '@/lib/data';

export default async function HeroSlideshow() {
  const newsArticles = await getNewsArticles();
  
  return (
    <div className="w-full">
      <Carousel
        opts={{
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {newsArticles.map((article) => (
            <CarouselItem key={article.id}>
              <div className="p-1">
                <Card className="overflow-hidden">
                  <CardContent className="flex aspect-[2.5/1] items-center justify-center p-0 relative">
                    <Image 
                      src={article.imageUrl} 
                      alt={article.title} 
                      fill 
                      className="object-cover"
                      data-ai-hint={article.imageHint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4 md:p-8">
                      <h2 className="text-xl md:text-3xl font-headline font-bold text-white shadow-lg">{article.title}</h2>
                      <p className="text-sm md:text-base text-white/90 mt-2 max-w-prose shadow-md hidden sm:block">{article.summary}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
      </Carousel>
    </div>
  );
}
