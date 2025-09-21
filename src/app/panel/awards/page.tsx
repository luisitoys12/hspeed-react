
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ref, onValue, set, push, remove } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Award, LoaderCircle, PlusCircle, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Schemas
const awardTypeSchema = z.object({
  name: z.string().min(3, "El nombre del premio es muy corto."),
});
const awardWinnerSchema = z.object({
  awardTypeId: z.string({ required_error: "Debes seleccionar un tipo de premio." }),
  winnerName: z.string().min(3, "El nombre del ganador es requerido."),
  month: z.string({ required_error: "El mes es requerido." }),
});

type AwardType = { id: string; name: string };
type AwardWinner = { id: string; awardTypeId: string; winnerName: string; month: string };
type AwardWinnerWithTypeName = AwardWinner & { awardTypeName: string };

const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export default function AwardsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [awardTypes, setAwardTypes] = useState<AwardType[]>([]);
  const [awardWinners, setAwardWinners] = useState<AwardWinnerWithTypeName[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const awardTypeForm = useForm({ resolver: zodResolver(awardTypeSchema) });
  const awardWinnerForm = useForm({ resolver: zodResolver(awardWinnerSchema) });

  useEffect(() => {
    const typesRef = ref(db, 'awardTypes');
    const winnersRef = ref(db, 'awardWinners');

    const unsubscribeTypes = onValue(typesRef, (snapshot) => {
      const data = snapshot.val() || {};
      setAwardTypes(Object.keys(data).map(key => ({ id: key, ...data[key] })));
    });

    const unsubscribeWinners = onValue(winnersRef, (snapshot) => {
      const winnersData = snapshot.val() || {};
      const winnersList: AwardWinner[] = Object.keys(winnersData).map(key => ({ id: key, ...winnersData[key] }));
      
      // Combine with type names
      const typesMap = new Map(awardTypes.map(t => [t.id, t.name]));
      const combined = winnersList.map(winner => ({
          ...winner,
          awardTypeName: typesMap.get(winner.awardTypeId) || "Premio Desconocido"
      })).sort((a,b) => new Date(b.month).getTime() - new Date(a.month).getTime());

      setAwardWinners(combined);
      setLoadingData(false);
    });

    return () => {
      unsubscribeTypes();
      unsubscribeWinners();
    };
  }, [awardTypes]); // Rerun when awardTypes changes to update names

  const handleAddAwardType = async (data: z.infer<typeof awardTypeSchema>) => {
    setIsSubmitting(true);
    await push(ref(db, 'awardTypes'), data);
    toast({ title: "Tipo de premio añadido" });
    awardTypeForm.reset({ name: '' });
    setIsSubmitting(false);
  };
  
  const handleAddAwardWinner = async (data: z.infer<typeof awardWinnerSchema>) => {
    setIsSubmitting(true);
    await push(ref(db, 'awardWinners'), { ...data, timestamp: new Date().toISOString() });
    toast({ title: "Ganador asignado" });
    awardWinnerForm.reset({ awardTypeId: '', winnerName: '', month: '' });
    setIsSubmitting(false);
  };
  
  const handleDeleteWinner = async (id: string) => {
      await remove(ref(db, `awardWinners/${id}`));
      toast({ title: "Ganador eliminado" });
  }

  if (authLoading || loadingData) return <div>Cargando...</div>;
  if (!user?.isSuperAdmin) return <div>Acceso denegado.</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <Award className="h-8 w-8 text-primary" />
          Premios y Destacados
        </h1>
        <p className="text-muted-foreground mt-2">Gestiona los premios y reconoce a los miembros destacados del equipo.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Forms column */}
        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Añadir Tipo de Premio</CardTitle>
                    <CardDescription>Crea una nueva categoría de premio (ej: "DJ del Mes").</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...awardTypeForm}>
                        <form onSubmit={awardTypeForm.handleSubmit(handleAddAwardType)} className="flex gap-2">
                            <FormField control={awardTypeForm.control} name="name" render={({ field }) => (
                                <FormItem className="flex-grow"><FormControl><Input placeholder="Nombre del premio..." {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <Button type="submit" disabled={isSubmitting} size="icon"><PlusCircle/></Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Asignar Ganador</CardTitle>
                    <CardDescription>Selecciona un premio, un ganador y un mes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...awardWinnerForm}>
                        <form onSubmit={awardWinnerForm.handleSubmit(handleAddAwardWinner)} className="space-y-4">
                            <FormField control={awardWinnerForm.control} name="awardTypeId" render={({ field }) => (
                                <FormItem><FormLabel>Premio</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona un premio" /></SelectTrigger></FormControl><SelectContent>{awardTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                            )}/>
                             <FormField control={awardWinnerForm.control} name="winnerName" render={({ field }) => (
                                <FormItem><FormLabel>Nombre del Ganador</FormLabel><FormControl><Input placeholder="Nombre de usuario en Habbo" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <FormField control={awardWinnerForm.control} name="month" render={({ field }) => (
                                <FormItem><FormLabel>Mes</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona un mes" /></SelectTrigger></FormControl><SelectContent>{months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                            )}/>
                            <Button type="submit" disabled={isSubmitting} className="w-full">
                                {isSubmitting && <LoaderCircle className="mr-2 animate-spin"/>} Asignar Premio
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>

        {/* Winners list column */}
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Historial de Ganadores</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Premio</TableHead>
                                    <TableHead>Ganador</TableHead>
                                    <TableHead>Mes</TableHead>
                                    <TableHead className="text-right">Acción</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {awardWinners.map(winner => (
                                    <TableRow key={winner.id}>
                                        <TableCell className="font-semibold text-primary">{winner.awardTypeName}</TableCell>
                                        <TableCell>{winner.winnerName}</TableCell>
                                        <TableCell>{winner.month}</TableCell>
                                        <TableCell className="text-right">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader><AlertDialogTitle>Confirmar eliminación</AlertDialogTitle><AlertDialogDescription>Se eliminará la entrada de {winner.winnerName} para el premio {winner.awardTypeName}.</AlertDialogDescription></AlertDialogHeader>
                                                    <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteWinner(winner.id)} className="bg-destructive">Eliminar</AlertDialogAction></AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

