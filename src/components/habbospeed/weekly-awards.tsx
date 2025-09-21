import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Award, Mic, Headphones, BookOpen } from "lucide-react";
import Image from "next/image";

const awards = [
  { 
    title: 'Mejor DJ', 
    user: 'PixelMaster', 
    avatar: 'https://www.habbo.es/habbo-imaging/avatarimage?user=PixelMaster&direction=2&head_direction=3&gesture=sml&size=m',
    icon: Mic,
    reason: 'Por su increíble set de Pop Pixelado el Lunes.'
  },
  { 
    title: 'Mejor Oyente', 
    user: 'Fanatico123', 
    avatar: 'https://www.habbo.es/habbo-imaging/avatarimage?user=Fanatico123&direction=2&head_direction=3&gesture=sml&size=m',
    icon: Headphones,
    reason: '¡Por participar y pedir las mejores canciones toda la semana!'
  },
  { 
    title: 'Mejor Guía', 
    user: 'ConstructorPro', 
    avatar: 'https://www.habbo.es/habbo-imaging/avatarimage?user=ConstructorPro&direction=2&head_direction=3&gesture=sml&size=m',
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
               <Image src={award.avatar} alt={award.user} width={40} height={40} className="rounded-full" />
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
