

"use client";

import { useState, useEffect } from 'react';
import { ref, onValue, set, remove, push } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { EventItem, EventFormValues } from '@/lib/types';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PartyPopper, Edit, Trash2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import EventsForm from '@/components/habbospeed/events-form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { sendWebhook } from '@/lib/actions';

export default function EventsManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (db) {
      const eventsRef = ref(db, 'events');
      const unsubscribe = onValue(eventsRef, (snapshot) => {
        const data = snapshot.val();
        const eventsArray = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
        eventsArray.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setEvents(eventsArray);
        setDbLoading(false);
      });
      return () => unsubscribe();
    }
  }, []);
  
  const handleSave = async (values: EventFormValues, id?: string) => {
    setIsSubmitting(true);
    try {
      if (id) {
        const eventRef = ref(db, `events/${id}`);
        await set(eventRef, values);
        toast({ title: "¡Éxito!", description: "El evento ha sido actualizado." });
      } else {
        const eventsRef = ref(db, 'events');
        const newEventRef = await push(eventsRef, values);
        toast({ title: "¡Éxito!", description: "El nuevo evento ha sido publicado." });
        await sendWebhook('events', { ...values, id: newEventRef.key });
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving event:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el evento." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const eventRef = ref(db, `events/${id}`);
      await remove(eventRef);
      toast({ title: "Evento eliminado", description: `El evento ha sido eliminado.` });
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el evento." });
    }
  };
  
  if (authLoading || dbLoading) {
    return <EventsSkeleton />;
  }
  
  if (!user?.isSuperAdmin) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Card><CardHeader><CardTitle>Acceso Denegado</CardTitle><CardDescription>No tienes permisos para gestionar los eventos.</CardDescription></CardHeader></Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <PartyPopper className="h-8 w-8 text-primary" />
          Gestión de Eventos
        </h1>
        <p className="text-muted-foreground mt-2">
          Crea, edita y elimina los eventos de la fansite.
        </p>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Eventos Programados</CardTitle>
            <CardDescription>Esta es la lista de eventos que se muestran en el sitio.</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><PlusCircle className="mr-2 h-4 w-4" />Crear Evento</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Evento</DialogTitle>
                <DialogDescription>Rellena la información del próximo evento.</DialogDescription>
              </DialogHeader>
              <EventsForm isSubmitting={isSubmitting} onSave={handleSave} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Anfitrión</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dbLoading ? 
                  Array.from({ length: 3 }).map((_, i) => <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>) 
                : events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium max-w-xs truncate">{event.title}</TableCell>
                    <TableCell>{new Date(event.date).toLocaleDateString('es-ES')}</TableCell>
                    <TableCell>{event.time}</TableCell>
                    <TableCell>{event.host}</TableCell>
                    <TableCell className="text-right">
                       <Dialog>
                        <DialogTrigger asChild>
                           <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[625px]">
                          <DialogHeader>
                            <DialogTitle>Editar Evento</DialogTitle>
                          </DialogHeader>
                          <EventsForm isSubmitting={isSubmitting} onSave={(values) => handleSave(values, event.id)} initialData={event} />
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción eliminará el evento <strong>"{event.title}"</strong> permanentemente.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(event.id)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
                 {events.length === 0 && !dbLoading && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                            No hay eventos creados. ¡Crea el primero!
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const EventsSkeleton = () => (
  <div className="container mx-auto p-4 md:p-8">
     <Skeleton className="h-10 w-1/2 mb-2" />
     <Skeleton className="h-4 w-3/4 mb-8" />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
           <div>
             <Skeleton className="h-6 w-48 mb-2" />
             <Skeleton className="h-4 w-64" />
           </div>
           <Skeleton className="h-10 w-32" />
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                 {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
        </CardContent>
      </Card>
  </div>
);
