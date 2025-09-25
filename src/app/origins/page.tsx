
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import LatestCampaigns from "@/components/habbospeed/latest-campaigns";
import LatestBadges from "@/components/habbospeed/latest-badges";
import { Sprout } from "lucide-react";
import Image from "next/image";

export default function OriginsPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <Sprout className="h-8 w-8 text-primary" />
          Speed Origins
        </h1>
        <p className="text-muted-foreground mt-2">
          Toda la información sobre el clásico Habbo Origins.
        </p>
      </div>

       <Card className="overflow-hidden mb-8">
            <div className="relative h-48 md:h-64 bg-black">
                <Image
                    src="https://images.habbo.com/web_images/habbo-web-articles/lpromo_habbo_origins_centerspread_upscaled.png"
                    alt="Habbo Origins"
                    layout="fill"
                    objectFit="cover"
                    className="opacity-60"
                    unoptimized
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <Image 
                        src="https://images.habbo.com/c_images/origins_logo/origins_logo_white.png" 
                        alt="Origins Logo"
                        width={200}
                        height={100}
                        unoptimized
                    />
                    <h1 className="text-xl md:text-2xl font-headline font-bold mt-2 drop-shadow-lg">
                        ¡El viaje al pasado ha comenzado!
                    </h1>
                </div>
            </div>
        </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <LatestCampaigns 
          hotel="origin"
          title="Campañas Recientes de Origins"
          description="Las últimas noticias y eventos del hotel original."
        />
        <LatestBadges 
          hotel="origin"
          title="Últimas Placas de Origins"
          description="Las placas más nuevas que han llegado a Habbo Origins."
        />
      </div>
    </div>
  );
}
