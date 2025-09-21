import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DoorOpen } from 'lucide-react';
import Image from 'next/image';

const rooms = [
  { id: 1, name: 'Juegos del Hambre', imageUrl: 'https://picsum.photos/seed/activeroom1/300/200', owner: 'GamesMaster', imageHint: 'fantasy landscape' },
  { id: 2, name: 'Laberinto del Terror', imageUrl: 'https://picsum.photos/seed/activeroom2/300/200', owner: 'ScaryBuilder', imageHint: 'haunted forest' },
  { id: 3, name: 'Adopta una Mascota', imageUrl: 'https://picsum.photos/seed/activeroom3/300/200', owner: 'PetLover', imageHint: 'cute animals' },
];

export default function ActiveRooms() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <DoorOpen className="text-primary" />
          Salas Activas en Habbo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rooms.map(room => (
            <div key={room.id} className="relative rounded-lg overflow-hidden group">
              <Image 
                src={room.imageUrl} 
                alt={room.name} 
                width={300} 
                height={200} 
                className="object-cover w-full h-full transition-transform group-hover:scale-110"
                data-ai-hint={room.imageHint}
              />
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-4">
                <span className="text-white font-bold text-lg text-center font-headline">{room.name}</span>
                <span className="text-white/80 text-sm">de {room.owner}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">Nota: Esta es una sección de marcador de posición. La funcionalidad real requeriría una integración con la API de Habbo.</p>
      </CardContent>
    </Card>
  );
}
