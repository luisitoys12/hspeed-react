import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getLeaderboardData } from '@/lib/data';
import { Trophy } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default async function AchievementRanking() {
  const leaderboard = await getLeaderboardData();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Trophy className="text-primary" />
          Ránking de Logros
        </CardTitle>
        <CardDescription>Top jugadores por puntos de logro.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead className="text-right">Puntuación</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.map((user, index) => (
              <TableRow key={user.name}>
                <TableCell className="font-bold">{index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${user.name}&headonly=1&size=s`} />
                      <AvatarFallback>{user.name.substring(0,1)}</AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">{(user.achievementScore || 0).toLocaleString('es-ES')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-xs text-muted-foreground mt-4 text-center">Ránking basado en los miembros del equipo de Ekus FM.</p>
      </CardContent>
    </Card>
  );
}
