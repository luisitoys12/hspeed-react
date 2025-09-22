
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ref, onValue, set, remove } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Radio, LoaderCircle, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const onAirSchema = z.object({
  currentDj: z.string().optional(),
  nextDj: z.string().optional(),
});

type OnAirFormValues = z.infer<typeof onAirSchema>;

export default function OnAirManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dbLoading, setDbLoading] = useState(true);

  const form = useForm<OnAirFormValues>({
    resolver: zodResolver(onAirSchema),
    defaultValues: { currentDj: '', nextDj: '' },
  });

  useEffect(() => {
    const onAirRef = ref(db, 'onAir');
    const unsubscribe = onValue(onAirRef, (snapshot) => {
      const data = snapshot.val();
      form.reset(data || { currentDj: '', nextDj: '' });
      setDbLoading(false);
    });
    return () => unsubscribe();
  }, [form]);

  const onSubmit = async (values: OnAirFormValues) => {
    setIsSubmitting(true);
    try {
      await set(ref(db, 'onAir'), values);
      toast({ title: "¡Actualizado!", description: "La información 'Al Aire' ha sido actualizada." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar." });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClearOverride = async () => {
    setIsSubmitting(true);
    try {
        await remove(ref(db, 'onAir'));
        form.reset({ currentDj: '', nextDj: '' });
        toast({ title: "¡Limpiado!", description: "Se ha restaurado el control automático." });
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "No se pudo limpiar." });
    } finally {
        setIsSubmitting(false);
    }
  }

  if (authLoading || dbLoading) return <Skeleton className="h-64 w-full" />;
  if (!user?.isSuperAdmin) return <div>Acceso denegado.</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <Radio className="h-8 w-8 text-primary" />
          Control de Transmisión
        </h1>
        <p className="text-muted-foreground mt-2">
          Anula manualmente el DJ "Al Aire" y el "Siguiente DJ".
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Anulación Manual</CardTitle>
          <CardDescription>
            Lo que escribas aquí tendrá prioridad sobre el sistema automático. Úsalo para correcciones rápidas o anuncios especiales. Deja los campos vacíos para volver al modo automático.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="currentDj" render={({ field }) => (
                        <FormItem>
                            <FormLabel>DJ Al Aire (Actual)</FormLabel>
                            <FormControl><Input placeholder="Nombre del DJ" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="nextDj" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Siguiente DJ</FormLabel>
                            <FormControl><Input placeholder="Nombre del DJ" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>

                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting && <LoaderCircle className="mr-2 animate-spin"/>}
                            Forzar Actualización
                        </Button>
                        <Button type="button" variant="destructive" disabled={isSubmitting} onClick={handleClearOverride} className="w-full">
                             {isSubmitting ? <LoaderCircle className="mr-2 animate-spin"/> : <Trash2 className="mr-2" />}
                            Volver a Automático
                        </Button>
                    </div>
                </form>
            </Form>
            <Alert className="mt-6">
                <Radio className="h-4 w-4"/>
                <AlertTitle>¿Cómo funciona?</AlertTitle>
                <AlertDescription>
                   Si dejas un campo vacío y guardas, esa parte volverá al modo automático. Si limpias ambos campos, el sistema entero volverá a ser automático.
                </AlertDescription>
            </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
