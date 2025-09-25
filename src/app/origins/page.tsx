
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import LatestBadges from "@/components/habbospeed/latest-badges";
import { Sprout, Newspaper, PartyPopper } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { NewsArticle, EventItem } from "@/lib/types";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function OriginsPage() {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const newsRef = ref(db, 'origins_news');
        const eventsRef = ref(db, 'origins_events');

        const unsubNews = onValue(newsRef, (snapshot) => {
            const data = snapshot.val() || {};
            const newsArray = Object.keys(data)
                .map(key => ({ id: key, ...data[key] }))
                .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setNews(newsArray);
            setLoading(false);
        });

        const unsubEvents = onValue(eventsRef, (snapshot) => {
            const data = snapshot.val() || {};
             const eventsArray = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
            eventsArray.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setEvents(eventsArray);
        });

        return () => {
            unsubNews();
            unsubEvents();
        }
    }, []);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <Sprout className="h-8 w-8 text-primary" />
          Speed Origins
        </h1>
        <p className="text-muted-foreground mt-2">
          Toda la información sobre el clásico Habbo Origins.
        </p>
      </div>

       <Card className="overflow-hidden mb-8">
            <div className="relative h-48 md:h-64 bg-black">
                <Image
                    src="https://images.habbo.com/web_images/habbo-web-articles/lpromo_habbo_origins_centerspread_upscaled.png"
                    alt="Habbo Origins"
                    layout="fill"
                    objectFit="cover"
                    className="opacity-60"
                    unoptimized
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <Image 
                        src="https://images.habbo.com/c_images/origins_logo/origins_logo_white.png" 
                        alt="Origins Logo"
                        width={200}
                        height={100}
                        unoptimized
                    />
                    <h1 className="text-xl md:text-2xl font-headline font-bold mt-2 drop-shadow-lg">
                        ¡El viaje al pasado ha comenzado!
                    </h1>
                </div>
            </div>
        </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Newspaper className="text-primary"/> Noticias de Origins</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading ? <Skeleton className="h-24 w-full" /> : news.length > 0 ? (
                        news.slice(0,3).map(article => (
                            <Link key={article.id} href={`/news/${article.id}`} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted group">
                                <Image src={article.imageUrl} alt={article.title} width={80} height={80} className="rounded-md object-cover aspect-square" unoptimized/>
                                <div>
                                    <h3 className="font-bold group-hover:text-primary">{article.title}</h3>
                                    <p className="text-xs text-muted-foreground">{article.summary}</p>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-center">No hay noticias sobre Origins todavía.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><PartyPopper className="text-primary"/> Eventos en Origins</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                     {loading ? <Skeleton className="h-32 w-full" /> : events.length > 0 ? (
                        events.slice(0,2).map(event => (
                            <div key={event.id} className="p-4 rounded-lg bg-muted">
                                <h3 className="font-bold text-primary">{event.title}</h3>
                                <p className="text-sm text-muted-foreground">{event.roomName}</p>
                                <p className="text-xs text-muted-foreground mt-2">{new Date(event.date).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}</p>
                            </div>
                        ))
                     ) : (
                          <p className="text-muted-foreground text-center col-span-2">No hay eventos de Origins programados.</p>
                     )}
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
             <LatestBadges 
                hotel="origin"
                title="Últimas Placas de Origins"
                description="Las placas más nuevas que han llegado a Habbo Origins."
            />
        </div>
      </div>
    </div>
  );
}
