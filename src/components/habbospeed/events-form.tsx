"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { EventFormValues } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LoaderCircle } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres."),
  imageUrl: z.string().url("Debe ser una URL de imagen válida."),
  imageHint: z.string().optional(),
  server: z.string().min(2, "El servidor es requerido."),
  host: z.string().min(2, "El anfitrión es requerido."),
  roomName: z.string().min(3, "El nombre de la sala es requerido."),
  roomOwner: z.string().min(3, "El dueño de la sala es requerido."),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "La fecha debe ser válida.",
  }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)."),
});

interface EventsFormProps {
  onSave: (values: EventFormValues, id?: string) => void;
  isSubmitting: boolean;
  initialData?: EventFormValues & { id?: string };
}

export default function EventsForm({ onSave, isSubmitting, initialData }: EventsFormProps) {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: '',
      imageUrl: '',
      imageHint: '',
      server: 'Habbo (ES)',
      host: '',
      roomName: '',
      roomOwner: '',
      date: new Date().toISOString().split('T')[0],
      time: '00:00'
    },
  });

  const onSubmit = (values: EventFormValues) => {
    onSave(values, initialData?.id);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem><FormLabel>Título del Evento</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField control={form.control} name="imageUrl" render={({ field }) => (
          <FormItem><FormLabel>URL de la Imagen de Portada</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="server" render={({ field }) => (
            <FormItem><FormLabel>Servidor</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="host" render={({ field }) => (
            <FormItem><FormLabel>Anfitrión (Host)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        <FormField control={form.control} name="roomName" render={({ field }) => (
          <FormItem><FormLabel>Nombre de la Sala</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField control={form.control} name="roomOwner" render={({ field }) => (
          <FormItem><FormLabel>Dueño de la Sala</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
         <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem><FormLabel>Fecha</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="time" render={({ field }) => (
            <FormItem><FormLabel>Hora (UTC)</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Guardar Cambios' : 'Publicar Evento'}
        </Button>
      </form>
    </Form>
  );
}
