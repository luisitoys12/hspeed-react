
"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ref, onValue, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings, Radio, LoaderCircle, Trash2, PlusCircle, Image as ImageIcon, Bot } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  logoUrl: z.string().url({ message: "Por favor, introduce una URL válida." }).optional().or(z.literal('')),
  radioService: z.enum(['azuracast', 'zenofm']),
  apiUrl: z.string().url({ message: "Por favor, introduce una URL válida." }),
  listenUrl: z.string().url({ message: "Por favor, introduce una URL válida." }),
  slideshow: z.array(slideSchema).optional(),
  discordBot: z.object({
      token: z.string().optional(),
      guildId: z.string().optional(),
      announcementChannelId: z.string().optional(),
      voiceChannelId: z.string().optional(),
  }).optional(),
});

type ConfigFormValues = z.infer<typeof configSchema>;

const demoSlides = [
    { 
      title: '¡Bienvenidos a Habbospeed!', 
      subtitle: 'La radio #1 para la comunidad de Habbo.es. Música, eventos y diversión 24/7.', 
      imageUrl: 'https://picsum.photos/seed/habboparty/1200/400',
      imageHint: 'habbo party',
      cta: { text: 'Ver Horarios', href: '/schedule' }
    },
    { 
      title: 'Gestiona el Contenido', 
      subtitle: 'Este carrusel se gestiona desde el Panel de Administración en la sección de Ajustes.', 
      imageUrl: 'https://picsum.photos/seed/adminpanel/1200/400',
      imageHint: 'dashboard analytics',
      cta: { text: 'Ir al Panel', href: '/panel' }
    },
    { 
      title: 'Únete a Nuestro Equipo', 
      subtitle: '¿Te apasiona la radio y Habbo? ¡Estamos buscando nuevos talentos para unirse al equipo!', 
      imageUrl: 'https://picsum.photos/seed/jointeam/1200/400',
      imageHint: 'job interview',
      cta: { text: 'Postular Ahora', href: '/join-us' }
    }
];

export default function ConfigPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dbLoading, setDbLoading] = useState(true);

  const defaultValues = useMemo(() => ({
    logoUrl: "https://i.imgur.com/u31XFxN.png",
    radioService: "azuracast" as const,
    apiUrl: "",
    listenUrl: "",
    slideshow: [],
    discordBot: {
      token: "",
      guildId: "",
      announcementChannelId: "",
      voiceChannelId: "",
    },
  }), []);

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues,
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "slideshow",
  });

  useEffect(() => {
    if (db) {
      const configRef = ref(db, 'config');
      const unsubscribe = onValue(configRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const slideshowArray = data.slideshow 
            ? Array.isArray(data.slideshow)
              ? data.slideshow.filter(Boolean)
              : Object.keys(data.slideshow).map(key => data.slideshow[key])
            : [];
          
          form.reset({
            logoUrl: data.logoUrl || "https://i.imgur.com/u31XFxN.png",
            radioService: data.radioService || "azuracast",
            apiUrl: data.apiUrl || "",
            listenUrl: data.listenUrl || "",
            slideshow: slideshowArray.length > 0 ? slideshowArray : demoSlides,
            discordBot: data.discordBot || defaultValues.discordBot,
          });
          
          if(slideshowArray.length === 0){
             replace(demoSlides);
          }

        } else {
            form.reset({
                ...defaultValues,
                slideshow: demoSlides,
            })
            replace(demoSlides);
        }
        setDbLoading(false);
      }, (error) => {
        console.error(error);
        setDbLoading(false);
      });
      return () => unsubscribe();
    }
  }, [form, defaultValues, replace]);

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
          Gestiona el logo, servicio de radio, URLs, y el carrusel de la página principal.
        </p>
      </div>

       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                <ImageIcon />
                Branding
              </CardTitle>
              <CardDescription>
                Personaliza el logo de tu sitio.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="logoUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL del Logo</FormLabel>
                    <FormControl><Input placeholder="https://tu-sitio.com/logo.png" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
              )}/>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                <Radio />
                Configuración de Radio
              </CardTitle>
              <CardDescription>
                Elige tu servicio de radio e introduce las URLs correspondientes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="radioService"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Servicio de Radio</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un servicio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="azuracast">Azuracast</SelectItem>
                        <SelectItem value="zenofm">ZenoFM</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="apiUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de la API "Now Playing"</FormLabel>
                    <FormControl><Input placeholder="URL de la API de tu radio" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
              )}/>
               <FormField control={form.control} name="listenUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL del Stream de Audio</FormLabel>
                    <FormControl><Input placeholder="URL del stream de audio" {...field} /></FormControl>
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
                    onClick={() => append({ title: '', subtitle: '', imageUrl: '', imageHint: '', cta: { text: '', href: '' }})}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Diapositiva
                  </Button>
            </CardContent>
          </Card>

           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                <Bot />
                Configuración del Bot de Discord
              </CardTitle>
              <CardDescription>
                Introduce las credenciales e IDs para tu bot de Discord. Estos valores serán leídos por tu aplicación de bot.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="discordBot.token" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token del Bot</FormLabel>
                    <FormControl><Input type="password" placeholder="Tu token secreto de bot" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
              )}/>
               <FormField control={form.control} name="discordBot.guildId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID del Servidor (Guild ID)</FormLabel>
                    <FormControl><Input placeholder="ID numérico de tu servidor de Discord" {...field} /></FormControl>
                     <FormMessage />
                  </FormItem>
              )}/>
               <FormField control={form.control} name="discordBot.announcementChannelId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID del Canal de Anuncios</FormLabel>
                    <FormControl><Input placeholder="ID del canal para los mensajes de 'Ahora suena'" {...field} /></FormControl>
                     <FormMessage />
                  </FormItem>
              )}/>
              <FormField control={form.control} name="discordBot.voiceChannelId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID del Canal de Voz 24/7</FormLabel>
                    <FormControl><Input placeholder="ID del canal de voz para la música continua" {...field} /></FormControl>
                     <FormMessage />
                  </FormItem>
              )}/>
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

    
