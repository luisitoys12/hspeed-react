
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
import { Award, LoaderCircle, PlusCircle, Trash2, Checkbox } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// Schemas
const awardTypeSchema = z.object({
  name: z.string().min(3, "El nombre del premio es muy corto."),
  isCopa: z.boolean().default(false).optional(),
});
const awardWinnerSchema = z.object({
  awardTypeId: z.string({ required_error: "Debes seleccionar un tipo de premio." }),
  winnerName: z.string().min(3, "El nombre del ganador es requerido."),
  month: z.string({ required_error: "El mes es requerido." }),
});

type AwardType = { id: string; name: string, isCopa?: boolean };
type AwardWinner = { id: string; awardTypeId: string; winnerName: string; month: string };
type AwardWinnerWithTypeName = AwardWinner & { awardTypeName: string; isCopa?: boolean };

const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export default function AwardsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [awardTypes, setAwardTypes] = useState<AwardType[]>([]);
  const [awardWinners, setAwardWinners] = useState<AwardWinnerWithTypeName[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const awardTypeForm = useForm<z.infer<typeof awardTypeSchema>>({ resolver: zodResolver(awardTypeSchema) });
  const awardWinnerForm = useForm({ resolver: zodResolver(awardWinnerSchema) });

  useEffect(() => {
    const typesRef = ref(db, 'awardTypes');
    const winnersRef = ref(db, 'awardWinners');

    const unsubscribeTypes = onValue(typesRef, (snapshot) => {
      const data = snapshot.val() || {};
      const typesArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
      setAwardTypes(typesArray);
      
      // Fetch winners only after types are loaded to map them correctly
      const unsubscribeWinners = onValue(winnersRef, (winnersSnapshot) => {
        const winnersData = winnersSnapshot.val() || {};
        const typesMap = new Map(typesArray.map(t => [t.id, {name: t.name, isCopa: t.isCopa || false}]));
        
        const winnersList: AwardWinnerWithTypeName[] = Object.keys(winnersData).map(key => {
            const winner = winnersData[key];
            const awardTypeInfo = typesMap.get(winner.awardTypeId);
            return {
                ...winner,
                id: key,
                awardTypeName: awardTypeInfo?.name || "Premio Desconocido",
                isCopa: awardTypeInfo?.isCopa || false
            };
        }).sort((a,b) => (b.timestamp || 0) - (a.timestamp || 0));

        setAwardWinners(winnersList);
        setLoadingData(false);
      });
      return () => unsubscribeWinners();
    });

    return () => {
      unsubscribeTypes();
    };
  }, []);

  const handleAddAwardType = async (data: z.infer<typeof awardTypeSchema>) => {
    setIsSubmitting(true);
    await push(ref(db, 'awardTypes'), data);
    toast({ title: "Tipo de premio añadido" });
    awardTypeForm.reset({ name: '', isCopa: false });
    setIsSubmitting(false);
  };
  
  const handleAddAwardWinner = async (data: z.infer<typeof awardWinnerSchema>) => {
    setIsSubmitting(true);
    await push(ref(db, 'awardWinners'), { ...data, timestamp: Date.now() });
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
                        <form onSubmit={awardTypeForm.handleSubmit(handleAddAwardType)} className="space-y-4">
                            <FormField control={awardTypeForm.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Nombre del premio</FormLabel><FormControl><Input placeholder="Ej: DJ del Mes" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField
                                control={awardTypeForm.control} name="isCopa"
                                render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Es un premio de la Copa</FormLabel>
                                        <FormDescription>Marca esto si el premio es exclusivo para la Copa Habbospeed.</FormDescription>
                                    </div>
                                </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isSubmitting} className="w-full"><PlusCircle className="mr-2"/>Añadir Tipo</Button>
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
                                        <TableCell className="font-semibold text-primary">{winner.awardTypeName} {winner.isCopa && "(Copa)"}</TableCell>
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
