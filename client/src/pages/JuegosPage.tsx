import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Sword,
  Heart,
  Gamepad2,
  Brain,
  Target,
  Clock,
  Play,
} from "lucide-react";
import { proxyImage } from "@/lib/habboProxy";
import type { MiniGame, UserMiniGameScore } from "@shared/schema";

const GAME_CONFIG: Record<string, { icon: any; color: string; label: string }> =
  {
    penalty: { icon: Zap, color: "text-green-400", label: "Deportes" },
    trivia: { icon: Brain, color: "text-blue-400", label: "Quiz" },
    memory: { icon: Trophy, color: "text-purple-400", label: "Puzzle" },
    clicker: { icon: Gamepad2, color: "text-orange-400", label: "Arcade" },
  };

export default function JuegosPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allGames, isLoading: loadingGames } = useQuery<MiniGame[]>({
    queryKey: ["/api/mini-games"],
  });

  const { data: userScores, isLoading: loadingScores } = useQuery<
    UserMiniGameScore[]
  >({
    queryKey: ["/api/users", user?.id, "mini-game-scores"],
    enabled: !!user,
  });

  const playMutation = useMutation({
    mutationFn: async ({
      gameCode,
      score,
      gameData,
    }: {
      gameCode: string;
      score: number;
      gameData?: any;
    }) => {
      const res = await apiRequest(
        "POST",
        `/api/mini-games/${gameCode}/play`,
        { score, gameData },
        token ? `Bearer ${token}` : undefined,
      );
      return res.json();
    },
    onSuccess: (_, { gameCode }) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/users", user?.id, "mini-game-scores"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/mini-games", gameCode, "leaderboard"],
      });
      toast({
        title: "¡Partida guardada!",
        description: "Tu puntuación se ha registrado",
      });
    },
    onError: (err: any) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
  });

  const games: MiniGame[] = allGames || [];

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 p-2 rounded-xl">
          <Gamepad2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Minijuegos</h1>
          <p className="text-xs text-muted-foreground">
            Compite, gana SpeedPoints y desbloquea cartas exclusivas
          </p>
        </div>
      </div>

      {loadingGames ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-64">
              <Skeleton className="h-full w-full" />
            </Card>
          ))}
        </div>
      ) : (
        <Tabs defaultValue="jugar" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="jugar">Jugar</TabsTrigger>
            <TabsTrigger value="ranking">Rankings</TabsTrigger>
          </TabsList>

          <TabsContent value="jugar">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.map((game) => {
                const config = GAME_CONFIG[game.code] || {
                  icon: Gamepad2,
                  color: "text-primary",
                  label: "Juego",
                };
                const GameIcon = config.icon;
                const userScore = userScores?.find(
                  (s) => s.miniGameId === game.id,
                );
                const bestScore = userScore?.maxScore || 0;

                return (
                  <Card key={game.id} className="h-64 flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GameIcon className={`w-5 h-5 ${config.color}`} />
                          <h3 className="font-bold">{game.name}</h3>
                        </div>
                        <Badge variant="secondary" className="text-[9px]">
                          {config.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between">
                      <p className="text-sm text-muted-foreground">
                        {game.description}
                      </p>
                      {game.thumbnailUrl && (
                        <img
                          src={proxyImage(game.thumbnailUrl)}
                          alt={game.name}
                          className="w-full h-32 object-cover rounded-lg mb-2"
                        />
                      )}
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>Mejor: {bestScore}</span>
                        <span>Jugadas: {userScore?.playsCount || 0}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            if (!user) {
                              toast({
                                title: "Inicia sesión",
                                description: "Necesitas una cuenta para jugar",
                                variant: "destructive",
                              });
                              return;
                            }
                            // Aquí se abriría el juego real - por ahora simulamos
                            const mockScore = Math.floor(
                              Math.random() * (game.maxScore || 1000),
                            );
                            playMutation.mutate({
                              gameCode: game.code,
                              score: mockScore,
                            });
                          }}
                          disabled={playMutation.isPending || !user}
                        >
                          <Play className="w-4 h-4 mr-1" /> Jugar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-8"
                          onClick={() => {}}
                        >
                          <Trophy className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="ranking">
            <div className="space-y-4">
              {games.map((game) => {
                const config = GAME_CONFIG[game.code] || {
                  icon: Gamepad2,
                  color: "text-primary",
                  label: "Juego",
                };
                const GameIcon = config.icon;

                return (
                  <Card key={game.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GameIcon className={`w-5 h-5 ${config.color}`} />
                          <h3 className="font-bold">{game.name}</h3>
                        </div>
                        <Badge variant="secondary" className="text-[9px]">
                          {config.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-medium text-muted-foreground">
                          <span>#</span>
                          <span>Usuario</span>
                          <span>Puntuación</span>
                          <span>Partidas</span>
                          <span>Última vez</span>
                        </div>
                        <div className="space-y-1">
                          {[1, 2, 3, 4, 5].map((pos) => (
                            <div
                              key={pos}
                              className="grid grid-cols-5 gap-2 items-center py-2 px-2 rounded border border-border/50"
                            >
                              <span className="font-bold text-sm">{pos}</span>
                              <span className="truncate">Jugador {pos}</span>
                              <span>{Math.floor(Math.random() * 1000)}</span>
                              <span>{Math.floor(Math.random() * 50) + 1}</span>
                              <span className="text-[10px]">
                                Hace {Math.floor(Math.random() * 24)}h
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      )}

      <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
        <CardContent className="p-4">
          <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" /> Recompensas por jugar
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" /> 1 partida: 15 SP
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3" /> Top 10: 100 SP
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Top 3: 250 SP + Carta
            </div>
            <div className="flex items-center gap-1">
              <Crown className="w-3 h-3" /> #1: 500 SP + Carta Épica
            </div>
            <div className="flex items-center gap-1">
              <Brain className="w-3 h-3" /> Trivia 10/10: 500 SP
            </div>
            <div className="flex items-center gap-1">
              <Flame className="w-3 h-3" /> Penalty 5/5: 300 SP
            </div>
            <div className="flex items-center gap-1">
              <Gamepad2 className="w-3 h-3" /> Clicker 100/s: 200 SP
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" /> Memory {"<60s"}: 150 SP
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
