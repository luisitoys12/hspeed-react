
"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ref, onValue, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings, Radio, Link as LinkIcon, LoaderCircle, Trash2, PlusCircle, Image as ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const slideSchema = z.object({
  title: z.string().min(1, "El título es requerido."),
  subtitle: z.string().min(1, "El subtítulo es requerido."),
  imageUrl: z.string().url("Debe ser una URL válida."),
  imageHint: z.string().optional(),
  cta: z.object({
    text: z.string().min(1, "El texto del botón es requerido."),
    href: z.string().min(1, "El enlace del botón es requerido."),
  })
});

const configSchema = z.object({
  apiUrl: z.string().url({ message: "Por favor, introduce una URL válida." }),
  listenUrl: z.string().url({ message: "Por favor, introduce una URL válida." }),
  slideshow: z.array(slideSchema).optional(),
});

type ConfigFormValues = z.infer<typeof configSchema>;

export default function ConfigPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dbLoading, setDbLoading] = useState(true);

  const defaultValues = useMemo(() => ({
    apiUrl: "",
    listenUrl: "",
    slideshow: [],
  }), []);

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "slideshow",
  });

  useEffect(() => {
    if (db) {
      const configRef = ref(db, 'config');
      const unsubscribe = onValue(configRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          // Convert slideshow object back to array for the form
          const slideshowArray = data.slideshow 
            ? Array.isArray(data.slideshow)
              ? data.slideshow.filter(Boolean) // Handle sparse arrays from Firebase
              : Object.keys(data.slideshow).map(key => data.slideshow[key])
            : [];
          form.reset({
            apiUrl: data.apiUrl || "",
            listenUrl: data.listenUrl || "",
            slideshow: slideshowArray
          });
        }
        setDbLoading(false);
      }, (error) => {
        console.error(error);
        setDbLoading(false);
      });
      return () => unsubscribe();
    }
  }, [form, defaultValues]);

  async function onSubmit(values: ConfigFormValues) {
    if (!user) {
      toast({ variant: "destructive", title: "No autorizado", description: "Debes iniciar sesión para guardar la configuración." });
      return;
    }

    setIsSubmitting(true);
    try {
      // Keep slideshow as an array for Firebase
      const dataToSave = {
        ...values,
      };

      const configRef = ref(db, 'config');
      await set(configRef, dataToSave);
      toast({ title: "¡Éxito!", description: "La configuración se ha guardado correctamente." });
    } catch (error) {
      console.error("Error saving config:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar la configuración." });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  if (authLoading || dbLoading) {
    return <ConfigSkeleton />;
  }
  
  if (!user?.isSuperAdmin) {
     return (
       <div className="container mx-auto p-4 md:p-8">
         <Card>
           <CardHeader>
             <CardTitle>Acceso Denegado</CardTitle>
             <CardDescription>Debes ser administrador para ver esta página.</CardDescription>
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
          Ajustes Generales
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestiona las URLs, el carrusel de la página principal y otros ajustes importantes.
        </p>
      </div>

       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
            <CardContent className="space-y-6">
              <FormField control={form.control} name="apiUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de la API Now Playing</FormLabel>
                    <FormControl><Input placeholder="https://radio.kusmedios.lat/api/nowplaying/ekus-fm" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
              )}/>
               <FormField control={form.control} name="listenUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL del Stream de Audio</FormLabel>
                    <FormControl><Input placeholder="http://radio.kusmedios.lat/listen/ekus-fm/radio.mp3" {...field} /></FormControl>
                     <FormMessage />
                  </FormItem>
              )}/>
            </CardContent>
          </Card>
          
          <Card>
             <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                <ImageIcon />
                Gestión del Carrusel (Slideshow)
              </CardTitle>
              <CardDescription>
                Añade o edita las diapositivas que aparecen en la página principal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-md relative space-y-4">
                    <h4 className="font-bold">Diapositiva {index + 1}</h4>
                     <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4" />
                     </Button>
                    <FormField control={form.control} name={`slideshow.${index}.title`} render={({ field }) => (
                      <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name={`slideshow.${index}.subtitle`} render={({ field }) => (
                      <FormItem><FormLabel>Subtítulo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name={`slideshow.${index}.imageUrl`} render={({ field }) => (
                      <FormItem><FormLabel>URL de la Imagen</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name={`slideshow.${index}.cta.text`} render={({ field }) => (
                          <FormItem><FormLabel>Texto del Botón</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name={`slideshow.${index}.cta.href`} render={({ field }) => (
                          <FormItem><FormLabel>Enlace del Botón</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                     </div>
                  </div>
                ))}
                 <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => append({ title: '', subtitle: '', imageUrl: '', cta: { text: '', href: '' }})}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Diapositiva
                  </Button>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Todos los Cambios
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

const ConfigSkeleton = () => (
  <div className="container mx-auto p-4 md:p-8">
    <Skeleton className="h-10 w-3/4 mb-2" />
    <Skeleton className="h-4 w-1/2 mb-8" />
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
          <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
            <Skeleton className="h-40 w-full rounded-md" />
            <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Skeleton className="h-10 w-40" />
      </div>
    </div>
  </div>
);
