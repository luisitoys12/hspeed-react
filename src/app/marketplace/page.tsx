import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getLeaderboardData, getMarketplaceMockData } from '@/lib/data';
import { BarChart, Flame, Store, Trophy } from 'lucide-react';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default async function MarketplacePage() {
  const leaderboard = await getLeaderboardData();
  const { popularItems, priceTrends } = await getMarketplaceMockData();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <Store className="h-8 w-8 text-primary" />
          Mercado y Ránkings
        </h1>
        <p className="text-muted-foreground mt-2">
          Consulta los artículos más populares del mercadillo y quién lidera en puntos de logro.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Ránking y Tendencias */}
        <div className="lg:col-span-1 space-y-8">
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
                      <TableCell className="text-right font-mono">{user.achievementScore.toLocaleString('es-ES')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-xs text-muted-foreground mt-4 text-center">Ránking basado en los miembros del equipo de Ekus FM.</p>
            </CardContent>
          </Card>

           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <BarChart className="text-primary" />
                Tendencias de Precios
              </CardTitle>
              <CardDescription> fluctuación de ítems populares.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {priceTrends.map(item => (
                    <div key={item.name} className="flex justify-between items-center">
                        <div className='flex items-center gap-2'>
                             <Image src={item.imageUrl} alt={item.name} width={24} height={24} unoptimized />
                             <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <div className="text-right">
                            <p className="font-mono text-sm">{item.price}</p>
                            <p className={`text-xs ${item.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{item.change}</p>
                        </div>
                    </div>
                ))}
                 <p className="text-xs text-muted-foreground mt-4 text-center">Datos del mercadillo simulados.</p>
            </CardContent>
          </Card>

        </div>

        {/* Columna Derecha: Artículos populares */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <Flame className="text-primary" />
                Artículos Populares del Mercadillo
              </CardTitle>
               <CardDescription>Los furnis y raros más tradeados esta semana.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {popularItems.map((item) => (
                  <div key={item.id} className="border p-2 rounded-lg text-center bg-muted/50">
                    <div className="aspect-square bg-background rounded-md flex items-center justify-center p-2">
                       <Image src={item.imageUrl} alt={item.name} width={80} height={80} className="object-contain" unoptimized />
                    </div>
                    <p className="text-sm font-bold mt-2 truncate">{item.name}</p>
                    <Badge variant="secondary" className="mt-1">{item.category}</Badge>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">La API oficial no provee datos del mercadillo. Esta sección es un concepto.</p>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
