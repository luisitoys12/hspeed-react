import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getMarketplaceMockData } from '@/lib/data';
import { BarChart, Flame, Store } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Suspense } from 'react';

function TrendsSkeleton() {
    return (
        <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <BarChart className="text-primary" />
                Tendencias de Precios
              </CardTitle>
              <CardDescription> fluctuación de ítems populares.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="h-8 w-full bg-muted rounded-md"></div>
                <div className="h-8 w-full bg-muted rounded-md"></div>
                <div className="h-8 w-full bg-muted rounded-md"></div>
            </CardContent>
        </Card>
    )
}

async function PriceTrends() {
  const { priceTrends } = await getMarketplaceMockData();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <BarChart className="text-primary" />
          Tendencias de Precios
        </CardTitle>
        <CardDescription>Fluctuación de ítems populares.</CardDescription>
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
  );
}

export default async function MarketplacePage() {
  const { popularItems } = await getMarketplaceMockData();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <Store className="h-8 w-8 text-primary" />
          Mercado
        </h1>
        <p className="text-muted-foreground mt-2">
          Consulta los artículos más populares del mercadillo y las tendencias de precios.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Tendencias */}
        <div className="lg:col-span-1 space-y-8">
          <Suspense fallback={<TrendsSkeleton />}>
            <PriceTrends />
          </Suspense>
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
