
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
import { Award, LoaderCircle, PlusCircle, Trash2, Lock, Unlock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

// Schemas
const categorySchema = z.object({ title: z.string().min(3, "El título es muy corto.") });
const nomineeSchema = z.object({ categoryId: z.string(), nomineeName: z.string().min(3, "El nombre es requerido.") });

// Types
type Category = { id: string; title: string; };
type Nominee = { id: string; name: string; motto: string; votes: number; };
type NominationData = { [key: string]: Nominee };

export default function AwardsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [nominations, setNominations] = useState<{ [catId: string]: NominationData }>({});
  const [isVotingOpen, setIsVotingOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  const categoryForm = useForm<z.infer<typeof categorySchema>>({ resolver: zodResolver(categorySchema) });
  const nomineeForm = useForm<z.infer<typeof nomineeSchema>>({ resolver: zodResolver(nomineeSchema) });

  useEffect(() => {
    const categoriesRef = ref(db, 'award_categories');
    const nominationsRef = ref(db, 'award_nominations');
    const configRef = ref(db, 'config/awardVotingOpen');

    const unsubCategories = onValue(categoriesRef, (snapshot) => {
      setCategories(snapshot.val() ? Object.keys(snapshot.val()).map(k => ({ id: k, ...snapshot.val()[k] })) : []);
      setLoadingData(false);
    });
    const unsubNominations = onValue(nominationsRef, (snapshot) => {
      setNominations(snapshot.val() || {});
    });
    const unsubConfig = onValue(configRef, (snapshot) => {
      setIsVotingOpen(snapshot.val() === true);
    });

    return () => {
      unsubCategories();
      unsubNominations();
      unsubConfig();
    };
  }, []);
  
  const handleAddCategory = async (data: z.infer<typeof categorySchema>) => {
    setIsSubmitting(true);
    await push(ref(db, 'award_categories'), { title: data.title });
    toast({ title: "Categoría creada" });
    categoryForm.reset({ title: '' });
    setIsSubmitting(false);
  };

  const handleAddNominee = async (data: z.infer<typeof nomineeSchema>) => {
     setIsSubmitting(true);
    // Quick check if nominee exists in Habbo API
    try {
        const response = await fetch(`/api/habbo-user?username=${data.nomineeName}`);
        if (!response.ok) throw new Error();
        const habboData = await response.json();

        const nomineeRef = push(ref(db, `award_nominations/${data.categoryId}`));
        await set(nomineeRef, { name: habboData.user.name, motto: habboData.user.motto, votes: 0 });
        toast({ title: "Nominado añadido" });
        nomineeForm.reset({ nomineeName: '', categoryId: data.categoryId });
    } catch {
        toast({ variant: 'destructive', title: 'Error', description: 'El usuario de Habbo no existe o no se pudo verificar.' });
    }
    setIsSubmitting(false);
  }

  const handleDeleteNominee = async (categoryId: string, nomineeId: string) => {
    await remove(ref(db, `award_nominations/${categoryId}/${nomineeId}`));
    toast({ title: "Nominado eliminado" });
  };
  
  const handleDeleteCategory = async (categoryId: string) => {
      await remove(ref(db, `award_categories/${categoryId}`));
      await remove(ref(db, `award_nominations/${categoryId}`));
      toast({title: "Categoría eliminada"});
  }

  const handleToggleVoting = async (isOpen: boolean) => {
    await set(ref(db, 'config/awardVotingOpen'), isOpen);
    toast({ title: `Votaciones ${isOpen ? 'abiertas' : 'cerradas'}` });
  };

  if (authLoading || loadingData) return <div className="container p-8"><Skeleton className="w-full h-96" /></div>;
  if (!user?.isSuperAdmin) return <div>Acceso denegado.</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <Award className="h-8 w-8 text-primary" />
          Gestión de Habbospeed Awards
        </h1>
        <p className="text-muted-foreground mt-2">Crea categorías, añade nominados y gestiona las votaciones.</p>
      </div>

       <Card className="mb-8">
            <CardHeader>
                <CardTitle>Control General</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center space-x-4 rounded-lg border p-4">
                {isVotingOpen ? <Unlock className="h-5 w-5 text-green-500" /> : <Lock className="h-5 w-5 text-red-500" />}
                <div className="flex-grow">
                    <Label htmlFor="voting-switch" className="font-bold">Votaciones {isVotingOpen ? 'Abiertas' : 'Cerradas'}</Label>
                    <p className="text-xs text-muted-foreground">Activa o desactiva la posibilidad de que los usuarios voten en la página pública.</p>
                </div>
                <Switch id="voting-switch" checked={isVotingOpen} onCheckedChange={handleToggleVoting} />
            </CardContent>
        </Card>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Añadir Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...categoryForm}>
                <form onSubmit={categoryForm.handleSubmit(handleAddCategory)} className="space-y-4">
                  <FormField control={categoryForm.control} name="title" render={({ field }) => (
                    <FormItem><FormControl><Input placeholder="Ej: DJ del Año" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <Button type="submit" disabled={isSubmitting} className="w-full"><PlusCircle className="mr-2" />Crear Categoría</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
            {categories.map(cat => (
                <Card key={cat.id}>
                    <CardHeader className="flex-row items-center justify-between">
                        <div>
                            <CardTitle>{cat.title}</CardTitle>
                            <CardDescription>Gestiona los nominados para esta categoría.</CardDescription>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="mr-2" />Eliminar Categoría</Button></AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>¿Seguro?</AlertDialogTitle><AlertDialogDescription>Se eliminará la categoría "{cat.title}" y todos sus nominados. Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteCategory(cat.id)} className="bg-destructive">Eliminar</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardHeader>
                    <CardContent>
                        <Form {...nomineeForm}>
                            <form onSubmit={nomineeForm.handleSubmit(handleAddNominee)} className="flex items-center gap-2 mb-4">
                                <FormField control={nomineeForm.control} name="nomineeName" render={({ field }) => (
                                    <FormItem className="flex-grow">
                                        <FormControl><Input placeholder="Nombre de Habbo del nominado..." {...field} /></FormControl>
                                    </FormItem>
                                )}/>
                                <Button type="submit" onClick={() => nomineeForm.setValue('categoryId', cat.id)} disabled={isSubmitting}>
                                    {isSubmitting ? <LoaderCircle className="animate-spin"/> : 'Añadir'}
                                </Button>
                            </form>
                        </Form>
                        <div className="border rounded-lg p-2 space-y-2">
                             {(nominations[cat.id] ? Object.entries(nominations[cat.id]) : []).map(([nomineeId, nominee]) => (
                                <div key={nomineeId} className="flex items-center justify-between p-2 bg-muted rounded-md">
                                    <div className="flex items-center gap-3">
                                        <Image src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${nominee.name}&headonly=1&size=s`} alt={nominee.name} width={32} height={32} unoptimized/>
                                        <div>
                                            <p className="font-bold">{nominee.name}</p>
                                            <p className="text-xs text-muted-foreground italic">"{nominee.motto}"</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-center">
                                            <p className="font-bold text-primary text-lg">{nominee.votes}</p>
                                            <p className="text-xs text-muted-foreground">Votos</p>
                                        </div>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Confirmar</AlertDialogTitle><AlertDialogDescription>Se eliminará a {nominee.name} de esta categoría.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteNominee(cat.id, nomineeId)} className="bg-destructive">Eliminar</AlertDialogAction></AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                             ))}
                             {!nominations[cat.id] && <p className="text-center text-sm text-muted-foreground py-4">No hay nominados en esta categoría todavía.</p>}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </div>
  );
}


    