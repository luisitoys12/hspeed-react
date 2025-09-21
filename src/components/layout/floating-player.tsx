
'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, Users, Music, LoaderCircle } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useEffect, useRef, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import SongRequestForm from '../habbospeed/song-request-form';


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
};

export default function FloatingPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [azuracastData, setAzuracastData] = useState<AzuracastData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://radio.kusmedios.lat/api/nowplaying/ekus-fm');
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
        if (azuracastData?.station.listen_url) {
            audioRef.current.src = azuracastData.station.listen_url;
            audioRef.current.play().catch(e => console.error("Error playing audio:", e));
        }
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  useEffect(() => {
    const audioEl = audioRef.current;
    if(audioEl) {
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        audioEl.addEventListener('play', handlePlay);
        audioEl.addEventListener('pause', handlePause);
        return () => {
            audioEl.removeEventListener('play', handlePlay);
            audioEl.removeEventListener('pause', handlePause);
        }
    }
  }, [audioRef])

  const listenUrl = azuracastData?.station.listen_url || "http://radio.kusmedios.lat/listen/ekus-fm/radio.mp3";

  const currentDjHabboName = azuracastData?.live.is_live && azuracastData.live.streamer_name 
    ? azuracastData.live.streamer_name 
    : defaultDj.habboName;

  const currentDjName = azuracastData?.live.is_live && azuracastData.live.streamer_name 
    ? azuracastData.live.streamer_name 
    : defaultDj.name;
  
  const songArt = azuracastData?.now_playing.song.art || "/placeholder-song.png";
  const songTitle = azuracastData?.now_playing.song.title || 'Canción no disponible';
  const songArtist = azuracastData?.now_playing.song.artist || 'Artista no disponible';
  const listeners = azuracastData?.listeners.current ?? 0;
  const djAvatarUrl = `https://www.habbo.es/habbo-imaging/avatarimage?user=${currentDjHabboName}&direction=2&head_direction=3&size=s`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2 md:p-4">
        <Card className="overflow-hidden shadow-2xl border-primary/20 backdrop-blur-sm bg-card/80">
        <audio ref={audioRef} src={listenUrl} preload="none" />
        <CardContent className="p-3 sm:p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                {isLoading ? (
                    <div className="flex items-center gap-4 w-full sm:w-auto flex-1 min-w-0">
                        <Skeleton className="h-12 w-12 sm:h-16 sm:w-16 rounded-md" />
                        <div className="flex-grow space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-4 w-full sm:w-auto flex-1 min-w-0">
                        <Image src={songArt} alt={songTitle} width={64} height={64} className="rounded-md h-12 w-12 sm:h-16 sm:w-16 object-cover" />
                        <div className="flex-grow min-w-0">
                            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2"><Music size={14}/> Sonando Ahora</p>
                            <h3 className="text-sm sm:text-md font-semibold font-headline truncate" title={songTitle}>{songTitle}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate" title={songArtist}>{songArtist}</p>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="flex items-center gap-4">
                 <div className="hidden lg:flex items-center gap-3 bg-background/50 p-2 rounded-lg">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={djAvatarUrl} alt={currentDjName} />
                        <AvatarFallback>{currentDjName.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-xs text-muted-foreground">Al Aire:</p>
                        <p className="font-bold text-sm text-primary">{currentDjName}</p>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2 sm:gap-4">
                    <Button variant="default" size="icon" className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg" onClick={togglePlayPause} disabled={isLoading}>
                        {isPlaying ? <Pause className="h-5 w-5 sm:h-6 sm:w-6 fill-primary-foreground" /> : <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-primary-foreground" />}
                    </Button>
                </div>

                <Sheet>
                  <SheetTrigger asChild>
                     <Button variant="outline" className="hidden sm:flex">
                        <Music className="mr-2 h-4 w-4" /> Pide una canción
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Pide una Canción</SheetTitle>
                      <SheetDescription>
                        ¿Quieres escuchar tu canción favorita? ¡Házselo saber a nuestro DJ! Tu petición será revisada por nuestra IA para asegurar que es apropiada para la estación.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-4">
                        <SongRequestForm />
                    </div>
                  </SheetContent>
                </Sheet>

                <div className="hidden md:flex items-center gap-2 w-full sm:w-32 lg:w-48">
                    <Volume2 className="text-muted-foreground" />
                    <Slider defaultValue={[volume]} max={100} step={1} onValueChange={(value) => setVolume(value[0])} />
                </div>

                <div className="hidden sm:flex items-center gap-2 bg-black/50 p-2 rounded-lg">
                    <Users className="text-primary h-5 w-5" />
                    <span className="font-bold text-white">{listeners}</span>
                </div>
            </div>

        </CardContent>
        </Card>
    </div>
  );
}
