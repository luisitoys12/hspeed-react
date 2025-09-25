
'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarCheck2, Clock, Home, User, Server, PartyPopper } from 'lucide-react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState } from 'react';
import { EventItem } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

function Countdown({ targetDate }: { targetDate: string }) {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const target = new Date(targetDate);
      const difference = target.getTime() - now.getTime();

      if (difference <= 0) {
        setCountdown('¡El evento ha comenzado!');
        clearInterval(interval);
        return;
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setCountdown(`en ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return <span className="font-mono">{countdown}</span>;
}

type ActiveEventsProps = {
  initialEvents: { [key: string]: Omit<EventItem, 'id'> };
};

export default function ActiveEvents({ initialEvents }: ActiveEventsProps) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialEvents) {
        const now = new Date();
        const allEvents = Object.keys(initialEvents)
            .map(key => ({ id: key, ...initialEvents[key] }))
            .map(event => ({
                ...event,
                dateTime: new Date(`${event.date}T${event.time}:00`)
            }))
            .filter(event => event.dateTime > now) // Filter for future events
            .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime()); // Sort by soonest
        setEvents(allEvents);
    }
    setLoading(false);
  }, [initialEvents]);

  if (loading) {
      return (
          <Card>
              <CardHeader><Skeleton className='h-6 w-1/2' /></CardHeader>
              <CardContent className="space-y-4">
                  <Skeleton className="h-24 w-full" />
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
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
                <CalendarCheck2 className="text-primary" />
                Próximo Evento
            </CardTitle>
        </CardHeader>
        <CardContent>
        {latestEvent ? (
          <div className="flex flex-col flex-grow text-sm">
            <div className="relative w-full aspect-video mb-4 rounded-lg overflow-hidden">
                <Image src={latestEvent.imageUrl} alt={latestEvent.title} fill className="object-cover" unoptimized/>
            </div>
            <p className='font-bold text-lg text-primary'>🏁 {latestEvent.title} 🏁</p>
            <div className='text-muted-foreground space-y-1 mt-2 flex-grow'>
                <p className='flex items-center gap-2'><Server className="h-4 w-4" /> {latestEvent.server}</p>
                <p className='flex items-center gap-2'><CalendarCheck2 className="h-4 w-4" /> {new Date(latestEvent.dateTime).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                <p className='flex items-center gap-2'><Clock className="h-4 w-4" /> {latestEvent.time} (<Countdown targetDate={latestEvent.dateTime.toISOString()} />)</p>
                <p className='flex items-center gap-2'><Home className="h-4 w-4" /> {latestEvent.roomName}</p>
                <p className='flex items-center gap-2'><User className="h-4 w-4" /> {latestEvent.roomOwner}</p>
                 <p className='flex items-center gap-2'><PartyPopper className="h-4 w-4" /> {latestEvent.host}</p>
            </div>
             {otherEvents.length > 0 && (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="w-full mt-4">Ver más eventos</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                        <DialogTitle>Próximos Eventos</DialogTitle>
                        <DialogDescription>
                            Esta es la lista de los próximos eventos organizados. ¡No te los pierdas!
                        </DialogDescription>
                        </DialogHeader>
                        <div className="max-h-[60vh] overflow-y-auto space-y-2 p-1">
                            {[latestEvent, ...otherEvents].map((event) => (
                                <div key={event.id} className="p-3 rounded-lg bg-muted">
                                    <h3 className="font-bold text-primary">{event.title}</h3>
                                    <p className="text-sm text-muted-foreground">{event.roomName} por {event.roomOwner}</p>
                                    <p className="text-xs text-muted-foreground mt-2">{new Date(event.dateTime).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}</p>
                                </div>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
          </div>
        ) : (
            <div className="text-center text-muted-foreground py-10 flex items-center justify-center">
                <p>No hay eventos programados por el momento.</p>
            </div>
        )}
        </CardContent>
    </Card>
  );
}
