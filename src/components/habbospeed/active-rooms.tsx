import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DoorOpen } from 'lucide-react';
import Image from 'next/image';
import { getActiveRooms } from '@/lib/data';

export default async function ActiveRooms() {
  const rooms = await getActiveRooms();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <DoorOpen className="text-primary" />
          Salas Destacadas en Habbo
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rooms && rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rooms.map(room => (
              <div key={room.id} className="relative rounded-lg overflow-hidden group">
                <Image 
                  src={room.imageUrl} 
                  alt={room.name} 
                  width={300} 
                  height={200} 
                  className="object-cover w-full h-full transition-transform group-hover:scale-110"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-white font-bold text-lg font-headline">{room.name}</span>
                  <span className="text-white/80 text-sm">de {room.owner}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center">No se pudieron cargar las salas destacadas.</p>
        )}
        <p className="text-xs text-muted-foreground mt-4 text-center">Salas obtenidas de la API de Habbo (usuario: official_rooms).</p>
      </CardContent>
    </Card>
  );
}
