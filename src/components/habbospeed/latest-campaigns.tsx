
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

type LatestCampaignsProps = {
  hotel?: 'es' | 'com.br' | 'com.tr' | 'de' | 'fi' | 'fr' | 'it' | 'nl';
  title?: string;
  description?: string;
};

export default function LatestCampaigns({ 
    hotel = 'es', 
    title = 'Campañas de Habbo', 
    description = 'Un vistazo a las últimas campañas y eventos oficiales de Habbo.es.' 
}: LatestCampaignsProps) {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const response = await fetch(`/api/campaigns?hotel=${hotel}`);
                if (response.ok) {
                    const data = await response.json();
                    setCampaigns(data.slice(0, 3));
                }
            } catch (error) {
                // Silently fail. The component will just show nothing if the API is down.
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, [hotel]);

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
    
    if (campaigns.length === 0 && !loading) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <Newspaper className="text-primary" />
                        {title}
                    </CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center">No hay campañas activas en este momento.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Newspaper className="text-primary" />
                    {title}
                </CardTitle>
                <CardDescription>
                    {description}
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
