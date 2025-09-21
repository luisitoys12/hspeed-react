"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { NewsArticleFormValues } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LoaderCircle } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres."),
  summary: z.string().min(10, "El resumen debe tener al menos 10 caracteres."),
  content: z.string().min(20, "El contenido debe tener al menos 20 caracteres."),
  imageUrl: z.string().url("Debe ser una URL de imagen válida."),
  imageHint: z.string().optional(),
  category: z.string().min(3, "La categoría es requerida."),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "La fecha debe ser válida.",
  }),
});

interface NewsFormProps {
  onSave: (values: NewsArticleFormValues, id?: string) => void;
  isSubmitting: boolean;
  initialData?: NewsArticleFormValues & { id?: string };
}

export default function NewsForm({ onSave, isSubmitting, initialData }: NewsFormProps) {
  const form = useForm<NewsArticleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: '',
      summary: '',
      content: '',
      imageUrl: '',
      imageHint: '',
      category: '',
      date: new Date().toISOString().split('T')[0], // Default to today
    },
  });

  const onSubmit = (values: NewsArticleFormValues) => {
    onSave(values, initialData?.id);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField control={form.control} name="summary" render={({ field }) => (
          <FormItem><FormLabel>Resumen</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField control={form.control} name="content" render={({ field }) => (
          <FormItem><FormLabel>Contenido Completo (Markdown permitido)</FormLabel><FormControl><Textarea {...field} rows={10} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField control={form.control} name="imageUrl" render={({ field }) => (
          <FormItem><FormLabel>URL de la Imagen</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
         <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem><FormLabel>Categoría</FormLabel><FormControl><Input placeholder="Ej: FURNI" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem><FormLabel>Fecha de Publicación</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Guardar Cambios' : 'Publicar Artículo'}
        </Button>
      </form>
    </Form>
  );
}
