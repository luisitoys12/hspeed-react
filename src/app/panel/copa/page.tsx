
"use client";

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ref, onValue, set, update, remove } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, LoaderCircle, PlusCircle, Trash2, Edit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Schemas
const teamSchema = z.object({
  name: z.string().min(3, "Nombre muy corto"),
  pj: z.coerce.number().min(0), pg: z.coerce.number().min(0),
  pe: z.coerce.number().min(0), pp: z.coerce.number().min(0),
  gf: z.coerce.number().min(0), gc: z.coerce.number().min(0),
});
const scorerSchema = z.object({ name: z.string().min(3), team: z.string().min(3), goals: z.coerce.number().min(0) });
const nextMatchSchema = z.object({ teamA: z.string().min(3), teamB: z.string().min(3), date: z.string(), time: z.string() });
const venueSchema = z.object({ name: z.string().min(3), owner: z.string().min(3) });

type TeamValues = z.infer<typeof teamSchema>;

export default function CopaPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [copaData, setCopaData] = useState<any | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Forms
  const teamsForm = useForm<{ teams: TeamValues[] }>({ defaultValues: { teams: [] } });
  const topScorersForm = useForm<{ scorers: z.infer<typeof scorerSchema>[] }>({ defaultValues: { scorers: [] } });
  const nextMatchForm = useForm<z.infer<typeof nextMatchSchema>>({ resolver: zodResolver(nextMatchSchema) });
  const venueForm = useForm<z.infer<typeof venueSchema>>({ resolver: zodResolver(venueSchema) });

  const { fields: teamFields, append: appendTeam, remove: removeTeam, update: updateTeam } = useFieldArray({ control: teamsForm.control, name: "teams" });
  const { fields: scorerFields, append: appendScorer, remove: removeScorer } = useFieldArray({ control: topScorersForm.control, name: "scorers" });

  useEffect(() => {
    const copaRef = ref(db, 'copa');
    const unsubscribe = onValue(copaRef, (snapshot) => {
      const data = snapshot.val();
      setCopaData(data);
      if (data) {
        teamsForm.reset({ teams: data.teams ? Object.values(data.teams) : [] });
        topScorersForm.reset({ scorers: data.topScorers || [] });
        nextMatchForm.reset(data.nextMatch || {});
        venueForm.reset(data.venue || {});
      }
      setLoadingData(false);
    });
    return () => unsubscribe();
  }, [teamsForm, topScorersForm, nextMatchForm, venueForm]);

  const handleUpdate = async (path: string, data: any) => {
    await update(ref(db, 'copa'), { [path]: data });
    toast({ title: "Datos de la Copa actualizados" });
  };
  
  const handleTeamsSubmit = (data: { teams: TeamValues[] }) => {
    const teamsObject = data.teams.reduce((acc, team) => {
      const key = team.name.replace(/[^a-zA-Z0-9]/g, '');
      acc[key] = {
        ...team,
        dg: team.gf - team.gc,
        pts: team.pg * 3 + team.pe,
      };
      return acc;
    }, {} as any);
    handleUpdate('teams', teamsObject);
  };

  const handleScorersSubmit = (data: { scorers: z.infer<typeof scorerSchema>[] }) => handleUpdate('topScorers', data.scorers);
  const handleNextMatchSubmit = (data: z.infer<typeof nextMatchSchema>) => handleUpdate('nextMatch', data);
  const handleVenueSubmit = (data: z.infer<typeof venueSchema>) => handleUpdate('venue', data);


  if (authLoading || loadingData) return <div className="container p-8"><Skeleton className="w-full h-64" /></div>;
  if (!user?.isSuperAdmin) return <div>Acceso denegado.</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <Trophy className="h-8 w-8 text-primary" />
          Gestión de la Copa
        </h1>
        <p className="text-muted-foreground mt-2">Administra las posiciones, goleadores y detalles del torneo.</p>
      </div>
        <div className="grid lg:grid-cols-2 gap-8">
            <Card>
                <CardHeader><CardTitle>Tabla de Posiciones</CardTitle></CardHeader>
                <CardContent>
                    <Form {...teamsForm}>
                        <form onSubmit={teamsForm.handleSubmit(handleTeamsSubmit)} className="space-y-4">
                           {teamFields.map((field, index) => (
                               <div key={field.id} className="p-2 border rounded-md space-y-2 relative">
                                <Input {...teamsForm.register(`teams.${index}.name`)} placeholder="Nombre del Equipo"/>
                                <div className="grid grid-cols-4 gap-2">
                                    <Input type="number" {...teamsForm.register(`teams.${index}.pj`)} placeholder="PJ" />
                                    <Input type="number" {...teamsForm.register(`teams.${index}.pg`)} placeholder="PG" />
                                    <Input type="number" {...teamsForm.register(`teams.${index}.pe`)} placeholder="PE" />
                                    <Input type="number" {...teamsForm.register(`teams.${index}.pp`)} placeholder="PP" />
                                    <Input type="number" {...teamsForm.register(`teams.${index}.gf`)} placeholder="GF" />
                                    <Input type="number" {...teamsForm.register(`teams.${index}.gc`)} placeholder="GC" />
                                </div>
                                <Button type="button" variant="destructive" size="icon" onClick={() => removeTeam(index)} className="absolute top-2 right-2"><Trash2/></Button>
                               </div>
                           ))}
                           <Button type="button" variant="outline" onClick={() => appendTeam({ name: '', pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 })}><PlusCircle className="mr-2"/>Añadir Equipo</Button>
                           <Button type="submit">Guardar Tabla</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            <div className="space-y-8">
                <Card>
                    <CardHeader><CardTitle>Máximos Goleadores</CardTitle></CardHeader>
                    <CardContent>
                        <Form {...topScorersForm}>
                            <form onSubmit={topScorersForm.handleSubmit(handleScorersSubmit)} className="space-y-4">
                                {scorerFields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-3 gap-2 items-center">
                                        <Input {...topScorersForm.register(`scorers.${index}.name`)} placeholder="Jugador"/>
                                        <Input {...topScorersForm.register(`scorers.${index}.team`)} placeholder="Equipo"/>
                                        <div className="flex gap-2">
                                            <Input type="number" {...topScorersForm.register(`scorers.${index}.goals`)} placeholder="Goles"/>
                                            <Button type="button" variant="destructive" size="icon" onClick={() => removeScorer(index)}><Trash2/></Button>
                                        </div>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" onClick={() => appendScorer({ name: '', team: '', goals: 0 })}><PlusCircle className="mr-2"/>Añadir Goleador</Button>
                                <Button type="submit">Guardar Goleadores</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Próximo Partido / Sede</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <Form {...nextMatchForm}>
                            <form onSubmit={nextMatchForm.handleSubmit(handleNextMatchSubmit)} className="space-y-2">
                                <div className="grid grid-cols-2 gap-2"><Input {...nextMatchForm.register('teamA')} placeholder="Equipo A"/><Input {...nextMatchForm.register('teamB')} placeholder="Equipo B"/></div>
                                <div className="grid grid-cols-2 gap-2"><Input type="date" {...nextMatchForm.register('date')}/><Input type="time" {...nextMatchForm.register('time')}/></div>
                                <Button type="submit">Guardar Partido</Button>
                            </form>
                        </Form>
                         <Form {...venueForm}>
                            <form onSubmit={venueForm.handleSubmit(handleVenueSubmit)} className="space-y-2">
                                <div className="grid grid-cols-2 gap-2"><Input {...venueForm.register('name')} placeholder="Nombre Sala"/><Input {...venueForm.register('owner')} placeholder="Dueño"/></div>
                                <Button type="submit">Guardar Sede</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
