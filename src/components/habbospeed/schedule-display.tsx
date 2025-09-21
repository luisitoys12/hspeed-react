import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { schedule as mockSchedule } from '@/lib/data';

type ScheduleItem = {
    day: string;
    time: string;
    show: string;
    dj: string;
}

type ScheduleDisplayProps = {
    schedule?: ScheduleItem[];
}

export default function ScheduleDisplay({ schedule = mockSchedule }: ScheduleDisplayProps) {
  return (
    <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px] font-headline">Día</TableHead>
              <TableHead className="w-[200px] font-headline">Hora (UTC)</TableHead>
              <TableHead className="font-headline">Programa</TableHead>
              <TableHead className="text-right font-headline">DJ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedule.map((item, index) => (
              <TableRow key={`${item.day}-${index}`}>
                <TableCell className="font-medium">{item.day}</TableCell>
                <TableCell>{item.time}</TableCell>
                <TableCell className="font-semibold text-primary">{item.show}</TableCell>
                <TableCell className="text-right">{item.dj}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </div>
  );
}