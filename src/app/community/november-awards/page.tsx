
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Calendar, ShieldCheck, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const winners = [
  { category: "Máximo Goleador", winner: "xX_Pichichi_Xx", team: "Los Furas" },
  { category: "Mejor Portero", winner: "MuroDeAcero", team: "Defensores" },
  { category: "Juego Limpio", winner: "PazYAmor", team: "Los Amistosos" },
]

export default function NovemberAwardsPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="overflow-hidden">
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
              Premios Noviembre 2024
            </h1>
            <p className="mt-2 text-lg text-white/90">
              Celebrando a los campeones de los torneos de la comunidad.
            </p>
          </div>
        </div>
      </Card>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Sobre los Torneos</CardTitle>
                    <CardDescription>Un mes de pura competición y fútbol pixelado.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>Durante todo noviembre, la comunidad de Habbospeed vibró con emocionantes torneos de fútbol. Equipos de todo el hotel compitieron por la gloria, demostrando habilidad, estrategia y, sobre todo, un gran espíritu deportivo.</p>
                    <p>Desde la fase de grupos hasta la gran final, cada partido fue una demostración de talento. ¡Gracias a todos los participantes por hacer de este evento un éxito rotundo!</p>
                </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Calendar /> Fechas Clave</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <p><strong>Inicio del Torneo:</strong> 01 de Noviembre</p>
                <p><strong>Fase de Grupos:</strong> 01 - 15 de Noviembre</p>
                <p><strong>Eliminatorias:</strong> 16 - 28 de Noviembre</p>
                <p><strong>La Gran Final:</strong> 30 de Noviembre</p>
            </CardContent>
        </Card>
      </div>

       <Card className="mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Star /> Cuadro de Honor</CardTitle>
                <CardDescription>¡Felicidades a los ganadores y a los equipos destacados del torneo!</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-yellow-400/20 text-yellow-200 rounded-lg text-center flex flex-col items-center justify-center">
                        <Trophy className="h-8 w-8" />
                        <h3 className="font-bold mt-2">Equipo Campeón</h3>
                        <p className="text-2xl font-headline">Los Furas</p>
                    </div>
                     {winners.map(winner => (
                        <div key={winner.category} className="p-4 bg-muted/50 rounded-lg text-center">
                            <h3 className="font-bold text-primary">{winner.category}</h3>
                            <p className="text-xl font-headline">{winner.winner}</p>
                            <p className="text-xs text-muted-foreground">de {winner.team}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

    </div>
  );
}
