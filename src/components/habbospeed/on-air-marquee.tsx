
'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Radio, ArrowRight } from 'lucide-react';
import { getSchedule } from '@/lib/data';

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

// Helper to get next DJ
const getNextDj = (schedule: ScheduleItem[]) => {
    // This is a simplified logic. A real implementation would need to parse times and dates accurately.
    // For now, it just returns the first DJ in the schedule as a placeholder.
    if (schedule && schedule.length > 0) {
        return { name: schedule[0].dj, habboName: schedule[0].dj };
    }
    return { name: 'Por anunciar', habboName: 'estacionkusfm' };
};

export default function OnAirMarquee() {
  const [azuracastData, setAzuracastData] = useState<AzuracastData | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    const fetchAzuracast = async () => {
      try {
        const response = await fetch('https://radio.kusmedios.lat/api/nowplaying/ekus-fm');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setAzuracastData(data);
      } catch (error) {
        console.error("Error fetching Azuracast data:", error);
      }
    };

    const fetchSchedule = async () => {
        const scheduleData = await getSchedule();
        setSchedule(scheduleData);
    }

    fetchAzuracast();
    fetchSchedule();
    const interval = setInterval(fetchAzuracast, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const currentDjHabboName = azuracastData?.live.is_live ? azuracastData.live.streamer_name : defaultDj.habboName;
  const currentDjName = azuracastData?.live.is_live ? azuracastData.live.streamer_name : defaultDj.name;

  const nextDj = getNextDj(schedule);
  const nextDjHabboName = nextDj.habboName;
  const nextDjName = nextDj.name;

  const MarqueeContent = () => (
    <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 shrink-0">
            <Radio className="text-primary animate-pulse" />
            <span className="font-headline font-bold text-lg">AL AIRE</span>
            <Avatar className="h-9 w-9">
                <AvatarImage src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${currentDjHabboName}&headonly=1&size=s`} alt={currentDjName} />
                <AvatarFallback>{currentDjName?.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <span className="font-semibold">{currentDjName}</span>
        </div>
        <ArrowRight className="text-muted-foreground shrink-0" />
        <div className="flex items-center gap-3 shrink-0">
            <span className="font-headline font-bold text-lg text-muted-foreground">SIGUIENTE</span>
             <Avatar className="h-9 w-9">
                <AvatarImage src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${nextDjHabboName}&headonly=1&size=s`} alt={nextDjName} />
                <AvatarFallback>{nextDjName?.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <span className="font-semibold text-muted-foreground">{nextDjName}</span>
        </div>
    </div>
  );

  return (
    <div className="w-full bg-card border-b py-3 overflow-hidden">
        <div className="marquee-container">
            <div className="marquee-content flex gap-6">
                {/* Repeat content for smooth infinite scroll */}
                <MarqueeContent />
                <MarqueeContent />
                <MarqueeContent />
                <MarqueeContent />
            </div>
        </div>
    </div>
  );
}
