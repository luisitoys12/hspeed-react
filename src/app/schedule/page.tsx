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
  // In a real application, you would fetch schedule data here
  // and pass it as a prop to ScheduleDisplay.
  // For this example, it uses mock data by default.

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-2xl">
            <Calendar className="text-primary" />
            Radio Schedule
          </CardTitle>
          <CardDescription>
            Check out our weekly line-up of shows and DJs. Never miss a beat!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScheduleDisplay />
        </CardContent>
      </Card>
    </div>
  );
}
