import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Play, Pause, Square, Volume2, VolumeX, Music, Users, Radio, Send, Headphones, Info, Monitor, Disc, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NowPlayingData {
  now_playing?: {
    song?: { title?: string; artist?: string };
  };
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
  return `https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&gesture=std&action=std&direction=2&head_direction=2${ho}&size=s`;
}

function getCurrentProgramProgress(startTime: string, endTime: string) {
  const now = new Date();
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const totalMin = endMin > startMin ? endMin - startMin : (1440 - startMin) + endMin;
  const elapsedMin = nowMin >= startMin ? nowMin - startMin : (1440 - startMin) + nowMin;
  if (totalMin <= 0) return 50;
  return Math.max(0, Math.min(100, (elapsedMin / totalMin) * 100));
}

const DAYS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function FloatingRadioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
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
      const listenUrl = nowPlaying?.station?.listen_url || siteConfig?.listenUrl;
      if (listenUrl) {
        audioRef.current.src = listenUrl;
        audioRef.current.play().catch(() => {});
      }
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, nowPlaying, siteConfig]);

  const requestMutation = useMutation({
    mutationFn: async (data: { type: string; details: string; userName: string }) => {
      const res = await apiRequest("POST", "/api/requests", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "¡Solicitud enviada!", description: "Tu solicitud ha sido recibida." });
      setRequestOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo enviar la solicitud.", variant: "destructive" });
    },
  });

  const [reqForm, setReqForm] = useState({ type: "cancion", details: "", userName: "" });

  const handleRequest = () => {
    if (!reqForm.details || !reqForm.userName) return;
    requestMutation.mutate(reqForm);
  };

  const song = nowPlaying?.now_playing?.song;
  const listeners = nowPlaying?.listeners?.current ?? 0;
  const djName = nowPlaying?.live?.streamer_name || djPanelData?.currentDj || "AutoDJ";
  const isLive = nowPlaying?.live?.is_live || false;
  const nextDj = djPanelData?.nextDj || "";
  const songHistory = nowPlaying?.song_history?.slice(0, 4) || [];

  // Find current program from schedule
  const today = DAYS_ES[new Date().getDay()];
  const currentSchedule = (scheduleData || []).find((s) => {
    if (s.day !== today) return false;
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const [sh, sm] = s.startTime.split(":").map(Number);
    const [eh, em] = s.endTime.split(":").map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    if (endMin > startMin) {
      return nowMin >= startMin && nowMin < endMin;
    }
    return nowMin >= startMin || nowMin < endMin;
  });

  const programStart = currentSchedule?.startTime || "00:00";
  const programEnd = currentSchedule?.endTime || "24:00";
  const programProgress = currentSchedule ? getCurrentProgramProgress(programStart, programEnd) : 50;

  return (
    <>
      <audio ref={audioRef} preload="none" />

      {/* ═══════ DESKTOP FULL PLAYER BAR ═══════ */}
      <div className="radio-player-bar hidden xl:flex items-center w-full gap-0 h-[52px] bg-card/95 backdrop-blur-sm border-b border-border/40 px-3">

        {/* ── SECTION 1: Current DJ ── */}
        <div className="flex items-center gap-2 pr-3 border-r border-border/40 flex-shrink-0">
          <div className="relative">
            <img
              src={getHabboAvatar(djName)}
              alt={djName}
              className="w-9 h-10 rounded object-cover bg-secondary border border-border/60"
              onError={(e) => { (e.target as HTMLImageElement).src = getHabboAvatar("AutoDJ"); }}
            />
            {isLive && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full live-indicator" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold block leading-tight">
              CURRENT DJ
            </span>
            <span className="text-xs font-bold text-foreground block truncate max-w-[100px] leading-tight">
              {djName}
            </span>
          </div>
        </div>

        {/* ── SECTION 2: Current Song ── */}
        <div className="flex items-center gap-2 px-3 border-r border-border/40 flex-shrink-0 min-w-0">
          <div className="min-w-0 mr-1">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold block leading-tight">
              CURRENT SONG
            </span>
            <p className="text-xs font-medium text-foreground truncate max-w-[180px] leading-tight">
              {song?.artist && song?.title
                ? `${song.artist} - ${song.title}`
                : "En vivo las 24h"}
            </p>
          </div>
        </div>

        {/* ── SECTION 3: Controls (Play/Stop + Listeners + Volume + Icons) ── */}
        <div className="flex items-center gap-2 px-3 border-r border-border/40 flex-shrink-0">
          {/* Play / Stop */}
          <button
            onClick={togglePlay}
            className="radio-play-btn w-8 h-8 rounded-full flex items-center justify-center transition-all"
            data-testid="button-play-pause"
            aria-label={isPlaying ? "Detener" : "Reproducir"}
          >
            {isPlaying
              ? <Square className="w-3.5 h-3.5" />
              : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          {/* Info */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors hover:bg-muted/50"
            aria-label="Información"
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          {/* Listeners */}
          <div className="flex items-center gap-1 text-xs text-primary font-bold px-1.5">
            <Headphones className="w-3.5 h-3.5" />
            <span data-testid="text-listeners">{listeners}</span>
          </div>

          {/* Mute */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-mute"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Volume Slider */}
          <Slider
            value={[isMuted ? 0 : volume]}
            onValueChange={([v]) => { setVolume(v); setIsMuted(false); }}
            max={100}
            step={1}
            className="w-14 h-1"
            data-testid="slider-volume"
          />

          {/* Extra icons */}
          <button className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Monitor">
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Disco">
            <Disc className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── SECTION 4: Program Time ── */}
        <div className="flex items-center gap-2 px-3 border-r border-border/40 flex-shrink-0 min-w-[160px]">
          <div className="flex flex-col gap-0.5 w-full">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-primary" />
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold leading-tight">
                PROGRAM TIME
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground font-medium">{programStart}</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-1000 relative"
                  style={{ width: `${programProgress}%` }}
                >
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full border border-primary-foreground shadow-sm" />
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">{programEnd}</span>
            </div>
          </div>
        </div>

        {/* ── SECTION 5: Next DJ ── */}
        <div className="flex items-center gap-2 pl-3 flex-shrink-0">
          <div className="min-w-0">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold block leading-tight">
              NEXT DJ
            </span>
            <span className="text-xs font-bold text-foreground block truncate max-w-[90px] leading-tight">
              {nextDj || "—"}
            </span>
          </div>
          {nextDj && (
            <img
              src={getHabboAvatar(nextDj, true)}
              alt={nextDj}
              className="w-6 h-6 rounded object-cover bg-secondary"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}
        </div>

        {/* ── Request button ── */}
        <div className="ml-auto pl-2 flex-shrink-0">
          <Sheet open={requestOpen} onOpenChange={setRequestOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" data-testid="button-request">
                <Music className="w-3.5 h-3.5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-card border-border" side="right">
              <SheetHeader>
                <SheetTitle className="font-pixel text-xs glow-text">Hacer Solicitud</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Tipo de solicitud</Label>
                  <Select value={reqForm.type} onValueChange={(v) => setReqForm(p => ({ ...p, type: v }))}>
                    <SelectTrigger className="mt-1" data-testid="select-request-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cancion">Canción</SelectItem>
                      <SelectItem value="saludo">Saludo</SelectItem>
                      <SelectItem value="grito">Grito</SelectItem>
                      <SelectItem value="declaracion">Declaración</SelectItem>
                      <SelectItem value="concurso">Concurso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Tu nombre (Habbo)</Label>
                  <Input
                    className="mt-1"
                    placeholder="Tu usuario..."
                    value={reqForm.userName}
                    onChange={(e) => setReqForm(p => ({ ...p, userName: e.target.value }))}
                    data-testid="input-request-username"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Detalles</Label>
                  <Textarea
                    className="mt-1"
                    placeholder="Artista - Canción / Mensaje..."
                    value={reqForm.details}
                    onChange={(e) => setReqForm(p => ({ ...p, details: e.target.value }))}
                    data-testid="input-request-details"
                  />
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary/80"
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
        </div>
      </div>

      {/* ═══════ MOBILE / TABLET COMPACT PLAYER ═══════ */}
      <div className="xl:hidden flex items-center gap-3 flex-1 min-w-0">
        {/* DJ Avatar + Info */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            <img
              src={getHabboAvatar(djName, true)}
              alt={djName}
              className="w-8 h-8 rounded object-cover bg-secondary"
              onError={(e) => { (e.target as HTMLImageElement).src = getHabboAvatar("AutoDJ", true); }}
            />
            {isLive && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full live-indicator" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-primary flex-shrink-0" />
              <span className="text-xs text-primary font-medium truncate">{djName}</span>
            </div>
            <p className="text-xs text-foreground truncate font-medium">
              {song?.artist && song?.title
                ? `${song.artist} - ${song.title}`
                : "En vivo las 24h"}
            </p>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
            <Users className="w-3 h-3" />
            <span data-testid="text-listeners-mobile">{listeners}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-primary hover:bg-primary/80 text-white"
            onClick={togglePlay}
            data-testid="button-play-pause-mobile"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </Button>

          <div className="flex items-center gap-1.5">
            <button onClick={() => setIsMuted(!isMuted)} className="text-muted-foreground hover:text-foreground transition-colors" data-testid="button-mute-mobile">
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={([v]) => { setVolume(v); setIsMuted(false); }}
              max={100}
              step={1}
              className="w-16 h-1"
              data-testid="slider-volume-mobile"
            />
          </div>

          {/* Song Request Drawer (mobile) */}
          <Sheet open={requestOpen} onOpenChange={setRequestOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" data-testid="button-request-mobile">
                <Music className="w-3.5 h-3.5" />
              </Button>
            </SheetTrigger>
            {/* Reuses same sheet content defined in desktop */}
          </Sheet>
        </div>
      </div>

      {/* ═══════ SONG HISTORY POPUP ═══════ */}
      {showHistory && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowHistory(false)} />
          <div className="radio-history-popup absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-card border border-border rounded-lg shadow-xl z-50 p-3 animate-fade-in-up">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-primary">Reproduciendo ahora</span>
              <button onClick={() => setShowHistory(false)} className="text-muted-foreground hover:text-foreground text-sm">&times;</button>
            </div>
            <p className="text-xs text-foreground font-medium mb-3 pb-2 border-b border-border/50">
              {song?.artist && song?.title ? `${song.artist} - ${song.title}` : "—"}
            </p>
            {songHistory.length > 0 && (
              <>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Últimas canciones</span>
                <ul className="mt-1.5 space-y-1.5">
                  {songHistory.map((h, i) => (
                    <li key={i} className="text-[11px] text-muted-foreground/80 border-b border-border/30 pb-1">
                      {h.song.artist} - {h.song.title}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
