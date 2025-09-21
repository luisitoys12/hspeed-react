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
        // When a DJ is live, determining the "next" one from the schedule can be complex.
        // We can simplify this or implement more complex logic. For now, let's keep it simple.
        // Let's try to find the next one in the schedule.
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

    // Find current based on schedule
    const currentShow = todaySchedule.find(item => currentTime >= item.startTime && currentTime <= item.endTime);
    if(currentShow) {
        currentDj = { name: currentShow.dj, habboName: currentShow.dj };
    }

    // Find next based on schedule
    const nextShow = todaySchedule.find(item => item.startTime > currentTime);
    if (nextShow) {
        nextDj = { name: nextShow.dj, habboName: nextShow.dj };
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
            const response = await fetch('https://radio.kusmedios.lat/api/nowplaying/ekus-fm');
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
