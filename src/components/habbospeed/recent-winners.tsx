
'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, query, limitToLast } from 'firebase/database';
import { Skeleton } from '../ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '../ui/badge';

type AwardType = { id: string; name: string };
type AwardWinner = { id: string; awardTypeId: string; winnerName: string; month: string; timestamp: string };
type AwardWinnerWithTypeName = Omit<AwardWinner, 'awardTypeId'> & { awardTypeName: string };

export default function RecentWinners() {
  const [winners, setWinners] = useState<AwardWinnerWithTypeName[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const typesRef = ref(db, 'awardTypes');
    const winnersQuery = query(ref(db, 'awardWinners'), limitToLast(5));

    const unsubscribeTypes = onValue(typesRef, (typesSnapshot) => {
      const typesData = typesSnapshot.val() || {};
      const typesMap = new Map(Object.keys(typesData).map(key => [key, typesData[key].name]));

      const unsubscribeWinners = onValue(winnersQuery, (winnersSnapshot) => {
        const winnersData = winnersSnapshot.val() || {};
        const winnersList: AwardWinnerWithTypeName[] = Object.keys(winnersData).map(key => {
          const winner = winnersData[key];
          return {
            id: key,
            winnerName: winner.winnerName,
            month: winner.month,
            timestamp: winner.timestamp,
            awardTypeName: typesMap.get(winner.awardTypeId) || "Premio Especial"
          };
        }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        setWinners(winnersList);
        setLoading(false);
      });
      
      return () => unsubscribeWinners();
    });

    return () => unsubscribeTypes();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader><Skeleton className='h-6 w-1/2' /></CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Award className="text-primary" />
          Ganadores del Mes
        </CardTitle>
        <CardDescription>¡Un aplauso para nuestros miembros destacados!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {winners.length > 0 ? (
            winners.map(winner => (
                <div key={winner.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${winner.winnerName}&headonly=1&size=m`} />
                            <AvatarFallback>{winner.winnerName.substring(0,1)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-sm">{winner.winnerName}</p>
                            <p className="text-xs text-muted-foreground">{winner.awardTypeName}</p>
                        </div>
                    </div>
                    <Badge variant="secondary">{winner.month}</Badge>
                </div>
            ))
        ) : (
            <p className="text-center text-muted-foreground py-4">Aún no se han asignado premios.</p>
        )}
      </CardContent>
    </Card>
  );
}

