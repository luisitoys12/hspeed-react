
"use client";

import { useState, useEffect } from 'react';
import { ref, onValue, remove } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

type Comment = {
  id: string;
  articleId: string;
  articleTitle?: string;
  authorName: string;
  comment: string;
  timestamp: number;
};

export default function CommentsManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  useEffect(() => {
    const commentsRef = ref(db, 'comments');
    const newsRef = ref(db, 'news');

    const unsubscribeComments = onValue(commentsRef, (commentsSnapshot) => {
        const commentsData = commentsSnapshot.val() || {};
        
        onValue(newsRef, (newsSnapshot) => {
            const newsData = newsSnapshot.val() || {};
            const newsTitleMap = new Map(Object.keys(newsData).map(key => [key, newsData[key].title]));

            const allComments: Comment[] = [];
            Object.keys(commentsData).forEach(articleId => {
                const articleComments = commentsData[articleId];
                Object.keys(articleComments).forEach(commentId => {
                    allComments.push({
                        id: commentId,
                        articleId: articleId,
                        articleTitle: newsTitleMap.get(articleId) || 'Artículo Eliminado',
                        ...articleComments[commentId]
                    });
                });
            });

            allComments.sort((a, b) => b.timestamp - a.timestamp);
            setComments(allComments);
            setDbLoading(false);
        }, { onlyOnce: true });
    });

    return () => unsubscribeComments();
  }, []);

  const handleDelete = async (articleId: string, commentId: string) => {
    try {
      await remove(ref(db, `comments/${articleId}/${commentId}`));
      toast({ title: "Comentario eliminado" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el comentario." });
    }
  };

  if (authLoading) return <CommentsSkeleton />;
  if (!user?.isSuperAdmin) return <div>Acceso denegado</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold"><MessageSquare />Moderación de Comentarios</h1>
        <p className="text-muted-foreground mt-2">Gestiona todos los comentarios de las noticias.</p>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Comentarios Recientes</CardTitle>
            <CardDescription>Aquí puedes ver y eliminar los comentarios de los usuarios en todas las noticias.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Comentario</TableHead>
                            <TableHead>En Noticia</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dbLoading ? <TableRow><TableCell colSpan={5}><Skeleton className="h-10 w-full" /></TableCell></TableRow> :
                        comments.map((comment) => (
                            <TableRow key={comment.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2 font-medium">
                                        <Avatar className="h-6 w-6"><AvatarImage src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${comment.authorName}&headonly=1&size=s`} /><AvatarFallback>{comment.authorName.substring(0,1)}</AvatarFallback></Avatar>
                                        {comment.authorName}
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground max-w-xs truncate">{comment.comment}</TableCell>
                                <TableCell><Link href={`/news/${comment.articleId}`} className="hover:underline text-primary text-xs" target="_blank">{comment.articleTitle}</Link></TableCell>
                                <TableCell className="text-xs">{new Date(comment.timestamp).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Se eliminará el comentario de <strong>{comment.authorName}</strong> que dice: "{comment.comment}".</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(comment.articleId, comment.id)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction></AlertDialogFooter>
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

const CommentsSkeleton = () => (
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
