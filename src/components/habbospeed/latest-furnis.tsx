
'use client'

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sofa, LoaderCircle } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '../ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

type Furni = {
  id: number;
  classname: string;
  name: string;
  description: string;
}

export default function LatestFurnis() {
  const [furnis, setFurnis] = useState<Furni[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFurnis = async () => {
      try {
        // Use the more general /api/furni endpoint which is more reliable
        const response = await fetch('https://habbofurni.com/api/furni?limit=10');
        if (response.ok) {
          const data = await response.json();
          setFurnis(data);
        }
      } catch (error) {
        // Silently fail if the external API is down
      } finally {
        setLoading(false);
      }
    };

    fetchFurnis();
  }, []);

  if (loading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
                 <Skeleton className="h-24 w-full" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Sofa className="text-primary" />
          Últimos Furnis
        </CardTitle>
        <CardDescription>Un vistazo a los furnis más recientes llegados al hotel.</CardDescription>
      </CardHeader>
      <CardContent>
        {furnis.length > 0 ? (
           <TooltipProvider>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
              {furnis.map((furni) => (
                <Tooltip key={furni.id}>
                    <TooltipTrigger>
                        <div className="p-2 border rounded-lg aspect-square flex items-center justify-center bg-muted/50">
                            <Image
                            src={`https://habbofurni.com/images/${furni.classname}.png`}
                            alt={furni.name}
                            width={64}
                            height={64}
                            className="object-contain"
                            unoptimized
                            />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="font-bold">{furni.name}</p>
                        <p className='max-w-xs'>{furni.description}</p>
                    </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        ) : (
          <p className="text-sm text-muted-foreground text-center">No se pudieron cargar los furnis.</p>
        )}
      </CardContent>
    </Card>
  );
}
