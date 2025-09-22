
"use client";

import { useState, useEffect } from 'react';
import { ref, onValue, set, remove } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: number;
  read: boolean;
};

export default function MessagesManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  useEffect(() => {
    const messagesRef = ref(db, 'contact-messages');
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val() || {};
      const messagesArray: Message[] = Object.keys(data).map(key => ({ id: key, ...data[key] }));
      messagesArray.sort((a, b) => b.timestamp - a.timestamp);
      setMessages(messagesArray);
      setDbLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleToggleRead = async (id: string, currentState: boolean) => {
    try {
      await set(ref(db, `contact-messages/${id}/read`), !currentState);
      toast({ title: `Mensaje marcado como ${!currentState ? 'leído' : 'no leído'}.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el estado del mensaje." });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(ref(db, `contact-messages/${id}`));
      toast({ title: "Mensaje eliminado" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el mensaje." });
    }
  };

  if (authLoading) return <MessagesSkeleton />;
  if (!user?.isSuperAdmin) return <div>Acceso denegado</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold"><Mail />Bandeja de Entrada</h1>
        <p className="text-muted-foreground mt-2">Lee y gestiona los mensajes enviados desde el formulario de contacto.</p>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Mensajes Recibidos</CardTitle>
            <CardDescription>Los mensajes más recientes aparecen primero. Los no leídos están resaltados.</CardDescription>
        </CardHeader>
        <CardContent>
            {dbLoading ? <MessagesSkeleton /> : messages.length > 0 ? (
                <Accordion type="multiple" className="w-full">
                    {messages.map((msg) => (
                        <AccordionItem value={msg.id} key={msg.id}>
                            <AccordionTrigger className={cn(!msg.read && "font-bold text-primary")}>
                                <div className='flex items-center gap-4 text-left'>
                                    {!msg.read && <Badge>Nuevo</Badge>}
                                    <div>
                                        <p>{msg.name}</p>
                                        <p className='text-xs text-muted-foreground font-normal'>{formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true, locale: es })}</p>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className='p-4 bg-muted/50 rounded-lg'>
                                    <p className='text-sm text-muted-foreground'>De: {msg.email}</p>
                                    <p className="mt-4 whitespace-pre-wrap">{msg.message}</p>
                                    <div className='flex gap-2 mt-4'>
                                        <Button size="sm" variant="outline" onClick={() => handleToggleRead(msg.id, msg.read)}>
                                            {msg.read ? <EyeOff className="mr-2"/> : <Eye className="mr-2"/>} Marcar como {msg.read ? 'no leído' : 'leído'}
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild><Button size="sm" variant="destructive"><Trash2 className="mr-2"/>Eliminar</Button></AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle><AlertDialogDescription>Se eliminará el mensaje de <strong>{msg.name}</strong>.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(msg.id)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction></AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : (
                <p className="text-center text-muted-foreground py-8">La bandeja de entrada está vacía.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

const MessagesSkeleton = () => (
    <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
    </div>
);
