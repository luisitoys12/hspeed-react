'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Gift, Star, Trophy } from 'lucide-react';
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
  isCopa: boolean;
};

export default function AwardsPage() {
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
        .filter(w => !w.isCopa) // Filter out Copa awards
        .sort((a,b) => b.month.localeCompare(a.month)) // Simple sort
        .slice(0, 6); // Limit to recent 6

        setWinners(winnersList);
        setLoading(false);
      });
    });
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="overflow-hidden">
        <div className="relative h-48 md:h-64 bg-black">
          <Image 
            src="https://picsum.photos/seed/awardsnight/1200/500"
            alt="Noche de Premios"
            layout="fill"
            objectFit="cover"
            className="opacity-40"
            data-ai-hint="awards ceremony"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4 bg-gradient-to-t from-black/80 to-transparent">
            <Gift className="h-16 w-16 text-primary drop-shadow-lg" />
            <h1 className="text-3xl md:text-5xl font-headline font-bold mt-2 drop-shadow-lg">
              Premios Habbospeed
            </h1>
            <p className="mt-2 text-lg text-white/90">
              Reconociendo a los miembros más destacados de nuestra comunidad.
            </p>
          </div>
        </div>
      </Card>
      
      <Card className="mt-8">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Star /> Cuadro de Honor Mensual</CardTitle>
            <CardDescription>¡Felicidades a los ganadores por su increíble contribución!</CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            ) : winners.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {winners.map(award => (
                        <div key={award.id} className="p-6 bg-muted rounded-lg text-center flex flex-col items-center justify-center transition-all hover:shadow-primary/20 hover:shadow-lg hover:-translate-y-1">
                            <Trophy className="h-10 w-10 text-yellow-400 mb-2" />
                            <h3 className="font-bold text-lg text-primary">{award.awardTypeName}</h3>
                            <p className="text-2xl font-headline mt-2">{award.winnerName}</p>
                            <p className="text-xs text-muted-foreground">{award.month}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground text-center py-8">No se han asignado premios este mes.</p>
            )}
        </CardContent>
    </Card>
    </div>
  );
}
