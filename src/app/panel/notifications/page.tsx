
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Bell, LoaderCircle, Send } from 'lucide-react';
import { submitNotification } from '@/lib/actions';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const notificationSchema = z.object({
  title: z.string().min(3, "El título es requerido."),
  body: z.string().min(10, "El mensaje es requerido."),
  url: z.string().url("La URL debe ser válida.").optional().or(z.literal('')),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: { title: '', body: '', url: '' },
  });

  const onSubmit = async (values: NotificationFormValues) => {
    setIsSubmitting(true);
    setResultMessage(null);
    try {
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('body', values.body);
        if (values.url) formData.append('url', values.url);

      const result = await submitNotification(new FormData());
      if (result.success) {
        toast({
            title: "¡Notificaciones Enviadas!",
            description: result.message,
        });
        form.reset();
      } else {
          toast({ variant: 'destructive', title: "Error", description: result.message });
      }
      setResultMessage(result.message);
    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: "No se pudo enviar la notificación." });
      setResultMessage("Un error inesperado ocurrió.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) return <div>Cargando...</div>;
  if (!user?.isSuperAdmin) return <div>Acceso denegado.</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <Bell className="h-8 w-8 text-primary" />
          Enviar Notificaciones
        </h1>
        <p className="text-muted-foreground mt-2">
          Envía notificaciones push a los usuarios que hayan habilitado los permisos.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Crear Notificación</CardTitle>
          <CardDescription>El mensaje llegará a todos los usuarios suscritos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} placeholder="Ej: ¡Nuevo evento!" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="body" render={({ field }) => (
                <FormItem><FormLabel>Mensaje</FormLabel><FormControl><Textarea {...field} placeholder="Ej: No te pierdas el gran juego de..." rows={4} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="url" render={({ field }) => (
                <FormItem><FormLabel>URL de destino (Opcional)</FormLabel><FormControl><Input {...field} placeholder="Ej: /news/id-del-articulo" /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? <LoaderCircle className="mr-2 animate-spin" /> : <Send className="mr-2" />}
                Enviar Notificación
              </Button>
            </form>
          </Form>
           {resultMessage && (
            <Alert className="mt-4">
              <AlertTitle>Resultado del envío</AlertTitle>
              <AlertDescription>{resultMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
