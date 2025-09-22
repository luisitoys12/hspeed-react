'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, BookmarkPlus, Music, FileSignature, AlertTriangle, LoaderCircle } from 'lucide-react';
import BookingGrid from '@/components/habbospeed/booking-grid';
import SongRequests from '@/components/dj-panel/song-requests';
import EventProposal from '@/components/dj-panel/event-proposal';

export default function DjPanelPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="container mx-auto p-4 md:p-8 flex justify-center"><LoaderCircle className="animate-spin h-8 w-8" /></div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>Debes iniciar sesión para acceder al Panel de DJ.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <LayoutDashboard className="h-8 w-8 text-primary" />
          Panel de DJ
        </h1>
        <p className="text-muted-foreground mt-2">
          ¡Bienvenido, {user.displayName}! Aquí tienes todas tus herramientas de DJ en un solo lugar.
        </p>
      </div>

      <Tabs defaultValue="booking" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
          <TabsTrigger value="booking"><BookmarkPlus className="mr-2" />Reservar Horario</TabsTrigger>
          <TabsTrigger value="requests"><Music className="mr-2" />Peticiones de Oyentes</TabsTrigger>
          <TabsTrigger value="propose"><FileSignature className="mr-2" />Proponer Evento</TabsTrigger>
        </TabsList>
        <TabsContent value="booking">
          <Card>
            <CardHeader>
              <CardTitle>Reservar Horario</CardTitle>
              <CardDescription>Selecciona un espacio disponible en la parrilla para tu próxima transmisión. Los horarios se basan en la hora del Centro de México (CST).</CardDescription>
            </CardHeader>
            <CardContent>
              <BookingGrid />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="requests">
          <SongRequests />
        </TabsContent>
        <TabsContent value="propose">
          <EventProposal />
        </TabsContent>
      </Tabs>
    </div>
  );
}
