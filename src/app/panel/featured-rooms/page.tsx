"use client";

import { useState, useEffect } from 'react';
import { ref, onValue, set, remove, push } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DoorOpen, Edit, Trash2, PlusCircle, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

const formSchema = z.object({
  name: z.string().min(2, "El nombre es requerido."),
  owner: z.string().min(2, "El dueño es requerido."),
  imageUrl: z.string().url("Debe ser una URL válida."),
});

type FormValues = z.infer<typeof formSchema>;
type FeaturedRoom = FormValues & { id: string };

interface RoomFormProps {
  onSave: (values: FormValues, id?: string) => void;
  isSubmitting: boolean;
  initialData?: FeaturedRoom;
}

function RoomForm({ onSave, isSubmitting, initialData }: RoomFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || { name: '', owner: '', imageUrl: '' },
  });

  const onSubmit = (values: FormValues) => {
    onSave(values, initialData?.id);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Nombre de la Sala</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField control={form.control} name="owner" render={({ field }) => (
          <FormItem><FormLabel>Dueño de la Sala</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField control={form.control} name="imageUrl" render={({ field }) => (
          <FormItem><FormLabel>URL de la Imagen (Thumbnail)</FormLabel><FormControl><Input placeholder="https://www.habbo.com/habbo-imaging/room/..." {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Guardar Cambios' : 'Añadir Sala'}
        </Button>
      </form>
    </Form>
  );
}

export default function FeaturedRoomsManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<FeaturedRoom[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const roomsRef = ref(db, 'featuredRooms');
    const unsubscribe = onValue(roomsRef, (snapshot) => {
      const data = snapshot.val();
      const roomsArray = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setRooms(roomsArray);
      setDbLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (values: FormValues, id?: string) => {
    setIsSubmitting(true);
    try {
      const roomRef = id ? ref(db, `featuredRooms/${id}`) : push(ref(db, 'featuredRooms'));
      await set(roomRef, values);
      toast({ title: "¡Éxito!", description: `La sala ha sido ${id ? 'actualizada' : 'añadida'}.` });
      setIsDialogOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar la sala." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(ref(db, `featuredRooms/${id}`));
      toast({ title: "Sala eliminada" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar la sala." });
    }
  };

  if (authLoading) return <RoomSkeleton />;
  if (!user?.isSuperAdmin) return <div>Acceso denegado</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold"><DoorOpen />Gestión de Salas Destacadas</h1>
        <p className="text-muted-foreground mt-2">Añade o elimina las salas que se muestran en la página principal.</p>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Salas Destacadas</CardTitle>
                <CardDescription>Gestiona las salas que se muestran en la página de inicio.</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" />Añadir Sala</Button></DialogTrigger>
                <DialogContent><DialogHeader><DialogTitle>Añadir Nueva Sala</DialogTitle></DialogHeader><RoomForm isSubmitting={isSubmitting} onSave={handleSave} /></DialogContent>
            </Dialog>
        </CardHeader>
        <CardContent>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Imagen</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Dueño</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dbLoading ? <TableRow><TableCell colSpan={4}><Skeleton className="h-10 w-full" /></TableCell></TableRow> :
                        rooms.map((room) => (
                            <TableRow key={room.id}>
                                <TableCell><Image src={room.imageUrl} alt={room.name} width={120} height={80} className="object-cover bg-muted p-1 rounded-md" unoptimized /></TableCell>
                                <TableCell className="font-medium">{room.name}</TableCell>
                                <TableCell>{room.owner}</TableCell>
                                <TableCell className="text-right">
                                    <Dialog>
                                        <DialogTrigger asChild><Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button></DialogTrigger>
                                        <DialogContent><DialogHeader><DialogTitle>Editar Sala</DialogTitle></DialogHeader><RoomForm isSubmitting={isSubmitting} onSave={handleSave} initialData={room} /></DialogContent>
                                    </Dialog>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Se eliminará la sala <strong>{room.name}</strong>.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(room.id)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction></AlertDialogFooter>
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

const RoomSkeleton = () => (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
        <Skeleton className="h-12 w-1/2" />
        <Card>
            <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
            <CardContent className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </CardContent>
        </Card>
    </div>
);
