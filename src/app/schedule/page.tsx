"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import ScheduleDisplay from '@/components/habbospeed/schedule-display';
import { useState, useEffect } from 'react';
import { scheduleApi } from '@/lib/api';
import { ScheduleItem } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';


export default function SchedulePage() {
  const [scheduleData, setScheduleData] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const data: any = await scheduleApi.getAll();
        const scheduleArray = data.map((item: any) => ({
          id: item._id,
          day: item.day,
          startTime: item.startTime,
          endTime: item.endTime,
          show: item.show,
          dj: item.dj
        }));
        setScheduleData(scheduleArray);
      } catch (error) {
        console.error('Error fetching schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);


  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-xl md:text-2xl">
            <Calendar className="text-primary" />
            Horario de la Radio
          </CardTitle>
          <CardDescription>
            ¡Consulta nuestra programación semanal de programas y DJs. No te pierdas ni un beat!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="border rounded-lg p-4 space-y-2">
                {Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
             </div>
          ) : (
             <ScheduleDisplay schedule={scheduleData} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
