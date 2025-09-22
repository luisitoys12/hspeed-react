
"use client";

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
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, LoaderCircle, PlusCircle, Trash2, Edit, Check, X, MoreHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';

// Schemas & Types
const openingSchema = z.object({
  role: z.string().min(2, "El rol es requerido."),
  description: z.string().min(10, "La descripción es muy corta."),
  requirements: z.array(z.object({ value: z.string().min(3, "El requisito es muy corto.") })),
});
type OpeningFormValues = z.infer<typeof openingSchema>;
type Opening = { id: string; role: string; description: string; requirements: string[]; };

type Application = {
  id: string;
  habboName: string;
  role: string;
  experience: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: number;
};

// Opening Form Component
function OpeningForm({ onSave, isSubmitting, initialData }: { onSave: (values: OpeningFormValues) => void; isSubmitting: boolean; initialData?: Opening; }) {
  const form = useForm<OpeningFormValues>({
    resolver: zodResolver(openingSchema),
    defaultValues: initialData 
      ? { ...initialData, requirements: (initialData.requirements || []).map(r => ({ value: r })) }
      : { role: '', description: '', requirements: [{ value: '' }] },
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "requirements" });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
        <FormField control={form.control} name="role" render={({ field }) => (
          <FormItem><FormLabel>Rol</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <div>
          <Label>Requisitos</Label>
          {fields.map((field, index) => (
            <FormField key={field.id} control={form.control} name={`requirements.${index}.value`} render={({ field }) => (
              <FormItem className="flex items-center gap-2 mt-2">
                <FormControl><Input {...field} /></FormControl>
                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 /></Button>
              </FormItem>
            )}/>
          ))}
          <Button type="button" size="sm" variant="outline" className="mt-2" onClick={() => append({ value: '' })}><PlusCircle className="mr-2"/>Añadir Requisito</Button>
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <LoaderCircle className="mr-2 animate-spin"/>}
          {initialData ? 'Guardar Cambios' : 'Crear Vacante'}
        </Button>
      </form>
    </Form>
  );
}

export default function RecruitmentPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const openingsRef = ref(db, 'openings');
    const applicationsRef = ref(db, 'applications');
    
    const unsubOpenings = onValue(openingsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setOpenings(Object.keys(data).map(key => ({ id: key, ...data[key], requirements: data[key].requirements || [] })));
      setLoadingData(false);
    });
    
    const unsubApplications = onValue(applicationsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const appArray = Object.keys(data).map(key => ({ id: key, ...data[key] })).sort((a,b) => b.timestamp - a.timestamp);
      setApplications(appArray);
    });

    return () => {
      unsubOpenings();
      unsubApplications();
    };
  }, []);

  const handleSaveOpening = async (data: OpeningFormValues, id?: string) => {
    setIsSubmitting(true);
    const openingRef = id ? ref(db, `openings/${id}`) : push(ref(db, 'openings'));
    const values = { ...data, requirements: data.requirements.map(r => r.value).filter(Boolean) };
    await set(openingRef, values);
    toast({ title: `Vacante ${id ? 'actualizada' : 'creada'}` });
    setIsSubmitting(false);
    setIsDialogOpen(false);
  };
  
  const handleDeleteOpening = async (id: string) => {
    await remove(ref(db, `openings/${id}`));
    toast({ title: "Vacante eliminada" });
  };
  
  const handleUpdateApplicationStatus = async (id: string, status: Application['status']) => {
      await set(ref(db, `applications/${id}/status`), status);
      toast({ title: "Estado de postulación actualizado." });
  }

  if (authLoading || loadingData) return <div className="container p-8"><Skeleton className="w-full h-64" /></div>;
  if (!user?.isSuperAdmin) return <div>Acceso denegado.</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <Briefcase className="h-8 w-8 text-primary" />
          Reclutamiento
        </h1>
        <p className="text-muted-foreground mt-2">Gestiona las vacantes abiertas y revisa las postulaciones de los usuarios.</p>
      </div>

      <Tabs defaultValue="applications">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="applications">Postulaciones ({applications.filter(a => a.status === 'pending').length})</TabsTrigger>
            <TabsTrigger value="openings">Gestionar Vacantes</TabsTrigger>
        </TabsList>
        <TabsContent value="applications">
          <Card>
            <CardHeader><CardTitle>Postulaciones Recibidas</CardTitle><CardDescription>Revisa y gestiona el estado de las postulaciones.</CardDescription></CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader><TableRow><TableHead>Postulante</TableHead><TableHead>Rol</TableHead><TableHead>Fecha</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {applications.map(app => (
                      <TableRow key={app.id}>
                        <TableCell className="font-semibold">{app.habboName}</TableCell>
                        <TableCell>{app.role}</TableCell>
                        <TableCell>{format(new Date(app.timestamp), 'dd/MM/yyyy')}</TableCell>
                        <TableCell><Badge variant={app.status === 'pending' ? 'secondary' : app.status === 'accepted' ? 'default' : 'destructive'}>{app.status}</Badge></TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal/></Button></DropdownMenuTrigger>
                            <DropdownMenuContent>
                               <DropdownMenuItem onClick={() => handleUpdateApplicationStatus(app.id, 'accepted')}><Check className="mr-2"/>Aceptar</DropdownMenuItem>
                               <DropdownMenuItem onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')}><X className="mr-2"/>Rechazar</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="openings">
           <Card>
            <CardHeader className="flex-row items-center justify-between">
                <div><CardTitle>Vacantes Abiertas</CardTitle><CardDescription>Crea y edita los puestos que se muestran en "Únete al equipo".</CardDescription></div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}><DialogTrigger asChild><Button><PlusCircle className="mr-2"/>Crear Vacante</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Nueva Vacante</DialogTitle></DialogHeader><OpeningForm onSave={(data) => handleSaveOpening(data)} isSubmitting={isSubmitting}/></DialogContent></Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              {openings.map(op => (
                <Card key={op.id} className="p-4 flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-primary">{op.role}</h3>
                        <p className="text-sm text-muted-foreground">{op.description}</p>
                        <ul className="text-xs list-disc pl-5 mt-2 text-muted-foreground">
                            {op.requirements.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                    </div>
                    <div className="flex-shrink-0">
                        <Dialog><DialogTrigger asChild><Button variant="ghost" size="icon"><Edit/></Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Editar Vacante</DialogTitle></DialogHeader><OpeningForm onSave={(data) => handleSaveOpening(data, op.id)} isSubmitting={isSubmitting} initialData={op} /></DialogContent></Dialog>
                        <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2/></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirmar</AlertDialogTitle><AlertDialogDescription>Se eliminará la vacante de {op.role}.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteOpening(op.id)} className="bg-destructive">Eliminar</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                    </div>
                </Card>
              ))}
            </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
