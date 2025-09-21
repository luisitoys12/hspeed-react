import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Award, Mic, Headphones, BookOpen } from "lucide-react";
import Image from "next/image";

const awards = [
  { 
    title: 'Mejor DJ', 
    user: 'Sin entregar', 
    avatar: 'https://files.habboemotion.com/resources/images/figures/natasha_bedingfiel.gif',
    icon: Mic,
    reason: 'Por su increíble set de Pop Pixelado el Lunes.'
  },
  { 
    title: 'Mejor Oyente', 
    user: 'Sin entregar', 
    avatar: 'https://files.habboemotion.com/resources/images/figures/natasha_bedingfiel.gif',
    icon: Headphones,
    reason: '¡Por participar y pedir las mejores canciones toda la semana!'
  },
  { 
    title: 'Mejor Guía', 
    user: 'Sin entregar', 
    avatar: 'https://files.habboemotion.com/resources/images/figures/natasha_bedingfiel.gif',
    icon: BookOpen,
    reason: 'Por su detallada guía sobre "Wobble Squabble".'
  },
];

export default function WeeklyAwards() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Award className="text-primary" />
          Reconocimientos Semanales
        </CardTitle>
        <CardDescription>Celebrando a lo mejor de nuestra comunidad esta semana.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {awards.map((award) => (
          <div key={award.title} className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex-shrink-0">
               <Image src={award.avatar} alt={award.user} width={40} height={60} className="rounded-full" unoptimized />
            </div>
            <div className="min-w-0">
                <p className="text-sm font-bold truncate flex items-center gap-1.5">
                    <award.icon className="h-4 w-4 text-primary" />
                    {award.title}: {award.user}
                </p>
                <p className="text-xs text-muted-foreground">{award.reason}</p>
            </div>
          </div>
        ))}
         <p className="text-xs text-muted-foreground text-center pt-2">Los reconocimientos son marcadores de posición.</p>
      </CardContent>
    </Card>
  );
}
