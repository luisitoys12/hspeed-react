
'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Shield, Users, Calendar, Newspaper, BarChart2, Home, Crosshair } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NewsArticle } from '@/lib/types';
import Link from 'next/link';

interface CopaData {
    teams: { [key: string]: { name: string; pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; dg: number; pts: number; } };
    topScorers: { name: string; team: string; goals: number; }[];
    nextMatch: { teamA: string; teamB: string; date: string; time: string; };
    venue: { name: string; owner: string; };
}

export default function CopaPage() {
    const [copaData, setCopaData] = useState<CopaData | null>(null);
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const copaRef = ref(db, 'copa');
        const newsRef = ref(db, 'news');

        const unsubCopa = onValue(copaRef, (snapshot) => {
            setCopaData(snapshot.val());
            setLoading(false);
        });

        const unsubNews = onValue(newsRef, (snapshot) => {
            const allNews = snapshot.val() || {};
            const copaNews = Object.keys(allNews)
                .map(key => ({ id: key, ...allNews[key] }))
                .filter(article => article.category === 'COPA')
                .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 3);
            setNews(copaNews);
        });

        return () => {
            unsubCopa();
            unsubNews();
        };
    }, []);

    const sortedTeams = copaData?.teams ? Object.values(copaData.teams).sort((a, b) => b.pts - a.pts || b.dg - a.dg) : [];

    return (
        <div className="container mx-auto p-4 md:p-8">
            <Card className="overflow-hidden mb-8">
                <div className="relative h-48 md:h-64 bg-black">
                    <Image
                        src="https://images.habbo.com/c_images/habbowidgets/pixelart-139_gen.gif"
                        alt="Torneo de Futbol Habbo"
                        layout="fill"
                        objectFit="cover"
                        unoptimized
                        className="opacity-50"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <Trophy className="h-16 w-16 text-yellow-400 drop-shadow-lg" />
                        <h1 className="text-3xl md:text-5xl font-headline font-bold mt-2 drop-shadow-lg">
                            Copa Habbospeed
                        </h1>
                        <p className="mt-2 text-lg text-white/90">
                            Toda la emoción del torneo de fútbol más prestigioso de Habbo.
                        </p>
                    </div>
                </div>
            </Card>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Standings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><BarChart2/> Tabla de Posiciones</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? <Skeleton className="h-48 w-full"/> : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Equipo</TableHead>
                                            <TableHead>PTS</TableHead>
                                            <TableHead>PJ</TableHead>
                                            <TableHead>G</TableHead>
                                            <TableHead>E</TableHead>
                                            <TableHead>P</TableHead>
                                            <TableHead>DG</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sortedTeams.map(team => (
                                            <TableRow key={team.name}>
                                                <TableCell className="font-bold">{team.name}</TableCell>
                                                <TableCell>{team.pts}</TableCell>
                                                <TableCell>{team.pj}</TableCell>
                                                <TableCell>{team.pg}</TableCell>
                                                <TableCell>{team.pe}</TableCell>
                                                <TableCell>{team.pp}</TableCell>
                                                <TableCell>{team.dg}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    {/* News */}
                    <Card>
                         <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Newspaper/> Noticias del Torneo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             {loading ? <Skeleton className="h-24 w-full"/> : news.length > 0 ? (
                                news.map(article => (
                                    <Link key={article.id} href={`/news/${article.id}`} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted group">
                                        <Image src={article.imageUrl} alt={article.title} width={80} height={80} className="rounded-md object-cover aspect-square" unoptimized/>
                                        <div>
                                            <h3 className="font-bold group-hover:text-primary">{article.title}</h3>
                                            <p className="text-xs text-muted-foreground">{article.summary}</p>
                                        </div>
                                    </Link>
                                ))
                             ) : (
                                 <p className="text-muted-foreground text-center">No hay noticias sobre la copa todavía.</p>
                             )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar column */}
                <div className="lg:col-span-1 space-y-8">
                     {/* Next Match */}
                    {copaData?.nextMatch && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Calendar/> Próximo Partido</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="flex justify-around items-center font-bold text-xl font-headline">
                                    <span>{copaData.nextMatch.teamA}</span>
                                    <span className="text-primary">VS</span>
                                    <span>{copaData.nextMatch.teamB}</span>
                                </div>
                                <p className="text-muted-foreground mt-2">{copaData.nextMatch.date} a las {copaData.nextMatch.time}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Top Scorers */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Crosshair/> Máximos Goleadores</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? <Skeleton className="h-32 w-full"/> : (
                                <ul className="space-y-3">
                                    {copaData?.topScorers?.sort((a,b) => b.goals - a.goals).map(player => (
                                        <li key={player.name} className="flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold">{player.name}</p>
                                                <p className="text-xs text-muted-foreground">{player.team}</p>
                                            </div>
                                            <p className="font-bold text-primary">{player.goals} Goles</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    {/* Venue */}
                     {copaData?.venue && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Home/> Sede del Torneo</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p><strong>Sala:</strong> {copaData.venue.name}</p>
                                <p><strong>Dueño:</strong> {copaData.venue.owner}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
