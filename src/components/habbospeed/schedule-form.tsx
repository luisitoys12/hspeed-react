"use client";

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ScheduleFormValues } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoaderCircle } from 'lucide-react';

const formSchema = z.object({
  show: z.string().min(3, "El nombre del programa es requerido."),
  dj: z.string().min(3, "El nombre del DJ es requerido."),
  day: z.string({ required_error: "Debes seleccionar un día." }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)."),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)."),
});

interface ScheduleFormProps {
  onSave: (values: ScheduleFormValues, id?: string) => void;
  isSubmitting: boolean;
  initialData?: ScheduleFormValues & { id?: string };
}

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function ScheduleForm({ onSave, isSubmitting, initialData }: ScheduleFormProps) {
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      show: '',
      dj: '',
      day: '',
      startTime: '',
      endTime: '',
    },
  });

  const onSubmit = (values: ScheduleFormValues) => {
    onSave(values, initialData?.id);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="show" render={({ field }) => (
          <FormItem><FormLabel>Nombre del Programa</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField control={form.control} name="dj" render={({ field }) => (
          <FormItem><FormLabel>Nombre del DJ</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField control={form.control} name="day" render={({ field }) => (
          <FormItem>
            <FormLabel>Día de la Semana</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un día" /></SelectTrigger></FormControl>
              <SelectContent>
                {daysOfWeek.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}/>
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="startTime" render={({ field }) => (
            <FormItem><FormLabel>Hora de Inicio (UTC)</FormLabel><FormControl><Input placeholder="HH:MM" {...field} /></FormControl><FormMessage /></FormItem>
          )}/>
          <FormField control={form.control} name="endTime" render={({ field }) => (
            <FormItem><FormLabel>Hora de Fin (UTC)</FormLabel><FormControl><Input placeholder="HH:MM" {...field} /></FormControl><FormMessage /></FormItem>
          )}/>
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
          Guardar Programa
        </Button>
      </form>
    </Form>
  );
}
