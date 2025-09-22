
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, remove } from 'firebase/database';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';

type SongRequest = {
  id: string;
  request: string;
  user: string;
  timestamp: number;
};

export default function SongRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const requestsRef = ref(db, 'song-requests');
    const unsubscribe = onValue(requestsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const requestsArray: SongRequest[] = Object.keys(data)
        .map(key => ({ id: key, ...data[key] }))
        .sort((a, b) => b.timestamp - a.timestamp);
      setRequests(requestsArray);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await remove(ref(db, `song-requests/${id}`));
      toast({ title: 'Petición eliminada' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar la petición.' });
    }
  };

  const isDjOrAdmin = user && (user.role === 'dj' || user.role === 'Admin');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Peticiones de Canciones</CardTitle>
        <CardDescription>
          Aquí puedes ver las últimas peticiones de los oyentes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Canción y Artista</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Hora</TableHead>
                {isDjOrAdmin && <TableHead className="text-right">Acción</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={isDjOrAdmin ? 4 : 3}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : requests.length > 0 ? (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.request}</TableCell>
                    <TableCell>{request.user}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(request.timestamp), { addSuffix: true, locale: es })}
                    </TableCell>
                    {isDjOrAdmin && (
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Se eliminará la petición: "{request.request}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(request.id)} className="bg-destructive hover:bg-destructive/90">
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isDjOrAdmin ? 4 : 3} className="h-24 text-center">
                    No hay peticiones pendientes.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
