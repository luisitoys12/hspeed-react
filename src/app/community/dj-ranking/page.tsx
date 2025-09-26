
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Medal, LoaderCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

interface DjRanking {
  name: string;
  likes: number;
}

const getMedal = (rank: number) => {
    if (rank === 0) return <Medal className="text-yellow-400" />;
    if (rank === 1) return <Medal className="text-gray-400" />;
    if (rank === 2) return <Medal className="text-yellow-600" />;
    return <span className="text-muted-foreground w-6 text-center">{rank + 1}</span>;
}

export default function DjRankingPage() {
  const [ranking, setRanking] = useState<DjRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const likesRef = ref(db, 'dj_likes');
    const unsubscribe = onValue(likesRef, (snapshot) => {
      const data = snapshot.val() || {};
      const rankingArray: DjRanking[] = Object.keys(data)
        .map(djName => ({
          name: djName,
          likes: data[djName] as number,
        }))
        .sort((a, b) => b.likes - a.likes);
      
      setRanking(rankingArray);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <Trophy className="h-8 w-8 text-primary" />
          Ranking de DJs
        </h1>
        <p className="text-muted-foreground mt-2">
          ¡Los DJs más populares de Habbospeed, votados por la comunidad!
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Top DJs</CardTitle>
          <CardDescription>
            Este ranking se actualiza en tiempo real según los 'likes' que los DJs reciben en el reproductor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : ranking.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Pos.</TableHead>
                  <TableHead>DJ</TableHead>
                  <TableHead className="text-right">Likes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranking.map((dj, index) => (
                  <TableRow key={dj.name}>
                    <TableCell className="font-bold text-lg flex items-center justify-center h-full">
                      {getMedal(index)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${dj.name}&headonly=1&size=s`} />
                          <AvatarFallback>{dj.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold">{dj.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">{dj.likes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-10">
              Aún no hay 'likes' registrados. ¡Sé el primero en apoyar a tu DJ favorito!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
