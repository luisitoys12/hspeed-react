
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dice5, Ticket, Trophy } from 'lucide-react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const currentRaffle = {
  title: 'Sorteo Semanal de Raros',
  prize: 'Trono de Dragón',
  prizeImage: 'https://images.habbo.com/dcr/hof_furni/throne/throne.gif',
  entries: 123,
  endsIn: '2 días',
};

const recentWinners = [
  { name: 'DJ-Pixel', prize: 'Ventilador Ocre' },
  { name: 'luisalegre', prize: 'Heladera Roja' },
  { name: 'estacionkusfm', prize: 'Saco de Monedas' },
];

export default function RafflesPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <Dice5 className="h-8 w-8 text-primary" />
          Sorteos y Loterías
        </h1>
        <p className="text-muted-foreground mt-2">
          Participa para ganar premios exclusivos. ¡Mucha suerte!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Sorteo Activo</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <h2 className="text-2xl font-bold text-primary">{currentRaffle.title}</h2>
              <p className="text-muted-foreground mb-4">¡El premio de esta semana es un increíble...</p>
              <div className="flex justify-center my-6">
                <div className="relative">
                  <Image src={currentRaffle.prizeImage} alt={currentRaffle.prize} width={80} height={80} unoptimized />
                  <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center text-xs font-bold">x1</div>
                </div>
              </div>
              <h3 className="text-3xl font-headline font-bold">{currentRaffle.prize}</h3>

              <div className="flex justify-around mt-6 text-sm">
                <div>
                  <p className="font-bold text-lg">{currentRaffle.entries}</p>
                  <p className="text-muted-foreground">Participantes</p>
                </div>
                <div>
                  <p className="font-bold text-lg">{currentRaffle.endsIn}</p>
                  <p className="text-muted-foreground">Termina en</p>
                </div>
              </div>

              <Button size="lg" className="mt-8 w-full max-w-sm" disabled>
                <Ticket className="mr-2"/>
                Participar (Próximamente)
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Trophy/>Ganadores Recientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentWinners.map((winner, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-md bg-muted">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${winner.name}&headonly=1&size=s`} />
                            <AvatarFallback>{winner.name.substring(0,1)}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-sm">{winner.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">ganó {winner.prize}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
