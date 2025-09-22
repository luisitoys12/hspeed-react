

'use client';

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
import { db, messaging, getToken } from '@/lib/firebase';
import { ref, onValue, set } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

// Estructura de datos de Azuracast
interface AzuracastData {
  station: { listen_url: string; };
  listeners: { current: number; };
  now_playing: {
    song: { text: string; artist: string; title: string; art: string; };
  };
  live: { is_live: boolean; streamer_name: string; };
}

// Estructura de datos de ZenoFM
interface ZenoFMData {
    data: {
        stream: string;
        title: string;
        listeners: string;
        image_url: string;
    }[]
}

interface OnAirOverride {
    currentDj: string;
    nextDj: string;
}

interface RadioConfig {
    radioService: 'azuracast' | 'zenofm';
    apiUrl: string;
    listenUrl: string;
}

export default function FloatingPlayer() {
  const pathname = usePathname();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [radioConfig, setRadioConfig] = useState<RadioConfig | null>(null);
  const [songInfo, setSongInfo] = useState({ art: "https://picsum.photos/seed/songart/100/100", title: 'Cargando...', artist: 'Por favor espera', listeners: 0 });
  const [djName, setDjName] = useState('AutoDJ');
  
  const [isLoading, setIsLoading] = useState(true);
  
  const [notificationPermission, setNotificationPermission] = useState('default');
  const { toast } = useToast();
  const lastNotifiedDj = useRef<string | null>(null);

  // Get Radio Config from Firebase
  useEffect(() => {
    const configRef = ref(db, 'config');
    const unsubscribeConfig = onValue(configRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.apiUrl && data.listenUrl) {
          setRadioConfig({
              radioService: data.radioService || 'azuracast',
              apiUrl: data.apiUrl,
              listenUrl: data.listenUrl,
          });
        }
        setIsLoading(false);
    });
    return () => unsubscribeConfig();
  }, []);

  // Fetch Now Playing Data
  useEffect(() => {
    const fetchData = async () => {
      if (!radioConfig) return;

      try {
        const response = await fetch(`/api/nowplaying`);
        if (!response.ok) throw new Error('Network response was not ok');

        if (radioConfig.radioService === 'zenofm') {
            const data: ZenoFMData = await response.json();
            const song = data?.data?.[0];
            const [artist, title] = song?.title.split(' - ') || ['Artista desconocido', 'Canción desconocida'];
            setSongInfo({
                art: song?.image_url || "https://picsum.photos/seed/songart/100/100",
                title: title.trim(),
                artist: artist.trim(),
                listeners: parseInt(song?.listeners || '0'),
            });
            // Zeno no provee info de DJ en la API
        } else { // Azuracast
            const data: AzuracastData = await response.json();
            setSongInfo({
                art: data.now_playing.song.art,
                title: data.now_playing.song.title,
                artist: data.now_playing.song.artist,
                listeners: data.listeners.current,
            });
            if (data.live.is_live && data.live.streamer_name) {
                setDjName(data.live.streamer_name);
            }
        }
      } catch (error) {
        console.error("Error fetching radio data:", error);
      }
    };
    
    if (radioConfig) {
      fetchData();
      const interval = setInterval(fetchData, 15000); 
      return () => clearInterval(interval);
    }
  }, [radioConfig]);

  // Handle Media Session Metadata
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: songInfo.title,
        artist: songInfo.artist,
        album: `Habbospeed - ${djName}`,
        artwork: [
          { src: songInfo.art, sizes: '96x96', type: 'image/png' },
          { src: songInfo.art, sizes: '128x128', type: 'image/png' },
          { src: songInfo.art, sizes: '192x192', type: 'image/png' },
          { src: songInfo.art, sizes: '256x256', type: 'image/png' },
          { src: songInfo.art, sizes: '384x384', type: 'image/png' },
          { src: songInfo.art, sizes: '512x512', type: 'image/png' },
        ],
      });
    }
  }, [songInfo, djName]);


  // Handle Notifications
  useEffect(() => {
    if ("Notification" in window) setNotificationPermission(Notification.permission);
    
    if (notificationPermission === 'granted' && djName !== 'AutoDJ' && djName !== lastNotifiedDj.current) {
        new Notification("¡DJ en Vivo!", {
          body: `${djName} está ahora en directo. ¡No te lo pierdas!`,
          icon: `https://www.habbo.es/habbo-imaging/avatarimage?user=${djName}&headonly=1&size=l`,
        });
        lastNotifiedDj.current = djName;
    }
  }, [djName, notificationPermission]);

  const handleNotificationClick = async () => {
    if (!messaging) return;
    if (notificationPermission === 'granted') {
      toast({ title: 'Notificaciones ya activadas' });
      return;
    }
    if (notificationPermission === 'denied') {
      toast({ variant: 'destructive', title: 'Notificaciones bloqueadas', description: 'Debes permitir las notificaciones en la configuración de tu navegador.' });
      return;
    }
    try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        if (permission === 'granted') {
            toast({ title: '¡Notificaciones activadas!', description: 'Te avisaremos cuando un DJ se conecte.' });
            const currentToken = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' });
            if (currentToken) {
                const tokenRef = ref(db, `fcmTokens/${currentToken}`);
                await set(tokenRef, true);
            }
        }
    } catch(error) {
        console.error('Error getting notification permission', error);
    }
  };

  // Audio Controls
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);
  
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !radioConfig) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.src = radioConfig.listenUrl;
      audio.load();
      audio.play().catch(e => console.error("Error playing audio:", e));
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
  }, [audioRef]);

  if (pathname === '/') return null;

  return (
    <>
      <audio ref={audioRef} preload="none" />
      <div className="fixed bottom-0 left-0 right-0 z-50 p-2 md:p-4">
        <div className="container mx-auto">
          <div className="w-full bg-card/80 backdrop-blur-sm border border-border rounded-lg shadow-2xl p-2 md:p-3 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              
              <div className="flex items-center gap-3 min-w-0 justify-start">
              {isLoading ? (
                  <>
                  <Skeleton className="h-12 w-12 rounded-md" />
                  <div className="space-y-2 hidden md:block">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                  </div>
                  </>
              ) : (
                  <>
                  <Image src={songInfo.art} alt={songInfo.title} width={48} height={48} className="rounded-md h-12 w-12 object-cover" unoptimized/>
                  <div className="min-w-0 hidden md:block">
                      <h3 className="text-sm md:text-base font-semibold font-headline truncate" title={songInfo.title}>{songInfo.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground truncate" title={songInfo.artist}>{songInfo.artist}</p>
                  </div>
                  </>
              )}
              </div>
              
              <div className="flex items-center justify-center gap-4">
              <Button variant="default" size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg" onClick={togglePlayPause} disabled={isLoading || !radioConfig}>
                  {isPlaying ? <Pause className="h-5 w-5 md:h-6 md:w-6 fill-primary-foreground" /> : <Play className="h-5 w-5 md:h-6 md:w-6 fill-primary-foreground" />}
              </Button>
              <div className="hidden md:flex items-center gap-2 w-24">
                  <Volume2 className="text-muted-foreground" />
                  <Slider defaultValue={[volume]} max={100} step={1} onValueChange={(value) => setVolume(value[0])} />
              </div>
              </div>

              <div className="flex items-center justify-end gap-2 md:gap-4">
              <div className="hidden lg:flex items-center gap-4 bg-black/50 p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                          <AvatarImage src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${djName}&headonly=1&size=s`} alt={djName} />
                          <AvatarFallback>{djName?.substring(0,2)}</AvatarFallback>
                      </Avatar>
                      <div>
                          <div className="text-xs font-bold text-white/90">AL AIRE</div>
                          <div className="text-xs text-muted-foreground">{djName}</div>
                      </div>
                  </div>
              </div>
              <div className="flex items-center gap-2 bg-black/50 p-2 rounded-lg">
                  <Users className="text-primary h-5 w-5" />
                  <span className="font-bold text-white text-sm">{songInfo.listeners}</span>
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
                  title={notificationPermission === 'granted' ? 'Notificaciones activadas' : 'Activar notificaciones de DJ'}
                  >
                  <Bell className="h-5 w-5" />
                  </Button>
              </div>
          </div>
        </div>
      </div>
    </>
  );
}
