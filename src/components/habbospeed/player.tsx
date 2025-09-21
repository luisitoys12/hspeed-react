'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, Users, Music, LoaderCircle } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useEffect, useRef, useState } from 'react';
import { Skeleton } from '../ui/skeleton';

// Estructura de datos de Azuracast
interface AzuracastData {
  station: {
    listen_url: string;
  };
  listeners: {
    current: number;
  };
  now_playing: {
    song: {
      text: string;
      artist: string;
      title: string;
      art: string;
    };
  };
  live: {
    is_live: boolean;
    streamer_name: string;
  };
}

const defaultDj = {
    name: 'AutoDJ',
    habboName: 'estacionkusfm',
    avatarUrl: `https://www.habbo.es/habbo-imaging/avatarimage?user=estacionkusfm&action=std&direction=2&head_direction=2&gesture=sml&size=l`,
    roles: ['AutoDJ'],
};

export default function Player() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [azuracastData, setAzuracastData] = useState<AzuracastData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // La URL base es http, no https
        const response = await fetch('http://radio.kusmedios.lat/api/nowplaying/ekus-fm');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setAzuracastData(data);
      } catch (error) {
        console.error("Error fetching Azuracast data:", error);
        setAzuracastData(null); // Clear data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchData(); // Fetch immediately on mount
    const interval = setInterval(fetchData, 15000); // Refresh every 15 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Asegúrate de que la URL de la estación esté disponible antes de reproducir
        if (azuracastData?.station.listen_url) {
            audioRef.current.src = azuracastData.station.listen_url;
            audioRef.current.play();
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const listenUrl = azuracastData?.station.listen_url || "http://radio.kusmedios.lat/listen/ekus-fm/radio.mp3";

  const currentDj = azuracastData?.live.is_live && azuracastData.live.streamer_name ? {
    name: azuracastData.live.streamer_name,
    habboName: azuracastData.live.streamer_name,
    avatarUrl: `https://www.habbo.es/habbo-imaging/avatarimage?user=${azuracastData.live.streamer_name}&action=std&direction=2&head_direction=2&gesture=sml&size=l`,
    roles: ['En Vivo']
  } : defaultDj;
  
  const songArt = azuracastData?.now_playing.song.art || "https://picsum.photos/seed/songart/300/300";
  const songTitle = azuracastData?.now_playing.song.title || 'Canción no disponible';
  const songArtist = azuracastData?.now_playing.song.artist || 'Artista no disponible';
  const listeners = azuracastData?.listeners.current ?? 0;

  return (
    <Card className="overflow-hidden shadow-lg border-primary/20">
      <audio ref={audioRef} src={listenUrl} preload="none" />
      <div className="relative h-48 w-full">
         <Image
          src="https://picsum.photos/seed/playerbg/1200/400"
          alt="Fondo de radio con temática de Halloween"
          fill
          className="object-cover"
          data-ai-hint="halloween party"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

        <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 p-2 rounded-lg">
          <Users className="text-primary h-5 w-5" />
          <span className="font-bold text-white">{listeners}</span>
          <span className="text-sm text-muted-foreground">Oyentes</span>
        </div>

        <div className="absolute bottom-4 left-4 flex items-end gap-4">
          <div className="relative h-24 w-24 border-4 border-background rounded-lg overflow-hidden shadow-lg">
             <Image
                src={currentDj.avatarUrl}
                alt={currentDj.name}
                width={96}
                height={96}
                className="object-contain"
                onError={(e) => { e.currentTarget.src = defaultDj.avatarUrl }}
              />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Al Aire:</p>
            <h2 className="text-3xl font-headline font-bold text-white shadow-black [text-shadow:1px_1px_2px_var(--tw-shadow-color)]">{currentDj.name}</h2>
            <div className="flex gap-2 mt-1">
              {currentDj.roles.map((role) => (
                <Badge key={role} variant={role === 'En Vivo' ? 'default' : 'secondary'} className={role === 'En Vivo' ? 'bg-red-600' : ''}>{role}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
      <CardContent className="p-6 bg-card flex flex-col sm:flex-row items-center gap-4">
        {isLoading ? (
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <Skeleton className="h-16 w-16 rounded-md" />
                <div className="flex-grow space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>
        ) : (
            <div className="flex items-center gap-4 w-full sm:w-auto flex-1 min-w-0">
                <Image src={songArt} alt={songTitle} width={64} height={64} className="rounded-md" />
                <div className="flex-grow min-w-0">
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><Music size={14}/> Sonando Ahora</p>
                    <h3 className="text-md font-semibold font-headline truncate" title={songTitle}>{songTitle}</h3>
                    <p className="text-sm text-muted-foreground truncate" title={songArtist}>{songArtist}</p>
                </div>
            </div>
        )}
        
        <div className="flex items-center justify-center gap-4">
            <Button variant="default" size="icon" className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg" onClick={togglePlayPause} disabled={isLoading}>
                {isPlaying ? <Pause className="h-6 w-6 fill-primary-foreground" /> : <Play className="h-6 w-6 fill-primary-foreground" />}
            </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-48">
            <Volume2 className="text-muted-foreground" />
            <Slider defaultValue={[volume]} max={100} step={1} onValueChange={(value) => setVolume(value[0])} />
        </div>
      </CardContent>
    </Card>
  );
}
