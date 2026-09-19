import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Wrench,
  Radio,
  Lock,
  Eye,
  EyeOff,
  Headphones,
  Music,
  Activity,
  Server,
  Database,
  ShieldCheck,
  Disc,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export default function MaintenancePage() {
  const { login } = useAuth();
  const { toast } = useToast();

  // Audio Stream State
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);

  // Staff Login Modal State
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Progress Bar simulation
  const [progress, setProgress] = useState(82);

  const streamUrl = "https://streaming.habbospeed.com/radio.mp3";

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      audio.src = "";
      setIsPlaying(false);
    } else {
      audio.src = streamUrl;
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoggingIn(true);
    try {
      await login(email, password);
      toast({
        title: "¡Acceso Concedido!",
        description: "Bienvenido al Panel de Administración.",
      });
      setShowStaffModal(false);
      window.location.href = "/panel";
    } catch (err: any) {
      toast({
        title: "Acceso denegado",
        description: err?.message || "Credenciales de staff inválidas",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070c18] text-white flex flex-col font-sans select-none relative overflow-hidden">
      <audio ref={audioRef} preload="none" />

      {/* Cyber Grid Background */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(#06b6d4 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Ambient Glow Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* 1. Caution Hazard Ribbon Header */}
      <div className="w-full bg-[#f59e0b] text-slate-950 font-black text-[11px] py-1 px-4 flex items-center justify-between tracking-widest overflow-hidden shadow-md relative z-20">
        <div className="flex items-center gap-4 animate-marquee whitespace-nowrap">
          <span>⚠️ MANTENIMIENTO PROGRAMADO HABBOSPEED</span>
          <span>·</span>
          <span>ACTUALIZACIÓN DE SERVIDORES 2026</span>
          <span>·</span>
          <span>RADIO 24/7 EN VIVO</span>
          <span>·</span>
          <span>DISCULPEN LAS MOLESTIAS</span>
          <span>·</span>
          <span>⚠️ MANTENIMIENTO PROGRAMADO HABBOSPEED</span>
          <span>·</span>
          <span>ACTUALIZACIÓN DE SERVIDORES 2026</span>
        </div>
      </div>

      {/* Contenedor Principal */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-4xl mx-auto w-full relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>HabboSpeed Versión 1.0</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow flex items-center justify-center gap-2">
            <span>h</span>
            <span className="text-cyan-400 underline decoration-cyan-500/40">Speed</span>
            <span className="text-amber-400 ml-1 font-mono text-2xl sm:text-3xl">· Offline</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Estamos aplicando mejoras de rendimiento, optimizando la base de datos de furnis y renovando la experiencia para toda la comunidad. ¡Volvemos en breve!
          </p>
        </div>

        {/* 2. Escena Isométrica de Constructores Habbo */}
        <div className="relative w-full max-w-lg bg-[#0b1424]/90 border border-cyan-500/20 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col items-center justify-center text-center">
          {/* Sombra de suelo */}
          <div className="flex items-end justify-center gap-6 sm:gap-12 relative w-full h-36">
            {/* Frank el Bot / Constructor */}
            <div className="flex flex-col items-center relative group">
              <div className="w-16 h-3 bg-black/60 rounded-full blur-[2px] absolute bottom-0"></div>
              <img
                src="https://www.habbo.es/habbo-imaging/avatarimage?user=Frank&action=wlk&direction=2&head_direction=2&gesture=sml&size=l"
                alt="Frank Constructor"
                className="h-32 w-auto object-contain relative z-10 group-hover:scale-105 transition-transform drop-shadow"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/habbo-radio/frank_small_03.gif";
                }}
              />
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full mt-1">
                Frank el Bot
              </span>
            </div>

            {/* Ícono central de Mantenimiento con Engranaje Giratorio */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-inner relative">
                <Wrench className="w-8 h-8 text-cyan-400 animate-pulse" />
              </div>
              <span className="text-[10px] font-black text-slate-300 mt-2">
                Trabajos en Curso
              </span>
            </div>

            {/* Bot Builder / Técnico */}
            <div className="flex flex-col items-center relative group">
              <div className="w-16 h-3 bg-black/60 rounded-full blur-[2px] absolute bottom-0"></div>
              <img
                src="https://www.habbo.es/habbo-imaging/avatarimage?user=PixelMaster&action=drk=1&direction=4&head_direction=4&gesture=sml&size=l"
                alt="Técnico"
                className="h-32 w-auto object-contain relative z-10 group-hover:scale-105 transition-transform drop-shadow"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/habbo-radio/frank_small_03.gif";
                }}
              />
              <span className="text-[9px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded-full mt-1">
                Pixel Builder
              </span>
            </div>
          </div>

          {/* Barra de Progreso */}
          <div className="w-full mt-6 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold px-1">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>Progreso de sincronización</span>
              </span>
              <span className="text-cyan-400 font-mono font-black">{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-400 rounded-full transition-all duration-700 shadow-sm shadow-cyan-500/50"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3. Reproductor DJ de Radio en Vivo (La Radio Sigue 24/7) */}
        <div className="w-full max-w-lg bg-[#0e1626] border border-white/10 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* DJ Avatar Box */}
            <div className="w-12 h-12 rounded-xl bg-cyan-400 flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-inner border border-cyan-300">
              <img
                src="https://www.habbo.es/habbo-imaging/avatarimage?user=DinhuLOL&headonly=1&size=m"
                alt="DJ"
                className="w-10 h-10 object-contain translate-y-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/habbo-radio/frank_small_03.gif";
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="bg-rose-500 text-white text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full tracking-wider">
                  RADIO EN VIVO
                </span>
                <span className="text-[9px] text-cyan-400 font-bold">102 oyentes</span>
              </div>
              <h4 className="text-xs font-black text-white truncate">
                Dua Lipa - Houdini
              </h4>
              <p className="text-[10px] text-slate-400 truncate">
                DJ DinhuLOL · ¡La mejor música no se detiene!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Equalizer Bars */}
            <div className="flex items-end gap-0.5 h-4">
              <span className={`w-1 bg-cyan-400 rounded-full transition-all ${isPlaying ? "h-4 animate-bounce" : "h-1"}`} />
              <span className={`w-1 bg-cyan-400 rounded-full transition-all ${isPlaying ? "h-3 animate-pulse" : "h-2"}`} />
              <span className={`w-1 bg-cyan-400 rounded-full transition-all ${isPlaying ? "h-4 animate-bounce" : "h-1"}`} />
            </div>

            <button
              onClick={togglePlay}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer ${
                isPlaying
                  ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30"
                  : "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/30"
              }`}
              title={isPlaying ? "Pausar Radio" : "Escuchar Radio en Vivo"}
            >
              <i className={`fa-solid ${isPlaying ? "fa-pause" : "fa-play"} text-xs ${!isPlaying ? "ml-0.5" : ""}`}></i>
            </button>
          </div>
        </div>

        {/* 4. Diagnósticos de Servidores */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-lg">
          <div className="bg-[#0b1424]/70 border border-white/5 p-2.5 rounded-xl text-center">
            <Radio className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <span className="text-[9px] text-slate-400 block">Radio Stream</span>
            <span className="text-[10px] font-black text-emerald-400 uppercase">Online</span>
          </div>

          <div className="bg-[#0b1424]/70 border border-white/5 p-2.5 rounded-xl text-center">
            <Server className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <span className="text-[9px] text-slate-400 block">Web Core</span>
            <span className="text-[10px] font-black text-amber-400 uppercase">Mantenimiento</span>
          </div>

          <div className="bg-[#0b1424]/70 border border-white/5 p-2.5 rounded-xl text-center">
            <Database className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <span className="text-[9px] text-slate-400 block">Catálogo</span>
            <span className="text-[10px] font-black text-cyan-400 uppercase">Sincronizando</span>
          </div>

          <div className="bg-[#0b1424]/70 border border-white/5 p-2.5 rounded-xl text-center">
            <ShieldCheck className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <span className="text-[9px] text-slate-400 block">Anti-DDoS</span>
            <span className="text-[10px] font-black text-purple-400 uppercase">Activo</span>
          </div>
        </div>

        {/* 5. Footer de la pantalla & Acceso Staff Modal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-lg pt-4 border-t border-white/10 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <a
              href="https://discord.gg"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1 font-bold"
            >
              <i className="fa-brands fa-discord text-cyan-400"></i>
              <span>Discord</span>
            </a>
            <span>·</span>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1 font-bold"
            >
              <i className="fa-brands fa-twitter text-cyan-400"></i>
              <span>Twitter</span>
            </a>
            <span>·</span>
            <a
              href="https://www.habbo.es"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1 font-bold"
            >
              <ExternalLink className="w-3 h-3 text-cyan-400" />
              <span>Habbo Hotel</span>
            </a>
          </div>

          {/* Modal de Acceso Staff */}
          <Dialog open={showStaffModal} onOpenChange={setShowStaffModal}>
            <DialogTrigger asChild>
              <button className="text-slate-500 hover:text-slate-300 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer">
                <Lock className="w-3 h-3" />
                <span>Acceso Staff</span>
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#0e1626] border border-white/15 text-white max-w-sm rounded-2xl p-6">
              <DialogHeader>
                <DialogTitle className="text-sm font-black flex items-center gap-2 text-white">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <span>Acceso para Administradores</span>
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleStaffLogin} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Email Staff</label>
                  <Input
                    type="email"
                    placeholder="admin@habbospeed.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border-white/10 text-xs h-9"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Contraseña</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/5 border-white/10 text-xs h-9 pr-8"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs py-2 rounded-xl"
                >
                  {isLoggingIn ? "Verificando..." : "Ingresar al Panel"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

