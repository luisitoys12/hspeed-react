import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

// Subcomponente de enlace de navegación simple
function DirectNavLink({ href, label }: { href: string; label: string }) {
  const [location] = useLocation();
  const isActive = href === "/" ? location === "/" : location.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "text-[11px] font-extrabold uppercase tracking-wider transition-colors py-1.5 border-b-2 border-transparent hover:text-slate-900 hover:border-slate-300 cursor-pointer",
        isActive ? "text-primary border-primary hover:border-primary" : "text-slate-500"
      )}
    >
      {label}
    </Link>
  );
}

// Elemento del dropdown
interface DropdownItem {
  href?: string;
  label: string;
  iconClass: string;
  onClick?: () => void;
}

// Subcomponente Dropdown para menú en Desktop
function NavDropdown({ label, items, activePrefixes }: { label: string; items: DropdownItem[]; activePrefixes: string[] }) {
  const [location] = useLocation();
  const isActive = activePrefixes.some(pref => pref === "/" ? location === "/" : location.startsWith(pref));

  return (
    <div className="relative group py-4">
      <button
        className={cn(
          "text-[11px] font-extrabold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer focus:outline-none",
          isActive ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-900"
        )}
      >
        <span>{label}</span>
        <i className="fa-solid fa-chevron-down text-[8px] opacity-65 group-hover:rotate-180 transition-transform duration-200"></i>
      </button>

      {/* Menú desplegable */}
      <div className="absolute left-0 top-full pt-1 hidden group-hover:block w-56 z-50 animate-fade-in">
        <div className="bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 overflow-hidden">
          {items.map((item, i) => {
            const isItemActive = item.href ? (item.href === "/" ? location === "/" : location.startsWith(item.href)) : false;

            if (item.onClick) {
              return (
                <button
                  key={i}
                  onClick={item.onClick}
                  className={cn(
                    "w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold transition-colors",
                    isItemActive
                      ? "text-primary bg-primary/5"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <i className={cn(item.iconClass, "w-4 text-center text-slate-400 group-hover:text-primary", isItemActive && "text-primary")}></i>
                  <span className="uppercase tracking-wider text-[10px]">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={i}
                href={item.href || "#"}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold transition-colors",
                  isItemActive
                    ? "text-primary bg-primary/5"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <i className={cn(item.iconClass, "w-4 text-center text-slate-400 group-hover:text-primary", isItemActive && "text-primary")}></i>
                <span className="uppercase tracking-wider text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
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

  // Dropdown Items Arrays
  const comunidadItems: DropdownItem[] = [
    { href: "/news", label: "Noticias", iconClass: "fa-solid fa-newspaper" },
    { href: "/events", label: "Eventos", iconClass: "fa-solid fa-calendar-days" },
    { href: "/forum", label: "Foro", iconClass: "fa-solid fa-comments" },
    { href: "/team", label: "Nuestro Equipo", iconClass: "fa-solid fa-users" },
    { href: "/contact", label: "Contacto", iconClass: "fa-solid fa-envelope" },
  ];

  const radioItems: DropdownItem[] = [
    { href: "/schedule", label: "Horarios", iconClass: "fa-solid fa-calendar-week" },
    { label: "Peticiones", iconClass: "fa-solid fa-bullhorn", onClick: () => setShowPeticionesModal(true) },
    { label: "Saludos", iconClass: "fa-solid fa-gift", onClick: () => setShowSaludosModal(true) },
  ];

  const habboItems: DropdownItem[] = [
    { href: "/armario", label: "Armario", iconClass: "fa-solid fa-shirt" },
    { href: "/imager", label: "Generador de Avatar (Imager)", iconClass: "fa-solid fa-image" },
    { href: "/catalog", label: "Catálogo de Furnis", iconClass: "fa-solid fa-cubes" },
    { href: "/badges", label: "Buscador de Placas", iconClass: "fa-solid fa-award" },
    { href: "/habbo3d", label: "Sala Habbo 3D", iconClass: "fa-solid fa-cube" },
  ];

  const tiendaItems: DropdownItem[] = [
    { href: "/tienda", label: "Tienda SP", iconClass: "fa-solid fa-cart-shopping" },
    { href: "/marketplace", label: "Mercadillo (Marketplace)", iconClass: "fa-solid fa-chart-line" },
  ];

  const mundialItems: DropdownItem[] = [
    { href: "/mundial", label: "Mundial 2026 Home", iconClass: "fa-solid fa-trophy" },
    { href: "/mundial/pronosticos", label: "Pronósticos", iconClass: "fa-solid fa-chart-bar" },
    { href: "/mundial/ranking", label: "Ranking Pronosticadores", iconClass: "fa-solid fa-ranking-star" },
    { href: "/mundial/equipos", label: "Equipos", iconClass: "fa-solid fa-users-gear" },
    { href: "/mundial/aventura", label: "Aventura Mundialista", iconClass: "fa-solid fa-compass" },
    { href: "/mundial/mini/rapido", label: "Minijuego Rápido", iconClass: "fa-solid fa-gamepad" },
    { href: "/mundial/mini/sorteos", label: "Sorteos Especiales", iconClass: "fa-solid fa-gift" },
  ];

  return (
    <nav className="w-full sticky top-0 z-50 shadow-md flex flex-col font-sans" data-testid="top-nav-bar">
      
      {/* 1. MENÚ BLANCO PREMIUM CON DROPDOWNS COMPLETOS */}
      <div className="bg-white text-slate-800 border-b border-slate-200 h-14 flex items-center px-4 sm:px-6 relative z-50">
        <div className="mx-auto w-full max-w-[1600px] flex items-center justify-between">
          
          {/* Logo y Dropdowns de Navegación */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/logo.png" alt="hSpeed Logo" className="h-9 w-auto object-contain" />
              <span className="hidden sm:inline-block text-xs uppercase tracking-widest font-black text-slate-900">
                HabboSpeed
              </span>
            </Link>

            {/* Links Escritorio en Dropdowns */}
            <div className="hidden md:flex items-center gap-6">
              <DirectNavLink href="/" label="INICIO" />
              <NavDropdown label="COMUNIDAD" items={comunidadItems} activePrefixes={["/news", "/events", "/forum", "/team", "/contact"]} />
              <NavDropdown label="RADIO" items={radioItems} activePrefixes={["/schedule"]} />
              <NavDropdown label="HERRAMIENTAS" items={habboItems} activePrefixes={["/armario", "/imager", "/catalog", "/badges", "/habbo3d"]} />
              <NavDropdown label="TIENDA" items={tiendaItems} activePrefixes={["/tienda", "/marketplace"]} />
              <NavDropdown label="MUNDIAL 2026" items={mundialItems} activePrefixes={["/mundial"]} />
            </div>
          </div>

          {/* Área de Autenticación / Registro */}
          <div className="flex items-center gap-4">
            {/* Toggle Modo Fútbol */}
            <button
              onClick={() => setFootballMode((p) => !p)}
              className="text-slate-500 hover:text-slate-900 transition-colors text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              <i className="fa-solid fa-futbol text-emerald-500 mr-1"></i>
              <span className="hidden sm:inline">{footballMode ? "Fútbol On" : "Fútbol Off"}</span>
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
                  <i className="fa-solid fa-chevron-down text-[9px] text-slate-400"></i>
                </button>

                {/* Dropdown Contenido */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 animate-fade-in">
                    <Link
                      href={`/profile/${user.habboUsername || user.displayName}`}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <i className="fa-solid fa-user text-slate-400 w-4 text-center"></i>
                      MI PERFIL
                    </Link>
                    <Link
                      href="/messages"
                      className="flex items-center justify-between px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <span className="flex items-center gap-2">
                        <i className="fa-solid fa-envelope text-slate-400 w-4 text-center"></i>
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
                        <i className="fa-solid fa-cog text-slate-400 w-4 text-center"></i>
                        PANEL ADMIN
                      </Link>
                    )}
                    {isDjOrAdmin && (
                      <Link
                        href="/djpanel"
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <i className="fa-solid fa-headphones text-slate-400 w-4 text-center"></i>
                        PANEL DJ
                      </Link>
                    )}
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors border-t border-slate-100 text-left"
                    >
                      <i className="fa-solid fa-sign-out-alt text-red-400 w-4 text-center"></i>
                      CERRAR SESIÓN
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="flex items-center gap-1 text-[11px] font-extrabold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-wider">
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
              {mobileMenuOpen ? <i className="fa-solid fa-xmark text-lg"></i> : <i className="fa-solid fa-bars text-lg"></i>}
            </button>
          </div>
        </div>
      </div>

      {/* 2. REPRODUCTOR DE RADIO HORIZONTAL AZUL OSCURO */}
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
            <i className="fa-solid fa-headphones text-xs"></i>
            <span>{listeners}</span>
          </div>

          {/* Botón Circular Play/Pause */}
          <button
            onClick={togglePlay}
            className="w-8.5 h-8.5 rounded-full bg-[#f43f5e] hover:bg-[#e11d48] text-white flex items-center justify-center transition-all shadow-md shrink-0 hover:scale-105 active:scale-95"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <i className="fa-solid fa-stop text-[10px]"></i> : <i className="fa-solid fa-play text-[10px] ml-0.5"></i>}
          </button>

          {/* Deslizador de Volumen */}
          <div className="hidden md:flex items-center gap-2 border-l border-white/10 pl-3.5">
            <button onClick={() => setIsMuted(!isMuted)} className="text-white/60 hover:text-white transition-colors">
              {isMuted ? <i className="fa-solid fa-volume-xmark"></i> : <i className="fa-solid fa-volume-high"></i>}
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

          {/* Iconos de Acción Rápida */}
          <div className="flex items-center gap-2 bg-[#140b49] px-2 py-1 rounded-lg border border-white/5">
            <Link href="/forum" className="text-white/60 hover:text-[#26d7ff] p-1.5 transition-colors" title="Chat/Foro">
              <i className="fa-solid fa-comments text-xs"></i>
            </Link>
            <button
              onClick={() => setShowPeticionesModal(true)}
              className="text-white/60 hover:text-[#26d7ff] p-1.5 transition-colors"
              title="Peticiones"
            >
              <i className="fa-solid fa-bullhorn text-xs"></i>
            </button>
            <button
              onClick={() => setShowSaludosModal(true)}
              className="text-white/60 hover:text-[#26d7ff] p-1.5 transition-colors"
              title="Saludos / Mensaje"
            >
              <i className="fa-solid fa-gift text-xs"></i>
            </button>
          </div>

          {/* Barra de Progreso del Programa */}
          <div className="hidden lg:flex items-center gap-2.5 flex-1 max-w-[280px] border-l border-white/10 pl-3.5">
            <div className="flex items-center gap-1 text-[9px] font-bold text-white/50 uppercase tracking-wider">
              <i className="fa-solid fa-clock"></i>
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

      {/* MENÚ MÓVIL TOTALMENTE COMPLETO */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white shadow-xl animate-fade-in-up max-h-[75vh] overflow-y-auto">
          <div className="px-4 py-4 space-y-4">
            
            {/* Inicio */}
            <Link href="/" className="flex items-center gap-2 px-3 py-2 text-xs font-black uppercase text-slate-900 hover:bg-slate-50 rounded" onClick={() => setMobileMenuOpen(false)}>
              <i className="fa-solid fa-house w-4 text-center"></i> INICIO
            </Link>

            {/* Sección Comunidad */}
            <div>
              <p className="px-3 text-[10px] font-black tracking-wider text-slate-400 uppercase">Comunidad</p>
              <div className="pl-3 mt-1 space-y-0.5">
                {comunidadItems.map((item, idx) => (
                  <Link key={idx} href={item.href || "#"} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded" onClick={() => setMobileMenuOpen(false)}>
                    <i className={cn(item.iconClass, "w-4 text-center text-slate-400")}></i> {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Sección Radio */}
            <div>
              <p className="px-3 text-[10px] font-black tracking-wider text-slate-400 uppercase">Radio</p>
              <div className="pl-3 mt-1 space-y-0.5">
                {radioItems.map((item, idx) => {
                  if (item.onClick) {
                    return (
                      <button
                        key={idx}
                        onClick={() => { item.onClick?.(); setMobileMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded text-left"
                      >
                        <i className={cn(item.iconClass, "w-4 text-center text-slate-400")}></i> {item.label}
                      </button>
                    );
                  }
                  return (
                    <Link key={idx} href={item.href || "#"} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded" onClick={() => setMobileMenuOpen(false)}>
                      <i className={cn(item.iconClass, "w-4 text-center text-slate-400")}></i> {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Sección Herramientas */}
            <div>
              <p className="px-3 text-[10px] font-black tracking-wider text-slate-400 uppercase">Herramientas Habbo</p>
              <div className="pl-3 mt-1 space-y-0.5">
                {habboItems.map((item, idx) => (
                  <Link key={idx} href={item.href || "#"} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded" onClick={() => setMobileMenuOpen(false)}>
                    <i className={cn(item.iconClass, "w-4 text-center text-slate-400")}></i> {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Sección Tienda */}
            <div>
              <p className="px-3 text-[10px] font-black tracking-wider text-slate-400 uppercase">Tienda & Economía</p>
              <div className="pl-3 mt-1 space-y-0.5">
                {tiendaItems.map((item, idx) => (
                  <Link key={idx} href={item.href || "#"} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded" onClick={() => setMobileMenuOpen(false)}>
                    <i className={cn(item.iconClass, "w-4 text-center text-slate-400")}></i> {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Sección Mundial */}
            <div>
              <p className="px-3 text-[10px] font-black tracking-wider text-slate-400 uppercase">Mundial 2026</p>
              <div className="pl-3 mt-1 space-y-0.5">
                {mundialItems.map((item, idx) => (
                  <Link key={idx} href={item.href || "#"} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded" onClick={() => setMobileMenuOpen(false)}>
                    <i className={cn(item.iconClass, "w-4 text-center text-slate-400")}></i> {item.label}
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL PETICIONES */}
      <Dialog open={showPeticionesModal} onOpenChange={setShowPeticionesModal}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <i className="fa-solid fa-bullhorn text-sm text-primary"></i>
              Enviar Petición de Canción
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2 font-sans">
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
              <i className="fa-solid fa-gift text-sm text-primary"></i>
              Enviar Saludo o Mensaje al Aire
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2 font-sans">
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
