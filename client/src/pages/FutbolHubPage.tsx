import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Calendar,
  Target,
  Users,
  Play,
  Star,
  RefreshCw,
  Award,
  Zap,
  Gamepad2,
  Gift,
  Medal,
  Compass,
  CheckCircle2,
  Lock,
  Flame,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const LEAGUES = [
  {
    id: "PL",
    name: "Premier League",
    country: "Inglaterra",
    logo: "https://crests.football-data.org/PL.png",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    season: "2024/2025",
  },
  {
    id: "PD",
    name: "La Liga",
    country: "España",
    logo: "https://crests.football-data.org/PD.png",
    flag: "🇪🇸",
    season: "2024/2025",
  },
  {
    id: "MX1",
    name: "Liga MX",
    country: "México",
    logo: "https://crests.football-data.org/MX1.png",
    flag: "🇲🇽",
    season: "Apertura 2024",
  },
];

async function fetchFromFootballAPI(endpoint: string) {
  try {
    const response = await fetch(
      `https://api.football-data.org/v4${endpoint}`,
      {
        headers: {
          "X-Auth-Token": "YOUR_API_KEY_HERE",
        },
      },
    );
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  } catch {
    return null;
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMatchStatus(status: string): { label: string; color: string; icon: any } {
  switch (status) {
    case "FINISHED":
      return { label: "Finalizado", color: "bg-green-500/20 text-green-400", icon: "✓" };
    case "LIVE":
    case "IN_PLAY":
      return { label: "EN VIVO", color: "bg-red-500/20 text-red-400 animate-pulse", icon: "LIVE" };
    default:
      return { label: "Programado", color: "bg-blue-500/20 text-blue-400", icon: "🕐" };
  }
}

export default function FutbolHubPage() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedLeague, setSelectedLeague] = useState(LEAGUES[0]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // Penal game state
  const [penaltyShotsLeft, setPenaltyShotsLeft] = useState(5);
  const [penaltyGoals, setPenaltyGoals] = useState(0);
  const [penaltySaves, setPenaltySaves] = useState(0);
  const [penaltyStreak, setPenaltyStreak] = useState(0);
  const [penaltyFeedback, setPenaltyFeedback] = useState(null);
  const [keeperDive, setKeeperDive] = useState(null);
  const [isShooting, setIsShooting] = useState(false);
  const [earnedSp, setEarnedSp] = useState(0);

  // Wheel state
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState(null);

  // Determine current active subview
  const isPenales = location.includes("/mini/rapido");
  const isSorteos = location.includes("/mini/sorteos");
  const isAventura = location.includes("/aventura");
  const isRanking = location.includes("/ranking");
  const isTorneos = location.includes("/torneos");
  const isPronosticos = location.includes("/pronosticos");
  const isEquipos = location.includes("/equipos");

  const [activeTab, setActiveTab] = useState(
    isPronosticos ? "pronosticos" : isEquipos ? "equipos" : "partidos"
  );

  useEffect(() => {
    if (isPronosticos) setActiveTab("pronosticos");
    else if (isEquipos) setActiveTab("equipos");
  }, [isPronosticos, isEquipos]);

  const { data: matches = [], isLoading: loadingMatches } = useQuery({
    queryKey: ["/api/football/matches", selectedLeague.id, selectedDate],
    queryFn: async () => {
      const data = await fetchFromFootballAPI(
        `/competitions/${selectedLeague.id}/matches?dateFrom=${selectedDate}&dateTo=${selectedDate}`
      );
      return data?.matches || [
        {
          id: 101,
          utcDate: new Date().toISOString(),
          status: "FINISHED",
          matchday: 24,
          homeTeam: { name: "Real Madrid" },
          awayTeam: { name: "FC Barcelona" },
          score: { fullTime: { home: 3, away: 2 } },
        },
        {
          id: 102,
          utcDate: new Date().toISOString(),
          status: "LIVE",
          matchday: 24,
          homeTeam: { name: "Manchester City" },
          awayTeam: { name: "Liverpool FC" },
          score: { fullTime: { home: 1, away: 1 } },
        },
        {
          id: 103,
          utcDate: new Date(Date.now() + 86400000).toISOString(),
          status: "SCHEDULED",
          matchday: 25,
          homeTeam: { name: "América" },
          awayTeam: { name: "Chivas Guadalajara" },
          score: { fullTime: { home: null, away: null } },
        },
      ];
    },
    staleTime: 60000,
  });

  const { data: standings = [], isLoading: loadingStandings } = useQuery({
    queryKey: ["/api/football/standings", selectedLeague.id],
    queryFn: async () => {
      const data = await fetchFromFootballAPI(`/competitions/${selectedLeague.id}/standings`);
      return (
        data?.standings?.[0]?.table || [
          { position: 1, team: { id: 1, name: "Real Madrid", crest: "https://crests.football-data.org/86.png" }, playedGames: 28, won: 22, draw: 4, lost: 2, goalDifference: 46, points: 70 },
          { position: 2, team: { id: 2, name: "FC Barcelona", crest: "https://crests.football-data.org/81.png" }, playedGames: 28, won: 20, draw: 5, lost: 3, goalDifference: 43, points: 65 },
          { position: 3, team: { id: 3, name: "Atlético de Madrid", crest: "https://crests.football-data.org/78.png" }, playedGames: 28, won: 18, draw: 6, lost: 4, goalDifference: 30, points: 60 },
          { position: 4, team: { id: 4, name: "Athletic Club", crest: "https://crests.football-data.org/77.png" }, playedGames: 28, won: 16, draw: 7, lost: 5, goalDifference: 22, points: 55 },
        ]
      );
    },
    staleTime: 60000,
  });

  const { data: teams = [] } = useQuery({
    queryKey: ["/api/football/teams", selectedLeague.id],
    queryFn: async () => {
      const data = await fetchFromFootballAPI(`/competitions/${selectedLeague.id}/teams`);
      return (
        data?.teams || [
          { id: 1, name: "Real Madrid CF", shortName: "RMA", crest: "https://crests.football-data.org/86.png" },
          { id: 2, name: "FC Barcelona", shortName: "BAR", crest: "https://crests.football-data.org/81.png" },
          { id: 3, name: "Atlético de Madrid", shortName: "ATM", crest: "https://crests.football-data.org/78.png" },
          { id: 4, name: "Athletic Club", shortName: "ATH", crest: "https://crests.football-data.org/77.png" },
          { id: 5, name: "Real Betis", shortName: "BET", crest: "https://crests.football-data.org/90.png" },
          { id: 6, name: "Real Sociedad", shortName: "RSO", crest: "https://crests.football-data.org/92.png" },
        ]
      );
    },
    staleTime: 60000,
  });

  // Shoot penalty logic
  const handleShoot = (zoneIndex) => {
    if (penaltyShotsLeft <= 0 || isShooting) return;
    setIsShooting(true);

    const randomDive = Math.floor(Math.random() * 5);
    setKeeperDive(randomDive);

    setTimeout(() => {
      if (randomDive !== zoneIndex) {
        const pts = 25 + penaltyStreak * 5;
        setPenaltyGoals((g) => g + 1);
        setPenaltyStreak((s) => s + 1);
        setEarnedSp((sp) => sp + pts);
        setPenaltyFeedback(`¡GOOOOOOLAZO! +${pts} SpeedPoints`);
        toast({
          title: "⚽ ¡GOOOOL!",
          description: `Tiro certero al ángulo. Sumaste +${pts} SpeedPoints.`,
        });
      } else {
        setPenaltySaves((s) => s + 1);
        setPenaltyStreak(0);
        setPenaltyFeedback("¡ATAJADÓN! El arquero adivinó tu tiro");
        toast({
          title: "🧤 ¡Atajado!",
          description: "El arquero pixel se lanzó justo a tiempo.",
          variant: "destructive",
        });
      }

      setPenaltyShotsLeft((l) => l - 1);
      setIsShooting(false);
    }, 650);
  };

  const resetPenalties = () => {
    setPenaltyShotsLeft(5);
    setPenaltyGoals(0);
    setPenaltySaves(0);
    setPenaltyStreak(0);
    setPenaltyFeedback(null);
    setKeeperDive(null);
    setEarnedSp(0);
  };

  const handleSpinWheel = () => {
    if (wheelSpinning) return;
    setWheelSpinning(true);
    setWheelResult(null);

    const prizes = [
      "50 SpeedPoints",
      "Raro Balón de Oro Habbo",
      "100 SpeedPoints",
      "Placa Hincha de Oro",
      "Furni Trofeo Champions",
      "25 SpeedPoints",
    ];

    setTimeout(() => {
      const prize = prizes[Math.floor(Math.random() * prizes.length)];
      setWheelSpinning(false);
      setWheelResult(prize);
      toast({
        title: "🎁 ¡Premio Obtenido!",
        description: `Ganaste: ${prize}`,
      });
    }, 2000);
  };

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-6" data-testid="futbol-hub-root">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/20 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-black font-black text-2xl">
            ⚽
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white">HSpeed Fútbol Hub</h1>
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                Temporada 2026
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Centro de fútbol oficial, torneos comunitarios, pronósticos y minijuegos retro.
            </p>
          </div>
        </div>

        {/* Global Hub Navigation Submenu */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/10 text-xs font-bold">
          <Link
            href="/futbol-hub"
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
              !isPenales && !isSorteos && !isAventura && !isRanking && !isTorneos && !isPronosticos && !isEquipos
                ? "bg-emerald-500 text-black shadow-md font-black"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            )}
          >
            <Trophy className="w-3.5 h-3.5" /> General
          </Link>
          <Link
            href="/futbol-hub/pronosticos"
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
              isPronosticos
                ? "bg-emerald-500 text-black shadow-md font-black"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            )}
          >
            <Target className="w-3.5 h-3.5" /> Pronósticos
          </Link>
          <Link
            href="/futbol-hub/ranking"
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
              isRanking
                ? "bg-emerald-500 text-black shadow-md font-black"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            )}
          >
            <Star className="w-3.5 h-3.5" /> Ranking
          </Link>
          <Link
            href="/futbol-hub/equipos"
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
              isEquipos
                ? "bg-emerald-500 text-black shadow-md font-black"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            )}
          >
            <Users className="w-3.5 h-3.5" /> Equipos
          </Link>
          <Link
            href="/futbol-hub/aventura"
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
              isAventura
                ? "bg-emerald-500 text-black shadow-md font-black"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            )}
          >
            <Compass className="w-3.5 h-3.5" /> Aventura
          </Link>
          <Link
            href="/futbol-hub/mini/rapido"
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
              isPenales
                ? "bg-emerald-500 text-black shadow-md font-black"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            )}
          >
            <Gamepad2 className="w-3.5 h-3.5" /> Penales
          </Link>
          <Link
            href="/futbol-hub/mini/sorteos"
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
              isSorteos
                ? "bg-emerald-500 text-black shadow-md font-black"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            )}
          >
            <Gift className="w-3.5 h-3.5" /> Sorteos
          </Link>
          <Link
            href="/futbol-hub/torneos"
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
              isTorneos
                ? "bg-emerald-500 text-black shadow-md font-black"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            )}
          >
            <Medal className="w-3.5 h-3.5" /> Torneos
          </Link>
        </div>
      </div>

      {/* 1. SUBVIEW: JUEGO DE PENALES RAPIDO */}
      {isPenales && (
        <div className="space-y-6 animate-fade-in" data-testid="view-penales">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Penalty Goal Area */}
            <div className="lg:col-span-2 bg-[#0c1424] border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[460px]">
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(16,185,129,0.06)_1px,transparent_1px),linear-gradient(to_right,rgba(16,185,129,0.06)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

              {/* Goal Crossbar & Net */}
              <div className="relative w-full max-w-xl mx-auto h-64 border-t-8 border-x-8 border-white/80 rounded-t-xl bg-gradient-to-b from-emerald-950/40 to-emerald-900/10 shadow-[0_0_30px_rgba(16,185,129,0.15)] flex items-center justify-center p-4">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

                {/* Animated Frank the Bot Goalkeeper */}
                <div
                  className={cn(
                    "absolute transition-all duration-500 z-10 flex flex-col items-center",
                    keeperDive === 0
                      ? "top-6 left-12 -rotate-12 scale-105"
                      : keeperDive === 1
                      ? "top-6 right-12 rotate-12 scale-105"
                      : keeperDive === 2
                      ? "top-14 scale-110"
                      : keeperDive === 3
                      ? "bottom-4 left-16 -rotate-45 scale-95"
                      : keeperDive === 4
                      ? "bottom-4 right-16 rotate-45 scale-95"
                      : "bottom-6"
                  )}
                >
                  <img
                    src="https://www.habbo.es/habbo-imaging/avatarimage?user=Frank&action=std&direction=2&head_direction=2&gesture=sml&size=l"
                    alt="Portero Frank"
                    className="w-24 h-32 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]"
                  />
                  <span className="text-[9px] font-black bg-emerald-500 text-black px-2 py-0.5 rounded-full mt-1 shadow">
                    Frank Portero
                  </span>
                </div>

                {/* 5 Target Zones */}
                {penaltyShotsLeft > 0 ? (
                  <div className="absolute inset-4 grid grid-cols-3 grid-rows-2 gap-3 z-20">
                    <button
                      onClick={() => handleShoot(0)}
                      disabled={isShooting}
                      className="border-2 border-dashed border-emerald-400/40 hover:border-emerald-300 hover:bg-emerald-400/20 rounded-xl flex items-center justify-center transition-all group cursor-pointer"
                    >
                      <span className="text-xs font-bold text-emerald-300 group-hover:scale-110 transition-transform">
                        🎯 Escuadra Izq
                      </span>
                    </button>
                    <button
                      onClick={() => handleShoot(2)}
                      disabled={isShooting}
                      className="col-span-1 row-span-2 border-2 border-dashed border-emerald-400/40 hover:border-emerald-300 hover:bg-emerald-400/20 rounded-xl flex items-center justify-center transition-all group cursor-pointer"
                    >
                      <span className="text-xs font-bold text-emerald-300 group-hover:scale-110 transition-transform">
                        🎯 Centro
                      </span>
                    </button>
                    <button
                      onClick={() => handleShoot(1)}
                      disabled={isShooting}
                      className="border-2 border-dashed border-emerald-400/40 hover:border-emerald-300 hover:bg-emerald-400/20 rounded-xl flex items-center justify-center transition-all group cursor-pointer"
                    >
                      <span className="text-xs font-bold text-emerald-300 group-hover:scale-110 transition-transform">
                        🎯 Escuadra Der
                      </span>
                    </button>
                    <button
                      onClick={() => handleShoot(3)}
                      disabled={isShooting}
                      className="border-2 border-dashed border-emerald-400/40 hover:border-emerald-300 hover:bg-emerald-400/20 rounded-xl flex items-center justify-center transition-all group cursor-pointer"
                    >
                      <span className="text-xs font-bold text-emerald-300 group-hover:scale-110 transition-transform">
                        🎯 Raso Izq
                      </span>
                    </button>
                    <button
                      onClick={() => handleShoot(4)}
                      disabled={isShooting}
                      className="border-2 border-dashed border-emerald-400/40 hover:border-emerald-300 hover:bg-emerald-400/20 rounded-xl flex items-center justify-center transition-all group cursor-pointer"
                    >
                      <span className="text-xs font-bold text-emerald-300 group-hover:scale-110 transition-transform">
                        🎯 Raso Der
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-30 p-6 text-center space-y-3 rounded-t-xl">
                    <Trophy className="w-12 h-12 text-yellow-400 animate-bounce" />
                    <h3 className="text-2xl font-black text-white">¡Tanda de Penales Finalizada!</h3>
                    <p className="text-xs text-slate-300 max-w-sm">
                      Anotaste <span className="text-emerald-400 font-bold">{penaltyGoals} goles</span> y
                      ganaste <span className="text-yellow-400 font-bold">+{earnedSp} SpeedPoints</span>.
                    </p>
                    <Button onClick={resetPenalties} className="bg-emerald-500 hover:bg-emerald-400 text-black font-black mt-2">
                      Jugar Otra Tanda
                    </Button>
                  </div>
                )}
              </div>

              {/* Penalty Spot & Ball */}
              <div className="relative flex flex-col items-center mt-6 z-10">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.4)] text-2xl font-black animate-pulse cursor-pointer">
                  ⚽
                </div>
                <p className="text-xs font-bold text-slate-300 mt-2">
                  {penaltyShotsLeft > 0
                    ? isShooting
                      ? "Disparando..."
                      : "¡Elige una zona del arco para disparar!"
                    : "Tanda concluida"}
                </p>
                {penaltyFeedback && (
                  <p
                    className={cn(
                      "text-xs font-black px-3 py-1 rounded-full mt-2 animate-bounce",
                      penaltyFeedback.includes("GOOOL")
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    )}
                  >
                    {penaltyFeedback}
                  </p>
                )}
              </div>
            </div>

            {/* Scoreboard & Rules Panel */}
            <div className="space-y-4">
              <Card className="bg-[#0c1424] border-emerald-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-extrabold flex items-center justify-between text-white">
                    <span>Marcador de Penales</span>
                    <Badge className="bg-emerald-500 text-black font-black text-[10px]">Tanda Rápida</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Tiros Restantes</p>
                      <p className="text-2xl font-black text-cyan-400">{penaltyShotsLeft} / 5</p>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Goles</p>
                      <p className="text-2xl font-black text-emerald-400">{penaltyGoals}</p>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Paradas</p>
                      <p className="text-2xl font-black text-red-400">{penaltySaves}</p>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Racha Actual</p>
                      <p className="text-2xl font-black text-yellow-400 flex items-center justify-center gap-1">
                        <Flame className="w-4 h-4 text-amber-400" /> {penaltyStreak}
                      </p>
                    </div>
                  </div>

                  <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-emerald-300 uppercase">Puntos Acumulados</p>
                      <p className="text-lg font-black text-white">+{earnedSp} SpeedPoints</p>
                    </div>
                    <Zap className="w-7 h-7 text-yellow-400" />
                  </div>

                  <Button
                    variant="outline"
                    onClick={resetPenalties}
                    className="w-full border-white/10 hover:bg-white/10 text-xs font-bold"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Reiniciar Tanda
                  </Button>
                </CardContent>
              </Card>

              {/* Instructions */}
              <Card className="bg-[#0c1424] border-emerald-500/20">
                <CardContent className="p-4 text-xs text-slate-300 space-y-2">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-400" /> Cómo Jugar y Ganar:
                  </p>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-400 text-[11px]">
                    <li>Cada gol exitoso otorga 25 SpeedPoints a tu cuenta.</li>
                    <li>Las rachas consecutivas multiplican los puntos ganados.</li>
                    <li>El arquero Frank aprende tus patrones: ¡varía tus tiros!</li>
                    <li>Completa tandas perfectas (5 de 5) para ganar la placa exclusiva "Goleador de Oro".</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* 2. SUBVIEW: SORTEOS ESPECIALES */}
      {isSorteos && (
        <div className="space-y-6 animate-fade-in" data-testid="view-sorteos">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Roulette card */}
            <Card className="bg-[#0c1424] border-emerald-500/20 text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 mx-auto flex items-center justify-center text-3xl shadow-lg shadow-yellow-500/20">
                🎁
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Ruleta de la Suerte Futbolera</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Gira la ruleta diaria para ganar SpeedPoints, furnis y placas oficiales.
                </p>
              </div>

              {wheelResult && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl animate-bounce">
                  <p className="text-xs font-bold text-yellow-300 uppercase">¡Premio Concedido!</p>
                  <p className="text-lg font-black text-white mt-0.5">{wheelResult}</p>
                </div>
              )}

              <Button
                onClick={handleSpinWheel}
                disabled={wheelSpinning}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black py-6 text-sm shadow-xl cursor-pointer"
              >
                {wheelSpinning ? (
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-5 h-5 mr-2" />
                )}
                {wheelSpinning ? "Girando Ruleta..." : "Girar Ruleta Gratis (1 Tirada)"}
              </Button>
            </Card>

            {/* Recent Winners */}
            <Card className="bg-[#0c1424] border-emerald-500/20 p-6 space-y-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" /> Últimos Ganadores de Sorteos
              </h3>
              <div className="space-y-2.5 text-xs">
                {[
                  { name: "DinhoLOL", prize: "Raro Balón de Oro 2026", time: "Hace 10 min" },
                  { name: "HabboGamer99", prize: "150 SpeedPoints", time: "Hace 35 min" },
                  { name: "PixelMaster", prize: "Placa Hincha de Oro", time: "Hace 1 hora" },
                  { name: "SpeedFan", prize: "Trofeo de Campeón Habbo", time: "Hace 2 horas" },
                ].map((w, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-white/5"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${w.name}&size=s&headonly=1`}
                        alt={w.name}
                        className="w-7 h-7 rounded-full bg-slate-800"
                      />
                      <div>
                        <p className="font-bold text-white">{w.name}</p>
                        <p className="text-[10px] text-emerald-400 font-medium">{w.prize}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500">{w.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* 3. SUBVIEW: AVENTURA FUTBOLISTICA */}
      {isAventura && (
        <div className="space-y-6 animate-fade-in" data-testid="view-aventura">
          <Card className="bg-[#0c1424] border-emerald-500/20 p-6">
            <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" /> Modo Historia — Carrera Futbolística
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Supera cada fase del torneo para desbloquear títulos de perfil, placas y recompensas de SpeedPoints.
            </p>

            <div className="space-y-4">
              {[
                { stage: 1, title: "Pruebas en la Academia Habbo", desc: "Anota 3 penales en el modo rápido", reward: "50 SP + Placa Novato", status: "completed" },
                { stage: 2, title: "El Torneo de Barrio Pixel", desc: "Realiza 2 pronósticos certeros en partidos reales", reward: "100 SP + Placa Goleador", status: "current" },
                { stage: 3, title: "El Gran Clásico del Hotel", desc: "Gana un partido en la liga comunitaria", reward: "200 SP + Camiseta HSpeed", status: "locked" },
                { stage: 4, title: "Copa Internacional de Fansites", desc: "Llega al top 5 del ranking mensual", reward: "350 SP + Furni Trofeo", status: "locked" },
                { stage: 5, title: "La Gran Final Mundialista", desc: "Conquista el título de Campeón HSpeed", reward: "500 SP + Rango VIP 30 Días", status: "locked" },
              ].map((lvl) => (
                <div
                  key={lvl.stage}
                  className={cn(
                    "p-4 rounded-xl border flex items-center justify-between gap-4 transition-all",
                    lvl.status === "completed"
                      ? "bg-emerald-950/20 border-emerald-500/30"
                      : lvl.status === "current"
                      ? "bg-cyan-950/30 border-cyan-400 shadow-lg shadow-cyan-500/10"
                      : "bg-slate-900/40 border-white/5 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm",
                        lvl.status === "completed"
                          ? "bg-emerald-500 text-black"
                          : lvl.status === "current"
                          ? "bg-cyan-400 text-black animate-pulse"
                          : "bg-slate-800 text-slate-500"
                      )}
                    >
                      {lvl.status === "completed" ? <CheckCircle2 className="w-5 h-5" /> : lvl.status === "current" ? lvl.stage : <Lock className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{lvl.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{lvl.desc}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="border-white/10 text-emerald-400 text-[10px]">
                      {lvl.reward}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* 4. SUBVIEW: RANKING DE EXPERTOS */}
      {isRanking && (
        <div className="space-y-6 animate-fade-in" data-testid="view-ranking">
          <Card className="bg-[#0c1424] border-emerald-500/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" /> Ranking Oficial de Pronosticadores
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Los usuarios más acertados de la temporada reciben premios en furnis raros a fin de mes.
                </p>
              </div>
              <Badge className="bg-yellow-500 text-black font-black text-xs">Top 10 Mensual</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] text-slate-400 border-b border-white/10">
                    <th className="p-3 w-12">#</th>
                    <th className="p-3">Usuario</th>
                    <th className="p-3 text-center">Aciertos</th>
                    <th className="p-3 text-center">Efectividad</th>
                    <th className="p-3 text-right">Puntos SP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { pos: 1, name: "DinhoLOL", hits: "42 / 48", eff: "87.5%", pts: 1250, badge: "🥇 Oro" },
                    { pos: 2, name: "FrankAdmin", hits: "39 / 48", eff: "81.2%", pts: 980, badge: "🥈 Plata" },
                    { pos: 3, name: "HabboGamer99", hits: "36 / 48", eff: "75.0%", pts: 820, badge: "🥉 Bronce" },
                    { pos: 4, name: "Goleador2026", hits: "33 / 48", eff: "68.7%", pts: 690, badge: "⭐ Top" },
                    { pos: 5, name: "PixelStriker", hits: "30 / 48", eff: "62.5%", pts: 540, badge: "⭐ Top" },
                  ].map((r) => (
                    <tr key={r.pos} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-black text-emerald-400">{r.pos}</td>
                      <td className="p-3 flex items-center gap-3">
                        <img
                          src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${r.name}&size=s&headonly=1`}
                          alt={r.name}
                          className="w-7 h-7 rounded-full bg-slate-800"
                        />
                        <div>
                          <p className="font-bold text-white">{r.name}</p>
                          <span className="text-[10px] text-yellow-400">{r.badge}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center font-semibold text-slate-300">{r.hits}</td>
                      <td className="p-3 text-center font-bold text-emerald-400">{r.eff}</td>
                      <td className="p-3 text-right font-black text-cyan-400">{r.pts} SP</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* 5. SUBVIEW: TORNEOS HSPEED */}
      {isTorneos && (
        <div className="space-y-6 animate-fade-in" data-testid="view-torneos">
          <Card className="bg-[#0c1424] border-emerald-500/20 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Medal className="w-5 h-5 text-amber-400" /> Copa HSpeed 2026 — Bracket Oficial
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Eliminatorias directas comunitarias disputadas en salas temáticas del hotel.
                </p>
              </div>
              <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs">
                Inscribir Mi Equipo
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-white/10 space-y-3">
                <Badge className="bg-slate-800 text-slate-300 text-[10px]">Cuartos de Final</Badge>
                <div className="space-y-2">
                  <div className="bg-black/40 p-2.5 rounded-lg border border-white/5 flex justify-between items-center text-xs">
                    <span className="font-bold text-white">Team Noir</span>
                    <span className="font-black text-emerald-400">3</span>
                  </div>
                  <div className="bg-black/40 p-2.5 rounded-lg border border-white/5 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Pixel Warriors</span>
                    <span className="text-slate-500">1</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-white/10 space-y-3">
                <Badge className="bg-cyan-500/20 text-cyan-300 text-[10px]">Semifinal</Badge>
                <div className="space-y-2">
                  <div className="bg-black/40 p-2.5 rounded-lg border border-white/5 flex justify-between items-center text-xs">
                    <span className="font-bold text-white">Team Noir</span>
                    <span className="text-cyan-400 font-bold">Próximo</span>
                  </div>
                  <div className="bg-black/40 p-2.5 rounded-lg border border-white/5 flex justify-between items-center text-xs">
                    <span className="font-bold text-white">Speed Strikers</span>
                    <span className="text-cyan-400 font-bold">Próximo</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-amber-500/30 space-y-3">
                <Badge className="bg-amber-500 text-black font-black text-[10px]">Gran Final</Badge>
                <div className="bg-black/40 p-4 rounded-lg border border-white/5 text-center text-xs text-slate-400">
                  <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                  Por disputarse el 28 de Septiembre
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 6. DEFAULT / GENERAL HUB (Partidos, Tabla, Pronósticos, Equipos) */}
      {!isPenales && !isSorteos && !isAventura && !isRanking && !isTorneos && (
        <div className="space-y-6 animate-fade-in" data-testid="view-general">
          {/* League Picker Card */}
          <Card className="bg-gradient-to-r from-emerald-950/40 to-slate-900 border-emerald-500/20">
            <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedLeague.flag}</span>
                <div>
                  <h2 className="font-bold text-lg text-white">{selectedLeague.name}</h2>
                  <p className="text-xs text-slate-400">
                    {selectedLeague.country} · {selectedLeague.season}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Select
                  value={selectedLeague.id}
                  onValueChange={(v) =>
                    setSelectedLeague(LEAGUES.find((l) => l.id === v) || LEAGUES[0])
                  }
                >
                  <SelectTrigger className="w-52 bg-slate-900/80 border-white/10 text-xs font-bold text-white">
                    <SelectValue placeholder="Seleccionar liga" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    {LEAGUES.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        <span className="flex items-center gap-2">
                          <span>{l.flag}</span>
                          <span>{l.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Date Picker for Matches */}
          {activeTab === "partidos" && (
            <Card className="bg-[#0c1424] border-white/10">
              <CardContent className="p-4 flex flex-wrap items-center gap-4">
                <label className="text-xs font-bold text-slate-400">Fecha de Encuentros:</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-44 bg-slate-900 border-white/10 text-xs text-white"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
                  className="border-white/10 hover:bg-white/10 text-xs font-bold"
                >
                  <RefreshCw className="w-3 h-3 mr-1.5" /> Hoy
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 bg-slate-900/80 border border-white/10 p-1 rounded-xl">
              <TabsTrigger value="partidos" className="text-xs font-bold data-[state=active]:bg-emerald-500 data-[state=active]:text-black">
                <Calendar className="w-3.5 h-3.5 mr-1.5" /> Partidos
              </TabsTrigger>
              <TabsTrigger value="tabla" className="text-xs font-bold data-[state=active]:bg-emerald-500 data-[state=active]:text-black">
                <Trophy className="w-3.5 h-3.5 mr-1.5" /> Tabla
              </TabsTrigger>
              <TabsTrigger value="equipos" className="text-xs font-bold data-[state=active]:bg-emerald-500 data-[state=active]:text-black">
                <Users className="w-3.5 h-3.5 mr-1.5" /> Equipos
              </TabsTrigger>
              <TabsTrigger value="pronosticos" className="text-xs font-bold data-[state=active]:bg-emerald-500 data-[state=active]:text-black">
                <Target className="w-3.5 h-3.5 mr-1.5" /> Pronósticos
              </TabsTrigger>
            </TabsList>

            {/* Matches */}
            <TabsContent value="partidos" className="space-y-3">
              {loadingMatches ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="h-28 bg-slate-900/60 animate-pulse border-white/5" />
                  ))}
                </div>
              ) : (
                matches.map((match) => {
                  const status = getMatchStatus(match.status);
                  return (
                    <Card
                      key={match.id}
                      className="bg-[#0c1424] border-white/10 hover:border-emerald-500/30 transition-all p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={`${status.color} text-[9px] font-bold`}>
                          {status.label}
                        </Badge>
                        <span className="text-[10px] text-slate-400">
                          Jornada {match.matchday} · {formatDate(match.utcDate)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white w-2/5 truncate text-right">
                          {match.homeTeam.name}
                        </span>
                        <div className="px-3 py-1 bg-black/40 rounded-lg border border-white/5 font-black text-sm text-emerald-400">
                          {match.score?.fullTime?.home !== null
                            ? `${match.score.fullTime.home} - ${match.score.fullTime.away}`
                            : "VS"}
                        </div>
                        <span className="text-sm font-bold text-white w-2/5 truncate text-left">
                          {match.awayTeam.name}
                        </span>
                      </div>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            {/* Standings */}
            <TabsContent value="tabla" className="space-y-4">
              <Card className="bg-[#0c1424] border-white/10 p-4 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-slate-400 border-b border-white/10 pb-2">
                      <th className="p-2 w-8">#</th>
                      <th className="p-2">Club</th>
                      <th className="p-2 text-center">PJ</th>
                      <th className="p-2 text-center">G</th>
                      <th className="p-2 text-center">E</th>
                      <th className="p-2 text-center">P</th>
                      <th className="p-2 text-center">DG</th>
                      <th className="p-2 text-right font-bold text-emerald-400">PTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {standings.map((s) => (
                      <tr key={s.position} className="hover:bg-white/5 transition-colors">
                        <td className="p-2 font-black text-slate-400">{s.position}</td>
                        <td className="p-2 font-bold text-white flex items-center gap-2">
                          <img src={s.team.crest} alt={s.team.name} className="w-5 h-5 object-contain" />
                          <span>{s.team.name}</span>
                        </td>
                        <td className="p-2 text-center text-slate-300">{s.playedGames}</td>
                        <td className="p-2 text-center text-emerald-400">{s.won}</td>
                        <td className="p-2 text-center text-yellow-400">{s.draw}</td>
                        <td className="p-2 text-center text-red-400">{s.lost}</td>
                        <td className="p-2 text-center text-slate-300">{s.goalDifference}</td>
                        <td className="p-2 text-right font-black text-emerald-400">{s.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </TabsContent>

            {/* Teams */}
            <TabsContent value="equipos" className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {teams.map((t) => (
                  <Card key={t.id} className="bg-[#0c1424] border-white/10 p-4 text-center hover:border-emerald-500/30 transition-all">
                    <img src={t.crest} alt={t.name} className="w-12 h-12 mx-auto object-contain mb-2" />
                    <p className="font-bold text-xs text-white truncate">{t.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{t.shortName}</p>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Predictions */}
            <TabsContent value="pronosticos" className="space-y-4">
              <Card className="bg-[#0c1424] border-white/10 p-6 space-y-4">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" /> Quiniela de la Semana
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Pronostica los marcadores y recibe SpeedPoints por acierto exacto o resultado general.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 1, home: "Real Madrid", away: "FC Barcelona", date: "Domingo 20:00" },
                    { id: 2, home: "Manchester City", away: "Liverpool FC", date: "Sábado 17:30" },
                    { id: 3, home: "América", away: "Chivas Guadalajara", date: "Domingo 22:00" },
                  ].map((p) => (
                    <div key={p.id} className="p-3 bg-slate-900/60 rounded-xl border border-white/5 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs text-slate-400 w-28">{p.date}</span>
                      <div className="flex items-center gap-2 flex-1 justify-center">
                        <span className="text-xs font-bold text-white w-32 text-right truncate">{p.home}</span>
                        <Input type="number" min={0} max={9} placeholder="0" className="w-12 h-8 text-center bg-black/40 border-white/10 text-xs text-white" />
                        <span className="text-xs font-bold text-slate-400">-</span>
                        <Input type="number" min={0} max={9} placeholder="0" className="w-12 h-8 text-center bg-black/40 border-white/10 text-xs text-white" />
                        <span className="text-xs font-bold text-white w-32 text-left truncate">{p.away}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => toast({ title: "¡Pronósticos Guardados!", description: "Registraste tus predicciones para la jornada." })}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs cursor-pointer"
                >
                  Confirmar y Enviar Pronósticos
                </Button>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
