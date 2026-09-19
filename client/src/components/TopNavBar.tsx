import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { proxyImage } from "@/lib/habboProxy";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DAYS_ES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

function getProgramProgress(startTime: string, endTime: string, now: Date) {
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

// Subcomponente de enlace de navegación simple con solo icono y tooltip
function DirectNavLink({
  href,
  label,
  iconClass,
  badge,
}: {
  href: string;
  label: string;
  iconClass: string;
  badge?: string;
}) {
  const [location] = useLocation();
  const isActive = href === "/" ? location === "/" : location.startsWith(href);

  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      className={cn(
        "relative h-9 px-3 rounded-xl flex items-center gap-1.5 transition-all duration-200 group cursor-pointer text-xs font-bold",
        isActive
          ? "bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/50 shadow-sm shadow-cyan-500/20"
          : "text-slate-300 hover:text-white hover:bg-white/10",
      )}
    >
      <i className={cn(iconClass, "text-xs group-hover:scale-110 transition-transform")}></i>
      <span className="text-xs font-bold tracking-tight">{label}</span>
      {badge && (
        <span className="bg-cyan-400 text-[#090e1a] text-[9px] font-black px-1.5 py-0.2 rounded-full ml-1">
          {badge}
        </span>
      )}
    </Link>
  );
}

// Elemento del dropdown
interface DropdownItem {
  href?: string;
  label: string;
  desc?: string;
  iconClass: string;
  badge?: string;
  onClick?: () => void;
}

// Subcomponente Dropdown para menú en Desktop con iconos, títulos y submenús ricos
function NavDropdown({
  label,
  iconClass,
  items,
  activePrefixes,
  columns = 1,
}: {
  label: string;
  iconClass: string;
  items: DropdownItem[];
  activePrefixes: string[];
  columns?: 1 | 2;
}) {
  const [location] = useLocation();
  const isActive = activePrefixes.some((pref) =>
    pref === "/" ? location === "/" : location.startsWith(pref),
  );

  return (
    <div className="relative group py-1.5">
      <button
        title={label}
        aria-label={label}
        className={cn(
          "relative h-9 px-3 rounded-xl flex items-center gap-1.5 transition-all duration-200 cursor-pointer focus:outline-none text-xs font-bold",
          isActive
            ? "bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/50 shadow-sm shadow-cyan-500/20"
            : "text-slate-300 hover:text-white hover:bg-white/10",
        )}
      >
        <i className={cn(iconClass, "text-xs group-hover:scale-110 transition-transform")}></i>
        <span className="text-xs font-bold tracking-tight">{label}</span>
        <i className="fa-solid fa-chevron-down text-[8px] opacity-60 group-hover:rotate-180 transition-transform duration-200 ml-0.5"></i>
      </button>

      {/* Menú desplegable amplio y detallado */}
      <div
        className={cn(
          "absolute left-0 top-full pt-1.5 hidden group-hover:block z-50 animate-fade-in",
          columns === 2 ? "w-[500px]" : "w-[300px]",
        )}
      >
        <div className="bg-[#0b1220]/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl p-3 overflow-hidden">
          {/* Header de Categoría */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 px-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs">
                <i className={iconClass}></i>
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-200">
                {label}
              </span>
            </div>
            <span className="text-[10px] font-bold text-cyan-400/80 bg-cyan-500/10 px-2 py-0.5 rounded-full">
              {items.length} accesos
            </span>
          </div>

          {/* Grid de Items */}
          <div
            className={cn(
              "gap-1.5",
              columns === 2 ? "grid grid-cols-2" : "flex flex-col",
            )}
          >
            {items.map((item, i) => {
              const isItemActive = item.href
                ? item.href === "/"
                  ? location === "/"
                  : location.startsWith(item.href)
                : false;

              const content = (
                <>
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                      isItemActive
                        ? "bg-cyan-500 text-black font-bold"
                        : "bg-white/5 text-cyan-400 group-hover/item:bg-cyan-500/20 group-hover/item:text-cyan-300",
                    )}
                  >
                    <i className={cn(item.iconClass, "text-xs")}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={cn(
                          "text-xs font-bold truncate transition-colors",
                          isItemActive
                            ? "text-cyan-400"
                            : "text-slate-200 group-hover/item:text-white",
                        )}
                      >
                        {item.label}
                      </p>
                      {item.badge && (
                        <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-black">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.desc && (
                      <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5 group-hover/item:text-slate-300">
                        {item.desc}
                      </p>
                    )}
                  </div>
                </>
              );

              if (item.onClick) {
                return (
                  <button
                    key={i}
                    onClick={item.onClick}
                    className={cn(
                      "w-full text-left flex items-center gap-2.5 p-2 rounded-xl transition-all group/item cursor-pointer",
                      isItemActive
                        ? "bg-cyan-500/15 border border-cyan-500/30 shadow-sm"
                        : "hover:bg-white/10 hover:border-white/10 border border-transparent",
                    )}
                  >
                    {content}
                  </button>
                );
              }

              return (
                <Link
                  key={i}
                  href={item.href || "#"}
                  className={cn(
                    "flex items-center gap-2.5 p-2 rounded-xl transition-all group/item cursor-pointer",
                    isItemActive
                      ? "bg-cyan-500/15 border border-cyan-500/30 shadow-sm"
                      : "hover:bg-white/10 hover:border-white/10 border border-transparent",
                  )}
                >
                  {content}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TopNavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const { user, logout, isAdmin, token } = useAuth();
  const isDjOrAdmin = user && (user.role === "admin" || user.role === "dj");
  const { toast } = useToast();
  const [location] = useLocation();

  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        "/api/notifications",
        undefined,
        token ? `Bearer ${token}` : undefined,
      );
      return res.json();
    },
    enabled: !!user,
    refetchInterval: 15000,
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(
        "PUT",
        "/api/notifications/read-all",
        undefined,
        token ? `Bearer ${token}` : undefined,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(
        "PUT",
        `/api/notifications/${id}/read`,
        undefined,
        token ? `Bearer ${token}` : undefined,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const unreadNotifs = notifications.filter((n: any) => !n.isRead);
  const unreadNotifsCount = unreadNotifs.length;

  const [footballMode, setFootballMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem("footballMode") === "1";
    } catch {
      return false;
    }
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
      const res = await apiRequest(
        "GET",
        "/api/messages/unread",
        undefined,
        token ? `Bearer ${token}` : undefined,
      );
      return res.json();
    },
    enabled: !!user,
    refetchInterval: 30000,
    retry: false,
  });
  const unreadCount = unreadData?.count || 0;

  // Dynamic timer to keep player progress active (non-static)
  const [nowDate, setNowDate] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setNowDate(new Date());
    }, 10000); // Update every 10 seconds
    return () => clearInterval(timer);
  }, []);

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
  const rawDj =
    nowPlaying?.live?.streamer_name || djPanel?.currentDj || "HabboSpeed";
  const isAutoDj =
    !rawDj ||
    ["autodj", "auto dj", "azuracast autodj", "habbospeed"].includes(
      rawDj.toLowerCase(),
    );
  const currentDj = isAutoDj ? "HabboSpeed" : rawDj;
  const nextDj = djPanel?.nextDj || "Dj_Invitado";
  const currentSong = nowPlaying?.now_playing?.song;
  const songTitle =
    currentSong?.artist && currentSong?.title
      ? `${currentSong.artist} - ${currentSong.title}`
      : "Wulf - All Things Under The Sun";
  const listeners = nowPlaying?.listeners?.current ?? 50;

  const today = DAYS_ES[new Date().getDay()];
  const currentSchedule = useMemo(
    () => (scheduleData || []).find((item) => item.day === today),
    [scheduleData, today],
  );
  const programStart = currentSchedule?.startTime || "01:00";
  const programEnd = currentSchedule?.endTime || "02:00";
  const programProgress = currentSchedule
    ? getProgramProgress(programStart, programEnd, nowDate)
    : 12;

  // Modales
  const [showPeticionesModal, setShowPeticionesModal] = useState(false);
  const [showSaludosModal, setShowSaludosModal] = useState(false);

  const [peticionForm, setPeticionForm] = useState({
    songTitle: "",
    artist: "",
    details: "",
  });
  const [saludoForm, setSaludoForm] = useState({ details: "" });

  const handleSendPeticion = async () => {
    if (!peticionForm.songTitle.trim() || !peticionForm.artist.trim()) {
      toast({
        title: "Error",
        description: "Por favor rellena canción y artista",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await apiRequest("POST", "/api/requests", {
        type: "cancion",
        userName: user?.displayName || "Invitado",
        details: `${peticionForm.artist.trim()} - ${peticionForm.songTitle.trim()} (${peticionForm.details.trim()})`,
      });
      if (response.ok) {
        toast({
          title: "¡Petición enviada!",
          description: "Tu canción ha sido agregada a la cola",
        });
        setPeticionForm({ songTitle: "", artist: "", details: "" });
        setShowPeticionesModal(false);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo enviar la petición",
        variant: "destructive",
      });
    }
  };

  const handleSendSaludo = async () => {
    if (!saludoForm.details.trim()) {
      toast({
        title: "Error",
        description: "Por favor escribe un mensaje",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await apiRequest("POST", "/api/requests", {
        type: "saludo",
        userName: user?.displayName || "Invitado",
        details: saludoForm.details.trim(),
      });
      if (response.ok) {
        toast({
          title: "¡Saludo enviado!",
          description: "Tu mensaje ha sido enviado al DJ de turno.",
        });
        setSaludoForm({ details: "" });
        setShowSaludosModal(false);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo enviar el saludo",
        variant: "destructive",
      });
    }
  };

  // 1. COMUNIDAD (Noticias, Eventos, Foro, Equipo, Salas, Mensajes, Perfil, Contacto)
  const comunidadItems: DropdownItem[] = [
    { href: "/news", label: "Noticias", desc: "Últimas novedades y artículos", iconClass: "fa-solid fa-newspaper" },
    { href: "/events", label: "Eventos", desc: "Torneos, fiestas y concursos", iconClass: "fa-solid fa-calendar-days" },
    { href: "/forum", label: "Foro de Discusión", desc: "Debates y guías de la comunidad", iconClass: "fa-solid fa-comments" },
    { href: "/team", label: "Nuestro Equipo", desc: "Administradores, DJs y staff", iconClass: "fa-solid fa-users" },
    { href: "/rooms", label: "Salas Habbo", desc: "Directorio de salas recomendadas", iconClass: "fa-solid fa-hotel" },
    { href: "/messages", label: "Mensajes Privados", desc: "Bandeja de chats privados", iconClass: "fa-solid fa-envelope" },
    { href: user ? `/profile/${user.habboUsername || user.displayName}` : "/login", label: "Mi Perfil", desc: "Avatar, poses y estadísticas", iconClass: "fa-solid fa-user" },
    { href: "/contact", label: "Contacto", desc: "Dudas, sugerencias y soporte", iconClass: "fa-solid fa-paper-plane" },
  ];

  // 2. RADIO (Sintonizar, Horarios, Historial, Horarios DJ, Peticiones, Saludos)
  const radioItems: DropdownItem[] = [
    { href: "/radio", label: "Sintonizar Radio", desc: "Streaming en directo y locutores", iconClass: "fa-solid fa-radio" },
    { href: "/schedule", label: "Horarios DJs", desc: "Programación semanal de la radio", iconClass: "fa-solid fa-calendar-week" },
    { href: "/song-history", label: "Historial Musical", desc: "Últimos temas emitidos al aire", iconClass: "fa-solid fa-compact-disc" },
    { href: "/dj-horarios", label: "Tablero DJ", desc: "Turnos y panel de locución", iconClass: "fa-solid fa-headphones" },
    {
      label: "Pedir Canción",
      desc: "Solicita tu tema al DJ de turno",
      iconClass: "fa-solid fa-bullhorn",
      onClick: () => setShowPeticionesModal(true),
    },
    {
      label: "Enviar Saludo",
      desc: "Dedica un mensaje en directo",
      iconClass: "fa-solid fa-gift",
      onClick: () => setShowSaludosModal(true),
    },
  ];

  // 3. HERRAMIENTAS (Hub, Feria, Armario, Imager, Catálogo, Badges, Memes, Habbo 3D, Reacciones)
  const herramientasItems: DropdownItem[] = [
    { href: "/herramientas", label: "Centro Herramientas", desc: "Todas las utilidades en un clic", iconClass: "fa-solid fa-screwdriver-wrench" },
    { href: "/feria", label: "Feria & Logros", desc: "Logros, niveles y mercadillo", iconClass: "fa-solid fa-store", badge: "Nuevo" },
    { href: "/armario", label: "Armario de Outfits", desc: "Prueba ropa y crea estilos", iconClass: "fa-solid fa-shirt" },
    { href: "/imager", label: "Generador de Avatar", desc: "Crea avatares HD con poses", iconClass: "fa-solid fa-image" },
    { href: "/catalog", label: "Catálogo Furnis", desc: "Base de datos con fotos y costes", iconClass: "fa-solid fa-cubes" },
    { href: "/badges", label: "Buscador de Placas", desc: "Explora insignias de todos los hoteles", iconClass: "fa-solid fa-award" },
    { href: "/memes", label: "Creador de Memes", desc: "Genera memes Habbo divertidos", iconClass: "fa-solid fa-face-laugh-squint" },
    { href: "/habbo3d", label: "Visor Habbo 3D", desc: "Salas tridimensionales interactivas", iconClass: "fa-solid fa-cube" },
    { href: "/reacciones", label: "Tienda Reacciones", desc: "Gestos y animaciones para chat", iconClass: "fa-solid fa-icons" },
  ];

  // 4. TIENDA (Tienda SP, VIP, Marketplace)
  const tiendaItems: DropdownItem[] = [
    { href: "/tienda", label: "Tienda SpeedPoints", desc: "Canjea puntos por recompensas", iconClass: "fa-solid fa-cart-shopping" },
    { href: "/vip", label: "Membresía VIP", desc: "Beneficios exclusivos y distinción", iconClass: "fa-solid fa-crown" },
    { href: "/marketplace", label: "Mercadillo Furnis", desc: "Historial de precios de mercado", iconClass: "fa-solid fa-chart-line" },
  ];

  // 5. GAMING & ENTRETENIMIENTO (Juegos, Cartas, Cine, Misiones, Tendencias, Mis Shorts)
  const entretenimientoItems: DropdownItem[] = [
    { href: "/juegos", label: "Arcade Mini-Juegos", desc: "Juegos clásicos con puntuaciones", iconClass: "fa-solid fa-gamepad" },
    { href: "/cartas", label: "Cartas Coleccionables", desc: "Álbum de cartas temáticas", iconClass: "fa-solid fa-layer-group" },
    { href: "/cine", label: "Cine YouTube Grupal", desc: "Salas de video sincronizadas", iconClass: "fa-solid fa-film" },
    { href: "/misiones", label: "Misiones & Premios", desc: "Retos diarios con SpeedPoints", iconClass: "fa-solid fa-bullseye" },
    { href: "/tendencias", label: "SpeedShorts", desc: "Tendencias y videos cortos", iconClass: "fa-solid fa-fire-flame-curved" },
    { href: "/mis-shorts", label: "Mis Videos Shorts", desc: "Sube y administra tus creaciones", iconClass: "fa-solid fa-video" },
  ];

  const mundialItems: DropdownItem[] = [
    {
      href: "/futbol-hub",
      label: "Fútbol Hub Home",
      desc: "Centro principal de fútbol",
      iconClass: "fa-solid fa-trophy",
    },
    {
      href: "/futbol-hub/pronosticos",
      label: "Pronósticos",
      desc: "Predice resultados y gana puntos",
      iconClass: "fa-solid fa-chart-bar",
    },
    {
      href: "/futbol-hub/ranking",
      label: "Ranking de Expertos",
      desc: "Líderes de predicciones",
      iconClass: "fa-solid fa-ranking-star",
    },
    {
      href: "/futbol-hub/equipos",
      label: "Equipos y Clubes",
      desc: "Plantillas y estadísticas",
      iconClass: "fa-solid fa-users-gear",
    },
    {
      href: "/futbol-hub/aventura",
      label: "Aventura Futbolística",
      desc: "Rutas de desafíos futboleros",
      iconClass: "fa-solid fa-compass",
    },
    {
      href: "/futbol-hub/mini/rapido",
      label: "Juego de Penales",
      desc: "Patea penales y anota goles",
      iconClass: "fa-solid fa-gamepad",
    },
    {
      href: "/futbol-hub/mini/sorteos",
      label: "Sorteos Especiales",
      desc: "Participa por premios únicos",
      iconClass: "fa-solid fa-gift",
    },
    {
      href: "/futbol-hub/torneos",
      label: "HSpeed Torneos",
      desc: "Copas y ligas comunitarias",
      iconClass: "fa-solid fa-medal",
    },
  ];

  return (
    <nav
      className="w-full sticky top-0 z-50 shadow-md flex flex-col font-sans"
      data-testid="top-nav-bar"
    >
      {/* 1. MENÚ SUPERIOR OSCURO HSPEED NUEVA GENERACIÓN CON SOLO ICONOS */}
      <div className="bg-[#090e1a] text-white border-b border-white/10 h-13 flex items-center px-4 sm:px-6 relative z-50">
        <div className="mx-auto w-full max-w-[1600px] flex items-center justify-between">
          {/* Logo y Links de Navegación con SOLO ICONOS */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-xl font-black tracking-tight text-white flex items-center">
                h<span className="text-cyan-400 group-hover:text-cyan-300 transition-colors">Speed</span>
              </span>
            </Link>

            {/* Links Escritorio: Iconos limpios con tooltips y megamenús ricos */}
            <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
              <DirectNavLink href="/" label="Inicio" iconClass="fa-solid fa-house" />
              <NavDropdown
                label="Comunidad"
                iconClass="fa-solid fa-users"
                items={comunidadItems}
                activePrefixes={["/news", "/events", "/forum", "/team", "/rooms", "/contact", "/messages", "/profile"]}
                columns={2}
              />
              <NavDropdown
                label="Radio"
                iconClass="fa-solid fa-radio"
                items={radioItems}
                activePrefixes={["/radio", "/schedule", "/song-history", "/dj-horarios"]}
              />
              <NavDropdown
                label="Herramientas"
                iconClass="fa-solid fa-screwdriver-wrench"
                items={herramientasItems}
                activePrefixes={["/herramientas", "/armario", "/imager", "/catalog", "/badges", "/feria", "/memes", "/habbo3d", "/reacciones"]}
                columns={2}
              />
              <NavDropdown
                label="Tienda"
                iconClass="fa-solid fa-cart-shopping"
                items={tiendaItems}
                activePrefixes={["/tienda", "/shop", "/vip", "/marketplace"]}
              />
              <NavDropdown
                label="Entretenimiento"
                iconClass="fa-solid fa-gamepad"
                items={entretenimientoItems}
                activePrefixes={["/juegos", "/cartas", "/cine", "/misiones", "/tendencias", "/mis-shorts", "/youtube"]}
                columns={2}
              />
              <NavDropdown
                label="Fútbol Hub"
                iconClass="fa-solid fa-futbol text-emerald-400"
                items={mundialItems}
                activePrefixes={["/futbol-hub"]}
                columns={2}
              />
            </div>
          </div>

          {/* Área de Usuario / SpeedLogin del Mockup */}
          <div className="flex items-center gap-3">
            {/* Toggle Modo Fútbol */}
            <button
              onClick={() => setFootballMode((p) => !p)}
              className="text-slate-400 hover:text-white transition-colors text-[11px] font-bold flex items-center gap-1 cursor-pointer mr-1 hidden sm:flex"
            >
              <i className="fa-solid fa-futbol text-emerald-400"></i>
              <span>{footballMode ? "Fútbol On" : "Fútbol Off"}</span>
            </button>

            {/* Info de Usuario / SpeedPoints / SpeedLogin */}
            {user ? (
              <div className="flex items-center gap-2.5">
                <img
                  src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(user.habboUsername || user.displayName)}&size=s&headonly=1`}
                  alt={user.displayName}
                  className="w-7 h-7 rounded-full bg-slate-800 border border-cyan-400/50 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/habbo-radio/frank_small_03.gif";
                  }}
                />
                <div className="hidden lg:flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400 font-medium">hSpeed -</span>
                  <span className="font-bold text-slate-200 truncate max-w-[120px]">
                    {user.displayName}
                  </span>
                  <span className="bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ml-1">
                    <i className="fa-solid fa-bolt text-yellow-400 text-[9px]"></i>
                    {user.speedPoints ?? 0} SP
                  </span>
                </div>

                {/* Botón Mi Perfil Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setUserMenuOpen(!userMenuOpen);
                      setNotifMenuOpen(false);
                    }}
                    className="bg-cyan-400 hover:bg-cyan-300 text-[#090e1a] font-black text-xs px-3 py-1 rounded-full transition-all shadow flex items-center gap-1 cursor-pointer"
                  >
                    <span>Mi Perfil</span>
                    <i className="fa-solid fa-chevron-down text-[9px]"></i>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#0e1626] border border-white/10 rounded-xl shadow-2xl py-1 z-50 animate-fade-in text-slate-200">
                      <Link
                        href={`/profile/${user.habboUsername || user.displayName}`}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold hover:bg-white/10 hover:text-cyan-400 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <i className="fa-solid fa-user text-slate-400 w-4 text-center"></i>
                        MI PERFIL
                      </Link>
                      <Link
                        href="/messages"
                        className="flex items-center justify-between px-4 py-2 text-xs font-bold hover:bg-white/10 hover:text-cyan-400 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <span className="flex items-center gap-2">
                          <i className="fa-solid fa-envelope text-slate-400 w-4 text-center"></i>
                          MENSAJES
                        </span>
                        {unreadCount > 0 && (
                          <Badge className="bg-cyan-400 text-black text-[9px] px-1.5 py-0.5">
                            {unreadCount}
                          </Badge>
                        )}
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/panel"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-bold hover:bg-white/10 hover:text-cyan-400 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <i className="fa-solid fa-cog text-slate-400 w-4 text-center"></i>
                          PANEL ADMIN
                        </Link>
                      )}
                      {isDjOrAdmin && (
                        <Link
                          href="/djpanel"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-bold hover:bg-white/10 hover:text-cyan-400 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <i className="fa-solid fa-headphones text-slate-400 w-4 text-center"></i>
                          PANEL DJ
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/10 text-left"
                      >
                        <i className="fa-solid fa-sign-out-alt text-red-400 w-4 text-center"></i>
                        CERRAR SESIÓN
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
                <Link
                  href="/login"
                  className="bg-cyan-400 hover:bg-cyan-300 text-[#090e1a] font-black text-xs px-4 py-1.5 rounded-full transition-all shadow flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                >
                  <i className="fa-solid fa-right-to-bracket text-xs"></i>
                  <span>SpeedLogin</span>
                </Link>
              )}

              {/* Campana de Notificaciones */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotifMenuOpen(!notifMenuOpen);
                      setUserMenuOpen(false);
                    }}
                    className="relative text-slate-300 hover:text-white transition-colors p-1.5 cursor-pointer flex items-center justify-center focus:outline-none"
                  >
                    <i className="fa-solid fa-bell text-sm"></i>
                    {unreadNotifsCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-cyan-400 text-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                        {unreadNotifsCount}
                      </span>
                    )}
                  </button>
                  {notifMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-[#0e1626] border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 animate-fade-in text-slate-200">
                      <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
                        <span className="font-extrabold text-[10px] uppercase tracking-wider text-slate-300">
                          Notificaciones
                        </span>
                        {unreadNotifsCount > 0 && (
                          <button
                            onClick={() => markAllReadMutation.mutate()}
                            className="text-[9px] text-cyan-400 hover:underline font-bold uppercase tracking-wider"
                          >
                            Marcar leídas
                          </button>
                        )}
                      </div>
                      <div className="max-h-60 overflow-y-auto py-1">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-xs text-slate-400">
                            No tienes notificaciones
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((notif: any) => (
                            <div
                              key={notif.id}
                              className="px-4 py-2.5 hover:bg-white/5 transition-colors flex items-start gap-2.5 border-b border-white/5 last:border-0 cursor-pointer"
                              onClick={() => {
                                if (!notif.isRead) markReadMutation.mutate(notif.id);
                                if (notif.link) window.location.hash = notif.link;
                                setNotifMenuOpen(false);
                              }}
                            >
                              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-slate-300 mt-0.5">
                                <i className="fa-solid fa-bell text-cyan-400"></i>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-white truncate">{notif.title}</p>
                                <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{notif.message}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Hamburguesa Móvil */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-300 hover:bg-white/10 p-2 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? (
                <i className="fa-solid fa-xmark text-lg"></i>
              ) : (
                <i className="fa-solid fa-bars text-lg"></i>
              )}
            </button>
          </div>
        </div>

      {/* Audio Element (Invisible) */}
      <audio ref={audioRef} preload="none" className="hidden" />

      {/* MENÚ MÓVIL TOTALMENTE COMPLETO */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-slate-50/98 backdrop-blur-md shadow-2xl animate-fade-in-up max-h-[80vh] overflow-y-auto rounded-b-2xl">
          <div className="px-4 py-5 space-y-4">
            {/* Inicio */}
            <Link
              href="/"
              className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-black uppercase text-slate-900 bg-white border border-slate-100 hover:bg-slate-50 rounded-xl transition-all shadow-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              <i className="fa-solid fa-house w-4 text-center text-primary"></i>{" "}
              INICIO
            </Link>

            {/* Sección Comunidad */}
            <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm space-y-2">
              <p className="px-1 text-[9px] font-black tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                <span className="w-1 h-1 bg-slate-300 rounded-full" /> Comunidad
              </p>
              <div className="grid grid-cols-1 gap-1">
                {comunidadItems.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href || "#"}
                    className="flex items-center gap-2.5 px-2 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <i
                      className={cn(
                        item.iconClass,
                        "w-4 text-center text-slate-400",
                      )}
                    ></i>{" "}
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Sección Radio */}
            <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm space-y-2">
              <p className="px-1 text-[9px] font-black tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                <span className="w-1 h-1 bg-slate-300 rounded-full" /> Radio &
                Programación
              </p>
              <div className="grid grid-cols-1 gap-1">
                {radioItems.map((item, idx) => {
                  if (item.onClick) {
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          item.onClick?.();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-2 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg text-left transition-all"
                      >
                        <i
                          className={cn(
                            item.iconClass,
                            "w-4 text-center text-slate-400",
                          )}
                        ></i>{" "}
                        {item.label}
                      </button>
                    );
                  }
                  return (
                    <Link
                      key={idx}
                      href={item.href || "#"}
                      className="flex items-center gap-2.5 px-2 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <i
                        className={cn(
                          item.iconClass,
                          "w-4 text-center text-slate-400",
                        )}
                      ></i>{" "}
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Sección Herramientas */}
            <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm space-y-2">
              <p className="px-1 text-[9px] font-black tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                <span className="w-1 h-1 bg-slate-300 rounded-full" /> Herramientas
              </p>
              <div className="grid grid-cols-1 gap-1">
                {herramientasItems.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href || "#"}
                    className="flex items-center gap-2.5 px-2 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <i
                      className={cn(
                        item.iconClass,
                        "w-4 text-center text-slate-400",
                      )}
                    ></i>{" "}
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Sección Tienda */}
            <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm space-y-2">
              <p className="px-1 text-[9px] font-black tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                <span className="w-1 h-1 bg-slate-300 rounded-full" /> Tienda & Economía
              </p>
              <div className="grid grid-cols-1 gap-1">
                {tiendaItems.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href || "#"}
                    className="flex items-center gap-2.5 px-2 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <i
                      className={cn(
                        item.iconClass,
                        "w-4 text-center text-slate-400",
                      )}
                    ></i>{" "}
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Sección Entretenimiento & Gaming */}
            <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm space-y-2">
              <p className="px-1 text-[9px] font-black tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                <span className="w-1 h-1 bg-slate-300 rounded-full" /> Entretenimiento & Gaming
              </p>
              <div className="grid grid-cols-1 gap-1">
                {entretenimientoItems.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href || "#"}
                    className="flex items-center gap-2.5 px-2 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <i
                      className={cn(
                        item.iconClass,
                        "w-4 text-center text-slate-400",
                      )}
                    ></i>{" "}
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Sección Fútbol Hub */}
            <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm space-y-2">
              <p className="px-1 text-[9px] font-black tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                <span className="w-1 h-1 bg-slate-300 rounded-full" /> Fútbol Hub
              </p>
              <div className="grid grid-cols-1 gap-1">
                {mundialItems.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href || "#"}
                    className="flex items-center gap-2.5 px-2 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <i
                      className={cn(
                        item.iconClass,
                        "w-4 text-center text-slate-400",
                      )}
                    ></i>{" "}
                    {item.label}
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
              <Label
                htmlFor="nav-song-title"
                className="text-xs text-muted-foreground mb-1.5 block"
              >
                Nombre de la canción
              </Label>
              <input
                id="nav-song-title"
                type="text"
                placeholder="Ej: Levitating"
                className="w-full px-3 py-2 text-xs rounded-lg bg-secondary/30 border border-border focus:outline-none focus:border-primary/50 text-foreground"
                value={peticionForm.songTitle}
                onChange={(e) =>
                  setPeticionForm({
                    ...peticionForm,
                    songTitle: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label
                htmlFor="nav-artist"
                className="text-xs text-muted-foreground mb-1.5 block"
              >
                Artista
              </Label>
              <input
                id="nav-artist"
                type="text"
                placeholder="Ej: Dua Lipa"
                className="w-full px-3 py-2 text-xs rounded-lg bg-secondary/30 border border-border focus:outline-none focus:border-primary/50 text-foreground"
                value={peticionForm.artist}
                onChange={(e) =>
                  setPeticionForm({ ...peticionForm, artist: e.target.value })
                }
              />
            </div>
            <div>
              <Label
                htmlFor="nav-details"
                className="text-xs text-muted-foreground mb-1.5 block"
              >
                Comentarios
              </Label>
              <Textarea
                id="nav-details"
                placeholder="Escribe alguna aclaración o mensaje especial..."
                rows={3}
                className="text-xs resize-none"
                value={peticionForm.details}
                onChange={(e) =>
                  setPeticionForm({ ...peticionForm, details: e.target.value })
                }
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
              <Label
                htmlFor="nav-saludo-msg"
                className="text-xs text-muted-foreground mb-1.5 block"
              >
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
