import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScheduleItem } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';


type ScheduleDisplayProps = {
    schedule: ScheduleItem[];
}

export default function ScheduleDisplay({ schedule }: ScheduleDisplayProps) {
  const daysOrder = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
  const sortedSchedule = [...schedule].sort((a, b) => {
    const dayIndexA = daysOrder.indexOf(a.day);
    const dayIndexB = daysOrder.indexOf(b.day);
    if (dayIndexA !== dayIndexB) {
      return dayIndexA - dayIndexB;
    }
    // Sort by start time
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px] font-headline">Día</TableHead>
              <TableHead className="w-[150px] font-headline">Hora (UTC)</TableHead>
              <TableHead className="font-headline">Programa</TableHead>
              <TableHead className="text-right font-headline">DJ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSchedule.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.day}</TableCell>
                <TableCell>{item.startTime} - {item.endTime}</TableCell>
                <TableCell className="font-semibold text-primary">{item.show}</TableCell>
                <TableCell className="text-right">
                  <div className='flex items-center justify-end gap-2'>
                    <span>{item.dj}</span>
                     <Avatar className="h-6 w-6">
                        <AvatarImage src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${item.dj}&headonly=1&size=s`} />
                        <AvatarFallback>{item.dj.substring(0,1)}</AvatarFallback>
                    </Avatar>
                  </div>
                </TableCell>
              </TableRow>
            ))}
             {sortedSchedule.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                        No hay programas en el horario. ¡Añade uno desde el panel de administración!
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
    </div>
  );
}
