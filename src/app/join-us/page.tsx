
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ref, push, serverTimestamp } from "firebase/database";
import { db } from "@/lib/firebase";
import { useState } from "react";
import { LoaderCircle, Send, HeartHandshake } from "lucide-react";

const openings = [
    {
        role: "DJ",
        description: "Buscamos DJs apasionados con ganas de entretener. Debes tener una buena colección musical y carisma para interactuar con los oyentes.",
        requirements: ["Micrófono de buena calidad.", "Disponibilidad horaria.", "Conocimiento de géneros musicales populares."]
    },
    {
        role: "Coordinador de Eventos",
        description: "¿Eres creativo y organizado? Ayúdanos a planificar y ejecutar los mejores eventos dentro de Habbo para la comunidad de Habbospeed.",
        requirements: ["Experiencia en organización de eventos.", "Conocimiento de Wired y Furnis.", "Capacidad para trabajar en equipo."]
    }
];

const applicationSchema = z.object({
  role: z.string({ required_error: "Debes seleccionar un rol." }),
  habboName: z.string().min(3, "Tu nombre de Habbo es requerido."),
  experience: z.string().min(20, "Cuéntanos un poco sobre tu experiencia (mín. 20 caracteres)."),
});

type ApplicationValues = z.infer<typeof applicationSchema>;

export default function JoinUsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ApplicationValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
        habboName: user?.displayName || '',
        experience: '',
    }
  });
  
  const onSubmit = async (values: ApplicationValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const applicationsRef = ref(db, 'applications');
      await push(applicationsRef, {
        ...values,
        userId: user.uid,
        userEmail: user.email,
        status: 'pending',
        timestamp: serverTimestamp(),
      });
      toast({ title: "¡Postulación Enviada!", description: "Hemos recibido tu postulación. ¡Gracias por tu interés!" });
      form.reset();
    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: "No se pudo enviar tu postulación. Inténtalo de nuevo." });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
        <div className="mb-8">
            <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
                <HeartHandshake className="h-8 w-8 text-primary" />
                Únete al Equipo
            </h1>
            <p className="text-muted-foreground mt-2">
                ¿Quieres formar parte de Habbospeed? ¡Estas son nuestras posiciones abiertas!
            </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
            <div>
                <Card>
                    <CardHeader>
                    <CardTitle>Vacantes Abiertas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                    {openings.map(opening => (
                        <div key={opening.role} className="p-4 border rounded-lg">
                            <h3 className="font-bold text-lg text-primary">{opening.role}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{opening.description}</p>
                            <h4 className="font-semibold text-sm mt-3 mb-1">Requisitos:</h4>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                {opening.requirements.map(req => <li key={req}>{req}</li>)}
                            </ul>
                        </div>
                    ))}
                    </CardContent>
                </Card>
            </div>
            <div>
                <Card>
                    <CardHeader>
                    <CardTitle>Formulario de Postulación</CardTitle>
                    <CardDescription>
                        Rellena el formulario si crees que eres el indicado para una de las vacantes. Debes estar registrado para postular.
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {user ? (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField control={form.control} name="role" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Rol al que Postulas</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un rol" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {openings.map(o => <SelectItem key={o.role} value={o.role}>{o.role}</SelectItem>)}
                                            </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="habboName" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre de Usuario en Habbo</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="experience" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>¿Por qué deberíamos elegirte?</FormLabel>
                                            <FormControl><Textarea placeholder="Cuéntanos sobre tu experiencia, tu motivación, etc." {...field} rows={5}/></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting && <LoaderCircle className="mr-2 animate-spin"/>}
                                        <Send className="mr-2" />
                                        Enviar Postulación
                                    </Button>
                                </form>
                            </Form>
                        ) : (
                            <div className="text-center p-4 bg-muted rounded-lg">
                                <p className="text-muted-foreground">Debes iniciar sesión para poder postularte.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
