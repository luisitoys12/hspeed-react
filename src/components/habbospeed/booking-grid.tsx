"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, set, get, runTransaction } from 'firebase/database';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

type Bookings = {
  [day: string]: {
    [hour: string]: {
      djName: string;
      uid: string;
    };
  };
};

function MexicoTimeClock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const mexicoTime = new Date().toLocaleString('es-MX', {
        timeZone: 'America/Mexico_City',
        hour12: false,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setTime(mexicoTime);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center mb-4 p-2 bg-muted rounded-lg">
      <span className="font-bold">Hora del Centro de México (CST):</span>
      <span className="ml-2 font-mono">{time}</span>
    </div>
  );
}

export default function BookingGrid() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Bookings>({});
  const [dbLoading, setDbLoading] = useState(true);

  useEffect(() => {
    const bookingsRef = ref(db, 'bookings');
    const unsubscribe = onValue(bookingsRef, (snapshot) => {
      setBookings(snapshot.val() || {});
      setDbLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleBookSlot = async (day: string, hour: string) => {
    if (!user || !user.displayName) {
      toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para reservar.' });
      return;
    }

    const slotRef = ref(db, `bookings/${day}/${hour.replace(':', '')}`);

    try {
        const { committed, snapshot } = await runTransaction(slotRef, (currentData) => {
            if (currentData === null) {
                return { djName: user.displayName, uid: user.uid };
            }
            return; // Abort transaction if slot is already taken
        });

        if (committed) {
            toast({
                title: '¡Reservado!',
                description: `Has reservado el horario de las ${hour} el día ${day}.`,
                className: 'bg-green-500 text-white'
            });
        } else {
             toast({
                variant: 'destructive',
                title: 'Horario Ocupado',
                description: 'Este horario acaba de ser tomado por otro DJ.',
            });
        }
    } catch (error) {
        console.error("Booking failed:", error);
        toast({
            variant: 'destructive',
            title: 'Error de Reserva',
            description: 'No se pudo completar la reserva. Inténtalo de nuevo.',
        });
    }
  };

  if (authLoading || dbLoading) {
    return <div className="flex justify-center items-center p-8"><LoaderCircle className="animate-spin h-8 w-8" /></div>;
  }
  
  if (!user) {
    return <div className="text-center p-8 bg-muted/50 rounded-md">
        <AlertTriangle className="mx-auto h-8 w-8 text-destructive mb-2" />
        <h3 className="font-bold">Acceso Restringido</h3>
        <p className="text-muted-foreground">Debes iniciar sesión para ver y reservar horarios.</p>
    </div>
  }

  return (
    <div>
        <MexicoTimeClock />
        <div className="overflow-x-auto">
        <table className="w-full border-collapse text-center table-fixed">
            <thead>
            <tr className="bg-muted">
                <th className="p-2 border border-border w-24">Hora</th>
                {daysOfWeek.map((day) => (
                <th key={day} className="p-2 border border-border">
                    {day}
                    <div className="text-xs font-normal text-muted-foreground">
                        {format(new Date(), 'dd MMM', { locale: es })}
                    </div>
                </th>
                ))}
            </tr>
            </thead>
            <tbody>
            {hours.map((hour) => (
                <tr key={hour}>
                <td className="p-2 border border-border font-mono text-xs">{hour}</td>
                {daysOfWeek.map((day) => {
                    const booking = bookings[day]?.[hour.replace(':', '')];
                    return (
                    <td key={`${day}-${hour}`} className="p-1 border border-border h-16">
                        {booking ? (
                        <div className={`p-1 rounded-md text-xs h-full flex flex-col justify-center ${booking.uid === user.uid ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                            <span className="font-bold truncate">{booking.djName}</span>
                        </div>
                        ) : (
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <button className="w-full h-full bg-background hover:bg-primary/20 text-transparent hover:text-primary transition-all duration-200 rounded-md text-xs flex items-center justify-center">
                                    <span className="opacity-0 group-hover:opacity-100">Reservar</span>
                                </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Reserva</AlertDialogTitle>
                                <AlertDialogDescription>
                                    ¿Estás seguro de que quieres reservar el horario de las <strong>{hour}</strong> del día <strong>{day}</strong>?
                                    Esta acción no se puede deshacer fácilmente.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleBookSlot(day, hour)}>
                                    Sí, reservar
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        )}
                    </td>
                    );
                })}
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    </div>
  );
}
