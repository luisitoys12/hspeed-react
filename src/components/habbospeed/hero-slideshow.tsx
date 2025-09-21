
'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Button } from '../ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { Skeleton } from '../ui/skeleton';

type Slide = {
  id: string;
  imageUrl: string;
  imageHint: string;
  title: string;
  subtitle: string;
  cta: {
    text: string;
    href: string;
  };
};

export default function HeroSlideshow() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const slidesRef = ref(db, 'config/slideshow');
    const unsubscribe = onValue(slidesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const slidesArray = Array.isArray(data) 
          ? data.filter(Boolean).map((item, index) => ({...item, id: `slide${index}`}))
          : Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setSlides(slidesArray);
      } else {
        // In case Firebase is empty, show a default placeholder slide
        setSlides([{
            id: '1',
            imageUrl: 'https://picsum.photos/seed/habboparty/1200/400',
            imageHint: 'habbo party',
            title: '¡Bienvenidos a Ekus FM!',
            subtitle: 'La radio #1 para la comunidad de Habbo.es. Música, eventos y diversión 24/7.',
            cta: {
              text: 'Ver Horarios',
              href: '/schedule',
            }
          }]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Skeleton className="w-full aspect-video md:aspect-[3/1] rounded-lg" />;
  }

  return (
    <Carousel
      className="w-full"
      plugins={[
        Autoplay({
          delay: 5000,
        }),
      ]}
      opts={{
        loop: slides.length > 1,
      }}
    >
      <CarouselContent className="rounded-lg overflow-hidden">
        {slides.map((slide) => (
          <CarouselItem key={slide.id}>
            <Card className="border-none">
              <CardContent className="relative aspect-video md:aspect-[3/1] p-0">
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  data-ai-hint={slide.imageHint}
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center p-4">
                  <h2 className="text-2xl md:text-4xl font-headline font-bold text-white drop-shadow-lg">
                    {slide.title}
                  </h2>
                  <p className="text-md md:text-lg text-white/90 drop-shadow-md mt-2 max-w-2xl">
                    {slide.subtitle}
                  </p>
                   {slide.cta && slide.cta.text && slide.cta.href && (
                    <Button asChild className="mt-4">
                      <Link href={slide.cta.href}>{slide.cta.text}</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
       {slides.length > 1 && (
        <>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex" />
        </>
      )}
    </Carousel>
  );
}
