import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FloatingRadioPlayer from "@/components/FloatingRadioPlayer";
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
  Home,
  Newspaper,
  Calendar,
  MessageSquare,
  Award,
  TrendingUp,
  Users,
  Shirt,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const navItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "INICIO", icon: Home },
  { href: "/news", label: "NOTICIAS", icon: Newspaper },
  { href: "/events", label: "EVENTOS", icon: Calendar },
  { href: "/forum", label: "FORO", icon: MessageSquare },
  { href: "/badges", label: "PLACAS", icon: Award },
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
    <Link href={href}>
      <a
        data-testid={`nav-link-${label.toLowerCase()}`}
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold tracking-wide transition-all whitespace-nowrap rounded-md relative group",
          isActive
            ? "text-primary bg-primary/10"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
        )}
        title={label}
      >
        {isActive && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
        )}
        {label}
      </a>
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

  const emoji = decorations?.emoji || "";

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
    <nav
      className="sticky top-0 z-50 w-full bg-card/98 backdrop-blur-md border-b border-border shadow-sm"
      data-testid="top-nav-bar"
    >
      {/* ── ROW 1: Logo | Auth ─────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex items-center h-14 gap-3">
          {/* Left: Logo */}
          <Link href="/">
            <a
              className="flex items-center gap-2.5 flex-shrink-0 group"
              data-testid="nav-logo"
            >
              {/* SVG logo mark */}
              <svg
                width="30"
                height="30"
                viewBox="0 0 32 32"
                fill="none"
                aria-label="HabboSpeed Logo"
                className="flex-shrink-0"
              >
                <rect
                  width="32"
                  height="32"
                  rx="6"
                  className="fill-primary"
                />
                <rect x="6" y="6" width="4" height="4" fill="white" />
                <rect x="10" y="6" width="4" height="4" fill="white" />
                <rect x="14" y="6" width="4" height="4" fill="white" />
                <rect x="6" y="10" width="4" height="4" fill="white" />
                <rect x="14" y="10" width="4" height="4" fill="white" />
                <rect x="6" y="14" width="4" height="4" fill="white" />
                <rect x="10" y="14" width="4" height="4" fill="white" />
                <rect x="14" y="14" width="4" height="4" fill="white" />
                <rect
                  x="18"
                  y="10"
                  width="8"
                  height="3"
                  className="fill-primary/60"
                />
                <rect
                  x="22"
                  y="13"
                  width="4"
                  height="3"
                  className="fill-primary/60"
                />
                <rect
                  x="18"
                  y="16"
                  width="8"
                  height="3"
                  className="fill-primary/60"
                />
                <rect
                  x="18"
                  y="19"
                  width="4"
                  height="3"
                  className="fill-primary/60"
                />
                <rect
                  x="18"
                  y="22"
                  width="8"
                  height="3"
                  className="fill-primary/60"
                />
              </svg>
              <div className="hidden sm:block leading-none">
                <span className="font-pixel text-[9px] text-theme-gradient block">
                  HABBO
                </span>
                <span className="font-pixel text-[8px] text-muted-foreground block">
                  SPEED
                </span>
              </div>
              {emoji && (
                <span className="text-sm hidden md:inline" aria-hidden="true">
                  {emoji}
                </span>
              )}
            </a>
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right: auth area */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Auth area */}
            {user ? (
              <div className="relative flex items-center gap-2">
                {/* Unread messages badge icon */}
                {unreadCount > 0 && (
                  <Link href="/messages">
                    <a className="relative flex-shrink-0" data-testid="button-messages-badge">
                      <Mail className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                      <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 bg-primary text-white text-[8px] rounded-full flex items-center justify-center px-0.5">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    </a>
                  </Link>
                )}
                <button
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  data-testid="button-user-menu"
                >
                  {user.habboUsername ? (
                    <img
                      src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${user.habboUsername}&size=s&headonly=1`}
                      alt={user.displayName}
                      className="w-7 h-7 rounded bg-muted object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                      data-testid="img-user-avatar"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded bg-muted flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  )}
                  <span className="hidden sm:inline text-xs font-medium text-foreground truncate max-w-[120px]" data-testid="text-username">
                    {user.displayName}
                  </span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block flex-shrink-0" />
                </button>

                {/* Dropdown menu */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-lg shadow-xl z-50 py-1 animate-fade-in-up">
                      <div className="px-3 py-2 border-b border-border">
                        <p className="text-sm font-medium" data-testid="text-dropdown-username">{user.displayName}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge
                            variant="outline"
                            className="text-[9px] border-primary/30 text-primary/80 py-0"
                          >
                            {user.role}
                          </Badge>
                          <span className="text-[10px] text-yellow-400 font-medium">
                            ⚡ {user.speedPoints}
                          </span>
                        </div>
                      </div>
                      <Link href={`/profile/${user.habboUsername || user.displayName}`}>
                        <a
                          className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                          data-testid="link-profile"
                        >
                          <User className="w-3.5 h-3.5" />
                          Mi Perfil
                        </a>
                      </Link>
                      <Link href="/messages">
                        <a
                          className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                          data-testid="link-messages"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Mensajes
                        </a>
                      </Link>
                      {isDjOrAdmin && (
                        <Link href="/djpanel">
                          <a
                            className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                            data-testid="link-dj-panel"
                          >
                            <Headphones className="w-3.5 h-3.5" />
                            Panel DJ
                          </a>
                        </Link>
                      )}
                      {isAdmin && (
                        <Link href="/panel">
                          <a
                            className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                            data-testid="link-admin-panel"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            Panel Admin
                          </a>
                        </Link>
                      )}
                      <div className="border-t border-border mt-1 pt-1">
                        <button
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-muted-foreground hover:text-destructive hover:bg-muted/50 transition-colors"
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                          }}
                          data-testid="button-logout"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <a data-testid="link-login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/60 text-[11px] h-8 px-4 font-semibold"
                    >
                      <LogIn className="w-3 h-3 mr-1.5 flex-shrink-0" />
                      Entrar
                    </Button>
                  </a>
                </Link>
                <Link href="/register">
                  <a data-testid="link-register">
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/85 text-primary-foreground text-[11px] h-8 px-4 font-semibold"
                    >
                      <UserPlus className="w-3 h-3 mr-1.5 flex-shrink-0" />
                      Registro
                    </Button>
                  </a>
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="lg:hidden text-muted-foreground hover:text-foreground p-1.5 ml-1 rounded-md hover:bg-muted/50 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── ROW 2: Navigation bar (desktop only) ───────────────────── */}
      <div className="hidden lg:block border-t border-border/50 bg-card/80">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
            {user && (
              <Link href="/messages">
                <a
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold tracking-wide transition-all whitespace-nowrap rounded-md",
                    location.startsWith("/messages")
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                  data-testid="nav-link-mensajes"
                >
                  {location.startsWith("/messages") && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
                  )}
                  MENSAJES
                  {unreadCount > 0 && (
                    <span className="ml-0.5 min-w-[16px] h-4 bg-primary text-white text-[9px] rounded-full flex items-center justify-center px-1">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </a>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── ROW 3: Radio Player Bar (desktop only — full width like the reference) ── */}
      <div className="relative">
        <FloatingRadioPlayer />
      </div>

      {/* ── Mobile slide-down panel ─────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-card/99 backdrop-blur-md animate-fade-in-up">
          <div className="max-w-[1600px] mx-auto px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? location === "/"
                  : location.startsWith(item.href);
              const MobileIcon = item.icon;

              return (
                <Link key={item.href} href={item.href}>
                  <a
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                  >
                    <MobileIcon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-primary" : "")} />
                    {item.label}
                  </a>
                </Link>
              );
            })}

            {/* Messages link in mobile */}
            {user && (
              <Link href="/messages">
                <a
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-nav-mensajes"
                >
                  <span className="flex items-center gap-3">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    MENSAJES
                  </span>
                  {unreadCount > 0 && (
                    <Badge className="bg-primary text-white text-[9px] py-0 px-1.5">{unreadCount > 9 ? "9+" : unreadCount}</Badge>
                  )}
                </a>
              </Link>
            )}

            {/* DJ Panel link in mobile */}
            {isDjOrAdmin && (
              <Link href="/djpanel">
                <a
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-nav-djpanel"
                >
                  <Headphones className="w-4 h-4 flex-shrink-0" />
                  PANEL DJ
                </a>
              </Link>
            )}

            {/* Admin link in mobile */}
            {isAdmin && (
              <Link href="/panel">
                <a
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-nav-admin"
                >
                  <Settings className="w-4 h-4 flex-shrink-0" />
                  PANEL ADMIN
                </a>
              </Link>
            )}

            {/* Radio player in mobile */}
            <div className="pt-2 mt-2 border-t border-border">
              <FloatingRadioPlayer />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
