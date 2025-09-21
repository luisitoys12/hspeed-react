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

const slides = [
  {
    id: 1,
    imageUrl: 'https://picsum.photos/seed/slide1/1200/400',
    imageHint: 'habbo party',
    title: '¡Bienvenidos a Ekus FM!',
    subtitle: 'Tu radio #1 en la comunidad de Habbo.es',
  },
  {
    id: 2,
    imageUrl: 'https://picsum.photos/seed/slide2/1200/400',
    imageHint: 'live music',
    title: 'Eventos Especiales Cada Semana',
    subtitle: 'Concursos, premios y la mejor música en vivo.',
  },
  {
    id: 3,
    imageUrl: 'https://picsum.photos/seed/slide3/1200/400',
    imageHint: 'radio studio',
    title: 'Pide Tus Canciones Favoritas',
    subtitle: 'Nuestros DJs están esperando tu petición.',
  },
];

export default function HeroSlideshow() {
  return (
    <Carousel
      className="w-full"
      plugins={[
        Autoplay({
          delay: 5000,
        }),
      ]}
      opts={{
        loop: true,
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
                />
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4">
                  <h2 className="text-2xl md:text-4xl font-headline font-bold text-white drop-shadow-lg">
                    {slide.title}
                  </h2>
                  <p className="text-md md:text-lg text-white/90 drop-shadow-md mt-2">
                    {slide.subtitle}
                  </p>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex" />
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex" />
    </Carousel>
  );
}
