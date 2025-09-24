import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, BookHeart, Milestone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AboutUsPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="flex items-center justify-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <BookHeart className="h-8 w-8 text-primary" />
          Nuestra Historia
        </h1>
        <p className="text-muted-foreground mt-2">
          El viaje de Habbospeed, desde sus inicios hasta convertirse en tu radio favorita.
        </p>
      </div>

      <div className="space-y-12">
        <Card className="flex flex-col md:flex-row items-center gap-8 p-8">
            <div className="flex-shrink-0">
                <Image src="https://i.imgur.com/u31XFxN.png" alt="Logo antiguo" width={150} height={150} unoptimized />
            </div>
            <div>
                <h2 className="font-headline text-2xl text-primary mb-2 flex items-center gap-2"><Milestone />El Comienzo</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Habbospeed nació en [Año de Fundación] de la mano de un pequeño grupo de amigos apasionados por Habbo Hotel y la música. Con más sueños que recursos, montaron una pequeña radio online con el objetivo de crear un espacio donde la comunidad pudiera reunirse, escuchar buena música y, sobre todo, divertirse. Las primeras transmisiones se hacían desde las salas públicas del hotel, con una energía que rápidamente contagió a los primeros oyentes.
                </p>
            </div>
        </Card>

         <Card className="flex flex-col md:flex-row-reverse items-center gap-8 p-8">
            <div className="flex-shrink-0">
                <Image src="https://images.habbo.com/c_images/habbowidgets/pixelart-139_gen.gif" alt="Evento en Habbo" width={150} height={150} unoptimized/>
            </div>
            <div>
                <h2 className="font-headline text-2xl text-primary mb-2 flex items-center gap-2"><Milestone />Crecimiento y Comunidad</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Lo que empezó como un hobby, pronto se convirtió en un fenómeno. Gracias al boca a boca y a la organización de eventos y concursos innovadores, la audiencia creció exponencialmente. Se unieron nuevos DJs, cada uno con su estilo único, y la programación se expandió para cubrir todos los gustos musicales. Habbospeed se convirtió en el punto de encuentro oficial para fiestas, debates y lanzamientos de nuevos furnis, consolidando una comunidad fuerte y leal.
                </p>
            </div>
        </Card>

         <Card className="flex flex-col md:flex-row items-center gap-8 p-8">
            <div className="flex-shrink-0">
                <Image src="https://images.habbo.com/c_images/album1584/ADM.gif" alt="Placa de fansite oficial" width={120} height={120} unoptimized />
            </div>
            <div>
                <h2 className="font-headline text-2xl text-primary mb-2 flex items-center gap-2"><Milestone />El Presente y Futuro</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Hoy, Habbospeed es una fansite oficial reconocida, con un equipo dedicado y miles de oyentes diarios. Hemos evolucionado, adoptando nuevas tecnologías para ofrecer una experiencia web moderna y una radio de alta calidad. Pero nuestra esencia sigue siendo la misma: ser una radio hecha por y para la comunidad. Mirando al futuro, nuestro compromiso es seguir innovando, creando eventos memorables y siendo el hogar musical de la comunidad de Habbo.es.
                </p>
            </div>
        </Card>
        
        <div className="text-center">
             <Button asChild size="lg">
                <Link href="/team">
                    <Users className="mr-2"/>
                    Conoce a Nuestro Equipo
                </Link>
            </Button>
        </div>

      </div>

    </div>
  );
}
