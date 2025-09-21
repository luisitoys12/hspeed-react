import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import ScheduleDisplay from '@/components/habbospeed/schedule-display';

export default function SchedulePage() {
  // En una aplicación real, obtendrías los datos del horario aquí
  // y los pasarías como prop a ScheduleDisplay.
  // Para este ejemplo, usa datos de ejemplo por defecto.

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-2xl">
            <Calendar className="text-primary" />
            Horario de la Radio
          </CardTitle>
          <CardDescription>
            ¡Consulta nuestra programación semanal de programas y DJs. No te pierdas ni un beat!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScheduleDisplay />
        </CardContent>
      </Card>
    </div>
  );
}