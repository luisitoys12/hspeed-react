
"use client";

import { useState, useEffect } from 'react';
import { ref, onValue, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, CheckCircle, Clock, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: string;
  approved: boolean;
  createdAt: string;
}

const ROLES = ['pending', 'user', 'dj', 'guide', 'Admin'];

export default function UserManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  useEffect(() => {
    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const usersArray = data ? Object.keys(data).map(key => ({ ...data[key] })) : [];
      setUsers(usersArray);
      setDbLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateUser = async (uid: string, updates: Partial<UserProfile>) => {
    try {
      const userRef = ref(db, `users/${uid}`);
      await set(userRef, { ...users.find(u => u.uid === uid), ...updates });
      toast({ title: "¡Éxito!", description: "El usuario ha sido actualizado." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el usuario." });
    }
  };

  if (authLoading || dbLoading) return <UsersSkeleton />;
  if (!user?.isSuperAdmin) return <div>Acceso denegado</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold"><Users />Gestión de Usuarios</h1>
        <p className="text-muted-foreground mt-2">Aprueba nuevos usuarios y asigna roles.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Todos los Usuarios</CardTitle>
          <CardDescription>Gestiona el acceso y los permisos de los usuarios registrados.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dbLoading ? <TableRow><TableCell colSpan={5}><Skeleton className="h-10 w-full" /></TableCell></TableRow> :
                        users.map((u) => (
                            <TableRow key={u.uid}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${u.displayName}&headonly=1&size=s`} />
                                            <AvatarFallback>{u.displayName.substring(0,1)}</AvatarFallback>
                                        </Avatar>
                                        {u.displayName}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">{u.email}</TableCell>
                                <TableCell>
                                    <Badge variant={u.approved ? "default" : "secondary"}>
                                        {u.approved ? 'Aprobado' : 'Pendiente'}
                                    </Badge>
                                </TableCell>
                                <TableCell>{u.role}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                            {!u.approved && <DropdownMenuItem onClick={() => handleUpdateUser(u.uid, { approved: true, role: 'user' })}><CheckCircle className="mr-2"/>Aprobar Usuario</DropdownMenuItem>}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuLabel>Asignar Rol</DropdownMenuLabel>
                                            {ROLES.map(role => (
                                                <DropdownMenuItem key={role} disabled={u.role === role} onClick={() => handleUpdateUser(u.uid, { role })}>
                                                    {role}
                                                </DropdownMenuItem>
                                            ))}
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
    </div>
  );
}

const UsersSkeleton = () => (
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
