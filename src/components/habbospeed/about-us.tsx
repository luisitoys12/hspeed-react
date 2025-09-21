import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Radio, Users, Heart } from 'lucide-react';
import Image from 'next/image';

export default function AboutUs() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-col items-center text-center">
            <Image src="https://www.habbo.es/habbo-imaging/avatarimage?user=estacionkusfm&headonly=1&size=l" alt="Ekus FM" width={80} height={80} className="rounded-full border-4 border-primary mb-4" />
          <CardTitle className="font-headline text-2xl">Sobre Ekus FM</CardTitle>
          <CardDescription className="italic">Tu radio, tu comunidad.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        
        <div className="space-y-4 text-sm">
            <div className="flex flex-col items-center gap-2 p-4 bg-background/50 rounded-lg">
                <Radio className="h-6 w-6 text-primary" />
                <h3 className="font-headline font-bold">Nuestra Misión</h3>
                <p className="text-muted-foreground">
                    Ofrecerte la mejor música y entretenimiento 24/7, creando un espacio donde la comunidad de Habbo.es pueda conectar y divertirse.
                </p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 bg-background/50 rounded-lg">
                <Heart className="h-6 w-6 text-primary" />
                <h3 className="font-headline font-bold">¿Por qué Elegirnos?</h3>
                <p className="text-muted-foreground">
                    Somos una fansite oficial con DJs apasionados, eventos exclusivos y una dedicación total a nuestros oyentes. ¡En Ekus FM, tú eres la estrella!
                </p>
            </div>
             <div className="flex flex-col items-center gap-2 p-4 bg-background/50 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
                <h3 className="font-headline font-bold">Nuestra Comunidad</h3>
                <p className="text-muted-foreground">
                   Únete a nuestra vibrante comunidad en Habbo y en nuestras redes sociales. Participa en concursos, gana premios y haz nuevos amigos.
                </p>
            </div>
        </div>

      </CardContent>
    </Card>
  );
}
