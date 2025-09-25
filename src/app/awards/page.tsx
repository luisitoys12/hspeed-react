import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Gift, Star } from 'lucide-react';
import Image from 'next/image';

const awards = [
  { category: "DJ del Mes", winner: "DJ-Pixel", month: "Octubre" },
  { category: "Guía Mejor Valorada", winner: "luisalegre", month: "Octubre" },
  { category: "Usuario más Activo", winner: "estacionkusfm", month: "Octubre" },
];

export default function AwardsPage() {
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
            <CardTitle className="flex items-center gap-2"><Star /> Cuadro de Honor - Octubre 2024</CardTitle>
            <CardDescription>¡Felicidades a los ganadores de este mes por su increíble contribución!</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {awards.map(award => (
                    <div key={award.category} className="p-6 bg-muted rounded-lg text-center flex flex-col items-center justify-center transition-all hover:shadow-primary/20 hover:shadow-lg hover:-translate-y-1">
                        <Trophy className="h-10 w-10 text-yellow-400 mb-2" />
                        <h3 className="font-bold text-lg text-primary">{award.category}</h3>
                        <p className="text-2xl font-headline mt-2">{award.winner}</p>
                        <p className="text-xs text-muted-foreground">{award.month}</p>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
    </div>
  );
}
