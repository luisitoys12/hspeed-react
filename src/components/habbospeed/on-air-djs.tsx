
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { ScheduleItem } from "@/lib/types";

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

const defaultDj = {
    name: 'AutoDJ',
    habboName: 'estacionkusfm',
};

const getDjs = (schedule: ScheduleItem[], onAirOverride?: OnAirOverride, azuracastData?: AzuracastData | null) => {
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
    
    // 2. Azuracast live streamer takes precedence over schedule
    const azuracastStreamer = azuracastData?.live.is_live ? azuracastData.live.streamer_name : '';
    if (azuracastStreamer && azuracastStreamer.toLowerCase() !== 'autodj' && azuracastStreamer.trim() !== '') {
        currentDj = { name: azuracastStreamer, habboName: azuracastStreamer };
    }

    // 3. Fallback to schedule if no override
    if (schedule && schedule.length > 0) {
        // Simulating Mexico City Time (UTC-6)
        const now = new Date();
        const mexicoTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
        
        const dayOfWeek = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][mexicoTime.getDay()];
        const currentTime = `${mexicoTime.getHours().toString().padStart(2, '0')}:${mexicoTime.getMinutes().toString().padStart(2, '0')}`;

        const todaySchedule = schedule
            .filter(item => item.day === dayOfWeek)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

        // Find current show based on schedule, only if no one is live on Azuracast
        if (!azuracastStreamer || azuracastStreamer.toLowerCase() === 'autodj') {
            const currentShow = todaySchedule.find(item => currentTime >= item.startTime && currentTime <= item.endTime);
            if(currentShow) {
                currentDj = { name: currentShow.dj, habboName: currentShow.dj };
            }
        }
        
        // Find next show based on schedule
        const nextShow = todaySchedule.find(item => item.startTime > currentTime);
        if (nextShow) {
            nextDj = { name: nextShow.dj, habboName: nextShow.dj };
        } else {
             // If no more shows today, find the first show of the next day
             const nextDayIndex = (mexicoTime.getDay() + 1) % 7;
             const nextDayName = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][nextDayIndex];
             const nextDaySchedule = schedule.filter(item => item.day === nextDayName).sort((a, b) => a.startTime.localeCompare(b.startTime));
             if(nextDaySchedule.length > 0) {
                 nextDj = { name: nextDaySchedule[0].dj, habboName: nextDaySchedule[0].dj };
             }
        }
    }
    
    return { current: currentDj, next: nextDj };
};


export default function OnAirDjs() {
    const [azuracastData, setAzuracastData] = useState<AzuracastData | null>(null);
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [onAirOverride, setOnAirOverride] = useState<OnAirOverride | undefined>(undefined);
    const [djs, setDjs] = useState({ current: defaultDj, next: { name: 'Por anunciar', habboName: 'estacionkusfm' } });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
          try {
            // Using a cache-busting query parameter to get fresh data
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

        fetchData();
        const interval = setInterval(fetchData, 30000); 
        
        return () => {
            clearInterval(interval);
            unsubscribeSchedule();
            unsubscribeOnAir();
        };
    }, []);

    useEffect(() => {
        const calculatedDjs = getDjs(schedule, onAirOverride, azuracastData);
        setDjs(calculatedDjs);
    }, [schedule, onAirOverride, azuracastData]);

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
