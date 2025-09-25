import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Shield, Users, Calendar } from 'lucide-react';
import Image from 'next/image';

const champions = {
    name: "Los Furas",
    players: ["xX_Pichichi_Xx", "MuroDeAcero", "ElRapido"],
    image: "https://images.habbo.com/c_images/catalogue/trophy_nets_1.gif"
};

const finalScore = {
    teamA: "Los Furas",
    scoreA: 3,
    teamB: "Defensores",
    scoreB: 2,
};

export default function CopaPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="overflow-hidden mb-8">
        <div className="relative h-48 md:h-64 bg-black">
          <Image 
            src="https://images.habbo.com/c_images/habbowidgets/pixelart-139_gen.gif"
            alt="Torneo de Futbol Habbo"
            layout="fill"
            objectFit="cover"
            unoptimized
            className="opacity-50"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4 bg-gradient-to-t from-black/80 to-transparent">
            <Trophy className="h-16 w-16 text-yellow-400 drop-shadow-lg" />
            <h1 className="text-3xl md:text-5xl font-headline font-bold mt-2 drop-shadow-lg">
              Copa Habbospeed
            </h1>
            <p className="mt-2 text-lg text-white/90">
              La gloria del torneo de fútbol más prestigioso.
            </p>
          </div>
        </div>
      </Card>
      
      <div className="grid md:grid-cols-3 gap-8 text-center">
        <div className="md:col-span-1">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2"><Trophy className="text-yellow-400"/>¡Campeones!</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <Image src={champions.image} alt="Trofeo" width={80} height={80} unoptimized />
                    <p className="text-3xl font-headline mt-2">{champions.name}</p>
                    <div className="mt-2 space-y-1">
                        {champions.players.map(p => <p key={p} className="text-sm text-muted-foreground">{p}</p>)}
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                     <CardTitle className="flex items-center justify-center gap-2"><Shield />La Gran Final</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center">
                    <div className="flex items-center justify-around w-full">
                        <span className="text-xl md:text-2xl font-bold font-headline">{finalScore.teamA}</span>
                        <span className="text-4xl md:text-5xl font-bold font-mono text-primary">{finalScore.scoreA} - {finalScore.scoreB}</span>
                         <span className="text-xl md:text-2xl font-bold font-headline">{finalScore.teamB}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">Un partido reñido hasta el último segundo.</p>
                </CardContent>
            </Card>
        </div>
      </div>

    </div>
  );
}
