"use client";

import { useState, useEffect } from 'react';
import { ref, onValue, set, remove, push } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { ScheduleItem, ScheduleFormValues } from '@/lib/types';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, LoaderCircle, Trash2, Edit, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose
} from "@/components/ui/dialog";
import ScheduleForm from '@/components/habbospeed/schedule-form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ScheduleManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (db) {
      const scheduleRef = ref(db, 'schedule');
      const unsubscribe = onValue(scheduleRef, (snapshot) => {
        const data = snapshot.val();
        const scheduleArray = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
        setSchedule(scheduleArray);
        setDbLoading(false);
      });
      return () => unsubscribe();
    }
  }, []);
  
  const handleSave = async (values: ScheduleFormValues, id?: string) => {
    setIsSubmitting(true);
    try {
      let scheduleRef;
      if (id) {
        scheduleRef = ref(db, `schedule/${id}`);
        await set(scheduleRef, values);
        toast({ title: "¡Éxito!", description: "El programa ha sido actualizado." });
      } else {
        scheduleRef = ref(db, 'schedule');
        await push(scheduleRef, values);
        toast({ title: "¡Éxito!", description: "El nuevo programa ha sido añadido." });
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving schedule item:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el programa." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const scheduleRef = ref(db, `schedule/${id}`);
      await remove(scheduleRef);
      toast({ title: "Programa eliminado", description: `El programa ha sido eliminado del horario.` });
    } catch (error) {
      console.error("Error deleting schedule item:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el programa." });
    }
  };
  
  if (authLoading || dbLoading) {
    return <ScheduleSkeleton />;
  }
  
  if (!user?.isSuperAdmin) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Card><CardHeader><CardTitle>Acceso Denegado</CardTitle><CardDescription>No tienes permisos para gestionar los horarios.</CardDescription></CardHeader></Card>
      </div>
    );
  }

  const daysOrder = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const sortedSchedule = [...schedule].sort((a, b) => {
    const dayIndexA = daysOrder.indexOf(a.day);
    const dayIndexB = daysOrder.indexOf(b.day);
    return dayIndexA - dayIndexB || a.startTime.localeCompare(b.startTime);
  });

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
            <CardDescription>Este es el horario que se muestra en la web. Los datos se actualizan en tiempo real.</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><PlusCircle className="mr-2 h-4 w-4" />Añadir Programa</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Añadir Nuevo Programa</DialogTitle>
                <DialogDescription>Completa los detalles del nuevo espacio en la radio.</DialogDescription>
              </DialogHeader>
              <ScheduleForm isSubmitting={isSubmitting} onSave={handleSave} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Programa</TableHead>
                  <TableHead>Día</TableHead>
                  <TableHead>Hora (UTC)</TableHead>
                  <TableHead>DJ</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dbLoading ? 
                  Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>) 
                : sortedSchedule.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.show}</TableCell>
                    <TableCell>{item.day}</TableCell>
                    <TableCell>{item.startTime} - {item.endTime}</TableCell>
                    <TableCell>{item.dj}</TableCell>
                    <TableCell className="text-right">
                       <Dialog>
                        <DialogTrigger asChild>
                           <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Programa</DialogTitle>
                          </DialogHeader>
                          <ScheduleForm isSubmitting={isSubmitting} onSave={(values) => handleSave(values, item.id)} initialData={item} />
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción eliminará el programa <strong>{item.show}</strong> permanentemente.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
                 {sortedSchedule.length === 0 && !dbLoading && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                            No hay programas creados. ¡Añade el primero!
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

const ScheduleSkeleton = () => (
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
                 {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
        </CardContent>
      </Card>
  </div>
);
