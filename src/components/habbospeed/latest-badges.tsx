
'use client'

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Award, LoaderCircle } from 'lucide-react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Skeleton } from '../ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

type Badge = {
  name: string;
  description: string;
  code: string;
}

type LatestBadgesProps = {
  hotel?: 'es' | 'origin';
  title?: string;
  description?: string;
}

export default function LatestBadges({ hotel = 'es', title = 'Últimas Placas', description = 'Las placas más recientes añadidas a Habbo.es.' }: LatestBadgesProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const response = await fetch(`/api/badges?hotel=${hotel}`);
        if (response.ok) {
          const data = await response.json();
          setBadges(data);
        }
      } catch (error) {
        // Silently fail. The component will just show nothing if the API is down.
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [hotel]);

  if (loading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
                 <Skeleton className="h-20 w-full" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Award className="text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {badges.length > 0 ? (
            <TooltipProvider>
                <Carousel opts={{ align: "start", loop: true }} className="w-full">
                    <CarouselContent>
                        {badges.map((badge) => (
                        <CarouselItem key={badge.code} className="basis-1/4 md:basis-1/5">
                            <Tooltip>
                                <TooltipTrigger>
                                    <div className="p-1">
                                        <Image
                                            src={`https://images.habbo.com/c_images/album1584/${badge.code}.gif`}
                                            alt={badge.name}
                                            width={50}
                                            height={50}
                                            className="mx-auto"
                                            unoptimized
                                        />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-bold">{badge.name}</p>
                                    <p>{badge.description}</p>
                                </TooltipContent>
                            </Tooltip>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className='-left-2' />
                    <CarouselNext className='-right-2' />
                </Carousel>
            </TooltipProvider>
        ) : (
          <p className="text-sm text-muted-foreground text-center">No se pudieron cargar las placas.</p>
        )}
      </CardContent>
    </Card>
  );
}
