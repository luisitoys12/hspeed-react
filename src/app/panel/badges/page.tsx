
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
import { Badge, Award, LoaderCircle, PlusCircle, Trash2, Edit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';

// Schemas & Types
const badgeSchema = z.object({
  name: z.string().min(3, "El nombre es muy corto."),
  description: z.string().min(5, "La descripción es muy corta."),
  imageUrl: z.string().url("Debe ser una URL de imagen válida."),
});
type BadgeFormValues = z.infer<typeof badgeSchema>;
type CustomBadge = { id: string; name: string; description: string; imageUrl: string; };
type UserProfile = { uid: string; displayName: string; };

// Badge Form Component
function BadgeForm({ onSave, isSubmitting, initialData }: { onSave: (values: BadgeFormValues, id?: string) => void; isSubmitting: boolean; initialData?: CustomBadge; }) {
  const form = useForm<BadgeFormValues>({
    resolver: zodResolver(badgeSchema),
    defaultValues: initialData || { name: '', description: '', imageUrl: '' },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => onSave(data, initialData?.id))} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Nombre de la Placa</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Descripción</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField control={form.control} name="imageUrl" render={({ field }) => (
          <FormItem><FormLabel>URL de la Imagen</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <LoaderCircle className="mr-2 animate-spin"/>}
          {initialData ? 'Guardar Cambios' : 'Crear Placa'}
        </Button>
      </form>
    </Form>
  );
}

export default function BadgesPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [badges, setBadges] = useState<CustomBadge[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const assignForm = useForm<{ userId: string; badgeId: string; }>({
      resolver: zodResolver(z.object({
          userId: z.string({required_error: "Debes seleccionar un usuario."}),
          badgeId: z.string({required_error: "Debes seleccionar una placa."}),
      }))
  });

  useEffect(() => {
    const badgesRef = ref(db, 'custom_badges');
    const usersRef = ref(db, 'users');

    const unsubBadges = onValue(badgesRef, (snapshot) => {
      setBadges(snapshot.val() ? Object.keys(snapshot.val()).map(k => ({ id: k, ...snapshot.val()[k] })) : []);
      setLoadingData(false);
    });
    const unsubUsers = onValue(usersRef, (snapshot) => {
        setUsers(snapshot.val() ? Object.keys(snapshot.val()).map(k => ({ ...snapshot.val()[k] })) : []);
    });

    return () => {
      unsubBadges();
      unsubUsers();
    };
  }, []);
  
  const handleSaveBadge = async (data: BadgeFormValues, id?: string) => {
    setIsSubmitting(true);
    const badgeRef = id ? ref(db, `custom_badges/${id}`) : push(ref(db, 'custom_badges'));
    await set(badgeRef, data);
    toast({ title: `Placa ${id ? 'actualizada' : 'creada'}` });
    setIsSubmitting(false);
    setIsDialogOpen(false);
  };

  const handleDeleteBadge = async (id: string) => {
    await remove(ref(db, `custom_badges/${id}`));
    // Note: This does not remove assigned badges from users. A more complex system would handle this.
    toast({ title: "Placa eliminada" });
  };
  
  const handleAssignBadge = async (data: { userId: string; badgeId: string; }) => {
      setIsSubmitting(true);
      const assignRef = ref(db, `user_badges_assigned/${data.userId}/${data.badgeId}`);
      await set(assignRef, true);
      toast({ title: "Placa asignada correctamente."});
      assignForm.reset();
      setIsSubmitting(false);
  }

  if (authLoading || loadingData) return <div className="container p-8"><Skeleton className="w-full h-96" /></div>;
  if (!user?.isSuperAdmin) return <div>Acceso denegado.</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <Award className="h-8 w-8 text-primary" />
          Gestión de Placas
        </h1>
        <p className="text-muted-foreground mt-2">Crea placas personalizadas y asígnalas a los usuarios.</p>
      </div>

       <Tabs defaultValue="manage">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manage">Gestionar Placas</TabsTrigger>
            <TabsTrigger value="assign">Asignar Placas a Usuarios</TabsTrigger>
        </TabsList>
        <TabsContent value="manage">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
                <div><CardTitle>Galería de Placas</CardTitle><CardDescription>Crea y edita las placas personalizadas de Habbospeed.</CardDescription></div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}><DialogTrigger asChild><Button><PlusCircle className="mr-2"/>Crear Placa</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Nueva Placa</DialogTitle></DialogHeader><BadgeForm onSave={handleSaveBadge} isSubmitting={isSubmitting}/></DialogContent></Dialog>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {badges.map(badge => (
                <div key={badge.id} className="p-4 border rounded-lg text-center space-y-2">
                    <Image src={badge.imageUrl} alt={badge.name} width={50} height={50} className="mx-auto" />
                    <p className="font-bold text-sm truncate">{badge.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{badge.description}</p>
                    <div>
                        <Dialog><DialogTrigger asChild><Button variant="ghost" size="icon"><Edit className="h-4 w-4"/></Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Editar Placa</DialogTitle></DialogHeader><BadgeForm onSave={handleSaveBadge} isSubmitting={isSubmitting} initialData={badge}/></DialogContent></Dialog>
                        <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirmar</AlertDialogTitle><AlertDialogDescription>Se eliminará la placa "{badge.name}".</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteBadge(badge.id)} className="bg-destructive">Eliminar</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                    </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="assign">
           <Card className="max-w-2xl mx-auto">
            <CardHeader><CardTitle>Asignar Placa a Usuario</CardTitle><CardDescription>Selecciona un usuario y una placa para otorgársela.</CardDescription></CardHeader>
            <CardContent>
                <Form {...assignForm}>
                    <form onSubmit={assignForm.handleSubmit(handleAssignBadge)} className="space-y-4">
                        <FormField control={assignForm.control} name="userId" render={({ field }) => (
                           <FormItem><FormLabel>Usuario</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona un usuario" /></SelectTrigger></FormControl><SelectContent>{users.map(u => <SelectItem key={u.uid} value={u.uid}>{u.displayName}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                        )}/>
                         <FormField control={assignForm.control} name="badgeId" render={({ field }) => (
                           <FormItem><FormLabel>Placa</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona una placa" /></SelectTrigger></FormControl><SelectContent>{badges.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                        )}/>
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting && <LoaderCircle className="mr-2 animate-spin"/>}
                            Asignar Placa
                        </Button>
                    </form>
                </Form>
            </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
