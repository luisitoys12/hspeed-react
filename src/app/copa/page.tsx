'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Shield, Users, Calendar } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { Skeleton } from '@/components/ui/skeleton';

type AwardWinner = { 
  id: string; 
  awardTypeName: string; 
  winnerName: string; 
  month: string; 
};

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
    const [winners, setWinners] = useState<AwardWinner[]>([]);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    const typesRef = ref(db, 'awardTypes');
    const winnersRef = ref(db, 'awardWinners');

    onValue(typesRef, (typesSnapshot) => {
      const typesData = typesSnapshot.val() || {};
      const typesMap = new Map(Object.keys(typesData).map(key => [key, {name: typesData[key].name, isCopa: typesData[key].isCopa || false }]));

      onValue(winnersRef, (winnersSnapshot) => {
        const winnersData = winnersSnapshot.val() || {};
        const winnersList: AwardWinner[] = Object.keys(winnersData).map(key => {
            const winner = winnersData[key];
            const awardTypeInfo = typesMap.get(winner.awardTypeId) || { name: "Premio Especial", isCopa: false };
            return {
              id: key,
              winnerName: winner.winnerName,
              month: winner.month,
              awardTypeName: awardTypeInfo.name,
              isCopa: awardTypeInfo.isCopa
            };
        })
        .filter(w => w.isCopa); // Only get Copa awards

        setWinners(winnersList);
        setLoading(false);
      });
    });
  }, []);

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
      
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Cuadro de Honor de la Copa</CardTitle>
                    <CardDescription>¡Felicidades a los campeones y jugadores destacados del torneo!</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-32 w-full" /> : 
                    winners.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {winners.map(winner => (
                                <div key={winner.id} className="p-4 bg-muted/50 rounded-lg text-center">
                                    <h3 className="font-bold text-primary">{winner.awardTypeName}</h3>
                                    <p className="text-xl font-headline">{winner.winnerName}</p>
                                    <p className="text-xs text-muted-foreground">Ganador de {winner.month}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No se han asignado premios para la copa aún.</p>
                    )}
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
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
