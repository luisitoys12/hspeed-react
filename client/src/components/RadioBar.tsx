import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { proxyImage } from "@/lib/habboProxy";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Radio,
  Headphones,
  Mic,
  Clock,
  Users,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface NowPlayingData {
  now_playing?: { song?: { title?: string; artist?: string } };
  listeners?: { current?: number };
  live?: { is_live?: boolean; streamer_name?: string };
  station?: { listen_url?: string };
}

export default function RadioBar() {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [nowDate, setNowDate] = useState(new Date());

  const { data: nowPlaying } = useQuery<NowPlayingData>({
    queryKey: ["/api/nowplaying"],
    refetchInterval: 15000,
    retry: false,
  });
  const { data: siteConfig } = useQuery<any>({
    queryKey: ["/api/config"],
    retry: false,
  });
  const { data: djPanel } = useQuery<any>({
    queryKey: ["/api/dj-panel"],
    refetchInterval: 15000,
    retry: false,
  });

  useEffect(() => {
    const timer = setInterval(() => setNowDate(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

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
      setIsPlaying(false);
      return;
    }
    const listenUrl = nowPlaying?.station?.listen_url || siteConfig?.listenUrl;
    if (!listenUrl) {
      toast({ title: "Error", description: "No hay URL de radio disponible", variant: "destructive" });
      return;
    }
    audioRef.current.src = listenUrl;
    audioRef.current.play().catch(() => {});
    setIsPlaying(true);
  }, [isPlaying, nowPlaying, siteConfig, toast]);

  const rawDj = nowPlaying?.live?.streamer_name || djPanel?.currentDj || "HabboSpeed";
  const isAutoDj = !rawDj || ["autodj", "auto dj", "azuracast autodj", "habbospeed"].includes(rawDj.toLowerCase());
  const currentDj = isAutoDj ? "AutoDJ" : rawDj;
  const currentSong = nowPlaying?.now_playing?.song;
  const songTitle = currentSong?.artist && currentSong?.title ? `${currentSong.artist} - ${currentSong.title}` : "En vivo las 24h";
  const listeners = nowPlaying?.listeners?.current ?? 50;
  const isLive = nowPlaying?.live?.is_live || false;

  return (
    <div className="w-full border-b border-border/40 bg-card/97 backdrop-blur-sm relative z-40 select-none font-sans overflow-hidden shadow-[0_-8px_24px_rgba(0,0,0,0.2)]">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-theme-gradient opacity-70" />
      <audio ref={audioRef} preload="none" />
      <div className="mx-auto w-full max-w-[1600px] flex items-center gap-3 px-3 sm:px-6 py-2">
        {/* DJ Avatar + Name */}
        <div className="flex items-center gap-2.5 flex-shrink-0 min-w-[140px]">
          <div className="relative">
            <img
              src={proxyImage(`https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(currentDj)}&size=b`)}
              alt={currentDj}
              className="w-9 h-12 rounded-lg object-contain bg-secondary border border-border/50"
              onError={(e) => {
                (e.target as HTMLImageElement).src = proxyImage(`https://www.habbo.es/habbo-imaging/avatarimage?user=AutoDJ&size=b`);
              }}
            />
            {isLive && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-[7px] font-black rounded leading-none live-indicator">
                LIVE
              </span>
            )}
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-fuchsia-500 text-white shadow border border-white/30">
              <Mic className="h-2 w-2" />
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-[8px] uppercase tracking-widest text-muted-foreground font-semibold leading-none">
              {isLive ? "DJ En Vivo" : "AutoDJ"}
            </p>
            <p className="text-xs font-black text-foreground truncate max-w-[80px] leading-tight">
              {currentDj}
            </p>
          </div>
        </div>

        {/* Current Song */}
        <div className="flex-1 min-w-[120px] max-w-md hidden sm:block border-l border-border/20 pl-3.5">
          <p className="text-[8px] uppercase tracking-widest text-muted-foreground font-semibold leading-none">
            Canción Actual
          </p>
          <p className="text-xs font-semibold text-foreground/90 truncate leading-tight mt-0.5">
            {songTitle}
          </p>
        </div>

        {/* Listeners */}
        <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1.5 rounded-full border border-primary/20 text-[11px] font-bold text-primary flex-shrink-0">
          <Headphones className="w-3 h-3" />
          {listeners}
        </div>

        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="radio-play-btn w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md shrink-0 hover:scale-105 active:scale-95"
          aria-label={isPlaying ? "Pausar" : "Reproducir"}
        >
          {isPlaying ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
        </button>

        {/* Volume */}
        <div className="hidden md:flex items-center gap-1.5 border-l border-border/20 pl-3.5 flex-shrink-0">
          <button onClick={() => setIsMuted(!isMuted)} className="text-muted-foreground hover:text-foreground transition-colors">
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <Slider value={[isMuted ? 0 : volume]} onValueChange={([v]) => { setVolume(v); setIsMuted(false); }} max={100} step={1} className="w-14 h-1" />
        </div>

        {/* Program Progress */}
        <div className="hidden lg:flex items-center gap-2 border-l border-border/20 pl-3.5 flex-shrink-0">
          <span className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1">
            <Clock className="w-3 h-3" /> ON AIR
          </span>
          <div className="h-1 w-20 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${(nowDate.getSeconds() / 60) * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
