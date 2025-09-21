import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import ScheduleDisplay from '@/components/habbospeed/schedule-display';
import { getSchedule } from '@/lib/data';
import { Button } from '@/components/ui/button';

export default async function ScheduleManagementPage() {
  const scheduleData = await getSchedule();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <Calendar className="h-8 w-8 text-primary" />
          Gestión de Horarios
        </h1>
        <p className="text-muted-foreground mt-2">
          Añade, edita o elimina los programas de la semana.
        </p>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Programación Actual</CardTitle>
                <CardDescription>Este es el horario que se muestra en la web.</CardDescription>
            </div>
            <Button disabled>Añadir Programa</Button>
        </CardHeader>
        <CardContent>
          <ScheduleDisplay schedule={scheduleData} />
           <div className="mt-4 text-center p-4 bg-muted rounded-lg border-2 border-dashed">
                <p className="text-sm text-muted-foreground">La edición de horarios es un marcador de posición. Se requiere una base de datos (Firebase) para que esta sección sea funcional.</p>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
