import { useMemo, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { proxyImage } from "@/lib/habboProxy";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NotificationBell from "@/components/NotificationBell";
import {
  Menu,
  X,
  LogIn,
  UserPlus,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Mail,
  Headphones,
  Clock,
  Home,
  Newspaper,
  Calendar,
  MessageSquare,
  Award,
  TrendingUp,
  Users,
  Shirt,
  Wrench,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";

const navItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "INICIO", icon: Home },
  { href: "/news", label: "NOTICIAS", icon: Newspaper },
  { href: "/events", label: "EVENTOS", icon: Calendar },
  { href: "/forum", label: "FORO", icon: MessageSquare },
  { href: "/badges", label: "PLACAS", icon: Award },
  { href: "/tienda", label: "TIENDA", icon: ShoppingCart },
  { href: "/marketplace", label: "MARKETPLACE", icon: TrendingUp },
  { href: "/imager", label: "IMAGER", icon: Users },
  { href: "/armario", label: "ARMARIO", icon: Shirt },
  { href: "/herramientas", label: "HERRAMIENTAS", icon: Wrench },
  { href: "/team", label: "EQUIPO", icon: Users },
];

function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: LucideIcon }) {
  const [location] = useLocation();
  const isActive =
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <Link
      href={href}
      data-testid={`nav-link-${label.toLowerCase()}`}
      className={cn(
        "flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold tracking-[0.18em] uppercase transition-all whitespace-nowrap rounded-md relative group",
        isActive
          ? "text-white bg-white/12"
          : "text-white/75 hover:text-white hover:bg-white/10"
      )}
      title={label}
    >
      <Icon className="w-3.5 h-3.5 opacity-90" />
      <span>{label}</span>
      {isActive && (
        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-white rounded-full opacity-80" />
      )}
    </Link>
  );
}

export default function TopNavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, isAdmin, token } = useAuth();
  const isDjOrAdmin = user && (user.role === "admin" || user.role === "dj");
  const { decorations } = useTheme();
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

  const emoji = decorations?.emoji || "";

  const djMessage = useMemo(() => {
    const guestMessages = [
      "Hola, como les va por el hotel? Hoy tenemos radio en vivo, eventos y premios.",
      "Buenas! Sube el volumen y pasa por el foro, la comunidad esta on fire.",
      "Hey familia Habbo, ponte comodo: radio, noticias y sorpresas todo el dia.",
      "Hola! Deja tu mensaje en el foro y revisa los horarios de DJs."
    ];

    const userMessages = [
      (name: string) => `Hola ${name}, como va todo? Hoy hay radio en vivo y mucha actividad.`,
      (name: string) => `Hola ${name}, gracias por volver. Revisa el foro y los horarios de DJs.`,
      (name: string) => `Hola ${name}, ponte comodo y disfruta la radio. Hay novedades en la fansite.`,
    ];

    const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];
    if (user?.displayName) {
      return pick(userMessages)(user.displayName);
    }
    return pick(guestMessages);
  }, [user?.displayName]);

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

  return (
    <nav className="site-shell sticky top-0 z-50 w-full" data-testid="top-nav-bar">
      <div className="site-hero-band site-hero-skyline">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-5 relative z-10">
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr] items-center">
            <Link href="/" className="flex items-center gap-4 min-w-0" data-testid="nav-logo">
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-label="HabboSpeed Logo" className="flex-shrink-0 drop-shadow-lg">
                <rect width="56" height="56" rx="14" fill="#2b6cb0" />
                <rect x="10" y="10" width="7" height="7" fill="white" />
                <rect x="17" y="10" width="7" height="7" fill="white" />
                <rect x="24" y="10" width="7" height="7" fill="white" />
                <rect x="10" y="17" width="7" height="7" fill="white" />
                <rect x="24" y="17" width="7" height="7" fill="white" />
                <rect x="10" y="24" width="7" height="7" fill="white" />
                <rect x="17" y="24" width="7" height="7" fill="white" />
                <rect x="24" y="24" width="7" height="7" fill="white" />
                <rect x="31" y="17" width="14" height="5" fill="rgba(255,255,255,0.56)" />
                <rect x="38" y="22" width="7" height="5" fill="rgba(255,255,255,0.56)" />
                <rect x="31" y="27" width="14" height="5" fill="rgba(255,255,255,0.56)" />
              </svg>
              <div className="min-w-0">
                <p className="font-pixel text-[11px] sm:text-sm text-white tracking-wide drop-shadow">HABBOSPEED</p>
                <p className="text-white/80 text-xs sm:text-sm font-medium max-w-xl truncate">
                  La fansite de Habbo con radio, noticias, foros, armario y herramientas.
                </p>
              </div>
            </Link>

            <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 p-3 sm:p-4">
                <Link href={`/profile/${user?.habboUsername || user?.displayName || "HabboSpeed"}`} className="hidden sm:block w-16 h-16 rounded-xl bg-black/20 border border-white/10 overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-primary/50 transition-all">
                  <img
                    src={proxyImage(`https://www.habbo.es/habbo-imaging/avatarimage?user=${user?.habboUsername || "HabboSpeed"}&size=b&headonly=0&direction=3&head_direction=3&gesture=sml`) }
                    alt={user?.displayName || "HabboSpeed"}
                    className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/70 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 live-indicator" />
                    En vivo ahora
                  </div>
                  <p className="text-sm sm:text-base font-bold text-white mt-1 truncate">
                    {user ? `Welcome back ${user.displayName}!` : "Join the community today"}
                  </p>
                  <p className="text-xs text-white/75 mt-1 line-clamp-2">
                    Noticias, radio, armario, placas y foros en una sola portada limpia y rápida.
                  </p>
                </div>
                <div className="hidden lg:flex flex-col items-end gap-2 flex-shrink-0">
                  <Badge className="bg-sky-200/20 text-white border-white/15 text-[10px]">Fansite 2026</Badge>
                  <div className="flex gap-2 items-center">
                    <Link href="/news" className="inline-flex items-center rounded-lg bg-white text-slate-900 px-3 py-2 text-[11px] font-bold hover:bg-slate-100">
                      Noticias
                    </Link>
                    <Link href="/armario" className="inline-flex items-center rounded-lg bg-slate-900/60 text-white px-3 py-2 text-[11px] font-bold hover:bg-slate-900/80">
                      Armario
                    </Link>
                    <button
                      onClick={() => setFootballMode((p) => !p)}
                      className="ml-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg football-toggle-badge hover:opacity-90 transition-opacity"
                      title="Activar modo fútbol"
                      data-testid="button-toggle-football"
                    >
                      ⚽ Modo Fútbol
                    </button>
                  </div>
                </div>
                <button
                  className="lg:hidden text-white/90 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  data-testid="button-mobile-menu"
                  aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="site-status-bar border-y border-white/10">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
          <div className="flex items-center gap-3 py-2.5">
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <span className="font-bold text-[11px] uppercase tracking-[0.24em] text-white/90 whitespace-nowrap">DJ says:</span>
              <span className="text-[12px] text-white/85 truncate">
                {djMessage}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              <Link href="/schedule" className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white hover:bg-white/15">
                <Clock className="w-3.5 h-3.5" />
                Horarios
              </Link>
              <Link href="/forum" className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white hover:bg-white/15">
                <MessageSquare className="w-3.5 h-3.5" />
                Foro
              </Link>
            </div>
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0 text-white/80">
              <Link
                href="/schedule"
                className="w-7 h-7 rounded-md bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
                aria-label="Horarios de radio"
                title="Horarios de radio"
              >
                📻
              </Link>
              <Link
                href="/news"
                className="w-7 h-7 rounded-md bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
                aria-label="Alertas y noticias"
                title="Alertas y noticias"
              >
                ⚠️
              </Link>
              <Link
                href="/forum"
                className="w-7 h-7 rounded-md bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
                aria-label="Foro"
                title="Foro"
              >
                💬
              </Link>
              <Link
                href="/contact"
                className="w-7 h-7 rounded-md bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
                aria-label="Contacto"
                title="Contacto"
              >
                🎧
              </Link>
              {isDjOrAdmin && (
                <Link
                  href="/djpanel"
                  className="w-7 h-7 rounded-md bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
                  aria-label="Panel DJ"
                  title="Panel DJ"
                >
                  🎚️
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/panel"
                  className="w-7 h-7 rounded-md bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
                  aria-label="Panel Admin"
                  title="Panel Admin"
                >
                  🛠️
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-md animate-fade-in-up">
          <div className="max-w-[1600px] mx-auto px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = item.href === "/" ? location === "/" : location.startsWith(item.href);
              const MobileIcon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive ? "bg-white/10 text-white" : "text-white/75 hover:text-white hover:bg-white/8"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                >
                  <MobileIcon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-white" : "text-white/60")} />
                  {item.label}
                </Link>
              );
            })}

            {!user && (
              <div className="flex items-center gap-2 px-3">
                <Link
                  href="/login"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2.5 text-sm font-semibold text-white hover:bg-white/15"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-nav-login"
                >
                  <LogIn className="w-4 h-4" />
                  Iniciar sesion
                </Link>
                <Link
                  href="/register"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2.5 text-sm font-semibold text-white hover:bg-white/15"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-nav-register"
                >
                  <UserPlus className="w-4 h-4" />
                  Registro
                </Link>
              </div>
            )}

            {user && (
              <Link
                href="/messages"
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-white/75 hover:text-white hover:bg-white/8"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-nav-mensajes"
              >
                <span className="flex items-center gap-3">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  MENSAJES
                </span>
                {unreadCount > 0 && (
                  <Badge className="bg-white text-slate-900 text-[9px] py-0 px-1.5">{unreadCount > 9 ? "9+" : unreadCount}</Badge>
                )}
              </Link>
            )}

            {user && (
              <Link
                href="/tienda"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/75 hover:text-white hover:bg-white/8"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-nav-tienda"
              >
                <ShoppingCart className="w-4 h-4 flex-shrink-0" />
                TIENDA SP
              </Link>
            )}

            {isDjOrAdmin && (
              <Link
                href="/djpanel"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/75 hover:text-white hover:bg-white/8"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-nav-djpanel"
              >
                <Headphones className="w-4 h-4 flex-shrink-0" />
                PANEL DJ
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/panel"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/75 hover:text-white hover:bg-white/8"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-nav-admin"
              >
                <Settings className="w-4 h-4 flex-shrink-0" />
                PANEL ADMIN
              </Link>
            )}

            <div className="pt-2 mt-2 border-t border-white/10 text-[11px] text-white/70">
              En vivo ahora. Usa las secciones para escuchar, leer y participar.
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
