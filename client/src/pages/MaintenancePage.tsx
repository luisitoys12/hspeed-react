import { useState, useEffect, useRef } from "react";
import { Settings, Wrench, Radio, Lock, Eye, EyeOff, Headphones, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

/* ======================================
   MAINTENANCE PAGE — HabboSpeed "En Construcción"
   Shows: Logo + message, Radio player, Staff Login
   NO navbar, NO footer — standalone fullscreen
   ====================================== */

function MiniRadioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);

  const streamUrl = "https://stream.zeno.fm/fy0189xhb0hvv"; // Placeholder stream

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.src = streamUrl;
      audio.volume = volume;
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3" data-testid="maintenance-radio">
      <audio ref={audioRef} />
      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
            isPlaying
              ? "bg-red-500 hover:bg-red-600 shadow-red-500/30 animate-pulse"
              : "bg-primary hover:bg-primary/80 shadow-primary/30"
          }`}
          data-testid="button-radio-toggle"
        >
          {isPlaying ? (
            <Headphones className="w-6 h-6 text-white" />
          ) : (
            <Radio className="w-6 h-6 text-white" />
          )}
        </button>
      </div>
      <div className="flex items-center gap-2">
        <Music className="w-3 h-3 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
          {isPlaying ? "Escuchando HabboSpeed Radio" : "Escuchar Radio"}
        </span>
      </div>
      {isPlaying && (
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            setVolume(v);
            if (audioRef.current) audioRef.current.volume = v;
          }}
          className="w-32 h-1 accent-primary cursor-pointer"
          data-testid="input-radio-volume"
        />
      )}
    </div>
  );
}

function StaffLoginForm() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    try {
      await login(email, password);
      toast({ title: "Acceso concedido", description: "Bienvenido al panel staff" });
      // After login, the App will redirect based on maintenance mode logic
      window.location.hash = "#/panel";
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Credenciales inválidas", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3" data-testid="staff-login-form">
      <div className="flex items-center gap-2 justify-center mb-2">
        <Lock className="w-3.5 h-3.5 text-primary" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          Acceso Staff
        </span>
      </div>
      <Input
        type="email"
        placeholder="Email staff"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-9 text-xs bg-secondary/50 border-border/50 focus:border-primary/50"
        data-testid="input-staff-email"
      />
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-9 text-xs bg-secondary/50 border-border/50 focus:border-primary/50 pr-9"
          data-testid="input-staff-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>
      <Button
        type="submit"
        className="w-full h-9 text-xs bg-primary hover:bg-primary/80"
        disabled={isLoading || !email || !password}
        data-testid="button-staff-login"
      >
        {isLoading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}

export default function MaintenancePage() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/20"
            style={{
              left: `${15 + i * 15}%`,
              top: `${10 + (i * 20) % 80}%`,
              animation: `float ${4 + i}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full space-y-8">
        {/* Logo + Brand */}
        <div className="space-y-4">
          <div className="relative mx-auto w-20 h-20">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
              <Settings className="w-10 h-10 text-primary animate-spin" style={{ animationDuration: "10s" }} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-yellow-500/10 border-2 border-yellow-500/20 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-yellow-400" />
            </div>
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight" data-testid="text-maintenance-title">
              HabboSpeed
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Estamos trabajando en mejoras{dots}
            </p>
          </div>
        </div>

        {/* Status pills */}
        <div className="flex gap-2 flex-wrap justify-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-medium text-green-400">Radio Online</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            <span className="text-[10px] font-medium text-yellow-400">Web en Mantenimiento</span>
          </div>
        </div>

        {/* Radio Player */}
        <div className="w-full p-5 rounded-xl bg-card/50 border border-border/50 backdrop-blur">
          <MiniRadioPlayer />
        </div>

        {/* Staff Login */}
        <div className="w-full p-5 rounded-xl bg-card/50 border border-border/50 backdrop-blur">
          <StaffLoginForm />
        </div>

        {/* Footer */}
        <p className="text-[9px] text-muted-foreground/40">
          HabboSpeed © {new Date().getFullYear()} · Volveremos pronto
        </p>
      </div>

      {/* Float animation keyframes */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) scale(1); opacity: 0.3; }
          100% { transform: translateY(-20px) scale(1.5); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
