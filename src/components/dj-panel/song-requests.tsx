
'use client';

import { useEffect, useState } from 'react';
import { requestsApi } from '@/lib/api';
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
import { Badge } from '../ui/badge';

type UserRequest = {
  id: string;
  type: "saludo" | "grito" | "concurso" | "cancion" | "declaracion";
  details: string;
  user: string;
  timestamp: number;
};

export default function SongRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const data: any = await requestsApi.getAll();
      const requestsArray: UserRequest[] = data.map((req: any) => ({
        id: req._id,
        type: req.type,
        details: req.details,
        user: req.user,
        timestamp: new Date(req.timestamp).getTime()
      })).sort((a: any, b: any) => b.timestamp - a.timestamp);
      setRequests(requestsArray);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await requestsApi.delete(id);
      setRequests(requests.filter(r => r.id !== id));
      toast({ title: 'Petición eliminada' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar la petición.' });
    }
  };

  const isAdmin = user && user.isSuperAdmin;

  const getBadgeVariant = (type: UserRequest['type']) => {
      switch(type) {
          case 'cancion': return 'default';
          case 'saludo': return 'secondary';
          case 'declaracion': return 'destructive';
          default: return 'outline';
      }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bandeja de Peticiones</CardTitle>
        <CardDescription>
          Aquí puedes ver las últimas peticiones de los oyentes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Detalles</TableHead>
                <TableHead>Hora</TableHead>
                {isAdmin && <TableHead className="text-right">Acción</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={isAdmin ? 5 : 4}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : requests.length > 0 ? (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.user}</TableCell>
                    <TableCell><Badge variant={getBadgeVariant(request.type)}>{request.type}</Badge></TableCell>
                    <TableCell className="max-w-sm truncate">{request.details}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(request.timestamp), { addSuffix: true, locale: es })}
                    </TableCell>
                    {isAdmin && (
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
                                Se eliminará la petición de "{request.user}".
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
                  <TableCell colSpan={isAdmin ? 5 : 4} className="h-24 text-center">
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
