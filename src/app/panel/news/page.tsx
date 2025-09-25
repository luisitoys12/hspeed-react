
"use client";

import { useState, useEffect } from 'react';
import { ref, onValue, set, remove, push } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { NewsArticle, NewsArticleFormValues } from '@/lib/types';
import { sendWebhook } from '@/lib/actions';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Newspaper, Edit, Trash2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import NewsForm from '@/components/habbospeed/news-form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function NewsManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (db) {
      const newsRef = ref(db, 'news');
      const unsubscribe = onValue(newsRef, (snapshot) => {
        const data = snapshot.val();
        const articlesArray = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
        articlesArray.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setArticles(articlesArray);
        setDbLoading(false);
      });
      return () => unsubscribe();
    }
  }, []);
  
  const handleSave = async (values: NewsArticleFormValues, id?: string) => {
    setIsSubmitting(true);
    try {
      if (id) {
        const articleRef = ref(db, `news/${id}`);
        await set(articleRef, values);
        toast({ title: "¡Éxito!", description: "El artículo ha sido actualizado." });
      } else {
        const articlesRef = ref(db, 'news');
        const newArticleRef = await push(articlesRef, values);
        toast({ title: "¡Éxito!", description: "El nuevo artículo ha sido publicado." });
        await sendWebhook('news', { ...values, id: newArticleRef.key });
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving article:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el artículo." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // First, remove the article itself
      const articleRef = ref(db, `news/${id}`);
      await remove(articleRef);
      
      // Then, remove the associated comments
      const commentsRef = ref(db, `comments/${id}`);
      await remove(commentsRef);

      toast({ title: "Artículo eliminado", description: `La noticia y sus comentarios han sido eliminados.` });
    } catch (error) {
      console.error("Error deleting article:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el artículo y sus comentarios." });
    }
  };
  
  if (authLoading || dbLoading) {
    return <NewsSkeleton />;
  }
  
  if (!user?.isSuperAdmin) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Card><CardHeader><CardTitle>Acceso Denegado</CardTitle><CardDescription>No tienes permisos para gestionar las noticias.</CardDescription></CardHeader></Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <Newspaper className="h-8 w-8 text-primary" />
          Gestión de Noticias
        </h1>
        <p className="text-muted-foreground mt-2">
          Crea, edita y elimina artículos y guías para la comunidad.
        </p>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Artículos Publicados</CardTitle>
            <CardDescription>Esta es la lista de noticias que se muestran en el sitio.</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><PlusCircle className="mr-2 h-4 w-4" />Crear Artículo</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Artículo</DialogTitle>
                <DialogDescription>Redacta una nueva noticia o guía para la comunidad.</DialogDescription>
              </DialogHeader>
              <NewsForm isSubmitting={isSubmitting} onSave={handleSave} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dbLoading ? 
                  Array.from({ length: 3 }).map((_, i) => <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>) 
                : articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium max-w-xs truncate">{article.title}</TableCell>
                    <TableCell>{article.category}</TableCell>
                    <TableCell>{new Date(article.date).toLocaleDateString('es-ES')}</TableCell>
                    <TableCell className="text-right">
                       <Dialog>
                        <DialogTrigger asChild>
                           <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[625px]">
                          <DialogHeader>
                            <DialogTitle>Editar Artículo</DialogTitle>
                          </DialogHeader>
                          <NewsForm isSubmitting={isSubmitting} onSave={(values) => handleSave(values, article.id)} initialData={article} />
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción eliminará el artículo <strong>"{article.title}"</strong> y todos sus comentarios permanentemente.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(article.id)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
                 {articles.length === 0 && !dbLoading && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                            No hay artículos publicados. ¡Crea el primero!
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const NewsSkeleton = () => (
  <div className="container mx-auto p-4 md:p-8">
     <Skeleton className="h-10 w-1/2 mb-2" />
     <Skeleton className="h-4 w-3/4 mb-8" />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
           <div>
             <Skeleton className="h-6 w-48 mb-2" />
             <Skeleton className="h-4 w-64" />
           </div>
           <Skeleton className="h-10 w-32" />
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                 {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
        </CardContent>
      </Card>
  </div>
);
