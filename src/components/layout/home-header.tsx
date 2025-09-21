
"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, Users, Music, Bell } from 'lucide-react';
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
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { ScheduleItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


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

interface OnAirOverride {
    currentDj: string;
    nextDj: string;
}

interface RadioConfig {
    apiUrl: string;
    listenUrl: string;
}

const defaultDj = {
    name: 'AutoDJ',
    habboName: 'estacionkusfm',
};

const getDjs = (schedule: ScheduleItem[], onAirOverride?: OnAirOverride, azuracastData?: AzuracastData | null) => {
    const azuracastStreamer = azuracastData?.live.is_live ? azuracastData.live.streamer_name : '';

    let currentDj = { name: defaultDj.name, habboName: defaultDj.habboName };
    let nextDj = { name: 'Por anunciar', habboName: 'estacionkusfm' };

    // 1. Check for manual override from Firebase
    if (onAirOverride?.currentDj) {
        currentDj = { name: onAirOverride.currentDj, habboName: onAirOverride.currentDj };
        if (onAirOverride.nextDj) {
            nextDj = { name: onAirOverride.nextDj, habboName: onAirOverride.nextDj };
        }
        return { current: currentDj, next: nextDj };
    }

    // 2. Check Azuracast for a live DJ
    if (azuracastStreamer && azuracastStreamer.toLowerCase() !== 'autodj' && azuracastStreamer.trim() !== '') {
        currentDj = { name: azuracastStreamer, habboName: azuracastStreamer };
        const now = new Date();
        const dayOfWeek = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][now.getUTCDay()];
        const currentTime = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}`;
        const todaySchedule = schedule
            .filter(item => item.day === dayOfWeek)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
        
        const nextShow = todaySchedule.find(item => item.startTime > currentTime);
        if (nextShow) {
             nextDj = { name: nextShow.dj, habboName: nextShow.dj };
        }
        return { current: currentDj, next: nextDj };
    }
    
    // 3. Fallback to schedule if no override and no one is live on Azuracast
    if (!schedule || schedule.length === 0) {
        return { current: currentDj, next: nextDj };
    }
    
    const now = new Date();
    const dayOfWeek = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][now.getUTCDay()];
    const currentTime = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}`;

    const todaySchedule = schedule
        .filter(item => item.day === dayOfWeek)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const currentShow = todaySchedule.find(item => currentTime >= item.startTime && currentTime <= item.endTime);
    if(currentShow) {
        currentDj = { name: currentShow.dj, habboName: currentShow.dj };
    }

    const nextShow = todaySchedule.find(item => item.startTime > currentTime);
    if (nextShow) {
        nextDj = { name: nextShow.dj, habboName: nextShow.dj };
    }
    
    return { current: currentDj, next: nextDj };
};


export default function HomeHeader() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [azuracastData, setAzuracastData] = useState<AzuracastData | null>(null);
  const [radioConfig, setRadioConfig] = useState<RadioConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [onAirOverride, setOnAirOverride] = useState<OnAirOverride | undefined>(undefined);
  const [djs, setDjs] = useState({ current: defaultDj, next: { name: 'Por anunciar', habboName: 'estacionkusfm' } });
  
  const [notificationPermission, setNotificationPermission] = useState('default');
  const { toast } = useToast();
  const lastNotifiedDj = useRef<string | null>(null);

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleNotificationClick = () => {
    if (!("Notification" in window)) {
      toast({ variant: 'destructive', title: 'Navegador no compatible', description: 'Tu navegador no soporta notificaciones.' });
      return;
    }
    if (notificationPermission === 'granted') {
      toast({ title: 'Notificaciones ya activadas' });
      return;
    }
    if (notificationPermission === 'denied') {
      toast({ variant: 'destructive', title: 'Notificaciones bloqueadas', description: 'Debes permitir las notificaciones en la configuración de tu navegador.' });
      return;
    }
    Notification.requestPermission().then(permission => {
      setNotificationPermission(permission);
      if (permission === 'granted') {
        toast({ title: '¡Notificaciones activadas!', description: 'Te avisaremos cuando un DJ se conecte.' });
        new Notification("Ekus FM", {
            body: "¡Gracias por activar las notificaciones!",
            icon: '/favicon.ico'
        });
      }
    });
  };

  useEffect(() => {
    const calculatedDjs = getDjs(schedule, onAirOverride, azuracastData);
    if (djs.current.name !== calculatedDjs.current.name) {
      setDjs(calculatedDjs);
      if (notificationPermission === 'granted' && calculatedDjs.current.name !== 'AutoDJ' && calculatedDjs.current.name !== lastNotifiedDj.current) {
        new Notification("¡DJ en Vivo!", {
          body: `${calculatedDjs.current.name} está ahora en directo. ¡No te lo pierdas!`,
          icon: `https://www.habbo.es/habbo-imaging/avatarimage?user=${calculatedDjs.current.habboName}&headonly=1&size=l`,
          badge: `https://www.habbo.es/habbo-imaging/avatarimage?user=${calculatedDjs.current.habboName}&headonly=1&size=s`,
        });
        lastNotifiedDj.current = calculatedDjs.current.name;
      }
    }
  }, [schedule, onAirOverride, azuracastData, notificationPermission, djs.current.name]);

  useEffect(() => {
    const configRef = ref(db, 'config');
    const unsubscribeConfig = onValue(configRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.apiUrl && data.listenUrl) {
          setRadioConfig({
              apiUrl: data.apiUrl,
              listenUrl: data.listenUrl,
          });
        } else {
            setRadioConfig({
                apiUrl: 'https://radio.kusmedios.lat/api/nowplaying/ekus-fm',
                listenUrl: 'http://radio.kusmedios.lat/listen/ekus-fm/radio.mp3'
            })
        }
    });
    
    const scheduleRef = ref(db, 'schedule');
    const unsubscribeSchedule = onValue(scheduleRef, (snapshot) => {
        const data = snapshot.val();
        const scheduleArray = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
        setSchedule(scheduleArray);
    });

    const onAirRef = ref(db, 'onAir');
    const unsubscribeOnAir = onValue(onAirRef, (snapshot) => {
        setOnAirOverride(snapshot.val());
    });

    return () => {
        unsubscribeConfig();
        unsubscribeSchedule();
        unsubscribeOnAir();
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!radioConfig?.apiUrl) {
          setIsLoading(false);
          return;
      };
      
      try {
        const response = await fetch(radioConfig.apiUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        const data: AzuracastData = await response.json();
        setAzuracastData(data);
      } catch (error) {
        console.error("Error fetching Azuracast data:", error);
        setAzuracastData(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (radioConfig) {
      fetchData();
      const interval = setInterval(fetchData, 15000); 
      return () => clearInterval(interval);
    }
  }, [radioConfig]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);
  
  useEffect(() => {
    if ("mediaSession" in navigator && azuracastData) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: azuracastData.now_playing.song.title,
        artist: azuracastData.now_playing.song.artist,
        album: 'Ekus FM',
        artwork: [{ src: azuracastData.now_playing.song.art, sizes: '500x500', type: 'image/jpeg' }],
      });
    }
  }, [azuracastData]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        if (radioConfig?.listenUrl) {
            audioRef.current.src = radioConfig.listenUrl;
            audioRef.current.play().catch(e => console.error("Error playing audio:", e));
        }
      }
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

  const songArt = azuracastData?.now_playing.song.art || "https://picsum.photos/seed/songart/100/100";
  const songTitle = azuracastData?.now_playing.song.title || 'Canción no disponible';
  const songArtist = azuracastData?.now_playing.song.artist || 'Artista no disponible';
  const listeners = azuracastData?.listeners.current ?? 0;
  
  return (
    <div className="w-full bg-card/80 backdrop-blur-sm border-b border-border">
      <audio ref={audioRef} src={radioConfig?.listenUrl || undefined} preload="none" />
      <div className="container mx-auto p-2 md:p-3 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        
        {/* Left Section: Song Info */}
        <div className="flex items-center gap-3 min-w-0 justify-start">
          {isLoading || !radioConfig ? (
            <>
              <Skeleton className="h-12 w-12 rounded-md" />
              <div className="space-y-2 hidden md:block">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </>
          ) : (
            <>
              <Image src={songArt} alt={songTitle} width={48} height={48} className="rounded-md h-12 w-12 object-cover" unoptimized/>
              <div className="min-w-0 hidden md:block">
                <h3 className="text-sm md:text-base font-semibold font-headline truncate" title={songTitle}>{songTitle}</h3>
                <p className="text-xs md:text-sm text-muted-foreground truncate" title={songArtist}>{songArtist}</p>
              </div>
            </>
          )}
        </div>
        
        {/* Center Section: Player Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="default" size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg" onClick={togglePlayPause} disabled={isLoading || !radioConfig}>
            {isPlaying ? <Pause className="h-5 w-5 md:h-6 md:w-6 fill-primary-foreground" /> : <Play className="h-5 w-5 md:h-6 md:w-6 fill-primary-foreground" />}
          </Button>
          <div className="hidden md:flex items-center gap-2 w-24">
            <Volume2 className="text-muted-foreground" />
            <Slider defaultValue={[volume]} max={100} step={1} onValueChange={(value) => setVolume(value[0])} />
          </div>
        </div>

        {/* Right Section: DJ, Listeners, Request */}
        <div className="flex items-center justify-end gap-2 md:gap-4">
           <div className="hidden lg:flex items-center gap-4 bg-black/50 p-2 rounded-lg">
              <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${djs.current.habboName}&headonly=1&size=s`} alt={djs.current.name} />
                      <AvatarFallback>{djs.current.name?.substring(0,2)}</AvatarFallback>
                  </Avatar>
                  <div>
                      <div className="text-xs font-bold text-white/90">AL AIRE</div>
                      <div className="text-xs text-muted-foreground">{djs.current.name}</div>
                  </div>
              </div>
          </div>
          <div className="flex items-center gap-2 bg-black/50 p-2 rounded-lg">
              <Users className="text-primary h-5 w-5" />
              <span className="font-bold text-white text-sm">{listeners}</span>
          </div>
          
          <Sheet>
              <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="hidden md:flex">
                  <Music className="h-4 w-4 mr-2" />
                  Petición
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
           <Button
              variant="ghost"
              size="icon"
              onClick={handleNotificationClick}
              className={cn(notificationPermission === 'granted' && 'text-primary')}
              title={
                notificationPermission === 'granted'
                  ? 'Notificaciones activadas'
                  : 'Activar notificaciones de DJ'
              }
            >
              <Bell className="h-5 w-5" />
            </Button>
        </div>
      </div>
    </div>
  );
}
