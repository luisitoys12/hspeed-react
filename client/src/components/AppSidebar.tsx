import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  Home, Newspaper, Calendar, Clock, Users, MessageCircle,
  Award, ShoppingBag, Image, MessageSquare, Mail, LogIn,
  UserPlus, User, Settings, Radio, ChevronRight, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Inicio" },
  { href: "/news", icon: Newspaper, label: "Noticias" },
  { href: "/events", icon: Calendar, label: "Eventos" },
  { href: "/schedule", icon: Clock, label: "Horarios" },
  { href: "/team", icon: Users, label: "Equipo" },
  { href: "/forum", icon: MessageCircle, label: "Foro" },
];

const toolItems = [
  { href: "/badges", icon: Award, label: "Placas" },
  { href: "/marketplace", icon: ShoppingBag, label: "Marketplace" },
  { href: "/imager", icon: Image, label: "Imager" },
  { href: "/contact", icon: Mail, label: "Contacto" },
];

interface SidebarProps {
  collapsed?: boolean;
}

function NavLink({ href, icon: Icon, label, collapsed }: { href: string; icon: any; label: string; collapsed?: boolean }) {
  const [location] = useLocation();
  const isActive = location === href || (href !== "/" && location.startsWith(href));

  return (
    <Link href={href}>
      <a
        data-testid={`nav-link-${label.toLowerCase()}`}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group",
          isActive
            ? "bg-primary/15 text-primary border border-primary/20 glow-purple"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
        )}
      >
        <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary transition-colors")} />
        {!collapsed && <span className="truncate">{label}</span>}
        {!collapsed && isActive && <ChevronRight className="w-3 h-3 ml-auto text-primary/60" />}
      </a>
    </Link>
  );
}

export default function AppSidebar({ collapsed }: SidebarProps) {
  const { user, logout, isAdmin } = useAuth();

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-sidebar-background border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
        <div className="flex-shrink-0">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-label="HabboSpeed Logo">
            <rect width="32" height="32" rx="6" fill="hsl(262 84% 58%)" />
            <rect x="6" y="6" width="4" height="4" fill="white" />
            <rect x="10" y="6" width="4" height="4" fill="white" />
            <rect x="14" y="6" width="4" height="4" fill="white" />
            <rect x="6" y="10" width="4" height="4" fill="white" />
            <rect x="14" y="10" width="4" height="4" fill="white" />
            <rect x="6" y="14" width="4" height="4" fill="white" />
            <rect x="10" y="14" width="4" height="4" fill="white" />
            <rect x="14" y="14" width="4" height="4" fill="white" />
            <rect x="18" y="10" width="8" height="3" fill="#a78bfa" />
            <rect x="22" y="13" width="4" height="3" fill="#a78bfa" />
            <rect x="18" y="16" width="8" height="3" fill="#a78bfa" />
            <rect x="18" y="19" width="4" height="3" fill="#a78bfa" />
            <rect x="18" y="22" width="8" height="3" fill="#a78bfa" />
          </svg>
        </div>
        {!collapsed && (
          <div>
            <p className="font-pixel text-[9px] text-primary glow-text leading-tight">HABBO</p>
            <p className="font-pixel text-[9px] text-primary/70 leading-tight">SPEED</p>
          </div>
        )}
        {!collapsed && (
          <div className="ml-auto flex-shrink-0">
            <span className="flex items-center gap-1 text-[9px] text-red-400 font-medium">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full live-indicator inline-block" />
              LIVE
            </span>
          </div>
        )}
      </div>

      {/* Nav Scroll area */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {/* Main Nav */}
        {!collapsed && <p className="text-[10px] font-medium text-muted-foreground px-3 pb-1 uppercase tracking-wider">Principal</p>}
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} collapsed={collapsed} />
        ))}

        <Separator className="my-2 border-sidebar-border" />

        {/* Tools */}
        {!collapsed && <p className="text-[10px] font-medium text-muted-foreground px-3 pb-1 uppercase tracking-wider">Herramientas</p>}
        {toolItems.map((item) => (
          <NavLink key={item.href} {...item} collapsed={collapsed} />
        ))}

        {/* Admin link */}
        {isAdmin && (
          <>
            <Separator className="my-2 border-sidebar-border" />
            {!collapsed && <p className="text-[10px] font-medium text-muted-foreground px-3 pb-1 uppercase tracking-wider">Admin</p>}
            <NavLink href="/panel" icon={Settings} label="Panel Admin" collapsed={collapsed} />
          </>
        )}
      </div>

      {/* User section */}
      <div className="p-3 border-t border-sidebar-border">
        {user ? (
          <div className="flex items-center gap-2">
            {user.habboUsername ? (
              <img
                src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${user.habboUsername}&size=s&headonly=1`}
                alt={user.displayName}
                className="w-8 h-8 rounded bg-secondary flex-shrink-0 object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = ""; }}
                data-testid="img-user-avatar"
              />
            ) : (
              <div className="w-8 h-8 rounded bg-secondary flex-shrink-0 flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" data-testid="text-username">{user.displayName}</p>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-[9px] border-primary/30 text-primary/80 py-0">
                    {user.role}
                  </Badge>
                  <span className="text-[10px] text-yellow-400 font-medium">⚡ {user.speedPoints}</span>
                </div>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={logout}
                className="text-muted-foreground hover:text-destructive transition-colors"
                data-testid="button-logout"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className={cn("flex gap-2", collapsed ? "flex-col items-center" : "")}>
            <Link href="/login">
              <a data-testid="link-login" className="flex-1">
                <Button variant="outline" size="sm" className={cn("border-primary/30 text-primary hover:bg-primary/10 text-xs", collapsed ? "w-8 h-8 p-0" : "w-full")}>
                  {collapsed ? <LogIn className="w-3.5 h-3.5" /> : <><LogIn className="w-3 h-3 mr-1.5" />Entrar</>}
                </Button>
              </a>
            </Link>
            {!collapsed && (
              <Link href="/register">
                <a data-testid="link-register">
                  <Button size="sm" className="bg-primary hover:bg-primary/80 text-white text-xs">
                    <UserPlus className="w-3 h-3 mr-1.5" />Registro
                  </Button>
                </a>
              </Link>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
