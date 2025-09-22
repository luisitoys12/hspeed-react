
"use client";

import { useState, useEffect } from 'react';
import { ref, remove, set, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookmarkPlus, LoaderCircle, Trash2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import BookingGrid from '@/components/habbospeed/booking-grid';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function BookingManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingLocked, setBookingLocked] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
      const configRef = ref(db, 'config/bookingLocked');
      const unsubscribe = onValue(configRef, (snapshot) => {
          setBookingLocked(snapshot.val() === true);
          setLoadingConfig(false);
      });
      return () => unsubscribe();
  }, []);

  const handleClearAllBookings = async () => {
    setIsSubmitting(true);
    try {
      const bookingsRef = ref(db, 'bookings');
      await remove(bookingsRef);
      toast({ title: "¡Éxito!", description: "Se han eliminado todas las reservas." });
    } catch (error) {
      console.error("Error clearing bookings:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudieron eliminar las reservas." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleBookingLock = async (locked: boolean) => {
      setBookingLocked(locked);
      try {
        await set(ref(db, 'config/bookingLocked'), locked);
        toast({ title: 'Configuración guardada', description: `Las reservas han sido ${locked ? 'bloqueadas' : 'desbloqueadas'}.`});
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "No se pudo guardar la configuración." });
        setBookingLocked(!locked); // Revert on error
      }
  }

  if (authLoading || loadingConfig) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!user?.isSuperAdmin) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>No tienes permisos para gestionar las reservas.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <BookmarkPlus className="h-8 w-8 text-primary" />
          Gestión de Reservas de DJ
        </h1>
        <p className="text-muted-foreground mt-2">
          Visualiza la parrilla y administra las opciones de reserva.
        </p>
      </div>

       <Card className="mb-8">
        <CardHeader>
            <CardTitle>Vista de la Parrilla</CardTitle>
            <CardDescription>Aquí puedes ver todas las reservas actuales y eliminar bloques individuales si es necesario. Esta vista es para supervisión y moderación.</CardDescription>
        </CardHeader>
        <CardContent>
            <BookingGrid />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Acciones de Administración</CardTitle>
          <CardDescription>Realiza acciones masivas sobre la parrilla de reservas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center space-x-2 rounded-lg border p-4">
                <Lock className="h-5 w-5"/>
                <div className="flex-grow">
                    <Label htmlFor="booking-lock" className="font-bold">Bloquear Reservas</Label>
                    <p className="text-xs text-muted-foreground">Impide que los DJs puedan hacer nuevas reservas en la parrilla.</p>
                </div>
                <Switch
                    id="booking-lock"
                    checked={bookingLocked}
                    onCheckedChange={handleToggleBookingLock}
                />
            </div>

          <Alert variant="destructive">
            <Trash2 className="h-4 w-4" />
            <AlertTitle>¡Acción Destructiva!</AlertTitle>
            <AlertDescription>
              El siguiente botón eliminará **todas** las reservas de la parrilla actual. Esta acción es irreversible y afectará a todos los DJs. Úsalo con precaución, por ejemplo, al inicio de una nueva semana.
            </AlertDescription>
          </Alert>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isSubmitting}>
                {isSubmitting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Vaciar todas las reservas
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará permanentemente todas las reservas de la parrilla. Los DJs perderán sus horarios reservados. ¿Deseas continuar?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAllBookings} className="bg-destructive hover:bg-destructive/90">
                  Sí, vaciar la parrilla
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </CardContent>
      </Card>
    </div>
  );
}
