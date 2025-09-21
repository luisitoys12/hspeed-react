'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { LoaderCircle, Send } from "lucide-react";

const proposalSchema = z.object({
  eventName: z.string().min(5, "El nombre del evento es muy corto."),
  description: z.string().min(20, "La descripción es muy corta."),
  prize: z.string().optional(),
});

type ProposalValues = z.infer<typeof proposalSchema>;

export default function EventProposal() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ProposalValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: { eventName: '', description: '', prize: '' },
  });
  
  const onSubmit = async (values: ProposalValues) => {
    setIsSubmitting(true);
    // Simular envío
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Event Proposal Submitted:", values);
    toast({ title: "Propuesta Enviada", description: "Tu idea de evento ha sido enviada para revisión." });
    form.reset();
    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proponer un Evento</CardTitle>
        <CardDescription>
          ¿Tienes una idea para un concurso, juego o evento especial? ¡Cuéntanosla!
        </CardDescription>
      </CardHeader>
      <CardContent>
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField control={form.control} name="eventName" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nombre del Evento</FormLabel>
                        <FormControl><Input placeholder="Ej: Maratón de Wired" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                 )}/>
                 <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Descripción del Evento</FormLabel>
                        <FormControl><Textarea placeholder="Explica en qué consiste el evento, cómo funcionaría, etc." {...field} rows={6} /></FormControl>
                        <FormMessage />
                    </FormItem>
                 )}/>
                 <FormField control={form.control} name="prize" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Premios Sugeridos (Opcional)</FormLabel>
                        <FormControl><Input placeholder="Ej: Raro del mes, créditos, placa exclusiva..." {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                 )}/>
                 <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <LoaderCircle className="mr-2 animate-spin"/>}
                    <Send className="mr-2" />
                    Enviar Propuesta
                </Button>
            </form>
        </Form>
      </CardContent>
    </Card>
  );
}
