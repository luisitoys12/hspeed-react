
'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Award, Home, Search, LoaderCircle } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { ScrollArea } from '../ui/scroll-area';
import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import type { getHabboProfileData as getHabboProfileDataType } from '@/lib/data';

type HabboProfileData = Awaited<ReturnType<typeof getHabboProfileDataType>>;

const defaultUsername = 'estacionkusfm';

// We need to redefine the function on the client to call our proxy
async function getHabboProfileData(username: string): Promise<HabboProfileData> {
    try {
        const response = await fetch(`/api/habbo-user?username=${username}`);
        if (!response.ok) {
            const errorData = await response.json();
            return { error: errorData.error || 'User not found or API error.' };
        }
        
        const data = await response.json();
        const { user, profile } = data;

        return {
            name: user.name,
            motto: user.motto,
            registrationDate: user.memberSince,
            rewards: profile.achievementScore,
            badges: profile.badges.slice(0, 5).map((badge: any) => ({
                id: badge.code,
                name: badge.name,
                imageUrl: `https://images.habbo.com/c_images/album1584/${badge.code}.gif`,
                imageHint: 'habbo badge', 
            })),
            rooms: profile.rooms.slice(0, 3).map((room: any) => ({
                id: room.id,
                name: room.name,
                imageUrl: `https://www.habbo.com/habbo-imaging/room/${room.id}/thumbnail.png`,
                imageHint: 'habbo room',
            })),
            error: null,
        };

    } catch (error) {
        // Silently fail on network error
        return { error: 'Ocurrió un error inesperado al buscar el perfil.' };
    }
}


export default function HabboProfile() {
  const [username, setUsername] = useState(defaultUsername);
  const [profile, setProfile] = useState<HabboProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState(defaultUsername);

  useEffect(() => {
    fetchProfile(username);
  }, []);

  const fetchProfile = async (name: string) => {
    setIsLoading(true);
    setError(null);
    setProfile(null);
    try {
      const data = await getHabboProfileData(name);
       if (data.error) {
        setError(data.error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (e) {
      setError('No se pudo encontrar al usuario o la API de Habbo no está disponible.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
        setUsername(inputValue.trim());
        fetchProfile(inputValue.trim());
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <Input 
            placeholder="Buscar usuario de Habbo..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button type="submit" size="icon" variant="outline" disabled={isLoading}>
            <Search className="h-4 w-4" />
          </Button>
        </form>
         <CardDescription className="text-xs text-center pt-1">
            Busca un perfil de Habbo para ver sus placas y salas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow overflow-hidden flex flex-col">
        {isLoading && (
            <div className="flex justify-center items-center h-full min-h-[300px] bg-card rounded-lg">
                <Image 
                    src="https://files.habboemotion.com/resources/images/seasons/habboween/handsuphabbo.gif" 
                    alt="Cargando..."
                    width={60}
                    height={100}
                    unoptimized
                />
            </div>
        )}
        {error && !isLoading && (
            <Alert variant="destructive" className="m-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {profile && !isLoading && profile.name && (
            <ScrollArea className="flex-grow pr-4 -mr-4">
                <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${profile.name}&size=l`} alt={profile.name} />
                        <AvatarFallback>{profile.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="font-headline">{profile.name}</CardTitle>
                        <CardDescription className="italic">"{profile.motto}"</CardDescription>
                    </div>
                </div>

                <div className="text-sm text-muted-foreground space-y-2">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Miembro desde: {new Date(profile.registrationDate).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        <span>Puntos de Logro: {profile.rewards}</span>
                    </div>
                </div>
                
                <div>
                    <h3 className="font-headline my-2">Placas</h3>
                    <div className="flex flex-wrap gap-2">
                        {profile.badges?.map(badge => (
                            <div key={badge.id} title={badge.name}>
                                <Image src={badge.imageUrl} alt={badge.name} width={40} height={40} className="rounded-md" data-ai-hint={badge.imageHint} unoptimized />
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="font-headline my-2 flex items-center gap-2"><Home className="h-4 w-4" /> Salas Creadas</h3>
                    <Carousel
                        opts={{
                        align: "start",
                        }}
                        className="w-full"
                    >
                        <CarouselContent>
                        {profile.rooms?.map((room) => (
                            <CarouselItem key={room.id} className="md:basis-1/2 lg:basis-full">
                            <div className="p-1">
                                <Card className="overflow-hidden">
                                <CardContent className="flex aspect-video items-center justify-center p-0 relative">
                                    <Image src={room.imageUrl} alt={room.name} fill className="object-cover" data-ai-hint={room.imageHint} unoptimized />
                                    <div className="absolute inset-0 bg-black/40" />
                                    <span className="relative font-bold text-white text-lg text-center p-2 font-headline">{room.name}</span>
                                </CardContent>
                                </Card>
                            </div>
                            </CarouselItem>
                        ))}
                        </CarouselContent>
                        <CarouselPrevious className="hidden sm:flex" />
                        <CarouselNext className="hidden sm:flex" />
                    </Carousel>
                </div>
                 <p className="text-xs text-muted-foreground text-center pt-4">Datos obtenidos de la API de Habbo.</p>
            </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
