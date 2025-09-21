
'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarCheck2, Info, Clock, Home, User, Server } from 'lucide-react';
import { getNewsArticles } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from '../ui/separator';
import { useEffect, useState } from 'react';
import { NewsArticle } from '@/lib/types';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { Skeleton } from '../ui/skeleton';


export default function ActiveEvents() {
  const [events, setEvents] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const newsRef = ref(db, 'news');
    const unsubscribe = onValue(newsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const allArticles = Object.keys(data).map(key => ({ id: key, ...data[key] }));
            const eventArticles = allArticles
                .filter(article => article.category.toUpperCase() === 'EVENTO')
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setEvents(eventArticles);
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
      return (
          <Card>
              <CardHeader><Skeleton className='h-6 w-1/2' /></CardHeader>
              <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
              </CardContent>
          </Card>
      )
  }

  const latestEvent = events[0];
  const otherEvents = events.slice(1);

  return (
    <Card className="h-full flex flex-col">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
                <CalendarCheck2 className="text-primary" />
                Próximos Eventos
            </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow">
        {latestEvent ? (
          <div className="flex flex-col flex-grow">
            <div className="space-y-2 text-sm flex-grow">
                <p className='font-bold text-base text-primary'>{latestEvent.title}</p>
                <div className='text-muted-foreground'>
                    <p className='flex items-center gap-2'><Clock className="h-4 w-4" /> {new Date(latestEvent.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                    <p className='flex items-center gap-2'><Server className="h-4 w-4" /> Habbo (ES)</p>
                    <p className='flex items-center gap-2'><Home className="h-4 w-4" /> {latestEvent.summary}</p>
                </div>
            </div>
             <Dialog>
                <DialogTrigger asChild>
                    <Button className="w-full mt-4">Ver más eventos</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                    <DialogTitle>Próximos Eventos de Fansite</DialogTitle>
                    <DialogDescription>
                        Esta es la lista de los próximos eventos organizados. ¡No te los pierdas!
                    </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto space-y-4 p-1">
                        {[latestEvent, ...otherEvents].map((event, index) => (
                            <div key={event.id}>
                                <Link href={`/news/${event.id}`}>
                                    <div className="p-4 rounded-lg bg-muted hover:bg-muted/80">
                                        <h3 className="font-bold text-primary">{event.title}</h3>
                                        <p className="text-sm text-muted-foreground">{event.summary}</p>
                                        <p className="text-xs text-muted-foreground mt-2">{new Date(event.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                </Link>
                                {index < events.length - 1 && <Separator className="mt-4" />}
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
          </div>
        ) : (
            <div className="text-center text-muted-foreground flex-grow flex items-center justify-center">
                <p>No hay eventos programados.</p>
            </div>
        )}
        </CardContent>
    </Card>
  );
}
