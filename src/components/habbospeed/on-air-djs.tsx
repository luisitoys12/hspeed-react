
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

interface AzuracastData {
  live: {
    is_live: boolean;
    streamer_name: string;
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
        if (onAirOverride.nextDj) {
            nextDj = { name: onAirOverride.nextDj, habboName: onAirOverride.nextDj };
        }
        return { current: currentDj, next: nextDj };
    }
    
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
                nextDj = { name: nextBooking.djName, habboName: nextBooking.djName };
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

    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await fetch(`https://radio.kusmedios.lat/api/nowplaying/ekus-fm?_=${new Date().getTime()}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setAzuracastData(data);
          } catch (error) {
            console.error("Error fetching Azuracast data:", error);
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
        const calculatedDjs = getDjs(bookings, onAirOverride, azuracastData);
        setDjs(calculatedDjs);
    }, [bookings, onAirOverride, azuracastData]);

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
        <div className="mt-8 bg-card/80 backdrop-blur-sm rounded-lg">
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-border">
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
        </div>
    )
}
