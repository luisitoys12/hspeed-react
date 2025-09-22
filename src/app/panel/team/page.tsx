"use client";

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ref, onValue, set, remove } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, UserPlus, Trash2, LoaderCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type TeamMember = {
  name: string;
  roles: string[];
};

const formSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  role: z.string({ required_error: "Debes seleccionar un rol." }),
});

type FormValues = z.infer<typeof formSchema>;

export default function TeamManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { control, handleSubmit, register, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (db) {
      const teamRef = ref(db, 'team');
      const unsubscribe = onValue(teamRef, (snapshot) => {
        const data = snapshot.val();
        const membersArray = data ? Object.keys(data).map(key => ({ name: key, ...data[key] })) : [];
        setTeamMembers(membersArray);
        setDbLoading(false);
      });
      return () => unsubscribe();
    }
  }, []);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    // Check if user already exists in the team
    if (teamMembers.some(member => member.name.toLowerCase() === data.name.toLowerCase())) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Este usuario ya forma parte del equipo."
        });
        setIsSubmitting(false);
        return;
    }

    try {
        // Verify user exists in Habbo API
        const response = await fetch(`https://www.habbo.es/api/public/users?name=${data.name}`);
        if (!response.ok) {
            throw new Error("El usuario de Habbo no existe.");
        }

        const memberRef = ref(db, `team/${data.name}`);
        await set(memberRef, { roles: [data.role] });

        toast({ title: "¡Éxito!", description: "El miembro ha sido añadido al equipo." });
        reset({ name: "", role: undefined });
    } catch (error: any) {
        console.error("Error adding team member:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "No se pudo añadir al miembro."
        });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (memberName: string) => {
    try {
        const memberRef = ref(db, `team/${memberName}`);
        await remove(memberRef);
        toast({ title: "Miembro eliminado", description: `${memberName} ha sido eliminado del equipo.` });
    } catch (error) {
        console.error("Error deleting member:", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar al miembro." });
    }
  };

  const renderSkeleton = () => (
    Array.from({ length: 3 }).map((_, index) => (
        <TableRow key={index}>
            <TableCell>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </TableCell>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            <TableCell className="text-right">
                 <Skeleton className="h-8 w-8 inline-block" />
            </TableCell>
        </TableRow>
    ))
  )
  
  if (authLoading) {
      return <div>Cargando...</div>
  }

  if (!user?.isSuperAdmin) {
       return (
       <div className="container mx-auto p-4 md:p-8">
         <Card>
           <CardHeader>
             <CardTitle>Acceso Denegado</CardTitle>
             <CardDescription>No tienes permisos para gestionar el equipo.</CardDescription>
           </CardHeader>
         </Card>
       </div>
     )
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <Users className="h-8 w-8 text-primary" />
          Gestión de Equipo
        </h1>
        <p className="text-muted-foreground mt-2">
          Añade, edita o elimina miembros del equipo de Habbospeed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Miembros Actuales</CardTitle>
              <CardDescription>Esta es la lista de usuarios en el equipo. Los datos se actualizan en tiempo real desde Firebase.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dbLoading ? renderSkeleton() : teamMembers.map((member) => (
                    <TableRow key={member.name}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${member.name}&headonly=1&size=s`} alt={member.name} />
                            <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{member.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">{member.roles.join(', ')}</span>
                      </TableCell>
                      <TableCell className="text-right">
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                             </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente a <strong>{member.name}</strong> del equipo.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(member.name)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus />
                Añadir Nuevo Miembro
              </CardTitle>
              <CardDescription>
                Introduce el nombre de usuario de Habbo y asigna un rol.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="habbo-name">Nombre de Usuario de Habbo</Label>
                  <Input id="habbo-name" placeholder="Ej: PixelMaster" {...register("name")} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                   <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="role">
                                <SelectValue placeholder="Selecciona un rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DJ">DJ</SelectItem>
                                <SelectItem value="Coordinador">Coordinador</SelectItem>
                                <SelectItem value="Administrador">Administrador</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                  />
                  {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    Añadir Miembro
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
