import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const DEFAULT_SOURCES = [
  { id: "fifa", name: "FIFA", url: "https://www.fifa.com/", note: "Calendario, sede y anuncios oficiales" },
  { id: "uefa", name: "UEFA", url: "https://www.uefa.com/", note: "Cobertura europea y contexto competitivo" },
  { id: "marca", name: "Marca", url: "https://www.marca.com/futbol/", note: "Noticias, previas y análisis diario" },
];

const ESTAMPAS = [
  { id: "trofeo", name: "Copa Dorada 2026", rarity: "Legendario", image: "/habbo-radio/estampa_trofeo.png", cost: 25, badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  { id: "balon", name: "Balón Imperial", rarity: "Épico", image: "/habbo-radio/estampa_balon.png", cost: 15, badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  { id: "estadio", name: "Estadio Cyber", rarity: "Raro", image: "/habbo-radio/estampa_estadio.png", cost: 10, badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  { id: "botas", name: "Botas de Neón", rarity: "Común", image: "/habbo-radio/estampa_botas.png", cost: 5, badgeColor: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
];

const LOGROS = [
  { id: "penales", name: "Guante del Campeón", requirement: "Anotar 5 goles en la tanda de penales", image: "/habbo-radio/logro_penales.png", badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  { id: "votante", name: "Pronosticador Experto", requirement: "Enviar un pronóstico de partido", image: "/habbo-radio/logro_votante.png", badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  { id: "hincha", name: "Megáfono de Oro", requirement: "Completar una misión de aventura", image: "/habbo-radio/logro_hincha.png", badgeColor: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30" },
  { id: "chateador", name: "Hablador Píxel", requirement: "Interactuar en el chat o reclamar logro", image: "/habbo-radio/logro_chateador.png", badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  { id: "staff", name: "Placa Staff HSpeed", requirement: "Pertenecer al equipo oficial del fansite", image: "/habbo-radio/estampa_staff.png", badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  { id: "dj", name: "Audífonos Locutor", requirement: "Rango de DJ Locutor en la radio", image: "/habbo-radio/estampa_audifonos_dj.png", badgeColor: "bg-red-500/20 text-red-300 border-red-500/30" },
];

function getSection(pathname: string) {
  if (pathname.startsWith("/mundial/source/")) return "source";
  if (pathname.startsWith("/mundial/pronosticos")) return "forecast";
  if (pathname.startsWith("/mundial/ranking")) return "ranking";
  if (pathname.startsWith("/mundial/equipos")) return "teams";
  if (pathname.startsWith("/mundial/aventura")) return "adventure";
  if (pathname.startsWith("/mundial/mini/rapido")) return "mini-rapid";
  if (pathname.startsWith("/mundial/mini/sorteos")) return "mini-draw";
  return "home";
}

export default function MundialPage() {
  const [location] = useLocation();
  const section = getSection(location);
  const { user } = useAuth();
  const { toast } = useToast();

  // Estados de Colección
  const [albumTab, setAlbumTab] = useState<"tienda" | "logros">("tienda");
  const [claimedStamps, setClaimedStamps] = useState<string[]>([]);
  const [unlockedLogros, setUnlockedLogros] = useState<string[]>([]);

  const handleClaimStamp = (stamp: typeof ESTAMPAS[0]) => {
    if (claimedStamps.includes(stamp.id)) {
      toast({ title: "Estampa ya reclamada", description: "Ya tienes esta estampa en tu álbum." });
      return;
    }
    setClaimedStamps((prev) => [...prev, stamp.id]);
    toast({
      title: "¡Estampa Reclamada!",
      description: `Has canjeado "${stamp.name}" por ${stamp.cost} SpeedPoints.`,
    });
  };

  const handleClaimLogroManual = (logroId: string, name: string) => {
    if (unlockedLogros.includes(logroId)) {
      toast({ title: "Logro ya desbloqueado", description: "Ya tienes esta estampa de logro." });
      return;
    }
    setUnlockedLogros((prev) => [...prev, logroId]);
    toast({
      title: "¡Logro Desbloqueado!",
      description: `¡Felicidades! Conseguiste la estampa "${name}".`,
    });
  };

  // Estados de Pronósticos
  const [predictions, setPredictions] = useState<Record<string, { t1: string; t2: string }>>({
    m1: { t1: "", t2: "" },
    m2: { t1: "", t2: "" },
    m3: { t1: "", t2: "" },
  });
  const handleSavePrediction = (matchId: string, teamA: string, teamB: string) => {
    const pred = predictions[matchId];
    if (pred.t1 === "" || pred.t2 === "") {
      toast({ title: "Error", description: "Por favor rellena ambos marcadores.", variant: "destructive" });
      return;
    }
    toast({
      title: "Pronóstico Guardado",
      description: `Has guardado la predicción: ${teamA} ${pred.t1} - ${pred.t2} ${teamB}. ¡Mucha suerte!`,
    });
    // Desbloquea logro de votante
    setUnlockedLogros((prev) => prev.includes("votante") ? prev : [...prev, "votante"]);
  };

  // Estados de Equipos / Clanes
  const [selectedClan, setSelectedClan] = useState<string | null>(null);
  const handleJoinClan = (clanName: string) => {
    setSelectedClan(clanName);
    toast({ title: "¡Te has unido!", description: `Ahora representas al "${clanName}" en el hotel.` });
  };

  // Estados de Aventura
  const [adventureMissions, setAdventureMissions] = useState<Record<string, boolean>>({
    mis1: false,
    mis2: false,
    mis3: false,
  });
  const handleCompleteMission = (misId: string, title: string) => {
    setAdventureMissions((prev) => ({ ...prev, [misId]: true }));
    toast({ title: "¡Misión Completada!", description: `Has terminado la misión "${title}". ¡Ganaste 15 SpeedPoints!` });
    // Desbloquea logro de hincha
    setUnlockedLogros((prev) => prev.includes("hincha") ? prev : [...prev, "hincha"]);
  };

  // Estados del Mini Juego (Penales)
  const [penaltyState, setPenaltyState] = useState<{
    status: "idle" | "playing" | "result" | "over";
    lastResult: "scored" | "missed" | null;
    shotsRemaining: number;
    score: number;
  }>({
    status: "idle",
    lastResult: null,
    shotsRemaining: 5,
    score: 0,
  });

  const handleShoot = (direction: "izq" | "cen" | "der") => {
    if (penaltyState.shotsRemaining <= 0) return;
    
    const goalkeeperChoice = ["izq", "cen", "der"][Math.floor(Math.random() * 3)];
    const isGoal = direction !== goalkeeperChoice;

    setPenaltyState((prev) => {
      const newScore = isGoal ? prev.score + 1 : prev.score;
      const newShots = prev.shotsRemaining - 1;
      
      // Si llega a 5 goles, desbloquea logro de penales
      if (newScore >= 5) {
        setUnlockedLogros((unlocked) => unlocked.includes("penales") ? unlocked : [...unlocked, "penales"]);
      }

      return {
        status: newShots === 0 ? "over" : "result",
        lastResult: isGoal ? "scored" : "missed",
        shotsRemaining: newShots,
        score: newScore,
      };
    });
  };

  const handleResetPenaltyGame = () => {
    setPenaltyState({
      status: "playing",
      lastResult: null,
      shotsRemaining: 5,
      score: 0,
    });
  };

  // Estados de Sorteos
  const [ticketsCount, setTicketsCount] = useState(0);
  const handleBuyTicket = () => {
    setTicketsCount((prev) => prev + 1);
    toast({ title: "Boleto Comprado", description: "Has adquirido un boleto para el próximo gran sorteo de placas." });
  };

  // Titulos y copies de pestañas
  const activeTitle =
    section === "forecast"
      ? "Pronósticos Habbo"
      : section === "ranking"
        ? "Ranking Mundial"
        : section === "teams"
          ? "Equipos y clanes"
          : section === "adventure"
            ? "Aventura Mundial"
            : section === "mini-rapid"
              ? "Tanda de Penales"
              : section === "mini-draw"
                ? "Sorteos y premios"
                : section === "source"
                  ? "Fuente seleccionada"
                  : "Mundial 2026";

  const activeCopy =
    section === "forecast"
      ? "Apuesta tus predicciones de partidos y gana SpeedPoints por tus aciertos exactos."
      : section === "ranking"
        ? "Sube en la tabla comunitaria con tus aciertos en pronósticos y obtén recompensas exclusivas."
        : section === "teams"
          ? "Únete a un clan del hotel para acumular puntos grupales y competir en torneos isométricos."
          : section === "adventure"
            ? "Completa misiones especiales interactuando en la radio y el foro de la comunidad."
            : section === "mini-rapid"
              ? "¡Patea penales contra el portero Frank y suma puntos a tu perfil!"
              : section === "mini-draw"
                ? "Compra boletos usando SpeedPoints y participa en el gran sorteo de raras y estampas."
                : section === "source"
                  ? "Gestiona fuentes externas del Mundial y mantén visible el disclaimer."
                  : "Zona temática para seguir el Mundial 2026 con pronósticos, aventura y colección de estampas.";

  // REQUERIMIENTO DE LOGIN
  if (!user) {
    return (
      <div className="p-4 lg:p-6 max-w-md mx-auto my-16 font-sans">
        <Card className="bg-card border-border shadow-2xl">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
              <i className="fa-solid fa-lock text-3xl"></i>
            </div>
            <h2 className="text-lg font-black uppercase text-foreground">Acceso de Aficionados</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              La sección especial del <strong>Mundial 2026</strong> requiere tener una sesión iniciada para participar en los pronósticos, aventuras, y coleccionar estampas.
            </p>
            <div className="pt-2">
              <Link href="/login">
                <Button className="w-full bg-primary hover:bg-primary/80 text-white font-bold text-xs py-2.5 uppercase tracking-wider">
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
            <div className="text-[11px] text-muted-foreground mt-2">
              ¿Eres nuevo? <Link href="/register" className="text-primary hover:underline font-extrabold">Regístrate ahora</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-5 font-sans">
      
      {/* Banner Principal */}
      <div className="site-panel-strong overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-transparent to-amber-400/10 pointer-events-none" />
        <div className="relative p-5 lg:p-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Button asChild variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-8">
              <Link href="/">
                <i className="fa-solid fa-arrow-left mr-1.5 text-[10px]"></i>
                Volver al Inicio
              </Link>
            </Button>
            <Badge className="bg-emerald-500/15 text-emerald-200 border-emerald-400/20 text-[10px] font-bold">
              Mundial 2026
            </Badge>
            <Badge className="bg-white/10 text-white border-white/10 text-[10px] font-bold">Modo Habbo</Badge>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] items-start">
            <div>
              <p className="site-kicker font-black text-emerald-400">Fansite Hub</p>
              <h1 className="text-2xl lg:text-4xl font-black text-white mt-2 uppercase tracking-tight">
                {activeTitle}
              </h1>
              <p className="text-white/80 mt-2.5 text-xs sm:text-sm max-w-2xl leading-relaxed">
                {activeCopy}
              </p>
              <div className="flex flex-wrap gap-2 mt-4 text-[10px] font-bold text-white/70">
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Pronósticos</span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Aventura</span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Mini torneos</span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Estampas</span>
              </div>
            </div>

            <Card className="bg-card/90 border-border/60">
              <CardContent className="p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-foreground">
                  <i className="fa-solid fa-circle-exclamation text-primary"></i>
                  Disclaimer Oficial
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Esta zona especial es interactiva para la comunidad. No tenemos afiliación oficial con la FIFA o marcas asociadas.
                </p>
                <div className="text-[10px] text-muted-foreground font-semibold">
                  Tus SpeedPoints acumulados en la radio se usan para jugar en el hub.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sub-Navegación del Mundial (Pestañas Rápidas) */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-6">
        <Link href="/mundial" className={cn("p-2.5 border rounded-xl text-center text-xs font-black transition-all", section === "home" ? "bg-primary border-primary text-white" : "bg-card border-border hover:bg-secondary/40")}>
          <i className="fa-solid fa-trophy block text-sm mb-1"></i> ALBUM ESTAMPAS
        </Link>
        <Link href="/mundial/pronosticos" className={cn("p-2.5 border rounded-xl text-center text-xs font-black transition-all", section === "forecast" ? "bg-primary border-primary text-white" : "bg-card border-border hover:bg-secondary/40")}>
          <i className="fa-solid fa-chart-line block text-sm mb-1"></i> PRONÓSTICOS
        </Link>
        <Link href="/mundial/ranking" className={cn("p-2.5 border rounded-xl text-center text-xs font-black transition-all", section === "ranking" ? "bg-primary border-primary text-white" : "bg-card border-border hover:bg-secondary/40")}>
          <i className="fa-solid fa-ranking-star block text-sm mb-1"></i> RANKING
        </Link>
        <Link href="/mundial/equipos" className={cn("p-2.5 border rounded-xl text-center text-xs font-black transition-all", section === "teams" ? "bg-primary border-primary text-white" : "bg-card border-border hover:bg-secondary/40")}>
          <i className="fa-solid fa-users-gear block text-sm mb-1"></i> CLANES
        </Link>
        <Link href="/mundial/aventura" className={cn("p-2.5 border rounded-xl text-center text-xs font-black transition-all", section === "adventure" ? "bg-primary border-primary text-white" : "bg-card border-border hover:bg-secondary/40")}>
          <i className="fa-solid fa-compass block text-sm mb-1"></i> AVENTURA
        </Link>
        <Link href="/mundial/mini/rapido" className={cn("p-2.5 border rounded-xl text-center text-xs font-black transition-all", section === "mini-rapid" ? "bg-primary border-primary text-white" : "bg-card border-border hover:bg-secondary/40")}>
          <i className="fa-solid fa-futbol block text-sm mb-1"></i> PENALES
        </Link>
      </div>

      {/* Renderizado de Sección Activa */}

      {/* 1. ALBUM DE ESTAMPAS (Home) */}
      {section === "home" && (
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 sm:p-5">
              
              {/* Selector de tipo de album (Tienda vs Logros) */}
              <div className="flex items-center justify-between border-b border-border/80 pb-3.5 mb-5 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-images text-primary text-sm"></i>
                  <h3 className="text-sm font-extrabold uppercase">Colección de Estampas del Mundial</h3>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => setAlbumTab("tienda")}
                    variant={albumTab === "tienda" ? "default" : "outline"}
                    className="text-[10px] font-black h-8 px-4"
                  >
                    TIENDA DE ESTAMPAS (SP)
                  </Button>
                  <Button
                    onClick={() => setAlbumTab("logros")}
                    variant={albumTab === "logros" ? "default" : "outline"}
                    className="text-[10px] font-black h-8 px-4"
                  >
                    ESTAMPAS DE LOGROS (GRATIS)
                  </Button>
                </div>
              </div>

              {albumTab === "tienda" ? (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground mb-4">
                    Compra estampas conmemorativas del Mundial usando tus <strong>SpeedPoints</strong> acumulados de la radio.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {ESTAMPAS.map((stamp) => {
                      const isClaimed = claimedStamps.includes(stamp.id);
                      return (
                        <div
                          key={stamp.id}
                          className={cn(
                            "relative border rounded-2xl p-4 flex flex-col items-center justify-between text-center transition-all bg-[#0e0a32]/40",
                            isClaimed ? "border-emerald-500/50 shadow-lg shadow-emerald-500/5" : "border-border/60 grayscale"
                          )}
                        >
                          <Badge className={cn("absolute top-3 right-3 font-bold text-[9px] border", stamp.badgeColor)}>
                            {stamp.rarity}
                          </Badge>
                          
                          <div className="w-28 h-28 my-3 flex items-center justify-center relative overflow-hidden bg-black/20 rounded-xl border border-white/5">
                            <img src={stamp.image} alt={stamp.name} className="w-24 h-24 object-contain" />
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-xs font-black text-white">{stamp.name}</h4>
                            <p className="text-[10px] text-muted-foreground font-semibold">Costo: {stamp.cost} SP</p>
                          </div>

                          <div className="mt-4 w-full">
                            {isClaimed ? (
                              <Button disabled className="w-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold h-8">
                                <i className="fa-solid fa-check mr-1"></i> ADQUIRIDA
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleClaimStamp(stamp)}
                                className="w-full bg-primary hover:bg-primary/80 text-white text-[10px] font-bold h-8"
                              >
                                COMPRAR POR {stamp.cost} SP
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground mb-4">
                    Desbloquea estas estampas especiales completando actividades temáticas en los mini juegos o chateando.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {LOGROS.map((logro) => {
                      const isUserStaff = user && (user.role === "admin" || user.role === "dj" || user.role === "moderador" || user.role === "colaborador" || user.role === "periodista" || user.role === "diseñador" || user.role === "builder" || user.role === "mentor" || user.role === "eventos");
                      const isUserDj = user && (user.role === "admin" || user.role === "dj");
                      const isUnlocked = unlockedLogros.includes(logro.id) ||
                        (logro.id === "staff" && isUserStaff) ||
                        (logro.id === "dj" && isUserDj);
                      return (
                        <div
                          key={logro.id}
                          className={cn(
                            "relative border rounded-2xl p-4 flex flex-col items-center justify-between text-center transition-all bg-[#0e0a32]/40",
                            isUnlocked ? "border-emerald-500/50 shadow-lg shadow-emerald-500/5" : "border-border/60 grayscale"
                          )}
                        >
                          <Badge className={cn("absolute top-3 right-3 font-bold text-[9px] border", logro.badgeColor)}>
                            LOGRO
                          </Badge>
                          
                          <div className="w-28 h-28 my-3 flex items-center justify-center relative overflow-hidden bg-black/20 rounded-xl border border-white/5">
                            <img src={logro.image} alt={logro.name} className="w-24 h-24 object-contain" />
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-xs font-black text-white">{logro.name}</h4>
                            <p className="text-[10px] text-muted-foreground leading-tight px-1 mt-0.5">{logro.requirement}</p>
                          </div>

                          <div className="mt-4 w-full">
                            {isUnlocked ? (
                              <Button disabled className="w-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold h-8">
                                <i className="fa-solid fa-lock-open mr-1"></i> DESBLOQUEADO
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleClaimLogroManual(logro.id, logro.name)}
                                className="w-full bg-secondary hover:bg-secondary/80 text-foreground text-[10px] font-bold h-8"
                              >
                                RECLAMAR / COMPROBAR
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. PRONÓSTICOS */}
      {section === "forecast" && (
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-chart-bar text-primary text-sm"></i>
                <h3 className="text-sm font-extrabold uppercase">Pronosticar Partidos del Mundial</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Predice marcadores. Si aciertas el ganador ganas 15 SP. Si aciertas el marcador exacto ganas **50 SpeedPoints** (y desbloqueas tu estampa de pronósticos).
              </p>

              <div className="space-y-3 pt-2">
                {[
                  { id: "m1", teamA: "México", teamB: "Estados Unidos", flagA: "🇲🇽", flagB: "🇺🇸", date: "15 de Junio, 2026" },
                  { id: "m2", teamA: "Argentina", teamB: "Brasil", flagA: "🇦🇷", flagB: "🇧🇷", date: "18 de Junio, 2026" },
                  { id: "m3", teamA: "España", teamB: "Francia", flagA: "🇪🇸", flagB: "🇫🇷", date: "20 de Junio, 2026" },
                ].map((match) => (
                  <div key={match.id} className="p-4 bg-secondary/10 border border-border/60 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-center md:text-left">
                      <p className="text-[10px] text-muted-foreground font-semibold">{match.date}</p>
                      <p className="text-xs font-bold text-foreground mt-0.5">Fase de Grupos</p>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                      <span className="text-sm font-bold w-20 text-right">{match.teamA} {match.flagA}</span>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        className="w-12 h-8 text-center text-xs font-bold bg-background"
                        value={predictions[match.id].t1}
                        onChange={(e) => setPredictions({ ...predictions, [match.id]: { ...predictions[match.id], t1: e.target.value } })}
                      />
                      <span className="text-xs text-slate-400 font-bold">vs</span>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        className="w-12 h-8 text-center text-xs font-bold bg-background"
                        value={predictions[match.id].t2}
                        onChange={(e) => setPredictions({ ...predictions, [match.id]: { ...predictions[match.id], t2: e.target.value } })}
                      />
                      <span className="text-sm font-bold w-20 text-left">{match.flagB} {match.teamB}</span>
                    </div>

                    <div>
                      <Button
                        onClick={() => handleSavePrediction(match.id, match.teamA, match.teamB)}
                        className="bg-primary hover:bg-primary/80 text-white text-[10px] font-bold h-8"
                      >
                        Enviar Pronóstico
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3. RANKING */}
      {section === "ranking" && (
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-ranking-star text-primary text-sm"></i>
                <h3 className="text-sm font-extrabold uppercase">Tabla de Líderes de Pronósticos</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Los usuarios que aciertan los partidos oficiales del Mundial suben en el ranking del hotel para ganar raras al final de la temporada.
              </p>

              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border/80 text-slate-400 font-bold uppercase text-[9px] tracking-wider bg-secondary/20">
                      <th className="py-2.5 px-3">Puesto</th>
                      <th className="py-2.5 px-3">Aficionado</th>
                      <th className="py-2.5 px-3 text-center">Puntos</th>
                      <th className="py-2.5 px-3 text-center">Aciertos</th>
                      <th className="py-2.5 px-3 text-right">Rango</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {[
                      { pos: 1, name: "Dj_Invitado", points: 120, aciertos: 6, rank: "Pichichi" },
                      { pos: 2, name: "HabboSpeed", points: 95, aciertos: 4, rank: "Goleador" },
                      { pos: 3, name: "FrankManager", points: 80, aciertos: 3, rank: "Goleador" },
                      { pos: 4, name: user.displayName, points: 45, aciertos: 2, rank: "Defensa" },
                      { pos: 5, name: "PixelKing", points: 30, aciertos: 1, rank: "Amateur" },
                    ].map((row, idx) => {
                      const isSelf = row.name === user.displayName;
                      return (
                        <tr key={idx} className={cn("hover:bg-secondary/10", isSelf && "bg-primary/5 font-bold border-l-2 border-primary")}>
                          <td className="py-3 px-3">
                            <Badge className={cn("text-[10px] font-mono", row.pos === 1 ? "bg-yellow-500 text-white" : row.pos === 2 ? "bg-slate-300 text-black" : row.pos === 3 ? "bg-amber-600 text-white" : "bg-card border text-foreground")}>
                              #{row.pos}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 flex items-center gap-2">
                            <img
                              src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(row.name)}&size=s&headonly=1&head_direction=2`}
                              alt=""
                              className="w-5 h-5 bg-secondary/35 rounded-full object-contain"
                              onError={(e) => { (e.target as HTMLImageElement).src = "/habbo-radio/frank_small_03.gif"; }}
                            />
                            <span>{row.name}</span>
                          </td>
                          <td className="py-3 px-3 text-center text-primary font-bold">{row.points}</td>
                          <td className="py-3 px-3 text-center">{row.aciertos}</td>
                          <td className="py-3 px-3 text-right text-muted-foreground text-[10px] font-semibold">{row.rank}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 4. CLANES */}
      {section === "teams" && (
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-users text-primary text-sm"></i>
                <h3 className="text-sm font-extrabold uppercase">Selecciona tu Clan del Mundial</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Únete a un grupo temático en el hotel para acumular puntos colectivos y competir en misiones exclusivas.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {[
                  { name: "Clan Gladiadores Neón", members: 14, icon: "fa-solid fa-shield-halved", color: "text-cyan-400 border-cyan-400/20 bg-cyan-950/20" },
                  { name: "Clan Furia Píxel", members: 8, icon: "fa-solid fa-fire", color: "text-amber-400 border-amber-400/20 bg-amber-950/20" },
                  { name: "Clan Fucsia Extremo", members: 19, icon: "fa-solid fa-bolt", color: "text-fuchsia-400 border-fuchsia-400/20 bg-fuchsia-950/20" },
                ].map((clan) => {
                  const isMyClan = selectedClan === clan.name;
                  return (
                    <div key={clan.name} className={cn("border rounded-2xl p-4 flex flex-col justify-between text-center gap-3.5", clan.color, isMyClan && "border-2")}>
                      <div className="mx-auto w-12 h-12 rounded-full border border-current/25 flex items-center justify-center">
                        <i className={cn(clan.icon, "text-xl")}></i>
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white">{clan.name}</h4>
                        <p className="text-[10px] text-muted-foreground mt-1">Miembros: {clan.members + (isMyClan ? 1 : 0)}</p>
                      </div>
                      <div className="pt-2">
                        {isMyClan ? (
                          <Button disabled className="w-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold h-8">
                            <i className="fa-solid fa-check mr-1.5"></i> ERES MIEMBRO
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleJoinClan(clan.name)}
                            className="w-full bg-white text-slate-900 hover:bg-white/90 text-[10px] font-bold h-8"
                          >
                            Unirse al Clan
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 5. AVENTURA */}
      {section === "adventure" && (
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-compass text-primary text-sm"></i>
                <h3 className="text-sm font-extrabold uppercase">Aventura Mundialista: Misiones Activas</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Completa estas misiones interactivas para acumular SpeedPoints adicionales y desbloquear estampas especiales.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  { id: "mis1", title: "Inauguración de Radio", desc: "Sintoniza la radio durante 15 minutos en el reproductor." },
                  { id: "mis2", title: "Saludo de Hincha", desc: "Envía un mensaje de saludo al DJ actual usando la barra de control." },
                  { id: "mis3", title: "Goleador Exacto", desc: "Realiza tu primer pronóstico exacto de algún partido del Mundial." },
                ].map((mission) => {
                  const isDone = adventureMissions[mission.id];
                  return (
                    <div key={mission.id} className="p-4 bg-secondary/15 border border-border/60 rounded-2xl flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-black text-white">{mission.title}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{mission.desc}</p>
                      </div>
                      <div>
                        {isDone ? (
                          <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold py-1 px-2.5">
                            COMPLETADA
                          </Badge>
                        ) : (
                          <Button
                            onClick={() => handleCompleteMission(mission.id, mission.title)}
                            className="bg-primary hover:bg-primary/80 text-white text-[10px] font-bold h-8"
                          >
                            Completar
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 6. PENALES */}
      {section === "mini-rapid" && (
        <div className="space-y-4 font-sans">
          <Card className="bg-card border-border">
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-futbol text-primary text-sm"></i>
                <h3 className="text-sm font-extrabold uppercase">Tanda de Penales contra el Bot Frank</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Frank es el portero. Elige a dónde patear el balón. Anota 5 goles para desbloquear la estampa <strong>Guante del Campeón</strong>.
              </p>

              <div className="bg-[#0b0632] border border-white/10 rounded-2xl p-6 text-center max-w-xl mx-auto flex flex-col justify-center items-center gap-5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(38,215,255,0.08),transparent_70%)] pointer-events-none" />
                
                {penaltyState.status === "idle" ? (
                  <div className="py-6 space-y-4 relative z-10">
                    <i className="fa-solid fa-circle-play text-5xl text-primary animate-pulse cursor-pointer" onClick={handleResetPenaltyGame}></i>
                    <h4 className="text-sm font-black text-white uppercase">¿Listo para patear?</h4>
                    <Button onClick={handleResetPenaltyGame} className="bg-primary hover:bg-primary/80 text-white text-xs font-bold px-6">
                      Iniciar Partido
                    </Button>
                  </div>
                ) : (
                  <div className="w-full space-y-5 relative z-10">
                    {/* Marcador */}
                    <div className="flex items-center justify-between bg-black/45 border border-white/5 rounded-xl px-4 py-2 text-xs">
                      <span className="font-bold text-slate-400">Pateador: <strong className="text-white">{user.displayName}</strong></span>
                      <span className="font-mono text-cyan-400 font-bold bg-[#140b49] px-2 py-0.5 rounded border border-white/10 text-xs">
                        {penaltyState.score} Goles
                      </span>
                      <span className="font-bold text-slate-400">Tiros: <strong className="text-white">{penaltyState.shotsRemaining}</strong></span>
                    </div>

                    {/* Animación o Mensaje de Estado */}
                    <div className="h-28 flex flex-col items-center justify-center text-center">
                      {penaltyState.lastResult === "scored" && (
                        <div className="space-y-2 animate-bounce">
                          <i className="fa-solid fa-circle-check text-4xl text-emerald-400"></i>
                          <h5 className="text-emerald-400 font-black text-sm uppercase">¡GOLAZO! Frank no llegó.</h5>
                        </div>
                      )}
                      {penaltyState.lastResult === "missed" && (
                        <div className="space-y-2 animate-shake">
                          <i className="fa-solid fa-circle-xmark text-4xl text-rose-500"></i>
                          <h5 className="text-rose-400 font-black text-sm uppercase">¡Atajadón! Frank la desvió.</h5>
                        </div>
                      )}
                      {penaltyState.lastResult === null && (
                        <div className="space-y-2 text-slate-300">
                          <i className="fa-solid fa-futbol text-4xl text-white animate-spin-slow"></i>
                          <h5 className="font-bold text-xs uppercase">Frank está posicionado en la portería...</h5>
                        </div>
                      )}
                      {penaltyState.status === "over" && (
                        <div className="space-y-2">
                          <i className="fa-solid fa-trophy text-4xl text-yellow-400"></i>
                          <h5 className="text-yellow-400 font-black text-sm uppercase">Tanda Terminada</h5>
                          <p className="text-[11px] text-slate-300">Lograste anotar {penaltyState.score} de 5 goles.</p>
                          {penaltyState.score >= 5 && (
                            <p className="text-[11.5px] text-emerald-400 font-extrabold">🎉 ¡LOGRO DESBLOQUEADO: Guante del Campeón! Ve al Álbum.</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Botones de Acción de Disparo */}
                    {penaltyState.status !== "over" ? (
                      <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
                        <Button
                          onClick={() => handleShoot("izq")}
                          className="bg-[#140b49] border border-white/10 text-xs font-bold text-white hover:bg-[#201170] h-9"
                        >
                          Izquierda
                        </Button>
                        <Button
                          onClick={() => handleShoot("cen")}
                          className="bg-[#140b49] border border-white/10 text-xs font-bold text-white hover:bg-[#201170] h-9"
                        >
                          Centro
                        </Button>
                        <Button
                          onClick={() => handleShoot("der")}
                          className="bg-[#140b49] border border-white/10 text-xs font-bold text-white hover:bg-[#201170] h-9"
                        >
                          Derecha
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={handleResetPenaltyGame} className="bg-primary hover:bg-primary/80 text-xs font-bold px-6">
                        Patear Otra Tanda
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 7. SORTEOS */}
      {section === "mini-draw" && (
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-gift text-primary text-sm"></i>
                <h3 className="text-sm font-extrabold uppercase">Sorteos de Placas del Mundial</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Participa en la rifa de placas y estampas raras usando tus SpeedPoints acumulados. Cada boleto te cuesta 15 SP.
              </p>

              <div className="grid gap-4 md:grid-cols-2 pt-2">
                {/* Caja de Compra */}
                <div className="p-5 bg-[#0e0a32]/45 border border-border/80 rounded-2xl flex flex-col justify-between items-center text-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl">
                    <i className="fa-solid fa-ticket"></i>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Comprar Boleto del Sorteo</h4>
                    <p className="text-[10px] text-muted-foreground mt-1">Costo por boleto: 15 SpeedPoints</p>
                    <p className="text-[10px] text-cyan-400 font-bold mt-2">Tienes {ticketsCount} boletos adquiridos.</p>
                  </div>
                  <Button
                    onClick={handleBuyTicket}
                    className="w-full bg-primary hover:bg-primary/80 text-white text-xs font-bold py-2"
                  >
                    Comprar 1 Boleto
                  </Button>
                </div>

                {/* Info de Sorteos */}
                <div className="p-4 bg-secondary/10 border border-border/50 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Premios del Sorteo de esta semana</h4>
                  <ul className="text-xs space-y-2.5 text-slate-300">
                    <li className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-emerald-400"></i>
                      <span>Placa Especial "Fanático de Oro 2026"</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-emerald-400"></i>
                      <span>Estampa Legendaria de Habbo Mundial</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-emerald-400"></i>
                      <span>Premio Mayor: 250 SpeedPoints</span>
                    </li>
                  </ul>
                  <p className="text-[10px] text-muted-foreground italic pt-2 border-t border-border/30">
                    El sorteo se realiza automáticamente todos los domingos en la noche durante el programa en vivo.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 8. FUENTE EXTERNA SELECCIONADA */}
      {section === "source" && (
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-newspaper text-primary text-sm"></i>
                <h3 className="text-sm font-extrabold uppercase">Fuentes Oficiales y Noticias Externas</h3>
              </div>
              <div className="space-y-2 pt-2">
                {DEFAULT_SOURCES.map((source) => (
                  <div key={source.id} className="rounded-xl border border-border/60 bg-background/40 p-4 flex items-start justify-between gap-3">
                    <div>
                      <a href={source.url} target="_blank" rel="noreferrer" className="text-xs font-black text-primary hover:underline inline-flex items-center gap-1">
                        {source.name}
                        <i className="fa-solid fa-up-right-from-square text-[9px]"></i>
                      </a>
                      <p className="text-[11px] text-muted-foreground mt-1">{source.note}</p>
                      <p className="text-[10px] text-muted-foreground/80 font-mono mt-1 break-all">{source.url}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}
