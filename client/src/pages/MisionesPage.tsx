import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Zap,
  Trophy,
  Sparkles,
  Crown,
  Flame,
  Star,
  Shield,
  Calendar,
  Clock,
  Target,
  CheckCircle,
  Loader2,
  Stamp,
} from "lucide-react";
import { proxyImage } from "@/lib/habboProxy";

const MISSION_CATEGORY_COLORS: Record<string, string> = {
  daily: "bg-blue-500/20 text-blue-400",
  weekly: "bg-purple-500/20 text-purple-400",
  seasonal: "bg-orange-500/20 text-orange-400",
  special: "bg-pink-500/20 text-pink-400",
  achievement: "bg-yellow-500/20 text-yellow-400",
};

const MISSION_CATEGORY_ICONS: Record<string, any> = {
  daily: Calendar,
  weekly: Calendar,
  seasonal: Flame,
  special: Sparkles,
  achievement: Trophy,
};

export default function MisionesPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allMissions, isLoading: loadingMissions } = useQuery({
    queryKey: ["/api/speed-missions"],
  });

  const { data: userMissions, isLoading: loadingUserMissions } = useQuery({
    queryKey: ["/api/users", user?.id, "missions"],
    enabled: !!user,
  });

  const { data: allStamps, isLoading: loadingStamps } = useQuery({
    queryKey: ["/api/seasonal-stamps"],
  });

  const { data: userStamps, isLoading: loadingUserStamps } = useQuery({
    queryKey: ["/api/users", user?.id, "stamps"],
    enabled: !!user,
  });

  const progressMutation = useMutation({
    mutationFn: async ({
      missionId,
      action,
      metadata,
    }: {
      missionId: number;
      action: string;
      metadata?: any;
    }) => {
      const res = await apiRequest(
        "POST",
        `/api/speed-missions/${missionId}/progress`,
        { action, metadata },
        token ? `Bearer ${token}` : undefined,
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/users", user?.id, "missions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/users", user?.id, "stamps"],
      });
    },
    onError: (err: any) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
  });

  const claimMutation = useMutation({
    mutationFn: async (missionId: number) => {
      const res = await apiRequest(
        "POST",
        `/api/speed-missions/${missionId}/claim`,
        {},
        token ? `Bearer ${token}` : undefined,
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/users", user?.id, "missions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/users", user?.id, "stamps"],
      });
      toast({
        title: "¡Recompensa reclamada!",
        description: "Revisa tu inventario",
      });
    },
    onError: (err: any) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
  });

  const missions = allMissions || [];
  const stamps = allStamps || [];
  const userMissionMap = new Map(
    (userMissions || []).map((m: any) => [m.missionId, m]),
  );
  const userStampSet = new Set((userStamps || []).map((s: any) => s.stampId));

  const categories = ["daily", "weekly", "seasonal", "special", "achievement"];

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-xl">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">
            Speed Missions & Álbum de Estampas
          </h1>
          <p className="text-xs text-muted-foreground">
            Completa misiones diarias, semanales y de temporada para ganar
            estampas y recompensas
          </p>
        </div>
      </div>

      <Tabs defaultValue="misiones" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="misiones">Misiones</TabsTrigger>
          <TabsTrigger value="estampas">Álbum de Estampas</TabsTrigger>
        </TabsList>

        <TabsContent value="misiones">
          <div className="space-y-3">
            {categories.map((cat) => {
              const catMissions = missions.filter(
                (m: any) => m.category === cat,
              );
              if (catMissions.length === 0) return null;

              const CategoryIcon = MISSION_CATEGORY_ICONS[cat] || Calendar;

              return (
                <Card key={cat} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CategoryIcon
                        className={`w-5 h-5 ${MISSION_CATEGORY_COLORS[cat].replace("bg-", "text-").replace("/20", "")}`}
                      />
                      <h3 className="font-bold capitalize">
                        {cat} ({catMissions.length})
                      </h3>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {catMissions.map((mission: any) => {
                        const userMission = userMissionMap.get(mission.id);
                        const isCompleted =
                          userMission?.status === "completed" ||
                          userMission?.status === "claimed";
                        const isClaimed = userMission?.status === "claimed";
                        const progress = userMission?.progress || {
                          current: 0,
                        };
                        const targetCount = mission.target?.count || 1;
                        const current =
                          typeof progress === "object"
                            ? progress.current || 0
                            : 0;
                        const percentage =
                          targetCount > 0
                            ? Math.min(100, (current / targetCount) * 100)
                            : 0;

                        return (
                          <div
                            key={mission.id}
                            className={`relative p-3 rounded-lg border transition-all ${
                              isClaimed
                                ? "bg-green-500/10 border-green-500/30"
                                : "hover:bg-card"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <img
                                    src={proxyImage(
                                      mission.iconUrl ||
                                        "https://images.habbo.com/c_images/album1584/ADM.gif",
                                    )}
                                    alt={mission.name}
                                    className="w-8 h-8 rounded"
                                  />
                                  <div>
                                    <h4 className="font-bold text-sm">
                                      {mission.name}
                                    </h4>
                                    <p className="text-[10px] text-muted-foreground">
                                      {mission.description}
                                    </p>
                                  </div>
                                  <Badge
                                    variant="secondary"
                                    className={`text-[9px] ${MISSION_CATEGORY_COLORS[mission.category]}`}
                                  >
                                    {mission.category.charAt(0).toUpperCase() +
                                      mission.category.slice(1)}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isClaimed ? (
                                    <Badge
                                      variant="default"
                                      className="bg-green-500 text-green-500/10"
                                    >
                                      <CheckCircle className="w-3 h-3 mr-1" />{" "}
                                      Reclamado
                                    </Badge>
                                  ) : isCompleted ? (
                                    <Button
                                      size="sm"
                                      variant="default"
                                      className="bg-green-500 hover:bg-green-600"
                                      onClick={() =>
                                        claimMutation.mutate(mission.id)
                                      }
                                      disabled={claimMutation.isPending}
                                    >
                                      {claimMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        "Reclamar"
                                      )}
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-20"
                                      onClick={() =>
                                        progressMutation.mutate({
                                          missionId: mission.id,
                                          action: mission.type,
                                        })
                                      }
                                      disabled={progressMutation.isPending}
                                    >
                                      Progreso
                                    </Button>
                                  )}
                                </div>
                              </div>
                              <div className="w-32">
                                <div className="flex items-center justify-between text-[10px] mb-1">
                                  <span className="text-muted-foreground">
                                    Progreso
                                  </span>
                                  <span className="font-bold">
                                    {current} / {targetCount}
                                  </span>
                                </div>
                                <Progress
                                  value={percentage}
                                  className="h-1.5"
                                />
                                <div className="flex items-center justify-between text-[9px] text-muted-foreground mt-1">
                                  <span>
                                    <Zap className="w-2.5 h-2.5 mr-1" />
                                    {mission.rewardConfig?.speedPoints || 0} SP
                                  </span>
                                  {mission.rewardConfig?.cards?.length && (
                                    <span className="flex items-center gap-1">
                                      <Stamp className="w-2.5 h-2.5" />
                                      {mission.rewardConfig.cards.length}{" "}
                                      carta(s)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="estampas">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                Álbum de Estampas de Temporada
              </h2>
              {user && (
                <Badge variant="secondary">
                  {userStampSet.size} / {stamps.length} estampas
                </Badge>
              )}
            </div>

            {stamps.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Stamp className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No hay estampas disponibles esta temporada</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {stamps.map((stamp: any) => {
                  const isOwned = userStampSet.has(stamp.id);
                  const userStamp = (userStamps || []).find(
                    (s: any) => s.stampId === stamp.id,
                  );
                  const quantity = userStamp?.quantity || 0;
                  const isRepeated = userStamp?.isRepeated;

                  return (
                    <Card
                      key={stamp.id}
                      className={`relative overflow-hidden transition-all hover:shadow-xl ${
                        isOwned
                          ? "border-primary/30 bg-primary/5"
                          : "opacity-60"
                      }`}
                    >
                      <div className="aspect-square relative bg-gradient-to-br from-primary/10 to-card">
                        {stamp.imageUrl && (
                          <img
                            src={proxyImage(stamp.imageUrl)}
                            alt={stamp.name}
                            className="w-full h-full object-contain p-2"
                          />
                        )}
                        {!isOwned && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <Stamp className="w-10 h-10 text-white/30" />
                          </div>
                        )}
                        <div className="absolute top-2 left-2">
                          <Badge variant="secondary" className="text-[8px]">
                            {stamp.season}
                          </Badge>
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge
                            variant="secondary"
                            className={`text-[8px] ${RARITY_COLORS[stamp.rarity]}`}
                          >
                            {RARITY_LABELS[stamp.rarity] || stamp.rarity}
                          </Badge>
                        </div>
                        {isOwned && (
                          <div className="absolute bottom-2 left-2">
                            <CheckCircle className="w-5 h-5 text-green-400 bg-green-400/20 rounded-full p-0.5" />
                          </div>
                        )}
                        {quantity > 1 && (
                          <div className="absolute bottom-2 right-2">
                            <Badge variant="secondary" className="text-[8px]">
                              x{quantity}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-2">
                        <h3 className="font-bold text-sm truncate">
                          {stamp.name}
                        </h3>
                        <p className="text-[9px] text-muted-foreground truncate">
                          {stamp.description}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                          <span className="text-[9px] text-muted-foreground">
                            {stamp.season}
                          </span>
                          {isOwned && (
                            <Badge
                              variant="default"
                              className="bg-green-500/20 text-green-400 text-[8px]"
                            >
                              <CheckCircle className="w-2.5 h-2.5 mr-1" />{" "}
                              Conseguida
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
              <CardContent className="p-4">
                <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                  <Flame className="w-4 h-4" /> Estampas de Temporada Actual
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Consigue estampas completando misiones de temporada,
                  asistiendo a eventos y ganando torneos. ¡Cada temporada trae
                  nuevas estampas exclusivas!
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Flame className="w-3 h-3" /> Misiones semanales
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="w-3 h-3" /> Torneos
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Eventos especiales
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Login en fechas señaladas
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const RARITY_LABELS: Record<string, string> = {
  common: "Común",
  rare: "Rara",
  epic: "Épica",
  legendary: "Legendaria",
  mythic: "Mítica",
};
