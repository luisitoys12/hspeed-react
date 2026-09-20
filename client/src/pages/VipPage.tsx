import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Crown, Coins } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { PageHeaderCard } from "@/components/PageHeaderCard";
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
    <PageContainer>
      <PageHeaderCard
        title="Membresías VIP"
        description="Apoya a la comunidad de HabboSpeed y obtén beneficios, multiplicadores de puntos e insignias exclusivas."
        icon={<Crown className="w-5 h-5 text-amber-500" />}
        action={
          user ? (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-xl text-xs">
              <span className="text-slate-500 dark:text-slate-400">Tus SpeedPoints:</span>
              <strong className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-bold">
                <Coins className="w-3.5 h-3.5" /> {user.speedPoints} SP
              </strong>
            </div>
          ) : undefined
        }
      />

      {/* Current VIP Status Card */}
      {user && vipStatus?.isActive && (
        <Card className="border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 rounded-2xl overflow-hidden shadow-xs">
          <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-500 text-2xl">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Tu Rango VIP{" "}
                  <span className="text-amber-600 dark:text-amber-400 uppercase">
                    {vipStatus.tier}
                  </span>{" "}
                  está Activo
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Vence el{" "}
                  {new Date(vipStatus.expiresAt!).toLocaleDateString("es-ES", {
                    dateStyle: "long",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400">
              <i className="fa-solid fa-circle-check"></i> Beneficios Activos
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={`relative flex flex-col rounded-2xl shadow-xs transition-all duration-300 hover:shadow-md ${
              tier.featured
                ? "bg-white dark:bg-slate-900 border-2 border-amber-500/60 ring-2 ring-amber-500/20"
                : "bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800"
            }`}
          >
            {tier.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                ★ RECOMENDADO ★
              </span>
            )}

            <CardHeader className="text-center pt-8">
              <CardTitle
                className={`text-2xl font-black uppercase ${tier.textColor}`}
              >
                VIP {tier.name}
              </CardTitle>
              <div className="flex items-baseline justify-center gap-1 mt-4">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">
                  {tier.cost}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">SP / mes</span>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-6 pt-0">
              <hr className="border-slate-100 dark:border-slate-800 mb-6" />

              <ul className="space-y-3 mb-8 flex-1 text-xs text-slate-600 dark:text-slate-400 text-left">
                {tier.perks.map((perk, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">
                      <i className="fa-solid fa-check"></i>
                    </span>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full font-bold uppercase py-2.5 rounded-xl text-xs tracking-wider transition-all duration-300 ${
                  tier.featured
                    ? "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs"
                    : "bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700"
                }`}
                disabled={
                  !user ||
                  subscribeMutation.isPending ||
                  (vipStatus?.isActive &&
                    vipStatus.tier === tier.name.toLowerCase())
                }
                onClick={() =>
                  subscribeMutation.mutate({
                    tier: tier.name.toLowerCase(),
                    months: 1,
                  })
                }
              >
                {subscribeMutation.isPending ? (
                  <i className="fa-solid fa-circle-notch animate-spin"></i>
                ) : vipStatus?.isActive &&
                  vipStatus.tier === tier.name.toLowerCase() ? (
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
      <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs">
        <CardContent className="p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
            Preguntas Frecuentes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 dark:text-slate-400">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-200 mb-1">
                ¿Cómo consigo SpeedPoints (SP)?
              </h4>
              <p>
                Puedes conseguir SpeedPoints de manera gratuita participando en
                los juegos de la comunidad, sintonizando la radio activamente,
                respondiendo las encuestas o participando en los concursos del
                foro.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-200 mb-1">
                ¿Puedo acumular meses de VIP?
              </h4>
              <p>
                Sí. Si decides renovar o adquirir más meses, tu fecha de
                expiración se extenderá automáticamente sumando los meses
                correspondientes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
