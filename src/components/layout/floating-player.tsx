

'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, Users, Music, Bell, Mic, X, Headphones } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useEffect, useRef, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
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
import { sendWebhook } from '@/lib/actions';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { OnAirData, RadioConfig, SongInfo } from '@/lib/types';


export default function FloatingPlayer() {
  const pathname = usePathname();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const [radioConfig, setRadioConfig] = useState<RadioConfig | null>(null);
  const [songInfo, setSongInfo] = useState<SongInfo>({ art: "", title: 'Cargando...', artist: 'Por favor espera', listeners: 0 });
  const [onAirData, setOnAirData] = useState<OnAirData | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  
  const [notificationPermission, setNotificationPermission] = useState('default');
  const { toast } = useToast();

  const lastNotifiedDj = useRef<string | null>(null);
  const lastNotifiedNextDj = useRef<string | null>(null);
  const lastNotifiedSong = useRef<string | null>(null);
  
  const [playerPreference, setPlayerPreference] = useState('classic');
  
  useEffect(() => {
    const storedPreference = localStorage.getItem('player-preference');
    if (storedPreference) {
      setPlayerPreference(storedPreference);
    }
  }, []);

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
              discordWebhookUrls: data.discordWebhookUrls,
          });
        }
        setIsLoading(false);
    });
    return () => unsubscribeConfig();
  }, []);

  // Fetch On-Air Data (both from radio API and Firebase override)
  useEffect(() => {
    if (!radioConfig) return;
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/nowplaying`);
        if (!response.ok) throw new Error('Network response was not ok');
        const apiData = await response.json();
        
        const newSongInfo: SongInfo = { art: '', title: 'Música Programada', artist: 'Habbospeed', listeners: 0 };
        let liveDjFromApi = 'AutoDJ';

        if (radioConfig.radioService === 'zenofm' && apiData?.data?.[0]) {
            const song = apiData.data[0];
            const [artist, title] = song.title.split(' - ') || ['Artista desconocido', 'Canción desconocida'];
            newSongInfo.title = title.trim();
            newSongInfo.artist = artist.trim();
            newSongInfo.art = song.image_url;
            newSongInfo.listeners = parseInt(song.listeners || '0');
        } else if (radioConfig.radioService === 'azuracast' && apiData?.now_playing) {
            newSongInfo.title = apiData.now_playing.song.title;
            newSongInfo.artist = apiData.now_playing.song.artist;
            newSongInfo.art = apiData.now_playing.song.art;
            newSongInfo.listeners = apiData.listeners.current;
            if (apiData.live.is_live && apiData.live.streamer_name) {
                liveDjFromApi = apiData.live.streamer_name;
            }
        }
        setSongInfo(newSongInfo);

        onValue(ref(db, 'onAir'), (snapshot) => {
            const override = snapshot.val();
            setOnAirData({
                currentDj: override?.currentDj || liveDjFromApi || 'AutoDJ',
                nextDj: override?.nextDj || 'N/A',
                isEvent: override?.isEvent || false
            });
        }, { onlyOnce: true });

      } catch (error) {
        console.error("Error fetching radio data:", error);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 15000); 
    return () => clearInterval(interval);
  }, [radioConfig]);


  // Handle all webhook logic
  useEffect(() => {
    if (!onAirData || !radioConfig?.discordWebhookUrls) return;
    
    const { currentDj, nextDj, isEvent } = onAirData;
    const { onAir, nextDj: nextDjHook, song: songHook } = radioConfig.discordWebhookUrls;
    const currentSongId = `${songInfo.title}-${songInfo.artist}`;
    
    // On Air DJ Changed
    if (onAir && currentDj !== lastNotifiedDj.current && currentDj !== 'AutoDJ') {
        sendWebhook('onAir', { currentDj, isEvent, songInfo });
        lastNotifiedDj.current = currentDj;
    } else if (currentDj === 'AutoDJ') {
        lastNotifiedDj.current = 'AutoDJ'; // Reset when back to auto
    }

    // Next DJ Changed
    if (nextDjHook && nextDj !== lastNotifiedNextDj.current) {
        sendWebhook('nextDj', { nextDj });
        lastNotifiedNextDj.current = nextDj;
    }
    
    // Song Changed
    if (songHook && currentSongId !== lastNotifiedSong.current) {
        sendWebhook('song', { songInfo });
        lastNotifiedSong.current = currentSongId;
    }

  }, [onAirData, songInfo, radioConfig]);


  // Handle Media Session Metadata
  useEffect(() => {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator && onAirData && isPlaying) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: songInfo.title,
        artist: songInfo.artist,
        album: `Habbospeed - ${onAirData.currentDj}`,
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
  }, [songInfo, onAirData, isPlaying]);


  // Handle Push Notifications
  useEffect(() => {
    if ("Notification" in window) setNotificationPermission(Notification.permission);
    
    if (onAirData && notificationPermission === 'granted' && onAirData.currentDj !== 'AutoDJ' && onAirData.currentDj !== lastNotifiedDj.current) {
        new Notification("¡DJ en Vivo!", {
          body: `${onAirData.currentDj} está ahora en directo. ¡No te lo pierdas!`,
          icon: `https://www.habbo.es/habbo-imaging/avatarimage?user=${onAirData.currentDj}&headonly=1&size=l`,
        });
        if(lastNotifiedDj) lastNotifiedDj.current = onAirData.currentDj;
    }
  }, [onAirData, notificationPermission]);

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

  const showPlayer = (pathname !== '/' || playerPreference === 'modern') && !['/login', '/register'].includes(pathname);
  if (!showPlayer) return null;


  const currentDjName = onAirData?.currentDj || 'AutoDJ';

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="h-16 w-16 rounded-full shadow-lg"
          aria-label="Abrir reproductor"
        >
          <Headphones className="h-8 w-8" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <audio ref={audioRef} preload="none" />
      <div className="md:hidden fixed bottom-24 right-4 z-50 flex flex-col gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button className="h-14 w-14 rounded-full bg-blue-600 shadow-lg hover:bg-blue-700">
              <Mic className="h-6 w-6" />
            </Button>
          </SheetTrigger>
            <SheetContent>
            <SheetHeader>
              <SheetTitle>Ahora Suena</SheetTitle>
            </SheetHeader>
            <div className="py-4 text-center">
                <Image src={songInfo.art || 'https://i.imgur.com/u31XFxN.png'} alt={songInfo.title} width={150} height={150} className="rounded-lg mx-auto mb-4" unoptimized/>
                <h3 className="font-bold text-lg">{songInfo.title}</h3>
                <p className="text-muted-foreground">{songInfo.artist}</p>
            </div>
          </SheetContent>
        </Sheet>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="h-14 w-14 rounded-full bg-primary shadow-lg">
              <Music className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Pide una Canción</SheetTitle>
              <SheetDescription>
                ¿Quieres escuchar tu canción favorita? ¡Házselo saber a nuestro DJ!
              </SheetDescription>
            </SheetHeader>
            <div className="py-4">
              <SongRequestForm />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-2 md:p-4">
        <div className="container mx-auto flex flex-col items-center gap-2">
           {/* DJ Info for Mobile */}
          {onAirData && (
             <div className="md:hidden flex items-center justify-center gap-2 bg-card/80 backdrop-blur-sm p-2 rounded-lg w-full max-w-sm">
                <Avatar className={`h-8 w-8 border-2 ${onAirData.isEvent ? 'border-yellow-400' : 'border-green-500'}`}>
                    <AvatarImage src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${currentDjName}&headonly=1&size=s`} alt={currentDjName} />
                    <AvatarFallback>{currentDjName.substring(0,2)}</AvatarFallback>
                </Avatar>
                <div className='text-left'>
                    <p className={`text-xs font-bold ${onAirData.isEvent ? 'text-yellow-400' : 'text-green-400'}`}>{onAirData.isEvent ? 'EVENTO' : 'AL AIRE'}</p>
                    <p className="text-sm font-headline font-bold leading-tight">{currentDjName}</p>
                </div>
            </div>
          )}

          <div className="w-full bg-card/80 backdrop-blur-sm border border-border rounded-lg shadow-2xl p-2 md:p-3 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              
              <div className="flex items-center gap-3 min-w-0 justify-start">
              {isLoading || !onAirData ? (
                  <>
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 hidden md:block">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                  </div>
                  </>
              ) : (
                  <>
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${currentDjName}&direction=2&head_direction=3&size=m`} alt={currentDjName} />
                        <AvatarFallback>{currentDjName.substring(0,2)}</AvatarFallback>
                    </Avatar>
                  <div className="min-w-0 hidden md:block">
                      <h3 className="text-sm md:text-base font-semibold font-headline truncate" title={currentDjName}>{currentDjName}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground truncate" title={`${songInfo.title} - ${songInfo.artist}`}>
                        {songInfo.title} - {songInfo.artist}
                      </p>
                  </div>
                  </>
              )}
              </div>
              
              <div className="flex items-center justify-center gap-4">
              <Button variant="default" size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg" onClick={togglePlayPause} disabled={isLoading || !radioConfig}>
                  {isPlaying ? <Pause className="h-5 w-5 md:h-6 md:w-6 fill-primary-foreground" /> : <Play className="h-5 w-5 md:h-6 md:w-6 fill-primary-foreground" />}
              </Button>
              </div>

              <div className="flex items-center justify-end gap-2 md:gap-4">
                <div className="hidden md:flex items-center gap-2 w-24">
                  <Volume2 className="text-muted-foreground" />
                  <Slider defaultValue={[volume]} max={100} step={1} onValueChange={(value) => setVolume(value[0])} />
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
                      ¿Quieres escuchar tu canción favorita? ¡Házselo saber a nuestro DJ!
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
                  className={cn('hidden md:inline-flex', notificationPermission === 'granted' && 'text-primary')}
                  title={notificationPermission === 'granted' ? 'Notificaciones activadas' : 'Activar notificaciones de DJ'}
                  >
                  <Bell className="h-5 w-5" />
              </Button>
               <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(true)}
                className="hidden md:inline-flex"
                title="Minimizar reproductor"
              >
                <X className="h-5 w-5" />
              </Button>
              </div>
          </div>
        </div>
      </div>
    </>
  );
}
