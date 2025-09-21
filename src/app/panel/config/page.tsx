"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ref, onValue, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings, Radio, Link as LinkIcon, LoaderCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const configSchema = z.object({
  apiUrl: z.string().url({ message: "Por favor, introduce una URL válida." }),
  listenUrl: z.string().url({ message: "Por favor, introduce una URL válida." }),
});

type ConfigFormValues = z.infer<typeof configSchema>;

export default function ConfigPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dbLoading, setDbLoading] = useState(true);

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      apiUrl: "",
      listenUrl: "",
    },
  });

  useEffect(() => {
    if (db) {
      const configRef = ref(db, 'config');
      const unsubscribe = onValue(configRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          form.reset({
            apiUrl: data.apiUrl || "",
            listenUrl: data.listenUrl || "",
          });
        }
        setDbLoading(false);
      });
      return () => unsubscribe();
    }
  }, [form]);

  async function onSubmit(values: ConfigFormValues) {
    if (!user) {
      toast({ variant: "destructive", title: "No autorizado", description: "Debes iniciar sesión para guardar la configuración." });
      return;
    }

    setIsSubmitting(true);
    try {
      const configRef = ref(db, 'config');
      await set(configRef, values);
      toast({ title: "¡Éxito!", description: "La configuración se ha guardado correctamente." });
    } catch (error) {
      console.error("Error saving config:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar la configuración." });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading || dbLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="flex justify-end">
              <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!user) {
     return (
       <div className="container mx-auto p-4 md:p-8">
         <Card>
           <CardHeader>
             <CardTitle>Acceso Denegado</CardTitle>
             <CardDescription>Debes iniciar sesión para ver esta página.</CardDescription>
           </CardHeader>
         </Card>
       </div>
     )
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <Settings className="h-8 w-8 text-primary" />
          Configuración de la Estación
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestiona las URLs y otros ajustes importantes para Ekus FM. Los cambios se guardarán en tiempo real.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <Radio />
            Configuración de Azuracast
          </CardTitle>
          <CardDescription>
            Introduce las URLs para la API de Azuracast y el stream de la radio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="apiUrl"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="api-url" className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      URL de la API Now Playing
                    </Label>
                    <FormControl>
                      <Input id="api-url" placeholder="https://radio.kusmedios.lat/api/nowplaying/ekus-fm" {...field} />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Esta URL se usa para obtener la información de la canción actual, el DJ y los oyentes.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="listenUrl"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="listen-url" className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      URL del Stream de Audio
                    </Label>
                    <FormControl>
                      <Input id="listen-url" placeholder="http://radio.kusmedios.lat/listen/ekus-fm/radio.mp3" {...field} />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Esta es la URL que los usuarios usarán para escuchar la radio en directo.
                    </p>
                     <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                   {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
