'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { getSchedule } from "@/lib/data";
import Image from "next/image";

interface AzuracastData {
  live: {
    is_live: boolean;
    streamer_name: string;
  };
}

type ScheduleItem = {
    day: string;
    time: string;
    show: string;
    dj: string;
}

const defaultDj = {
    name: 'AutoDJ',
    habboName: 'estacionkusfm',
};

const getNextDj = (schedule: ScheduleItem[]) => {
    if (schedule && schedule.length > 0) {
        // This is a simplified logic, a real implementation would check current time
        return { name: schedule[0].dj, habboName: schedule[0].dj };
    }
    return { name: 'Por anunciar', habboName: 'estacionkusfm' };
};

export default function OnAirDjs() {
    const [azuracastData, setAzuracastData] = useState<AzuracastData | null>(null);
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
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

        const fetchSchedule = async () => {
            const scheduleData = await getSchedule();
            setSchedule(scheduleData);
        }

        fetchData();
        fetchSchedule();
        const interval = setInterval(fetchData, 30000); 
        return () => clearInterval(interval);
    }, []);

    const currentDjHabboName = azuracastData?.live.is_live && azuracastData.live.streamer_name 
        ? azuracastData.live.streamer_name 
        : defaultDj.habboName;
    
    const currentDjName = azuracastData?.live.is_live && azuracastData.live.streamer_name 
        ? azuracastData.live.streamer_name 
        : defaultDj.name;

    const nextDj = getNextDj(schedule);

    if (isLoading) {
        return (
            <Card className="mt-8">
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-center min-h-[120px]">
                   <div className="col-span-1 md:col-span-2 flex justify-center items-center">
                     <Image 
                        src="https://files.habboemotion.com/resources/images/seasons/habboween/handsuphabbo.gif" 
                        alt="Cargando..."
                        width={60}
                        height={100}
                        unoptimized
                    />
                   </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="mt-8">
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-border">
                <div className="flex items-center justify-center gap-4 p-4">
                    <Avatar className="h-16 w-16 border-4 border-green-500">
                        <AvatarImage src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${currentDjHabboName}&headonly=1&size=l`} alt={currentDjName} />
                        <AvatarFallback>{currentDjName.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm text-muted-foreground">Al Aire</p>
                        <p className="text-xl font-bold font-headline">{currentDjName}</p>
                    </div>
                </div>
                <div className="flex items-center justify-center gap-4 p-4">
                    <Avatar className="h-16 w-16 border-4 border-primary">
                         <AvatarImage src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${nextDj.habboName}&headonly=1&size=l`} alt={nextDj.name} />
                        <AvatarFallback>{nextDj.name.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm text-muted-foreground">Siguiente DJ</p>
                        <p className="text-xl font-bold font-headline">{nextDj.name}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
