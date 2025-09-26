

'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState, useRef, useTransition } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { Heart } from 'lucide-react';
import { OnAirData } from '@/lib/types';
import { Button } from "../ui/button";
import { addLikeToDj } from "@/lib/actions";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const defaultDj = {
    name: 'Habbospeed',
    habboName: 'Habbospeed',
};

type Bookings = {
  [day: string]: {
    [hour: string]: {
      djName: string;
      uid: string;
    };
  };
};

const getDjs = (bookings: Bookings, onAirOverride?: OnAirData, azuracastStreamer?: string) => {
    let currentDj = { name: defaultDj.name, habboName: defaultDj.habboName, isEvent: false };
    let nextDj = { name: defaultDj.name, habboName: defaultDj.habboName };

    // 1. Manual override has the highest priority
    if (onAirOverride?.currentDj) {
        currentDj = { name: onAirOverride.currentDj, habboName: onAirOverride.currentDj, isEvent: onAirOverride.isEvent || false };
    }
    if (onAirOverride?.nextDj) {
        nextDj = { name: onAirOverride.nextDj, habboName: onAirOverride.nextDj };
    }
     if (onAirOverride?.currentDj) return { current: currentDj, next: nextDj };
    
    // 2. Azuracast live streamer takes precedence over bookings
    if (azuracastStreamer && azuracastStreamer.toLowerCase() !== 'autodj' && azuracastStreamer.trim() !== '') {
        currentDj = { name: azuracastStreamer, habboName: azuracastStreamer, isEvent: false };
    }

    // 3. Fallback to booking grid if no override or live streamer
    if (Object.keys(bookings).length > 0) {
        const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const mexicoTime = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
        
        const currentDayName = daysOfWeek[mexicoTime.getDay()];
        const currentHour = mexicoTime.getHours();
        const currentHourString = `${currentHour.toString().padStart(2, '0')}00`;

        if (!azuracastStreamer || azuracastStreamer.toLowerCase() === 'autodj') {
            const currentBooking = bookings[currentDayName]?.[currentHourString];
            if (currentBooking) {
                currentDj = { name: currentBooking.djName, habboName: currentBooking.djName, isEvent: false };
            }
        }
        
        let nextHour = currentHour + 1;
        let nextDayIndex = mexicoTime.getDay();
        
        for (let i = 0; i < 48; i++) { 
            if (nextHour > 23) {
                nextHour = 0;
                nextDayIndex = (nextDayIndex + 1) % 7;
            }
            
            const nextDayName = daysOfWeek[nextDayIndex];
            const nextHourString = `${nextHour.toString().padStart(2, '0')}00`;
            const nextBooking = bookings[nextDayName]?.[nextHourString];

            if (nextBooking) {
                if (!onAirOverride?.nextDj) { 
                    nextDj = { name: nextBooking.djName, habboName: nextBooking.djName };
                }
                break;
            }
            nextHour++;
        }
    }
    
    return { current: currentDj, next: nextDj };
};


export default function OnAirDjs() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [azuracastStreamer, setAzuracastStreamer] = useState<string | undefined>(undefined);
    const [bookings, setBookings] = useState<Bookings>({});
    const [onAirOverride, setOnAirOverride] = useState<OnAirData | undefined>(undefined);
    const [djs, setDjs] = useState({ current: { ...defaultDj, isEvent: false }, next: { name: defaultDj.name, habboName: defaultDj.habboName } });
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await fetch(`/api/nowplaying`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
             if (data.live.is_live) {
                setAzuracastStreamer(data.live.streamer_name);
            } else {
                setAzuracastStreamer('AutoDJ');
            }
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

    useEffect(() => {
        const calculatedDjs = getDjs(bookings, onAirOverride, azuracastStreamer);
        setDjs(calculatedDjs);
    }, [bookings, onAirOverride, azuracastStreamer]);

    const handleLike = () => {
        if (!user) {
            toast({ variant: 'destructive', title: '¡Inicia sesión para apoyar!'});
            return;
        }
        if (djs.current.name === defaultDj.name) return;

        startTransition(async () => {
            const result = await addLikeToDj(user.uid, djs.current.name);
            if (result.success) {
                toast({ title: '¡Gracias por tu apoyo!', description: `Has dado un like a ${djs.current.name}.` });
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.message });
            }
        });
    }

    if (isLoading) {
        return (
            <div className="bg-card/80 backdrop-blur-sm rounded-lg">
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
        <div className="bg-card/80 backdrop-blur-sm rounded-lg space-y-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-border">
                <Button 
                    variant="ghost" 
                    className="flex items-center justify-center gap-4 p-4 h-full disabled:opacity-100"
                    onClick={handleLike}
                    disabled={isPending || djs.current.name === defaultDj.name}
                >
                    <Avatar className={`h-16 w-16 border-4 ${djs.current.isEvent ? 'border-yellow-400' : 'border-green-500'}`}>
                        <AvatarImage src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${djs.current.habboName}&headonly=1&size=l`} alt={djs.current.name} />
                        <AvatarFallback>{djs.current.name.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                         <div className="flex items-center gap-2">
                           <p className="text-sm text-muted-foreground">Dale al DJ tu like de apoyo</p>
                           <Heart className="h-4 w-4 text-pink-500/80"/>
                        </div>
                        <p className="text-xl font-bold font-headline">{djs.current.name}</p>
                    </div>
                </Button>
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
        </div>
    )
}
