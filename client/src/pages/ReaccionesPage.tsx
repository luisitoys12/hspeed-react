import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Zap,
  Heart,
  Flame,
  Sparkles,
  Trophy,
  Crown,
  Radio,
  Star,
  Lock,
  Check,
  Loader2,
} from "lucide-react";
import { proxyImage } from "@/lib/habboProxy";
import type { ReactionIcon, UserReactionIcon } from "@shared/schema";

const RARITY_COLORS: Record<string, string> = {
  common: "bg-gray-500/20 text-gray-400",
  rare: "bg-blue-500/20 text-blue-400",
  epic: "bg-purple-500/20 text-purple-400",
  legendary: "bg-yellow-500/20 text-yellow-400",
};

const RARITY_ICONS: Record<string, any> = {
  common: Star,
  rare: Sparkles,
  epic: Flame,
  legendary: Crown,
};

export default function ReaccionesPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allIcons, isLoading: loadingIcons } = useQuery<ReactionIcon[]>({
    queryKey: ["/api/reaction-icons"],
  });

  const { data: userIcons, isLoading: loadingUserIcons } = useQuery<
    UserReactionIcon[]
  >({
    queryKey: ["/api/users", user?.id, "reaction-icons"],
    enabled: !!user,
  });

  const unlockMutation = useMutation({
    mutationFn: async (iconId: number) => {
      const res = await apiRequest(
        "POST",
        `/api/users/${user?.id}/reaction-icons/${iconId}/unlock`,
        {},
        token ? `Bearer ${token}` : undefined,
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/users", user?.id, "reaction-icons"],
      });
      toast({
        title: "¡Icono desbloqueado!",
        description: "Ya puedes usarlo en tus reacciones",
      });
    },
    onError: (err: any) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
  });

  const icons = allIcons || [];
  const unlockedIds = new Set(
    (userIcons || []).map((u: any) => u.reactionIconId),
  );

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 p-2 rounded-xl">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">
            Speed Icons - Reacciones Coleccionables
          </h1>
          <p className="text-xs text-muted-foreground">
            Desbloquea iconos únicos participando en la comunidad
          </p>
        </div>
        {user && (
          <Badge variant="secondary" className="text-[10px] ml-auto">
            {unlockedIds.size} / {icons.length} desbloqueados
          </Badge>
        )}
      </div>

      {!user || loadingUserIcons ? (
        <div className="text-center py-8 text-muted-foreground">
          <Lock className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p className="text-sm">
            Inicia sesión para ver tu colección y desbloquear iconos
          </p>
          {user && loadingUserIcons && (
            <Loader2 className="w-6 h-6 mx-auto mt-2 animate-spin text-primary" />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {icons.map((icon: any) => {
            const isUnlocked = unlockedIds.has(icon.id);
            const RarityIcon = RARITY_ICONS[icon.rarity] || Star;
            const canAfford =
              (user?.speedPoints || 0) >= (icon.speedPointsCost || 0);
            const isUnlockedByCondition =
              icon.unlockCondition &&
              Object.keys(icon.unlockCondition).length > 0;

            return (
              <Card
                key={icon.id}
                className={`relative overflow-hidden transition-all hover:shadow-xl ${
                  isUnlocked ? "border-primary/30 bg-primary/5" : "opacity-60"
                }`}
              >
                <div className="aspect-square relative bg-gradient-to-br from-primary/10 to-card">
                  {icon.iconUrl && (
                    <img
                      src={proxyImage(icon.iconUrl)}
                      alt={icon.name}
                      className="w-full h-full object-contain p-4"
                    />
                  )}
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <Lock className="w-10 h-10 text-white/50" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant="secondary"
                      className={`${RARITY_COLORS[icon.rarity]} text-[9px]`}
                    >
                      <RarityIcon className="w-2.5 h-2.5 mr-1" />
                      {icon.rarity.charAt(0).toUpperCase() +
                        icon.rarity.slice(1)}
                    </Badge>
                  </div>
                  {isUnlocked && (
                    <div className="absolute top-2 left-2">
                      <Check className="w-5 h-5 text-green-400 bg-green-400/20 rounded-full p-0.5" />
                    </div>
                  )}
                </div>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm truncate">{icon.name}</h3>
                    {icon.label && (
                      <span className="text-2xl">{icon.label}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">
                    {icon.category}
                  </p>

                  {!isUnlocked && (
                    <div className="pt-2 border-t border-border/50 space-y-2">
                      {icon.speedPointsCost && icon.speedPointsCost > 0 && (
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {icon.speedPointsCost} SP
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            ({user?.speedPoints || 0} disponibles)
                          </span>
                        </div>
                      )}
                      {icon.unlockCondition &&
                        Object.keys(icon.unlockCondition).length > 0 && (
                          <div className="text-[10px] text-muted-foreground">
                            Se desbloquea:{" "}
                            {JSON.stringify(icon.unlockCondition)}
                          </div>
                        )}

                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => unlockMutation.mutate(icon.id)}
                        disabled={unlockMutation.isPending || !canAfford}
                      >
                        {unlockMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            {icon.speedPointsCost > 0
                              ? "Comprar"
                              : "Desbloquear"}
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {isUnlocked && (
                    <div className="pt-2 border-t border-green-400/30">
                      <Badge
                        variant="default"
                        className="w-full bg-green-400/20 text-green-400 text-[10px]"
                      >
                        <Check className="w-2.5 h-2.5 mr-1" /> Desbloqueado
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4" /> ¿Cómo conseguir SpeedPoints?
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" /> Login diario: 10 SP
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" /> Leer noticias: 5 SP
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" /> Escuchar radio: 15 SP/30min
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" /> Jugar minijuegos: 25 SP
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" /> Comentar: 10 SP
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" /> Reaccionar: 5 SP
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" /> Compartir: 20 SP
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" /> Misiones: 10-200 SP
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
