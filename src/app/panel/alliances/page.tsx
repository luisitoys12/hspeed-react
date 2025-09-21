"use client";

import { useState, useEffect } from 'react';
import { ref, onValue, set, remove, push } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Handshake, Edit, Trash2, PlusCircle, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

const formSchema = z.object({
  name: z.string().min(2, "El nombre es requerido."),
  imageUrl: z.string().url("Debe ser una URL válida."),
  imageHint: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type Alliance = FormValues & { id: string };

interface AllianceFormProps {
  onSave: (values: FormValues, id?: string) => void;
  isSubmitting: boolean;
  initialData?: Alliance;
}

function AllianceForm({ onSave, isSubmitting, initialData }: AllianceFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || { name: '', imageUrl: '', imageHint: '' },
  });

  const onSubmit = (values: FormValues) => {
    onSave(values, initialData?.id);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Nombre de la Alianza</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField control={form.control} name="imageUrl" render={({ field }) => (
          <FormItem><FormLabel>URL del Logo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Guardar Cambios' : 'Añadir Alianza'}
        </Button>
      </form>
    </Form>
  );
}

export default function AllianceManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [alliances, setAlliances] = useState<Alliance[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const alliancesRef = ref(db, 'alliances');
    const unsubscribe = onValue(alliancesRef, (snapshot) => {
      const data = snapshot.val();
      const alliancesArray = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setAlliances(alliancesArray);
      setDbLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (values: FormValues, id?: string) => {
    setIsSubmitting(true);
    try {
      const allianceRef = id ? ref(db, `alliances/${id}`) : push(ref(db, 'alliances'));
      await set(allianceRef, values);
      toast({ title: "¡Éxito!", description: `La alianza ha sido ${id ? 'actualizada' : 'añadida'}.` });
      setIsDialogOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar la alianza." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(ref(db, `alliances/${id}`));
      toast({ title: "Alianza eliminada" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar la alianza." });
    }
  };

  if (authLoading) return <AllianceSkeleton />;
  if (!user?.isSuperAdmin) return <div>Acceso denegado</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold"><Handshake />Gestión de Alianzas</h1>
        <p className="text-muted-foreground mt-2">Añade o elimina las alianzas que se muestran en la página principal.</p>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Alianzas Oficiales</CardTitle>
                <CardDescription>Gestiona las fansites y webs aliadas.</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" />Añadir Alianza</Button></DialogTrigger>
                <DialogContent><DialogHeader><DialogTitle>Añadir Nueva Alianza</DialogTitle></DialogHeader><AllianceForm isSubmitting={isSubmitting} onSave={handleSave} /></DialogContent>
            </Dialog>
        </CardHeader>
        <CardContent>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Logo</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dbLoading ? <TableRow><TableCell colSpan={3}><Skeleton className="h-10 w-full" /></TableCell></TableRow> :
                        alliances.map((alliance) => (
                            <TableRow key={alliance.id}>
                                <TableCell><Image src={alliance.imageUrl} alt={alliance.name} width={100} height={50} className="object-contain bg-muted p-1 rounded-md" unoptimized /></TableCell>
                                <TableCell className="font-medium">{alliance.name}</TableCell>
                                <TableCell className="text-right">
                                    <Dialog>
                                        <DialogTrigger asChild><Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button></DialogTrigger>
                                        <DialogContent><DialogHeader><DialogTitle>Editar Alianza</DialogTitle></DialogHeader><AllianceForm isSubmitting={isSubmitting} onSave={handleSave} initialData={alliance} /></DialogContent>
                                    </Dialog>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Se eliminará la alianza <strong>{alliance.name}</strong>.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(alliance.id)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction></AlertDialogFooter>
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
  );
}

const AllianceSkeleton = () => (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
        <Skeleton className="h-12 w-1/2" />
        <Card>
            <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
            <CardContent className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </CardContent>
        </Card>
    </div>
);
