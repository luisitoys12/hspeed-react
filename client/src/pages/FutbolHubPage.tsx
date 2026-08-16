import { useMemo, useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Trophy,
  Calendar,
  Target,
  TrendingUp,
  Users,
  ChevronLeft,
  ChevronRight,
  Play,
  Clock,
  Shield,
  Star,
  Flag,
  RefreshCw,
  Activity,
  Award,
  Zap,
} from "lucide-react";
import { proxyImage } from "@/lib/habboProxy";
import { useQuery } from "@tanstack/react-query";

const LEAGUES = [
  {
    id: "PL",
    name: "Premier League",
    country: "England",
    logo: "https://crests.football-data.org/PL.png",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    season: "2024/2025",
  },
  {
    id: "PD",
    name: "La Liga",
    country: "Spain",
    logo: "https://crests.football-data.org/PD.png",
    flag: "🇪🇸",
    season: "2024/2025",
  },
  {
    id: "MX1",
    name: "Liga MX",
    country: "Mexico",
    logo: "https://crests.football-data.org/MX1.png",
    flag: "🇲🇽",
    season: "Apertura 2024",
  },
  {
    id: "MX2",
    name: "Liga de Expansión MX",
    country: "Mexico",
    logo: "https://crests.football-data.org/MX2.png",
    flag: "🇲🇽",
    season: "Apertura 2024",
  },
];

const FOOTBALL_API_BASE = "https://api.football-data.org/v4";
const FOOTBALL_API_KEY = "YOUR_API_KEY_HERE";

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
  } catch (error) {
    console.error("Football API error:", error);
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

function getMatchStatus(status: string): {
  label: string;
  color: string;
  icon: any;
} {
  switch (status) {
    case "FINISHED":
      return {
        label: "Finalizado",
        color: "bg-green-500/20 text-green-400",
        icon: "✓",
      };
    case "LIVE":
    case "IN_PLAY":
    case "PAUSED":
      return {
        label: "EN VIVO",
        color: "bg-red-500/20 text-red-400 animate-pulse",
        icon: "LIVE",
      };
    case "SCHEDULED":
    case "TIMED":
      return {
        label: "Programado",
        color: "bg-blue-500/20 text-blue-400",
        icon: "🕐",
      };
    case "POSTPONED":
      return {
        label: "Aplazado",
        color: "bg-yellow-500/20 text-yellow-400",
        icon: "⏸",
      };
    case "CANCELLED":
      return {
        label: "Cancelado",
        color: "bg-gray-500/20 text-gray-400",
        icon: "✗",
      };
    default:
      return {
        label: status,
        color: "bg-gray-500/20 text-gray-400",
        icon: "?",
      };
  }
}

export default function FutbolHubPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [selectedLeague, setSelectedLeague] = useState<(typeof LEAGUES)[0]>(
    LEAGUES[0],
  );
  const [activeTab, setActiveTab] = useState<
    "partidos" | "tabla" | "equipos" | "pronosticos"
  >("partidos");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [userPredictions, setUserPredictions] = useState<
    Record<string, { home: number; away: number }>
  >({});

  const { data: matches, isLoading: loadingMatches } = useQuery({
    queryKey: ["/api/football/matches", selectedLeague.id, selectedDate],
    queryFn: async () => {
      const data = await fetchFromFootballAPI(
        `/competitions/${selectedLeague.id}/matches?dateFrom=${selectedDate}&dateTo=${selectedDate}`,
      );
      return data?.matches || [];
    },
    enabled: !!selectedLeague.id && !!selectedDate,
  });

  const { data: standings, isLoading: loadingStandings } = useQuery({
    queryKey: ["/api/football/standings", selectedLeague.id],
    queryFn: async () => {
      const data = await fetchFromFootballAPI(
        `/competitions/${selectedLeague.id}/standings`,
      );
      return data?.standings?.[0]?.table || [];
    },
    enabled: !!selectedLeague.id,
  });

  const { data: teams, isLoading: loadingTeams } = useQuery({
    queryKey: ["/api/football/teams", selectedLeague.id],
    queryFn: async () => {
      const data = await fetchFromFootballAPI(
        `/competitions/${selectedLeague.id}/teams`,
      );
      return data?.teams || [];
    },
    enabled: !!selectedLeague.id,
  });

  const handleMatchClick = (match: any) => {
    // Could open match details modal
  };

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-xl">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Fútbol Hub</h1>
          <p className="text-xs text-muted-foreground">
            Premier League · La Liga · Liga MX · Liga Expansión MX
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Select
            value={selectedLeague.id}
            onValueChange={(v) =>
              setSelectedLeague(LEAGUES.find((l) => l.id === v) || LEAGUES[0])
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Seleccionar liga" />
            </SelectTrigger>
            <SelectContent>
              {LEAGUES.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  <span className="flex items-center gap-2">
                    <span>{l.flag}</span>
                    <img src={l.logo} alt={l.name} className="w-5 h-5" />
                    <span>{l.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* League Info */}
      <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedLeague.flag}</span>
              <div>
                <h2 className="font-bold text-lg">{selectedLeague.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {selectedLeague.country} · {selectedLeague.season}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
              Datos en vivo
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Date Picker for Matches */}
      {activeTab === "partidos" && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm text-muted-foreground">Fecha:</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-48"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSelectedDate(new Date().toISOString().split("T")[0])
                }
              >
                <RefreshCw className="w-3 h-3 mr-1" /> Hoy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(
            value as "partidos" | "tabla" | "equipos" | "pronosticos",
          )
        }
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="partidos">
            <Calendar className="w-4 h-4 mr-1" /> Partidos
          </TabsTrigger>
          <TabsTrigger value="tabla">
            <Trophy className="w-4 h-4 mr-1" /> Tabla
          </TabsTrigger>
          <TabsTrigger value="equipos">
            <Users className="w-4 h-4 mr-1" /> Equipos
          </TabsTrigger>
          <TabsTrigger value="pronosticos">
            <Target className="w-4 h-4 mr-1" /> Pronósticos
          </TabsTrigger>
        </TabsList>

        {/* Matches Tab */}
        <TabsContent value="partidos" className="space-y-4">
          {loadingMatches ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="h-40">
                  <div className="animate-pulse h-full w-full bg-muted" />
                </Card>
              ))}
            </div>
          ) : matches?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p>No hay partidos para esta fecha</p>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((match: any) => {
                const status = getMatchStatus(match.status);
                const isLive =
                  match.status === "LIVE" || match.status === "IN_PLAY";

                return (
                  <Card
                    key={match.id}
                    className={`relative overflow-hidden transition-all hover:shadow-xl ${
                      isLive
                        ? "border-red-500/30 bg-red-500/5 animate-pulse"
                        : ""
                    }`}
                  >
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge
                          variant="secondary"
                          className={`${status.color} text-[9px]`}
                        >
                          {typeof status.icon === "string" ? (
                            status.icon
                          ) : (
                            <status.icon className="w-3 h-3 mr-1" />
                          )}
                          {status.label}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          Jornada {match.matchday} · {formatDate(match.utcDate)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-right w-1/2">
                          <span className="text-sm font-medium w-24 text-right truncate">
                            {match.homeTeam.name}
                          </span>
                          {match.status === "LIVE" &&
                            match.score.fullTime.home !== null && (
                              <span className="font-bold text-lg text-red-400">
                                {match.score.fullTime.home}
                              </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 w-16 text-center">
                          {isLive ? (
                            <Badge
                              variant="default"
                              className="bg-red-500 text-red-500/10"
                            >
                              <Play className="w-3 h-3 mr-1" /> EN VIVO
                            </Badge>
                          ) : match.status === "FINISHED" ? (
                            <span className="font-bold text-lg">
                              {match.score.fullTime.home} -{" "}
                              {match.score.fullTime.away}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">VS</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 w-1/2">
                          {match.status === "LIVE" &&
                            match.score.fullTime.away !== null && (
                              <span className="font-bold text-lg text-red-400">
                                {match.score.fullTime.away}
                              </span>
                            )}
                          <span className="text-sm font-medium truncate w-1/3">
                            {match.awayTeam.name}
                          </span>
                        </div>
                      </div>
                      {match.status === "FINISHED" && (
                        <div className="mt-2 text-[10px] text-muted-foreground">
                          HT: {match.score.halfTime.home} -{" "}
                          {match.score.halfTime.away}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Standings Tab */}
        <TabsContent value="tabla" className="space-y-4">
          {loadingStandings ? (
            <div className="animate-pulse h-64" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] text-muted-foreground border-b border-border">
                    <th className="p-2 w-8">#</th>
                    <th className="p-2 w-8"></th>
                    <th className="p-2">Equipo</th>
                    <th className="p-2 w-16">PJ</th>
                    <th className="p-2 w-16">G</th>
                    <th className="p-2 w-16">E</th>
                    <th className="p-2 w-16">P</th>
                    <th className="p-2 w-16">GF</th>
                    <th className="p-2 w-16">GC</th>
                    <th className="p-2 w-16">DG</th>
                    <th className="p-2 w-20 font-bold">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((standing: any) => (
                    <tr
                      key={standing.team.id}
                      className="border-b border-border/50 hover:bg-card"
                    >
                      <td className="p-2 font-bold text-xs">
                        {standing.position}
                      </td>
                      <td className="p-2">
                        <img
                          src={standing.team.crest}
                          alt={standing.team.name}
                          className="w-5 h-5"
                        />
                      </td>
                      <td className="p-2 font-medium text-sm truncate max-w-[150px]">
                        {standing.team.name}
                      </td>
                      <td className="p-2 text-center text-xs">
                        {standing.playedGames}
                      </td>
                      <td className="p-2 text-center text-xs text-green-400">
                        {standing.won}
                      </td>
                      <td className="p-2 text-center text-xs text-yellow-400">
                        {standing.draw}
                      </td>
                      <td className="p-2 text-center text-xs text-red-400">
                        {standing.lost}
                      </td>
                      <td className="p-2 text-center text-xs">
                        {standing.goalsFor}
                      </td>
                      <td className="p-2 text-center text-xs">
                        {standing.goalsAgainst}
                      </td>
                      <td className="p-2 text-center text-xs">
                        {standing.goalDifference > 0 ? "+" : ""}
                        {standing.goalDifference}
                      </td>
                      <td className="p-2 text-center font-bold text-sm">
                        {standing.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* Teams Tab */}
        <TabsContent value="equipos" className="space-y-4">
          {loadingTeams ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="h-48">
                  <div className="animate-pulse h-full w-full bg-muted" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {teams.map((team: any) => (
                <Card
                  key={team.id}
                  className="text-center p-3 hover:shadow-xl transition-shadow"
                >
                  <img
                    src={team.crest}
                    alt={team.name}
                    className="w-12 h-12 mx-auto mb-2 object-contain"
                  />
                  <p className="font-semibold text-sm truncate">{team.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {team.shortName}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="pronosticos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4" /> Tus Pronósticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Pronostica los resultados de los próximos partidos y gana
                SpeedPoints.
              </p>
              <div className="space-y-2">
                {matches
                  ?.slice(0, 5)
                  .filter((m: any) => m.status === "SCHEDULED")
                  .map((match: any) => (
                    <Card key={match.id} className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(match.utcDate)}
                        </span>
                        <Badge variant="secondary">Por jugar</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate w-1/3 text-right">
                          {match.homeTeam.name}
                        </span>
                        <Input
                          type="number"
                          min={0}
                          max={10}
                          className="w-12 text-center"
                          placeholder="0"
                        />
                        <span className="text-lg font-bold mx-2">-</span>
                        <Input
                          type="number"
                          min={0}
                          max={10}
                          className="w-12 text-center"
                          placeholder="0"
                        />
                        <span className="text-sm font medium truncate w-1/3">
                          {match.awayTeam.name}
                        </span>
                      </div>
                    </Card>
                  ))}
              </div>
              <Button className="w-full mt-4">
                <Target className="w-4 h-4 mr-2" /> Enviar Pronósticos
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
