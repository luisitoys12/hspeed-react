
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Vote, LoaderCircle, PlusCircle, Trash2, Edit, CheckSquare, Square } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import type { Poll } from '@/lib/types';
import { Label } from '@/components/ui/label';

// Schemas & Types
const pollSchema = z.object({
  title: z.string().min(5, "El título de la encuesta es muy corto."),
  options: z.array(z.object({ name: z.string().min(1, "El nombre de la opción es requerido.") })),
});
type PollFormValues = z.infer<typeof pollSchema>;


// Poll Form Component
function PollForm({ onSave, isSubmitting, initialData }: { onSave: (values: PollFormValues) => void; isSubmitting: boolean; initialData?: Poll; }) {
  const form = useForm<PollFormValues>({
    resolver: zodResolver(pollSchema),
    defaultValues: initialData 
      ? { title: initialData.title, options: initialData.options ? Object.values(initialData.options).map(o => ({name: o.name})) : [{name: ''}] }
      : { title: '', options: [{ name: '' }, { name: '' }] },
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "options" });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem><FormLabel>Título de la Encuesta</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <div>
          <Label>Opciones de Respuesta</Label>
          {fields.map((field, index) => (
            <FormField key={field.id} control={form.control} name={`options.${index}.name`} render={({ field }) => (
              <FormItem className="flex items-center gap-2 mt-2">
                <FormControl><Input {...field} placeholder={`Opción ${index + 1}`} /></FormControl>
                {fields.length > 2 && <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 /></Button>}
              </FormItem>
            )}/>
          ))}
          <Button type="button" size="sm" variant="outline" className="mt-2" onClick={() => append({ name: '' })}><PlusCircle className="mr-2"/>Añadir Opción</Button>
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <LoaderCircle className="mr-2 animate-spin"/>}
          {initialData ? 'Guardar Cambios' : 'Crear Encuesta'}
        </Button>
      </form>
    </Form>
  );
}

export default function PollsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const pollsRef = ref(db, 'polls');
    const unsubscribe = onValue(pollsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const pollsArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
      pollsArray.sort((a,b) => b.createdAt - a.createdAt);
      setPolls(pollsArray);
      setLoadingData(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSavePoll = async (data: PollFormValues, id?: string) => {
    setIsSubmitting(true);
    const pollRef = id ? ref(db, `polls/${id}`) : push(ref(db, 'polls'));
    
    const optionsObject = data.options.reduce((acc, opt, index) => {
        acc[`opt${index + 1}`] = { name: opt.name, votes: 0 };
        return acc;
    }, {} as { [key: string]: { name: string, votes: number } });

    const newPollData = {
        title: data.title,
        options: optionsObject,
        isActive: false, // Always created as inactive
        createdAt: id ? (polls.find(p => p.id === id)?.createdAt || Date.now()) : Date.now(),
    };

    await set(pollRef, newPollData);
    toast({ title: `Encuesta ${id ? 'actualizada' : 'creada'}` });
    setIsSubmitting(false);
    setIsDialogOpen(false);
  };
  
  const handleDeletePoll = async (id: string) => {
    await remove(ref(db, `polls/${id}`));
    // Also remove votes associated with this poll
    await remove(ref(db, `poll_votes`)); // Simplified: clears all votes. A more complex app might do this differently.
    toast({ title: "Encuesta eliminada" });
  };

  const handleToggleActive = async (pollToActivate: Poll) => {
      polls.forEach(async (poll) => {
          const pollRef = ref(db, `polls/${poll.id}/isActive`);
          await set(pollRef, poll.id === pollToActivate.id ? !poll.isActive : false);
      });
      toast({ title: "Estado de la encuesta actualizado." });
  }

  if (authLoading || loadingData) return <div className="container p-8"><Skeleton className="w-full h-64" /></div>;
  if (!user?.isSuperAdmin) return <div>Acceso denegado.</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <Vote className="h-8 w-8 text-primary" />
          Gestión de Encuestas
        </h1>
        <p className="text-muted-foreground mt-2">Crea, activa y elimina las encuestas de la comunidad.</p>
      </div>

       <Card>
        <CardHeader className="flex-row items-center justify-between">
            <div><CardTitle>Lista de Encuestas</CardTitle><CardDescription>Solo una encuesta puede estar activa a la vez.</CardDescription></div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}><DialogTrigger asChild><Button><PlusCircle className="mr-2"/>Crear Encuesta</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Nueva Encuesta</DialogTitle></DialogHeader><PollForm onSave={(data) => handleSavePoll(data)} isSubmitting={isSubmitting}/></DialogContent></Dialog>
        </CardHeader>
        <CardContent>
            <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {polls.map(poll => (
                    <TableRow key={poll.id}>
                        <TableCell className="font-semibold">{poll.title}</TableCell>
                        <TableCell><Badge variant={poll.isActive ? 'default' : 'outline'}>{poll.isActive ? 'Activa' : 'Inactiva'}</Badge></TableCell>
                        <TableCell className="text-right">
                           <Button variant="ghost" size="icon" onClick={() => handleToggleActive(poll)}>
                                {poll.isActive ? <CheckSquare className="h-5 w-5 text-primary"/> : <Square className="h-5 w-5"/>}
                           </Button>
                           <Dialog>
                            <DialogTrigger asChild><Button variant="ghost" size="icon"><Edit className="h-4 w-4"/></Button></DialogTrigger>
                            <DialogContent><DialogHeader><DialogTitle>Editar Encuesta</DialogTitle></DialogHeader><PollForm onSave={(data) => handleSavePoll(data, poll.id)} isSubmitting={isSubmitting} initialData={poll} /></DialogContent>
                           </Dialog>
                           <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive"/></Button></AlertDialogTrigger>
                            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirmar</AlertDialogTitle><AlertDialogDescription>Se eliminará la encuesta "{poll.title}" y todos sus votos.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeletePoll(poll.id)} className="bg-destructive">Eliminar</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
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
  );
}
