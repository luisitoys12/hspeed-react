import BookingGrid from '@/components/habbospeed/booking-grid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookmarkPlus } from 'lucide-react';

export default function BookingPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline text-xl md:text-2xl">
                    <BookmarkPlus className="text-primary" />
                    Reservar Horario de DJ
                </CardTitle>
                <CardDescription>
                    Selecciona un espacio disponible en la parrilla para reservar tu turno. Los horarios se basan en la hora del Centro de México (CST).
                </CardDescription>
            </CardHeader>
            <CardContent>
                <BookingGrid />
            </CardContent>
        </Card>
    </div>
  );
}
