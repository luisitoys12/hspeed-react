import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface VipMembership {
  id: number;
  userId: number;
  tier: string;
  startedAt: string;
  expiresAt?: string;
  paymentRef?: string;
  isActive: boolean;
}

export default function VipPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: vipStatus } = useQuery<VipMembership>({
    queryKey: ["/api/vip/status"],
    enabled: !!user,
  });

  const subscribeMutation = useMutation({
    mutationFn: async ({ tier, months }: { tier: string; months: number }) => {
      return apiRequest("POST", "/api/vip/subscribe", { tier, months });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vip/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "¡Suscripción exitosa!",
        description: "Tu rango VIP ha sido activado correctamente.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error al suscribirse",
        description: err.message || "No se pudo procesar la suscripción.",
        variant: "destructive",
      });
    },
  });

  const tiers = [
    {
      name: "Silver",
      cost: 100,
      color: "from-zinc-500 to-zinc-300",
      textColor: "text-zinc-300",
      borderColor: "border-zinc-500/30",
      glowColor: "shadow-[0_0_15px_rgba(161,161,170,0.2)]",
      perks: [
        "Insignia VIP Silver en tu perfil público",
        "Multiplicador x1.25 en ganancias de SpeedPoints",
        "Color de chat exclusivo en el muro de perfiles",
      ],
    },
    {
      name: "Gold",
      cost: 200,
      color: "from-amber-500 to-amber-300",
      textColor: "text-primary",
      borderColor: "border-primary/40",
      glowColor: "shadow-[0_0_20px_rgba(245,166,35,0.3)]",
      featured: true,
      perks: [
        "Insignia VIP Gold en tu perfil público",
        "Multiplicador x1.5 en ganancias de SpeedPoints",
        "Rango destacado en comentarios y foros",
        "Prioridad de peticiones musicales sobre usuarios básicos",
      ],
    },
    {
      name: "Diamond",
      cost: 400,
      color: "from-cyan-500 to-blue-400",
      textColor: "text-cyan-400",
      borderColor: "border-cyan-500/30",
      glowColor: "shadow-[0_0_25px_rgba(6,182,212,0.3)]",
      perks: [
        "Insignia VIP Diamond de máximo prestigio",
        "Multiplicador x2.0 en ganancias de SpeedPoints",
        "Acceso exclusivo al Catálogo RARO de la tienda",
        "Fondo personalizado en tu muro de perfil",
        "Peticiones de canciones al instante",
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold uppercase tracking-tight text-white mb-2 font-cabinet">
          Membresías <span className="text-primary">VIP</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Apoya a la comunidad de HabboSpeed y obtén beneficios, multiplicadores de puntos e insignias exclusivas.
        </p>

        {user && (
          <div className="mt-6 inline-flex items-center gap-2 bg-card border border-border px-4 py-1.5 rounded-full text-xs">
            <span className="text-muted-foreground">Tus SpeedPoints:</span>
            <strong className="text-primary flex items-center gap-1">
              <i className="fa-solid fa-coins"></i> {user.speedPoints} SP
            </strong>
          </div>
        )}
      </div>

      {/* Current VIP Status Card */}
      {user && vipStatus?.isActive && (
        <Card className="mb-12 border-primary/40 bg-gradient-to-r from-primary/5 via-card to-card overflow-hidden">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl shadow-[0_0_10px_rgba(245,166,35,0.2)]">
                <i className="fa-solid fa-crown"></i>
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">
                  Tu Rango VIP <span className="text-primary uppercase">{vipStatus.tier}</span> está Activo
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Vence el {new Date(vipStatus.expiresAt!).toLocaleDateString("es-ES", { dateStyle: "long" })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3.5 py-1 rounded-full text-xs font-bold text-primary">
              <i className="fa-solid fa-circle-check"></i> Beneficios Activos
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={`relative flex flex-col border transition-all duration-300 hover:scale-[1.02] ${
              tier.featured ? "border-primary/80 bg-zinc-950" : "border-border bg-card/60"
            } ${tier.glowColor}`}
          >
            {tier.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-black font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-[0_4px_10px_rgba(245,166,35,0.4)]">
                ★ RECOMENDADO ★
              </span>
            )}

            <CardHeader className="text-center pt-8">
              <CardTitle className={`text-2xl font-black uppercase font-cabinet ${tier.textColor}`}>
                VIP {tier.name}
              </CardTitle>
              <div className="flex items-baseline justify-center gap-1 mt-4">
                <span className="text-4xl font-extrabold text-white">{tier.cost}</span>
                <span className="text-xs text-muted-foreground">SP / mes</span>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-6 pt-0">
              <hr className="border-border/60 mb-6" />
              
              <ul className="space-y-3 mb-8 flex-1 text-xs text-muted-foreground text-left">
                {tier.perks.map((perk, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5"><i className="fa-solid fa-check"></i></span>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full font-bold uppercase py-5 rounded-lg text-xs tracking-wider transition-all duration-300 ${
                  tier.featured 
                    ? "bg-primary text-black hover:bg-primary/90 shadow-[0_4px_12px_rgba(245,166,35,0.25)]" 
                    : "bg-secondary text-white hover:bg-zinc-800"
                }`}
                disabled={!user || subscribeMutation.isPending || (vipStatus?.isActive && vipStatus.tier === tier.name.toLowerCase())}
                onClick={() => subscribeMutation.mutate({ tier: tier.name.toLowerCase(), months: 1 })}
              >
                {subscribeMutation.isPending ? (
                  <i className="fa-solid fa-circle-notch animate-spin"></i>
                ) : vipStatus?.isActive && vipStatus.tier === tier.name.toLowerCase() ? (
                  "Suscrito"
                ) : (
                  "Adquirir con SP"
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info FAQ */}
      <Card className="border border-border bg-card/40 backdrop-blur">
        <CardContent className="p-8">
          <h3 className="text-lg font-bold uppercase tracking-wider text-white font-cabinet mb-4">
            Preguntas Frecuentes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-muted-foreground">
            <div>
              <h4 className="font-bold text-white mb-1">¿Cómo consigo SpeedPoints (SP)?</h4>
              <p>Puedes conseguir SpeedPoints de manera gratuita participando en los juegos de la comunidad, sintonizando la radio activamente, respondiendo las encuestas o participando en los concursos del foro.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">¿Puedo acumular meses de VIP?</h4>
              <p>Sí. Si decides renovar o adquirir más meses, tu fecha de expiración se extenderá automáticamente sumando los meses correspondientes.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
