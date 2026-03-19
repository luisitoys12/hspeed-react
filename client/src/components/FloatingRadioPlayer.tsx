import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Play, Pause, Volume2, VolumeX, Music, Users, Radio, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NowPlayingData {
  now_playing?: {
    song?: { title?: string; artist?: string };
  };
  listeners?: { current?: number };
  live?: { is_live?: boolean; streamer_name?: string };
  station?: { listen_url?: string };
}

export default function FloatingRadioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
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

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
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
  };

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
  const isLive = nowPlaying?.live?.is_live;
  const djName = nowPlaying?.live?.streamer_name;

  return (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <audio ref={audioRef} preload="none" />

      {/* DJ Avatar + Info */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {djName && (
          <div className="relative flex-shrink-0">
            <img
              src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${djName}&size=s&headonly=1`}
              alt={djName}
              className="w-8 h-8 rounded object-cover bg-secondary"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            {isLive && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full live-indicator" />
            )}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-primary flex-shrink-0" />
            {isLive && djName ? (
              <span className="text-xs text-primary font-medium truncate">{djName}</span>
            ) : (
              <span className="text-xs text-muted-foreground">HabboSpeed Radio</span>
            )}
          </div>
          <p className="text-xs text-foreground truncate font-medium">
            {song?.artist && song?.title
              ? `${song.artist} - ${song.title}`
              : "En vivo las 24h"}
          </p>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
          <Users className="w-3 h-3" />
          <span data-testid="text-listeners">{listeners}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-primary hover:bg-primary/80 text-white"
          onClick={togglePlay}
          data-testid="button-play-pause"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </Button>

        <div className="flex items-center gap-1.5">
          <button onClick={() => setIsMuted(!isMuted)} className="text-muted-foreground hover:text-foreground transition-colors" data-testid="button-mute">
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <Slider
            value={[isMuted ? 0 : volume]}
            onValueChange={([v]) => { setVolume(v); setIsMuted(false); }}
            max={100}
            step={1}
            className="w-16 h-1"
            data-testid="slider-volume"
          />
        </div>

        {/* Song Request Drawer */}
        <Sheet open={requestOpen} onOpenChange={setRequestOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" data-testid="button-request">
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
  );
}
