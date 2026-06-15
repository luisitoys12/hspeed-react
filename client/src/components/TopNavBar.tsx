import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { proxyImage } from "@/lib/habboProxy";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Menu, X, LogIn, UserPlus, User, Settings, LogOut, ChevronDown, Mail, Headphones, Clock, Home, Newspaper, Calendar, MessageSquare, Award, TrendingUp, Users, Shirt, Wrench, ShoppingCart, Play, Square, Volume2, VolumeX, Megaphone, Gift
} from "lucide-react";

const DAYS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function getProgramProgress(startTime: string, endTime: string) {
  const now = new Date();
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const totalMin = endMin > startMin ? endMin - startMin : 1440 - startMin + endMin;
  const elapsedMin = nowMin >= startMin ? nowMin - startMin : 1440 - startMin + nowMin;
  if (totalMin <= 0) return 50;
  return Math.max(0, Math.min(100, (elapsedMin / totalMin) * 100));
}

function NavLink({ href, label }: { href: string; label: string }) {
  const [location] = useLocation();
  const isActive = href === "/" ? location === "/" : location.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "text-xs font-bold uppercase tracking-wider transition-colors py-2 flex items-center gap-1 cursor-pointer",
        isActive
          ? "text-primary border-b-2 border-primary"
          : "text-slate-600 hover:text-slate-900"
      )}
    >
      <span>{label}</span>
      <ChevronDown className="w-3 h-3 opacity-50" />
    </Link>
  );
}

export default function TopNavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, isAdmin, token } = useAuth();
  const isDjOrAdmin = user && (user.role === "admin" || user.role === "dj");
  const { toast } = useToast();
  const [location] = useLocation();

  const [footballMode, setFootballMode] = useState<boolean>(() => {
    try { return localStorage.getItem("footballMode") === "1"; } catch { return false; }
  });

  useEffect(() => {
    try {
      if (footballMode) document.documentElement.classList.add("football-mode");
      else document.documentElement.classList.remove("football-mode");
      localStorage.setItem("footballMode", footballMode ? "1" : "0");
    } catch (e) {}
  }, [footballMode]);

  // Queries para datos de reproducción
  const { data: nowPlaying } = useQuery<any>({
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

  const { data: scheduleData } = useQuery<any[]>({
    queryKey: ["/api/schedule"],
    retry: false,
    staleTime: 60000,
  });

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/messages/unread"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/messages/unread", undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    enabled: !!user,
    refetchInterval: 30000,
    retry: false,
  });
  const unreadCount = unreadData?.count || 0;

  // Estados de reproducción de Audio
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    const listenUrl = nowPlaying?.station?.listen_url || siteConfig?.listenUrl;
    if (!listenUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.src = "";
      setIsPlaying(false);
      return;
    }

    audioRef.current.src = listenUrl;
    audioRef.current.play().catch(() => {});
    setIsPlaying(true);
  };

  // Cálculo de datos del reproductor
  const rawDj = nowPlaying?.live?.streamer_name || djPanel?.currentDj || "HabboSpeed";
  const isAutoDj = !rawDj || ["autodj", "auto dj", "azuracast autodj", "habbospeed"].includes(rawDj.toLowerCase());
  const currentDj = isAutoDj ? "HabboSpeed" : rawDj;
  const nextDj = djPanel?.nextDj || "Dj_Invitado";
  const currentSong = nowPlaying?.now_playing?.song;
  const songTitle = currentSong?.artist && currentSong?.title ? `${currentSong.artist} - ${currentSong.title}` : "Wulf - All Things Under The Sun";
  const listeners = nowPlaying?.listeners?.current ?? 50;

  const today = DAYS_ES[new Date().getDay()];
  const currentSchedule = useMemo(
    () => (scheduleData || []).find((item) => item.day === today),
    [scheduleData, today]
  );
  const programStart = currentSchedule?.startTime || "01:00";
  const programEnd = currentSchedule?.endTime || "02:00";
  const programProgress = currentSchedule ? getProgramProgress(programStart, programEnd) : 12;

  // Modales
  const [showPeticionesModal, setShowPeticionesModal] = useState(false);
  const [showSaludosModal, setShowSaludosModal] = useState(false);

  const [peticionForm, setPeticionForm] = useState({ songTitle: "", artist: "", details: "" });
  const [saludoForm, setSaludoForm] = useState({ details: "" });

  const handleSendPeticion = async () => {
    if (!peticionForm.songTitle.trim() || !peticionForm.artist.trim()) {
      toast({ title: "Error", description: "Por favor rellena canción y artista", variant: "destructive" });
      return;
    }
    try {
      const response = await apiRequest("POST", "/api/requests", {
        type: "cancion",
        userName: user?.displayName || "Invitado",
        details: `${peticionForm.artist.trim()} - ${peticionForm.songTitle.trim()} (${peticionForm.details.trim()})`,
      });
      if (response.ok) {
        toast({ title: "¡Petición enviada!", description: "Tu canción ha sido agregada a la cola" });
        setPeticionForm({ songTitle: "", artist: "", details: "" });
        setShowPeticionesModal(false);
      }
    } catch (err) {
      toast({ title: "Error", description: "No se pudo enviar la petición", variant: "destructive" });
    }
  };

  const handleSendSaludo = async () => {
    if (!saludoForm.details.trim()) {
      toast({ title: "Error", description: "Por favor escribe un mensaje", variant: "destructive" });
      return;
    }
    try {
      const response = await apiRequest("POST", "/api/requests", {
        type: "saludo",
        userName: user?.displayName || "Invitado",
        details: saludoForm.details.trim(),
      });
      if (response.ok) {
        toast({ title: "¡Saludo enviado!", description: "Tu mensaje ha sido enviado al DJ de turno." });
        setSaludoForm({ details: "" });
        setShowSaludosModal(false);
      }
    } catch (err) {
      toast({ title: "Error", description: "No se pudo enviar el saludo", variant: "destructive" });
    }
  };

  return (
    <nav className="w-full sticky top-0 z-50 shadow-md flex flex-col font-sans" data-testid="top-nav-bar">
      
      {/* 1. MENÚ BLANCO PREMIUM (Estilo Imagen 2) */}
      <div className="bg-white text-slate-800 border-b border-slate-200 h-14 flex items-center px-4 sm:px-6 relative z-50">
        <div className="mx-auto w-full max-w-[1600px] flex items-center justify-between">
          
          {/* Logo y Navegación Principal */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-pixel text-slate-900 tracking-wider font-bold">
              <span className="bg-primary text-white p-1.5 rounded-lg text-xs leading-none">HS</span>
              <span className="hidden sm:inline-block text-xs uppercase tracking-widest">HabboSpeed</span>
            </Link>

            {/* Links Escritorio */}
            <div className="hidden md:flex items-center gap-6">
              <NavLink href="/" label="HOME" />
              <NavLink href="/team" label="HABBORADIO" />
              <NavLink href="/news" label="NEWS" />
              <NavLink href="/schedule" label="RADIO" />
              <NavLink href="/armario" label="HABBO" />
            </div>
          </div>

          {/* Área de Autenticación / Registro */}
          <div className="flex items-center gap-4">
            {/* Toggle Modo Fútbol */}
            <button
              onClick={() => setFootballMode((p) => !p)}
              className="text-slate-500 hover:text-slate-900 transition-colors text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              ⚽ {footballMode ? "Fútbol On" : "Fútbol Off"}
            </button>

            {user ? (
              <div className="flex items-center gap-3 relative">
                {/* Dropdown Botón */}
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
                >
                  <img
                    src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(user.habboUsername || user.displayName)}&size=s&headonly=1`}
                    alt={user.displayName}
                    className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/habbo-radio/frank_small_03.gif"; }}
                  />
                  <span className="hidden sm:inline-block text-xs font-bold text-slate-700 uppercase tracking-wider">{user.displayName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Contenido */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 animate-fade-in">
                    <Link
                      href={`/profile/${user.habboUsername || user.displayName}`}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-3.5 h-3.5" />
                      MI PERFIL
                    </Link>
                    <Link
                      href="/messages"
                      className="flex items-center justify-between px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <span className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5" />
                        MENSAJES
                      </span>
                      {unreadCount > 0 && (
                        <Badge className="bg-primary text-white text-[9px] px-1.5 py-0.5">{unreadCount}</Badge>
                      )}
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/panel"
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="w-3.5 h-3.5" />
                        PANEL ADMIN
                      </Link>
                    )}
                    {isDjOrAdmin && (
                      <Link
                        href="/djpanel"
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Headphones className="w-3.5 h-3.5" />
                        PANEL DJ
                      </Link>
                    )}
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors border-t border-slate-100 text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      CERRAR SESIÓN
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-wider">
                  Sign In
                </Link>
                <img
                  src="https://www.habbo.es/habbo-imaging/avatarimage?user=HabboSpeed&size=s&headonly=1"
                  alt="Sign in"
                  className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 object-contain"
                />
              </div>
            )}

            {/* Hamburguesa Móvil */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. REPRODUCTOR DE RADIO HORIZONTAL AZUL OSCURO (Estilo Imagen 2) */}
      <div className="bg-[#0b0632] text-white border-b border-white/5 py-2 px-4 sm:px-6 relative z-40 select-none font-sans overflow-hidden">
        <audio ref={audioRef} preload="none" />
        <div className="mx-auto w-full max-w-[1600px] flex flex-wrap items-center justify-between gap-3">
          
          {/* DJ de Turno */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#140b49] border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
              <img
                src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(currentDj)}&size=b`}
                alt={currentDj}
                className="absolute top-[-10px] w-12 h-16 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).src = "/habbo-radio/frank_small_03.gif"; }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold text-white/50 uppercase tracking-wider leading-none">CURRENT DJ</p>
              <p className="text-xs font-black text-white truncate max-w-[90px] mt-0.5" title={currentDj}>{currentDj}</p>
            </div>
          </div>

          {/* Canción en Reproducción */}
          <div className="flex-1 min-w-[150px] max-w-md hidden sm:block border-l border-white/10 pl-3.5">
            <p className="text-[9px] font-bold text-white/50 uppercase tracking-wider leading-none">CURRENT SONG</p>
            <p className="text-xs font-semibold text-white/90 truncate mt-0.5" title={songTitle}>{songTitle}</p>
          </div>

          {/* Oyentes */}
          <div className="flex items-center gap-1.5 bg-[#140b49] px-2.5 py-1.5 rounded-full border border-white/5 text-[11px] font-bold text-[#26d7ff]">
            <Headphones className="w-3.5 h-3.5" />
            <span>{listeners}</span>
          </div>

          {/* Botón Circular Play/Pause */}
          <button
            onClick={togglePlay}
            className="w-8.5 h-8.5 rounded-full bg-[#f43f5e] hover:bg-[#e11d48] text-white flex items-center justify-center transition-all shadow-md shrink-0 hover:scale-105 active:scale-95"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Square className="w-3 h-3 fill-white" /> : <Play className="w-3 h-3 fill-white ml-0.5" />}
          </button>

          {/* Deslizador de Volumen */}
          <div className="hidden md:flex items-center gap-2 border-l border-white/10 pl-3.5">
            <button onClick={() => setIsMuted(!isMuted)} className="text-white/60 hover:text-white transition-colors">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }}
              className="w-16 h-1 rounded-full accent-cyan-400 bg-white/20 appearance-none cursor-pointer"
            />
          </div>

          {/* Iconos de Acción Rápida (Peticiones, Saludos, Foro) */}
          <div className="flex items-center gap-2 bg-[#140b49] px-2 py-1 rounded-lg border border-white/5">
            <Link href="/forum" className="text-white/60 hover:text-[#26d7ff] p-1 transition-colors" title="Chat/Foro">
              <MessageSquare className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setShowPeticionesModal(true)}
              className="text-white/60 hover:text-[#26d7ff] p-1 transition-colors"
              title="Peticiones"
            >
              <Megaphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSaludosModal(true)}
              className="text-white/60 hover:text-[#26d7ff] p-1 transition-colors"
              title="Saludos / Mensaje"
            >
              <Gift className="w-4 h-4" />
            </button>
          </div>

          {/* Barra de Progreso del Programa */}
          <div className="hidden lg:flex items-center gap-2.5 flex-1 max-w-[280px] border-l border-white/10 pl-3.5">
            <div className="flex items-center gap-1 text-[9px] font-bold text-white/50 uppercase tracking-wider">
              <Clock className="w-3 h-3" />
              <span>PROGRAM TIME</span>
            </div>
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="text-[10px] text-white/60 font-semibold">{programStart}</span>
              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#26d7ff] transition-all duration-1000" style={{ width: `${programProgress}%` }} />
              </div>
              <span className="text-[10px] text-white/60 font-semibold">{programEnd}</span>
            </div>
          </div>

          {/* Próximo DJ */}
          <div className="hidden xl:block border-l border-white/10 pl-3.5 text-right min-w-[90px]">
            <p className="text-[9px] font-bold text-white/50 uppercase tracking-wider leading-none">NEXT DJ</p>
            <p className="text-xs font-black text-white/90 truncate mt-0.5 max-w-[100px]" title={nextDj}>{nextDj}</p>
          </div>

        </div>
      </div>

      {/* MENÚ MÓVIL */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white shadow-xl animate-fade-in-up">
          <div className="px-4 py-3 space-y-1">
            <Link href="/" className="block px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded" onClick={() => setMobileMenuOpen(false)}>HOME</Link>
            <Link href="/team" className="block px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded" onClick={() => setMobileMenuOpen(false)}>HABBORADIO</Link>
            <Link href="/news" className="block px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded" onClick={() => setMobileMenuOpen(false)}>NEWS</Link>
            <Link href="/schedule" className="block px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded" onClick={() => setMobileMenuOpen(false)}>RADIO</Link>
            <Link href="/armario" className="block px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded" onClick={() => setMobileMenuOpen(false)}>HABBO</Link>
          </div>
        </div>
      )}

      {/* MODAL PETICIONES */}
      <Dialog open={showPeticionesModal} onOpenChange={setShowPeticionesModal}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Enviar Petición de Canción
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label htmlFor="nav-song-title" className="text-xs text-muted-foreground mb-1.5 block">
                Nombre de la canción
              </Label>
              <input
                id="nav-song-title"
                type="text"
                placeholder="Ej: Levitating"
                className="w-full px-3 py-2 text-xs rounded-lg bg-secondary/30 border border-border focus:outline-none focus:border-primary/50 text-foreground"
                value={peticionForm.songTitle}
                onChange={(e) => setPeticionForm({ ...peticionForm, songTitle: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="nav-artist" className="text-xs text-muted-foreground mb-1.5 block">
                Artista
              </Label>
              <input
                id="nav-artist"
                type="text"
                placeholder="Ej: Dua Lipa"
                className="w-full px-3 py-2 text-xs rounded-lg bg-secondary/30 border border-border focus:outline-none focus:border-primary/50 text-foreground"
                value={peticionForm.artist}
                onChange={(e) => setPeticionForm({ ...peticionForm, artist: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="nav-details" className="text-xs text-muted-foreground mb-1.5 block">
                Comentarios
              </Label>
              <Textarea
                id="nav-details"
                placeholder="Escribe alguna aclaración o mensaje especial..."
                rows={3}
                className="text-xs resize-none"
                value={peticionForm.details}
                onChange={(e) => setPeticionForm({ ...peticionForm, details: e.target.value })}
              />
            </div>
            <Button
              onClick={handleSendPeticion}
              className="w-full bg-primary hover:bg-primary/80 text-white text-xs"
            >
              Enviar Petición
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL SALUDOS */}
      <Dialog open={showSaludosModal} onOpenChange={setShowSaludosModal}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Enviar Saludo o Mensaje al Aire
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label htmlFor="nav-saludo-msg" className="text-xs text-muted-foreground mb-1.5 block">
                Mensaje de saludo
              </Label>
              <Textarea
                id="nav-saludo-msg"
                placeholder="Escribe tu saludo o mensaje para que el DJ lo lea al aire..."
                rows={4}
                className="text-xs resize-none"
                value={saludoForm.details}
                onChange={(e) => setSaludoForm({ details: e.target.value })}
              />
            </div>
            <Button
              onClick={handleSendSaludo}
              className="w-full bg-primary hover:bg-primary/80 text-white text-xs"
            >
              Enviar Saludo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </nav>
  );
}
