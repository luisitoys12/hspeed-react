import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Music,
  Users,
  Radio,
  Send,
  Headphones,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NowPlayingData {
  now_playing?: { song?: { title?: string; artist?: string } };
  listeners?: { current?: number };
  live?: { is_live?: boolean; streamer_name?: string };
  station?: { listen_url?: string };
  song_history?: Array<{ song: { title?: string; artist?: string } }>;
}

interface ScheduleItem {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
  showName: string;
  djName: string;
}

function getHabboAvatar(username: string, headonly = false) {
  const ho = headonly ? "&headonly=1" : "&headonly=0";
  return `https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(
    username
  )}&gesture=std&action=std&direction=2&head_direction=2${ho}&size=s`;
}

function getCurrentProgramProgress(startTime: string, endTime: string) {
  const now = new Date();
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const totalMin =
    endMin > startMin ? endMin - startMin : 1440 - startMin + endMin;
  const elapsedMin =
    nowMin >= startMin ? nowMin - startMin : 1440 - startMin + nowMin;
  if (totalMin <= 0) return 50;
  return Math.max(0, Math.min(100, (elapsedMin / totalMin) * 100));
}

const DAYS_ES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

// ─── Zeno.FM widget embed ─────────────────────────────────────────────────────
// Cambia ZENO_STATION_ID por el ID de tu estación en ZenoFM
// Ejemplo: "estacion-kus" o el slug que aparece en tu URL de ZenoFM
const ZENO_STATION_ID = ""; // ← pon aquí tu ID de estación ZenoFM
const ZENO_EMBED_URL = ZENO_STATION_ID
  ? `https://zeno.fm/player/${ZENO_STATION_ID}/`
  : "";

export default function FloatingRadioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showZeno, setShowZeno] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const { data: nowPlaying } = useQuery<NowPlayingData>({
    queryKey: ["/api/nowplaying"],
    refetchInterval: 15000,
    retry: false,
  });

  const { data: siteConfig } = useQuery<any>({
    queryKey: ["/api/config"],
    retry: false,
  });

  const { data: djPanelData } = useQuery<any>({
    queryKey: ["/api/dj-panel"],
    refetchInterval: 15000,
    retry: false,
  });

  const { data: scheduleData } = useQuery<ScheduleItem[]>({
    queryKey: ["/api/schedule"],
    retry: false,
    staleTime: 60000,
  });

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.src = "";
    } else {
      const listenUrl =
        nowPlaying?.station?.listen_url || siteConfig?.listenUrl;
      if (listenUrl) {
        audioRef.current.src = listenUrl;
        audioRef.current.play().catch(() => {});
      }
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, nowPlaying, siteConfig]);

  const requestMutation = useMutation({
    mutationFn: async (data: {
      type: string;
      details: string;
      userName: string;
    }) => {
      const res = await apiRequest("POST", "/api/requests", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "¡Solicitud enviada!",
        description: "Tu solicitud ha sido recibida.",
      });
      setRequestOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud.",
        variant: "destructive",
      });
    },
  });

  const [reqForm, setReqForm] = useState({
    type: "cancion",
    details: "",
    userName: "",
  });

  const handleRequest = () => {
    if (!reqForm.details || !reqForm.userName) return;
    requestMutation.mutate(reqForm);
  };

  const song = nowPlaying?.now_playing?.song;
  const listeners = nowPlaying?.listeners?.current ?? 0;
  const djName =
    nowPlaying?.live?.streamer_name || djPanelData?.currentDj || "AutoDJ";
  const isLive = nowPlaying?.live?.is_live || false;
  const nextDj = djPanelData?.nextDj || "";
  const songHistory = nowPlaying?.song_history?.slice(0, 4) || [];

  const today = DAYS_ES[new Date().getDay()];
  const currentSchedule = (scheduleData || []).find((s) => {
    if (s.day !== today) return false;
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const [sh, sm] = s.startTime.split(":").map(Number);
    const [eh, em] = s.endTime.split(":").map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    return endMin > startMin
      ? nowMin >= startMin && nowMin < endMin
      : nowMin >= startMin || nowMin < endMin;
  });

  const programStart = currentSchedule?.startTime || "00:00";
  const programEnd = currentSchedule?.endTime || "24:00";
  const programProgress = currentSchedule
    ? getCurrentProgramProgress(programStart, programEnd)
    : 50;
  const songTitle =
    song?.artist && song?.title
      ? `${song.artist} — ${song.title}`
      : "En vivo las 24h";

  // ─── Request Sheet (shared desktop + mobile) ─────────────────────────────
  const RequestSheet = (
    <Sheet open={requestOpen} onOpenChange={setRequestOpen}>
      <SheetTrigger asChild>
        <button
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-semibold transition-colors"
          data-testid="button-request"
          title="Hacer solicitud al DJ"
        >
          <Music className="w-3 h-3" />
          <span className="hidden sm:inline">Solicitud</span>
        </button>
      </SheetTrigger>
      <SheetContent className="bg-card border-border" side="right">
        <SheetHeader>
          <SheetTitle className="font-pixel text-xs glow-text-themed">
            🎵 Hacer Solicitud
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Tipo</Label>
            <Select
              value={reqForm.type}
              onValueChange={(v) => setReqForm((p) => ({ ...p, type: v }))}
            >
              <SelectTrigger className="mt-1" data-testid="select-request-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cancion">🎵 Canción</SelectItem>
                <SelectItem value="saludo">👋 Saludo</SelectItem>
                <SelectItem value="grito">📣 Grito</SelectItem>
                <SelectItem value="declaracion">💌 Declaración</SelectItem>
                <SelectItem value="concurso">🏆 Concurso</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              Tu nombre (Habbo)
            </Label>
            <Input
              className="mt-1"
              placeholder="Tu usuario..."
              value={reqForm.userName}
              onChange={(e) =>
                setReqForm((p) => ({ ...p, userName: e.target.value }))
              }
              data-testid="input-request-username"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Detalles</Label>
            <Textarea
              className="mt-1 resize-none"
              rows={3}
              placeholder="Artista - Canción / Mensaje..."
              value={reqForm.details}
              onChange={(e) =>
                setReqForm((p) => ({ ...p, details: e.target.value }))
              }
              data-testid="input-request-details"
            />
          </div>
          <Button
            className="w-full bg-theme-gradient text-white hover:opacity-90"
            onClick={handleRequest}
            disabled={requestMutation.isPending}
            data-testid="button-submit-request"
          >
            <Send className="w-3.5 h-3.5 mr-2" />
            Enviar Solicitud
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      <audio ref={audioRef} preload="none" />

      {/* ═══ ZenoFM popup widget ═══════════════════════════════════════════ */}
      {ZENO_EMBED_URL && showZeno && (
        <div className="fixed bottom-16 right-4 z-50 shadow-2xl rounded-2xl overflow-hidden border border-border animate-fade-in-up">
          <div className="flex items-center justify-between px-3 py-2 bg-card border-b border-border">
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <Zap className="w-3 h-3" /> ZenoFM Player
            </span>
            <button
              onClick={() => setShowZeno(false)}
              className="text-muted-foreground hover:text-foreground text-lg leading-none"
            >
              ×
            </button>
          </div>
          <iframe
            src={ZENO_EMBED_URL}
            width="300"
            height="140"
            frameBorder="0"
            scrolling="no"
            title="ZenoFM Radio Player"
            allow="autoplay"
          />
        </div>
      )}

      {/* ═══ DESKTOP PLAYER BAR ════════════════════════════════════════════ */}
      <div className="radio-player-bar hidden xl:flex items-center w-full gap-0 h-[52px] bg-card/97 backdrop-blur-sm border-b border-border/40 px-3 relative overflow-visible">
        {/* Gradient accent line top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-theme-gradient opacity-70" />

        {/* ── DJ Avatar + ON AIR badge ── */}
        <div className="flex items-center gap-2 pr-3 border-r border-border/30 flex-shrink-0">
          <div className="relative">
            <img
              src={getHabboAvatar(djName)}
              alt={djName}
              className="w-9 h-10 rounded-lg object-cover bg-secondary border border-border/50"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  getHabboAvatar("AutoDJ");
              }}
            />
            {isLive && (
              <span className="absolute -top-1 -right-1 px-1 py-0.5 bg-red-500 text-white text-[7px] font-black rounded leading-none live-indicator">
                ON AIR
              </span>
            )}
          </div>
          <div className="min-w-0">
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold block">
              DJ
            </span>
            <span className="text-xs font-bold text-foreground truncate max-w-[100px] block">
              {djName}
            </span>
          </div>
        </div>

        {/* ── Current song with scroll animation ── */}
        <div className="flex items-center gap-2 px-3 border-r border-border/30 min-w-0 flex-shrink-0 max-w-[220px]">
          <div className="min-w-0 overflow-hidden">
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold block">
              SONANDO
            </span>
            <div className="overflow-hidden max-w-[190px]">
              <p className="text-xs font-semibold text-foreground truncate">
                {songTitle}
              </p>
            </div>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="flex items-center gap-2.5 px-3 border-r border-border/30 flex-shrink-0">
          {/* Play / Stop */}
          <button
            onClick={togglePlay}
            className="radio-play-btn w-9 h-9 rounded-full flex items-center justify-center transition-all"
            data-testid="button-play-pause"
            aria-label={isPlaying ? "Detener" : "Reproducir"}
          >
            {isPlaying ? (
              <Square className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5 ml-0.5" />
            )}
          </button>

          {/* Listeners */}
          <div className="flex items-center gap-1 bg-primary/10 rounded-lg px-2 py-1">
            <Headphones className="w-3 h-3 text-primary" />
            <span className="text-[11px] font-bold text-primary" data-testid="text-listeners">
              {listeners}
            </span>
          </div>

          {/* Mute + Volume */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-mute"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>
          <Slider
            value={[isMuted ? 0 : volume]}
            onValueChange={([v]) => {
              setVolume(v);
              setIsMuted(false);
            }}
            max={100}
            step={1}
            className="w-16 h-1"
            data-testid="slider-volume"
          />
        </div>

        {/* ── Program progress ── */}
        <div className="flex items-center gap-2 px-3 border-r border-border/30 flex-shrink-0 min-w-[170px]">
          <div className="flex flex-col gap-1 w-full">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-primary" />
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">
                {currentSchedule?.showName || "PROGRAMA"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">{programStart}</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-theme-gradient rounded-full transition-all duration-1000 relative"
                  style={{ width: `${programProgress}%` }}
                >
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full border border-card shadow" />
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground">{programEnd}</span>
            </div>
          </div>
        </div>

        {/* ── Next DJ ── */}
        <div className="flex items-center gap-2 px-3 border-r border-border/30 flex-shrink-0">
          <div className="min-w-0">
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold block">
              SIGUIENTE
            </span>
            <span className="text-xs font-bold text-foreground truncate max-w-[90px] block">
              {nextDj || "—"}
            </span>
          </div>
          {nextDj && (
            <img
              src={getHabboAvatar(nextDj, true)}
              alt={nextDj}
              className="w-6 h-6 rounded-lg object-cover bg-secondary"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
        </div>

        {/* ── Right actions ── */}
        <div className="ml-auto pl-3 flex items-center gap-2 flex-shrink-0">
          {/* Historial */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            title="Historial de canciones"
          >
            <Radio className="w-3.5 h-3.5" />
            {showHistory ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>

          {/* ZenoFM button */}
          {ZENO_EMBED_URL && (
            <button
              onClick={() => setShowZeno(!showZeno)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors ${
                showZeno
                  ? "bg-primary text-white"
                  : "bg-primary/10 hover:bg-primary/20 text-primary"
              }`}
              title="Abrir ZenoFM Player"
            >
              <Zap className="w-3 h-3" />
              Zeno
            </button>
          )}

          {/* Solicitud */}
          {RequestSheet}
        </div>
      </div>

      {/* ═══ MOBILE COMPACT BAR ════════════════════════════════════════════ */}
      <div className="xl:hidden flex items-center gap-3 flex-1 min-w-0 relative">
        {/* Gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-theme-gradient opacity-60" />

        {/* DJ + Song info */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            <img
              src={getHabboAvatar(djName, true)}
              alt={djName}
              className="w-8 h-8 rounded-lg object-cover bg-secondary ring-1 ring-primary/20"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  getHabboAvatar("AutoDJ", true);
              }}
            />
            {isLive && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full live-indicator" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-primary flex-shrink-0" />
              <span className="text-xs text-primary font-bold truncate">{djName}</span>
            </div>
            <p className="text-[11px] text-foreground/80 truncate">{songTitle}</p>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0 bg-primary/10 rounded-lg px-2 py-0.5">
            <Users className="w-3 h-3 text-primary" />
            <span className="font-semibold text-primary" data-testid="text-listeners-mobile">
              {listeners}
            </span>
          </div>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={togglePlay}
            className="radio-play-btn w-8 h-8 rounded-full flex items-center justify-center"
            data-testid="button-play-pause-mobile"
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5 ml-0.5" />
            )}
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-mute-mobile"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>

          <Slider
            value={[isMuted ? 0 : volume]}
            onValueChange={([v]) => {
              setVolume(v);
              setIsMuted(false);
            }}
            max={100}
            step={1}
            className="w-14 h-1"
            data-testid="slider-volume-mobile"
          />

          {/* ZenoFM mobile */}
          {ZENO_EMBED_URL && (
            <button
              onClick={() => setShowZeno(!showZeno)}
              className="text-primary hover:text-primary/70 transition-colors"
              title="ZenoFM"
            >
              <Zap className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Solicitud mobile */}
          <Sheet open={requestOpen} onOpenChange={setRequestOpen}>
            <SheetTrigger asChild>
              <button
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="button-request-mobile"
              >
                <Music className="w-3.5 h-3.5" />
              </button>
            </SheetTrigger>
            <SheetContent className="bg-card border-border" side="right">
              <SheetHeader>
                <SheetTitle className="font-pixel text-xs glow-text-themed">
                  🎵 Hacer Solicitud
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Tipo</Label>
                  <Select
                    value={reqForm.type}
                    onValueChange={(v) =>
                      setReqForm((p) => ({ ...p, type: v }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cancion">🎵 Canción</SelectItem>
                      <SelectItem value="saludo">👋 Saludo</SelectItem>
                      <SelectItem value="grito">📣 Grito</SelectItem>
                      <SelectItem value="declaracion">💌 Declaración</SelectItem>
                      <SelectItem value="concurso">🏆 Concurso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Tu nombre (Habbo)
                  </Label>
                  <Input
                    className="mt-1"
                    placeholder="Tu usuario..."
                    value={reqForm.userName}
                    onChange={(e) =>
                      setReqForm((p) => ({ ...p, userName: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Detalles</Label>
                  <Textarea
                    className="mt-1 resize-none"
                    rows={3}
                    placeholder="Artista - Canción / Mensaje..."
                    value={reqForm.details}
                    onChange={(e) =>
                      setReqForm((p) => ({ ...p, details: e.target.value }))
                    }
                  />
                </div>
                <Button
                  className="w-full bg-theme-gradient text-white hover:opacity-90"
                  onClick={handleRequest}
                  disabled={requestMutation.isPending}
                >
                  <Send className="w-3.5 h-3.5 mr-2" />
                  Enviar Solicitud
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* ═══ SONG HISTORY POPUP ════════════════════════════════════════════ */}
      {showHistory && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowHistory(false)}
          />
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-card border border-primary/20 rounded-2xl shadow-2xl z-50 p-4 animate-fade-in-up">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" /> Sonando ahora
              </span>
              <button
                onClick={() => setShowHistory(false)}
                className="text-muted-foreground hover:text-foreground text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="bg-primary/10 rounded-xl px-3 py-2 mb-3">
              <p className="text-xs text-foreground font-semibold">{songTitle}</p>
            </div>

            {songHistory.length > 0 && (
              <>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Últimas canciones
                </span>
                <ul className="mt-1.5 space-y-1.5">
                  {songHistory.map((h, i) => (
                    <li
                      key={i}
                      className="text-[11px] text-muted-foreground border-b border-border/30 pb-1.5 flex items-center gap-1.5"
                    >
                      <span className="text-primary font-bold text-[10px]">
                        {i + 1}
                      </span>
                      {h.song.artist} — {h.song.title}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* Link a ZenoFM si está configurado */}
            {ZENO_EMBED_URL && (
              <a
                href={`https://zeno.fm/${ZENO_STATION_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center gap-1.5 text-[11px] text-primary hover:underline"
              >
                <ExternalLink className="w-3 h-3" /> Ver en ZenoFM
              </a>
            )}
          </div>
        </>
      )}
    </>
  );
}
