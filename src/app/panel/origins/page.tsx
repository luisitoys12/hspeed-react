
"use client";

import { useState, useEffect } from 'react';
import { ref, onValue, set, remove, push } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { NewsArticle, NewsArticleFormValues, EventItem, EventFormValues } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sprout, Newspaper, PartyPopper, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NewsForm from '@/components/habbospeed/news-form';
import EventsForm from '@/components/habbospeed/events-form';

export default function OriginsManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewsDialogOpen, setIsNewsDialogOpen] = useState(false);
  const [isEventsDialogOpen, setIsEventsDialogOpen] = useState(false);
  
  useEffect(() => {
    const newsRef = ref(db, 'origins_news');
    const eventsRef = ref(db, 'origins_events');

    const unsubNews = onValue(newsRef, (snapshot) => {
      const data = snapshot.val();
      const articlesArray = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      articlesArray.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setNews(articlesArray);
      setDbLoading(false);
    });
    
    const unsubEvents = onValue(eventsRef, (snapshot) => {
        const data = snapshot.val();
        const eventsArray = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
        eventsArray.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setEvents(eventsArray);
    });

    return () => {
        unsubNews();
        unsubEvents();
    };
  }, []);
  
  const handleSaveNews = async (values: NewsArticleFormValues, id?: string) => {
    setIsSubmitting(true);
    try {
      const newsRef = id ? ref(db, `origins_news/${id}`) : push(ref(db, 'origins_news'));
      await set(newsRef, values);
      toast({ title: "¡Éxito!", description: `La noticia de Origins ha sido ${id ? 'actualizada' : 'publicada'}.` });
      setIsNewsDialogOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar la noticia." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNews = async (id: string) => {
    await remove(ref(db, `origins_news/${id}`));
    toast({ title: "Noticia de Origins eliminada" });
  };
  
   const handleSaveEvent = async (values: EventFormValues, id?: string) => {
    setIsSubmitting(true);
    try {
      const eventRef = id ? ref(db, `origins_events/${id}`) : push(ref(db, 'origins_events'));
      await set(eventRef, values);
      toast({ title: "¡Éxito!", description: `El evento de Origins ha sido ${id ? 'actualizado' : 'publicado'}.` });
      setIsEventsDialogOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el evento." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    await remove(ref(db, `origins_events/${id}`));
    toast({ title: "Evento de Origins eliminado" });
  };

  if (authLoading || dbLoading) return <div className="p-8"><Skeleton className="h-64 w-full" /></div>;
  if (!user?.isSuperAdmin) return <div>Acceso denegado.</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <Sprout className="h-8 w-8 text-primary" />
          Panel de Origins
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestiona el contenido específico para la sección de Habbo Origins.
        </p>
      </div>

       <Tabs defaultValue="news">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="news"><Newspaper className="mr-2"/>Noticias de Origins</TabsTrigger>
            <TabsTrigger value="events"><PartyPopper className="mr-2"/>Eventos de Origins</TabsTrigger>
        </TabsList>
        <TabsContent value="news">
          <Card>
             <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Artículos de Origins</CardTitle>
                <CardDescription>Crea y gestiona noticias para la sección de Origins.</CardDescription>
              </div>
              <Dialog open={isNewsDialogOpen} onOpenChange={setIsNewsDialogOpen}>
                <DialogTrigger asChild><Button><PlusCircle className="mr-2"/>Crear Noticia</Button></DialogTrigger>
                <DialogContent className="sm:max-w-[625px]"><DialogHeader><DialogTitle>Nueva Noticia de Origins</DialogTitle></DialogHeader><NewsForm isSubmitting={isSubmitting} onSave={handleSaveNews} /></DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent><TableManager type="news" items={news} onDelete={handleDeleteNews} onSave={handleSaveNews} isSubmitting={isSubmitting} /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="events">
             <Card>
             <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Eventos de Origins</CardTitle>
                <CardDescription>Crea y gestiona eventos para la sección de Origins.</CardDescription>
              </div>
              <Dialog open={isEventsDialogOpen} onOpenChange={setIsEventsDialogOpen}>
                <DialogTrigger asChild><Button><PlusCircle className="mr-2"/>Crear Evento</Button></DialogTrigger>
                <DialogContent className="sm:max-w-[625px]"><DialogHeader><DialogTitle>Nuevo Evento de Origins</DialogTitle></DialogHeader><EventsForm isSubmitting={isSubmitting} onSave={handleSaveEvent} /></DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent><TableManager type="events" items={events} onDelete={handleDeleteEvent} onSave={handleSaveEvent} isSubmitting={isSubmitting} /></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Reusable table component for managing items
function TableManager({ type, items, onDelete, onSave, isSubmitting }: any) {
  const EditForm = type === 'news' ? NewsForm : EventsForm;
  
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Fecha</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
        <TableBody>
          {items.map((item: any) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium max-w-xs truncate">{item.title}</TableCell>
              <TableCell>{new Date(item.date).toLocaleDateString('es-ES')}</TableCell>
              <TableCell className="text-right">
                <Dialog>
                  <DialogTrigger asChild><Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button></DialogTrigger>
                  <DialogContent className="sm:max-w-[625px]"><DialogHeader><DialogTitle>Editar {type === 'news' ? 'Noticia' : 'Evento'}</DialogTitle></DialogHeader><EditForm isSubmitting={isSubmitting} onSave={(values: any) => onSave(values, item.id)} initialData={item} /></DialogContent>
                </Dialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                  <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Seguro?</AlertDialogTitle><AlertDialogDescription>Se eliminará "{item.title}" permanentemente.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => onDelete(item.id)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground h-24">No hay contenido todavía.</TableCell></TableRow>}
        </TableBody>
      </Table>
    </div>
  );
}
