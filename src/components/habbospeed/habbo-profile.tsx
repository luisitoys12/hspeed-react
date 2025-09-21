import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getHabboProfileData } from '@/lib/data';
import { Calendar, Award, Home } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { ScrollArea } from '../ui/scroll-area';

const HABBO_USERNAME = 'hspeed'; // You can make this dynamic later

export default async function HabboProfile() {
  const habboProfile = await getHabboProfileData(HABBO_USERNAME);
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${habboProfile.name}&size=l`} alt={habboProfile.name} />
            <AvatarFallback>{habboProfile.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="font-headline">{habboProfile.name}</CardTitle>
            <CardDescription className="italic">"{habboProfile.motto}"</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 flex-grow overflow-hidden flex flex-col">
       <ScrollArea className="flex-grow pr-4 -mr-4">
        <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Miembro desde: {new Date(habboProfile.registrationDate).toLocaleDateString('es-ES')}</span>
            </div>
            <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>Puntos de Logro: {habboProfile.rewards}</span>
            </div>
        </div>
        
        <div>
            <h3 className="font-headline my-2">Placas</h3>
            <div className="flex flex-wrap gap-2">
                {habboProfile.badges.map(badge => (
                    <div key={badge.id} title={badge.name}>
                        <Image src={badge.imageUrl} alt={badge.name} width={40} height={40} className="rounded-md" data-ai-hint={badge.imageHint} unoptimized />
                    </div>
                ))}
            </div>
        </div>

        <div>
            <h3 className="font-headline my-2 flex items-center gap-2"><Home className="h-4 w-4" /> Salas Creadas</h3>
             <Carousel
              opts={{
                align: "start",
              }}
              className="w-full"
            >
              <CarouselContent>
                {habboProfile.rooms.map((room) => (
                  <CarouselItem key={room.id} className="md:basis-1/2 lg:basis-full">
                    <div className="p-1">
                      <Card className="overflow-hidden">
                        <CardContent className="flex aspect-video items-center justify-center p-0 relative">
                           <Image src={room.imageUrl} alt={room.name} fill className="object-cover" data-ai-hint={room.imageHint} unoptimized />
                           <div className="absolute inset-0 bg-black/40" />
                           <span className="relative font-bold text-white text-lg text-center p-2 font-headline">{room.name}</span>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
        </div>
        </ScrollArea>
        <p className="text-xs text-muted-foreground text-center pt-4">Datos obtenidos de la API de Habbo.</p>
      </CardContent>
    </Card>
  );
}
