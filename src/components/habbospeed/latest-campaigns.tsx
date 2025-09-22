
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Newspaper, LoaderCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';

interface Campaign {
    title: string;
    story: string;
    image: string;
    link: string;
}

export default function LatestCampaigns() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const response = await fetch('https://puhekupla.com/api/v1/campaigns?hotel=es', {
                    headers: {
                        'X-Puhekupla-APIKey': 'demo-habbospeed'
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch campaigns');
                const data = await response.json();
                // Limitar a las primeras 2 o 3 campañas
                setCampaigns(data.slice(0, 3));
            } catch (error) {
                console.error("Error fetching campaigns from Puhekupla:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, []);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4"><Skeleton className="h-20 w-20" /><div className="space-y-2 flex-1"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-4/5" /></div></div>
                    <div className="flex gap-4"><Skeleton className="h-20 w-20" /><div className="space-y-2 flex-1"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-4/5" /></div></div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Newspaper className="text-primary" />
                    Campañas de Habbo
                </CardTitle>
                <CardDescription>
                    Un vistazo a las últimas campañas y eventos oficiales de Habbo.es.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {campaigns.map((campaign) => (
                        <Link href={campaign.link} key={campaign.title} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group">
                            <div className="relative w-24 h-24 md:w-32 md:h-20 flex-shrink-0">
                                <Image
                                    src={campaign.image}
                                    alt={campaign.title}
                                    fill
                                    className="rounded-md object-cover transition-transform group-hover:scale-105"
                                    unoptimized
                                />
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-bold font-headline text-base md:text-lg leading-tight group-hover:text-primary transition-colors">
                                    {campaign.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1 hidden md:block">
                                    {campaign.story}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">Datos de campañas obtenidos desde la API de Puhekupla.</p>
            </CardContent>
        </Card>
    );
}
