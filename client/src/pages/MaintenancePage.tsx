import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Music,
  Activity,
  Server,
  Database,
  ShieldCheck,
  Sparkles,
  Search,
  Settings,
  Play,
  Pause,
} from "lucide-react";

export default function MaintenancePage() {
  const { login } = useAuth();
  const { toast } = useToast();

  // Audio Stream State
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);

  // Live Radio Now Playing data
  const { data: nowPlaying } = useQuery<any>({
    queryKey: ["/api/nowplaying"],
    refetchInterval: 10000,
    retry: false,
  });

  const songTitle =
    typeof nowPlaying?.song === "string"
      ? nowPlaying.song
      : typeof nowPlaying?.title === "string"
      ? nowPlaying.title
      : "Dua Lipa - Houdini";
  const djName =
    typeof nowPlaying?.dj === "string"
      ? nowPlaying.dj
      : typeof nowPlaying?.djName === "string"
      ? nowPlaying.djName
      : "DJ DinhuLOL";
  const listenersCount =
    typeof nowPlaying?.listeners === "object" && nowPlaying?.listeners !== null
      ? (nowPlaying.listeners.current ?? 102)
      : typeof nowPlaying?.listeners === "number"
      ? nowPlaying.listeners
      : 102;
  const streamUrl =
    typeof nowPlaying?.listenUrl === "string" && nowPlaying.listenUrl
      ? nowPlaying.listenUrl
      : "https://streaming.habbospeed.com/radio.mp3";

  // Staff Login Modal State
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Progress Bar simulation
  const [progress, setProgress] = useState(82);

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
    <div className="min-h-screen text-slate-800 dark:text-slate-100 flex flex-col font-sans select-none relative overflow-x-hidden">
      <audio ref={audioRef} preload="none" />

      {/* Isometric Habbo City Background Wallpaper */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: `url('/habbo-city-bg.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[0.5px]" />
      </div>

      {/* 1. Caution Top Ribbon Banner */}
      <div className="w-full bg-[#f59e0b] text-slate-950 font-black text-[11px] sm:text-xs py-1.5 px-4 flex items-center justify-center tracking-wide overflow-hidden shadow-sm relative z-30">
        <div className="flex items-center gap-3 sm:gap-6 whitespace-nowrap overflow-x-auto no-scrollbar">
          <span>• Mantenimiento Programado hSpeed 2026</span>
          <span>• Radio 24/7 en Vivo</span>
          <span>• Actualización de Servidores</span>
        </div>
      </div>

      {/* 2. Top Golden Sub-Bar */}
      <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 mt-2 sm:mt-3 relative z-20">
        <div className="bg-[#b38634] text-white rounded-xl p-2 sm:p-2.5 flex items-center justify-between gap-3 shadow-lg border border-[#cfa448]/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <button className="bg-[#eab308] hover:bg-[#facc15] text-slate-950 text-[10px] font-black px-3 py-1 rounded-lg shadow-xs transition-colors shrink-0">
              Sub-Bar
            </button>
            <div className="flex items-center gap-2 text-[11px] font-bold truncate">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-amber-50">Radio • LIVE • AO VIVO</span>
              </span>
              <span className="text-amber-200/60 hidden sm:inline">|</span>
              <span className="text-amber-100 text-[10px] hidden sm:inline">{listenersCount} listeners</span>
            </div>
          </div>

          {/* Logo Center */}
          <div className="text-center font-black tracking-tight text-lg sm:text-xl flex items-center gap-1 drop-shadow">
            <span className="text-slate-950">h</span>
            <span className="text-cyan-300">Speed</span>
          </div>

          {/* Icons Right */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="w-7 h-7 rounded-full bg-black/20 flex items-center justify-center text-amber-100 hover:bg-black/30 cursor-pointer transition-colors">
              <Search className="w-3.5 h-3.5" />
            </div>
            <div className="w-7 h-7 rounded-full bg-black/20 flex items-center justify-center text-amber-100 hover:bg-black/30 cursor-pointer transition-colors">
              <Settings className="w-3.5 h-3.5" />
            </div>
            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-xs">
              <span className="w-2 h-2 rounded-full bg-white" />
            </div>
            <div className="w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-xs">
              <span className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Central Card Container (Spacious on PC and Mobile) */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 lg:p-10 w-full max-w-4xl mx-auto relative z-10 my-auto">
        <div className="w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-8 lg:p-10 space-y-6 backdrop-blur-md transition-all">
          {/* Header Brand */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 text-[10px] font-black uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3 h-3 text-cyan-500 animate-spin" />
              <span>HABBOSPEED VERSIÓN 1.0</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <span className="text-slate-800 dark:text-slate-100">h</span>
              <span className="text-cyan-500 underline decoration-cyan-400/40">Speed</span>
              <span className="text-slate-800 dark:text-slate-100 font-bold"> - Offline</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              Estamos aplicando mejoras de rendimiento, optimizando la base de datos de furnis y renovando la experiencia para toda la comunidad. ¡Volvemos en breve!
            </p>
          </div>

          {/* Avatars Area: habbospeed & ser03z-51 */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-700/70 rounded-3xl p-4 sm:p-6 shadow-inner">
            <div className="flex items-end justify-around relative w-full h-36 sm:h-44">
              {/* Left Avatar: habbospeed */}
              <div className="flex flex-col items-center relative group">
                <div className="w-16 h-3 bg-black/25 rounded-full blur-[2px] absolute bottom-0"></div>
                <img
                  src="https://www.habbo.es/habbo-imaging/avatarimage?user=habbospeed&action=std&direction=2&head_direction=2&gesture=sml&size=l"
                  alt="habbospeed"
                  className="h-32 sm:h-38 w-auto object-contain relative z-10 group-hover:scale-105 transition-transform drop-shadow"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://www.habbo.com/habbo-imaging/avatarimage?user=habbospeed&action=std&direction=2&head_direction=2&gesture=sml&size=l";
                  }}
                />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-200 bg-amber-400/25 border border-amber-500/40 px-3.5 py-0.5 rounded-full mt-2 shadow-xs">
                  habbospeed
                </span>
              </div>

              {/* Center Tool / Wrench Box */}
              <div className="flex flex-col items-center justify-center my-auto">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-cyan-100/70 dark:bg-cyan-950/60 border border-cyan-300/80 dark:border-cyan-800 flex items-center justify-center shadow-xs">
                  <Wrench className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-600 dark:text-cyan-400 animate-pulse" />
                </div>
                <span className="text-[10px] sm:text-xs font-black text-slate-700 dark:text-slate-300 mt-2">
                  Trabajos en Curso
                </span>
              </div>

              {/* Right Avatar: ser03z-51 */}
              <div className="flex flex-col items-center relative group">
                <div className="w-16 h-3 bg-black/25 rounded-full blur-[2px] absolute bottom-0"></div>
                <img
                  src="https://www.habbo.es/habbo-imaging/avatarimage?user=ser03z-51&action=std&direction=4&head_direction=4&gesture=sml&size=l"
                  alt="ser03z-51"
                  className="h-32 sm:h-38 w-auto object-contain relative z-10 group-hover:scale-105 transition-transform drop-shadow"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://www.habbo.com/habbo-imaging/avatarimage?user=ser03z-51&action=std&direction=4&head_direction=4&gesture=sml&size=l";
                  }}
                />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-200 bg-amber-400/25 border border-amber-500/40 px-3.5 py-0.5 rounded-full mt-2 shadow-xs">
                  ser03z-51
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full mt-6 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold px-1">
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-bold">
                  <Activity className="w-3.5 h-3.5 text-cyan-500 animate-spin" />
                  <span>Progreso de sincronización</span>
                </span>
                <span className="text-cyan-600 dark:text-cyan-400 font-mono font-black">{progress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700/80 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-400 rounded-full transition-all duration-700 shadow-sm shadow-cyan-500/30"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Radio Player Capsule (Fiel al diseño exacto de la imagen) */}
          <div className="w-full bg-slate-950 text-white rounded-2xl p-3.5 sm:p-4 border border-slate-800 shadow-xl flex items-center justify-between gap-3 sm:gap-4 transition-all">
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
              {/* Cover / Vinyl Thumbnail */}
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-inner">
                <img
                  src="/habbo-radio/estampa_audifonos_dj.png"
                  alt="Radio"
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-cyan-500/10 flex items-center justify-center">
                  <Music className="w-4 h-4 text-cyan-400" />
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="bg-rose-500 text-white text-[8px] sm:text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shadow-xs">
                    RADIO EN VIVO
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{listenersCount} listeners</span>
                </div>
                <h4 className="text-xs sm:text-sm font-black text-white truncate">
                  {songTitle}
                </h4>
                <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                  {djName} · ¡La mejor música no se detiene!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
              {/* Equalizer Bars */}
              <div className="flex items-end gap-0.5 sm:gap-1 h-5">
                <span className={`w-1 bg-cyan-400 rounded-full transition-all ${isPlaying ? "h-5 animate-bounce" : "h-1.5"}`} />
                <span className={`w-1 bg-cyan-400 rounded-full transition-all ${isPlaying ? "h-3.5 animate-pulse" : "h-2"}`} />
                <span className={`w-1 bg-cyan-400 rounded-full transition-all ${isPlaying ? "h-5 animate-bounce" : "h-1.5"}`} />
                <span className={`w-1 bg-cyan-400 rounded-full transition-all ${isPlaying ? "h-4 animate-pulse" : "h-2.5"}`} />
              </div>

              {/* Big Green Play / Pause Button */}
              <button
                onClick={togglePlay}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 cursor-pointer ${
                  isPlaying
                    ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30 ring-4 ring-rose-500/20"
                    : "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/40 ring-4 ring-emerald-500/20"
                }`}
                title={isPlaying ? "Pausar Radio" : "Escuchar Radio en Vivo"}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-white" />
                ) : (
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                )}
              </button>
            </div>
          </div>

          {/* 4 Status Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/70 p-3 rounded-2xl text-center shadow-xs">
              <Radio className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">Radio Stream</span>
              <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase">ONLINE</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/70 p-3 rounded-2xl text-center shadow-xs">
              <Server className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">Web Core</span>
              <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase">MANTENIMIENTO</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/70 p-3 rounded-2xl text-center shadow-xs">
              <Database className="w-4 h-4 text-cyan-500 mx-auto mb-1" />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">Catálogo</span>
              <span className="text-[11px] font-black text-cyan-600 dark:text-cyan-400 uppercase">SINCRONIZANDO</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/70 p-3 rounded-2xl text-center shadow-xs">
              <ShieldCheck className="w-4 h-4 text-purple-500 mx-auto mb-1" />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">Anti-DDoS</span>
              <span className="text-[11px] font-black text-purple-600 dark:text-purple-400 uppercase">ACTIVO</span>
            </div>
          </div>

          {/* Footer inside card & Staff Access Modal */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3 font-semibold">
              <a
                href="https://discord.gg"
                target="_blank"
                rel="noreferrer"
                className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5"
              >
                <i className="fa-brands fa-discord text-cyan-500"></i>
                <span>Discord</span>
              </a>
              <span>•</span>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5"
              >
                <i className="fa-brands fa-twitter text-cyan-500"></i>
                <span>Twitter</span>
              </a>
              <span>•</span>
              <a
                href="https://www.habbo.es"
                target="_blank"
                rel="noreferrer"
                className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5"
              >
                <span>Habbo Hotel</span>
              </a>
            </div>

            {/* Staff Access Modal Trigger */}
            <Dialog open={showStaffModal} onOpenChange={setShowStaffModal}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-xs font-bold cursor-pointer">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Acceso Staff</span>
                </button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-sm font-black flex items-center gap-2 text-foreground">
                    <Lock className="w-4 h-4 text-cyan-500" />
                    <span>Acceso para Administradores</span>
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleStaffLogin} className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground">Email Staff</label>
                    <Input
                      type="email"
                      placeholder="admin@habbospeed.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-xs h-9"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground">Contraseña</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="text-xs h-9 pr-8"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs py-2 rounded-xl"
                  >
                    {isLoggingIn ? "Verificando..." : "Ingresar al Panel"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>
    </div>
  );
}
