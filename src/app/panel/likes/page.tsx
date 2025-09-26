
"use client";

import { useState, useEffect } from 'react';
import { ref, onValue, remove } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ThumbsUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type DjLikeInfo = {
  djName: string;
  likes: number;
  lastLiked?: number; 
};

export default function LikesManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [djLikes, setDjLikes] = useState<DjLikeInfo[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  useEffect(() => {
    const djLikesRef = ref(db, 'dj_likes');
    const userLikesRef = ref(db, 'user_dj_likes');

    const unsubscribe = onValue(djLikesRef, async (likesSnapshot) => {
      const likesData = likesSnapshot.val() || {};
      const userLikesDataSnapshot = await get(userLikesRef);
      const userLikesData = userLikesDataSnapshot.val() || {};

      const djLikesArray: DjLikeInfo[] = Object.keys(likesData).map(djName => {
        let lastLiked = 0;
        // Find the latest timestamp for this DJ across all users
        Object.values(userLikesData).forEach((userDjLikes: any) => {
          if (userDjLikes[djName] && userDjLikes[djName] > lastLiked) {
            lastLiked = userDjLikes[djName];
          }
        });

        return {
          djName: djName,
          likes: likesData[djName],
          lastLiked: lastLiked || undefined
        };
      });

      djLikesArray.sort((a, b) => b.likes - a.likes);
      setDjLikes(djLikesArray);
      setDbLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteDjLikes = async (djName: string) => {
    try {
      await remove(ref(db, `dj_likes/${djName}`));
      toast({ title: "Likes eliminados", description: `Se han reiniciado los likes de ${djName}.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudieron eliminar los likes." });
    }
  };
  
  const handleClearAll = async () => {
    try {
      await remove(ref(db, 'dj_likes'));
      await remove(ref(db, 'user_dj_likes'));
      toast({ title: "Ranking vaciado", description: "Se han reiniciado todos los contadores de likes." });
    } catch(error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo vaciar el ranking." });
    }
  }

  if (authLoading) return <div className="p-8"><Skeleton className="h-64 w-full"/></div>;
  if (!user?.isSuperAdmin) return <div>Acceso denegado</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold"><ThumbsUp />Gestión de Likes</h1>
        <p className="text-muted-foreground mt-2">Administra los "likes" que los DJs reciben de la comunidad.</p>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Ranking de Likes</CardTitle>
                <CardDescription>Aquí puedes ver y reiniciar los contadores de likes.</CardDescription>
            </div>
             <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="destructive"><Trash2 className="mr-2"/>Vaciar Todo</Button></AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción eliminará **todos** los likes de **todos** los DJs y reiniciará el ranking por completo. Es irreversible.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleClearAll} className="bg-destructive hover:bg-destructive/90">Sí, vaciar todo</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CardHeader>
        <CardContent>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>DJ</TableHead>
                            <TableHead>Likes</TableHead>
                            <TableHead>Último Like Recibido</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dbLoading ? <TableRow><TableCell colSpan={4}><Skeleton className="h-10 w-full" /></TableCell></TableRow> :
                        djLikes.map((dj) => (
                            <TableRow key={dj.djName}>
                                <TableCell>
                                    <div className="flex items-center gap-2 font-medium">
                                        <Avatar className="h-6 w-6"><AvatarImage src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${dj.djName}&headonly=1&size=s`} /><AvatarFallback>{dj.djName.substring(0,1)}</AvatarFallback></Avatar>
                                        {dj.djName}
                                    </div>
                                </TableCell>
                                <TableCell className="font-bold text-primary">{dj.likes}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {dj.lastLiked ? formatDistanceToNow(new Date(dj.lastLiked), { addSuffix: true, locale: es }) : 'N/A'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>¿Reiniciar likes?</AlertDialogTitle><AlertDialogDescription>Se eliminarán los likes de <strong>{dj.djName}</strong>.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteDjLikes(dj.djName)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction></AlertDialogFooter>
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

