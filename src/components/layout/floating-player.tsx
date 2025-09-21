'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, Users, Music } from 'lucide-react';
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
import { getSchedule } from '@/lib/data';


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

type ScheduleItem = {
    day: string;
    time: string;
    show: string;
    dj: string;
}

const getNextDj = (schedule: ScheduleItem[]) => {
    if (schedule && schedule.length > 0) {
        return { name: schedule[0].dj, habboName: schedule[0].dj };
    }
    return { name: 'Por anunciar', habboName: 'estacionkusfm' };
};

export default function FloatingPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [azuracastData, setAzuracastData] = useState<AzuracastData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

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
    
    const fetchSchedule = async () => {
        const scheduleData = await getSchedule();
        setSchedule(scheduleData);
    }

    fetchData();
    fetchSchedule();
    const interval = setInterval(fetchData, 15000); 

    return () => clearInterval(interval);
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
    
  const nextDj = getNextDj(schedule);

  const songArt = azuracastData?.now_playing.song.art || "/placeholder-song.png";
  const songTitle = azuracastData?.now_playing.song.title || 'Canción no disponible';
  const songArtist = azuracastData?.now_playing.song.artist || 'Artista no disponible';
  const listeners = azuracastData?.listeners.current ?? 0;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2 md:p-4">
      <Card className="overflow-hidden shadow-2xl border-primary/20 backdrop-blur-sm bg-card/80">
        <audio ref={audioRef} src={listenUrl} preload="none" />
        <CardContent className="p-3 md:p-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          
          {/* Left Section: Song Info */}
          <div className="flex items-center gap-3 min-w-0">
            {isLoading ? (
              <>
                <Skeleton className="h-14 w-14 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </>
            ) : (
              <>
                <Image src={songArt} alt={songTitle} width={56} height={56} className="rounded-md h-14 w-14 object-cover" />
                <div className="min-w-0">
                  <h3 className="text-sm md:text-base font-semibold font-headline truncate" title={songTitle}>{songTitle}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground truncate" title={songArtist}>{songArtist}</p>
                </div>
              </>
            )}
          </div>
          
          {/* Center Section: Player Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button variant="default" size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg" onClick={togglePlayPause} disabled={isLoading}>
              {isPlaying ? <Pause className="h-5 w-5 md:h-6 md:w-6 fill-primary-foreground" /> : <Play className="h-5 w-5 md:h-6 md:w-6 fill-primary-foreground" />}
            </Button>
            <div className="hidden lg:flex items-center gap-2 w-24">
              <Volume2 className="text-muted-foreground" />
              <Slider defaultValue={[volume]} max={100} step={1} onValueChange={(value) => setVolume(value[0])} />
            </div>
          </div>

          {/* Right Section: DJ, Listeners, Request */}
          <div className="flex items-center justify-end gap-2 md:gap-4">
            <div className="hidden md:flex items-center gap-4 bg-black/50 p-2 rounded-lg">
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${currentDjHabboName}&headonly=1&size=s`} alt={currentDjName} />
                        <AvatarFallback>{currentDjName?.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="text-xs font-bold text-white/90">AL AIRE</div>
                        <div className="text-xs text-muted-foreground">{currentDjName}</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${nextDj.habboName}&headonly=1&size=s`} alt={nextDj.name} />
                        <AvatarFallback>{nextDj.name?.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="text-xs font-bold text-white/90">SIGUIENTE</div>
                        <div className="text-xs text-muted-foreground">{nextDj.name}</div>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 bg-black/50 p-2 rounded-lg">
                <Users className="text-primary h-5 w-5" />
                <span className="font-bold text-white text-sm">{listeners}</span>
            </div>
            <Sheet>
                <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="flex-shrink-0 h-10 w-10">
                    <Music className="h-4 w-4" />
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
