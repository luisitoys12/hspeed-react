import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import ScheduleDisplay from '@/components/habbospeed/schedule-display';
import { getSchedule } from '@/lib/data';

export default async function SchedulePage() {
  const scheduleData = await getSchedule();

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
          <ScheduleDisplay schedule={scheduleData} />
        </CardContent>
      </Card>
    </div>
  );
}
