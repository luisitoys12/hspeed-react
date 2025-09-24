

'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { Play, Pause, Volume2, Users } from 'lucide-react';
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";

interface AzuracastData {
  live: {
    is_live: boolean;
    streamer_name: string;
  };
  listeners: { current: number; };
  now_playing: {
    song: { text: string; artist: string; title: string; art: string; };
  };
}

interface OnAirOverride {
    currentDj: string;
    nextDj: string;
}

type Bookings = {
  [day: string]: {
    [hour: string]: { // hour is like "0300"
      djName: string;
      uid: string;
    };
  };
};

const defaultDj = {
    name: 'AutoDJ',
    habboName: 'estacionkusfm',
};

const getDjs = (bookings: Bookings, onAirOverride?: OnAirOverride, azuracastData?: AzuracastData | null) => {
    let currentDj = { name: defaultDj.name, habboName: defaultDj.habboName };
    let nextDj = { name: 'Por anunciar', habboName: 'estacionkusfm' };

    // 1. Manual override has the highest priority
    if (onAirOverride?.currentDj) {
        currentDj = { name: onAirOverride.currentDj, habboName: onAirOverride.currentDj };
    }
    if (onAirOverride?.nextDj) {
        nextDj = { name: onAirOverride.nextDj, habboName: onAirOverride.nextDj };
    }
    if (onAirOverride?.currentDj) return { current: currentDj, next: nextDj };
    
    // 2. Azuracast live streamer takes precedence over bookings
    const azuracastStreamer = azuracastData?.live.is_live ? azuracastData.live.streamer_name : '';
    if (azuracastStreamer && azuracastStreamer.toLowerCase() !== 'autodj' && azuracastStreamer.trim() !== '') {
        currentDj = { name: azuracastStreamer, habboName: azuracastStreamer };
    }

    // 3. Fallback to booking grid if no override or live streamer
    if (Object.keys(bookings).length > 0) {
        const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const mexicoTime = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
        
        const currentDayName = daysOfWeek[mexicoTime.getDay()];
        const currentHour = mexicoTime.getHours();
        const currentHourString = `${currentHour.toString().padStart(2, '0')}00`;

        // Find current DJ from bookings if not live on Azuracast
        if (!azuracastStreamer || azuracastStreamer.toLowerCase() === 'autodj') {
            const currentBooking = bookings[currentDayName]?.[currentHourString];
            if (currentBooking) {
                currentDj = { name: currentBooking.djName, habboName: currentBooking.djName };
            }
        }
        
        // Find next DJ from bookings
        let nextHour = currentHour + 1;
        let nextDayIndex = mexicoTime.getDay();
        
        for (let i = 0; i < 48; i++) { // Look ahead up to 48 hours
            if (nextHour > 23) {
                nextHour = 0;
                nextDayIndex = (nextDayIndex + 1) % 7;
            }
            
            const nextDayName = daysOfWeek[nextDayIndex];
            const nextHourString = `${nextHour.toString().padStart(2, '0')}00`;
            const nextBooking = bookings[nextDayName]?.[nextHourString];

            if (nextBooking) {
                if (!onAirOverride?.nextDj) { // Check if nextDj is not manually set
                    nextDj = { name: nextBooking.djName, habboName: nextBooking.djName };
                }
                break; // Found the next one
            }
            nextHour++;
        }
    }
    
    return { current: currentDj, next: nextDj };
};

export default function OnAirDjs() {
    const [azuracastData, setAzuracastData] = useState<AzuracastData | null>(null);
    const [bookings, setBookings] = useState<Bookings>({});
    const [onAirOverride, setOnAirOverride] = useState<OnAirOverride | undefined>(undefined);
    const [djs, setDjs] = useState({ current: defaultDj, next: { name: 'Por anunciar', habboName: 'estacionkusfm' } });
    const [isLoading, setIsLoading] = useState(true);
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(50);
    const audioRef = useRef<HTMLAudioElement>(null);
    
    const [radioConfig, setRadioConfig] = useState<{listenUrl: string} | null>(null);

    // Get Radio Config from Firebase for listenUrl
    useEffect(() => {
        const configRef = ref(db, 'config');
        const unsubscribe = onValue(configRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.listenUrl) {
                setRadioConfig({ listenUrl: data.listenUrl });
            }
        });
        return () => unsubscribe();
    }, []);

    // Fetch radio data
    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await fetch(`/api/nowplaying`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setAzuracastData(data);
          } catch (error) {
            console.error("Error fetching Now Playing data:", error);
          } finally {
            setIsLoading(false);
          }
        };
        
        const bookingsRef = ref(db, 'bookings');
        const unsubscribeBookings = onValue(bookingsRef, (snapshot) => {
            setBookings(snapshot.val() || {});
        });

        const onAirRef = ref(db, 'onAir');
        const unsubscribeOnAir = onValue(onAirRef, (snapshot) => {
            setOnAirOverride(snapshot.val());
        });

        fetchData();
        const interval = setInterval(fetchData, 30000); 
        
        return () => {
            clearInterval(interval);
            unsubscribeBookings();
            unsubscribeOnAir();
        };
    }, []);

    // Calculate DJs
    useEffect(() => {
        const calculatedDjs = getDjs(bookings, onAirOverride, azuracastData);
        setDjs(calculatedDjs);
    }, [bookings, onAirOverride, azuracastData]);

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


    if (isLoading) {
        return (
            <div className="mt-8 bg-card/80 backdrop-blur-sm rounded-lg">
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-center min-h-[120px]">
                   <div className="col-span-1 md:col-span-2 flex justify-center items-center">
                     <Image 
                        src="https://files.habboemotion.com/resources/images/seasons/habboween/handsuphabbo.gif" 
                        alt="Cargando..."
                        width={60}
                        height={100}
                        unoptimized
                    />
                   </div>
                </div>
            </div>
        )
    }

    return (
        <div className="mt-8 bg-card/80 backdrop-blur-sm rounded-lg space-y-4 p-4">
             <audio ref={audioRef} preload="none" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-border">
                <div className="flex items-center justify-center gap-4 p-4">
                    <Avatar className="h-16 w-16 border-4 border-green-500">
                        <AvatarImage src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${djs.current.habboName}&headonly=1&size=l`} alt={djs.current.name} />
                        <AvatarFallback>{djs.current.name.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm text-muted-foreground">Al Aire</p>
                        <p className="text-xl font-bold font-headline">{djs.current.name}</p>
                    </div>
                </div>
                <div className="flex items-center justify-center gap-4 p-4">
                    <Avatar className="h-16 w-16 border-4 border-primary">
                         <AvatarImage src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${djs.next.habboName}&headonly=1&size=l`} alt={djs.next.name} />
                        <AvatarFallback>{djs.next.name.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm text-muted-foreground">Siguiente DJ</p>
                        <p className="text-xl font-bold font-headline">{djs.next.name}</p>
                    </div>
                </div>
            </div>

            <div className="bg-background/50 rounded-lg p-2 md:p-3 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                <div className="flex items-center gap-3 min-w-0 justify-start">
                    <Image src={azuracastData?.now_playing.song.art || "https://picsum.photos/seed/songart/100/100"} alt={azuracastData?.now_playing.song.title || 'Canción'} width={48} height={48} className="rounded-md h-12 w-12 object-cover" unoptimized/>
                    <div className="min-w-0 hidden md:block">
                        <h3 className="text-sm md:text-base font-semibold font-headline truncate" title={azuracastData?.now_playing.song.title}>{azuracastData?.now_playing.song.title || 'Cargando...'}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground truncate" title={azuracastData?.now_playing.song.artist}>{azuracastData?.now_playing.song.artist || '...'}</p>
                    </div>
                </div>
                
                <div className="flex items-center justify-center gap-4">
                    <Button variant="default" size="icon" className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg" onClick={togglePlayPause} disabled={isLoading || !radioConfig}>
                        {isPlaying ? <Pause className="h-6 w-6 fill-primary-foreground" /> : <Play className="h-6 w-6 fill-primary-foreground" />}
                    </Button>
                </div>

                <div className="flex items-center justify-end gap-2 md:gap-4">
                    <div className="flex items-center gap-2">
                        <Users className="text-primary h-5 w-5" />
                        <span className="font-bold text-white text-sm">{azuracastData?.listeners.current || 0}</span>
                    </div>
                    <div className="hidden md:flex items-center gap-2 w-24">
                        <Volume2 className="text-muted-foreground" />
                        <Slider defaultValue={[volume]} max={100} step={1} onValueChange={(value) => setVolume(value[0])} />
                    </div>
                </div>
            </div>
        </div>
    )
}
