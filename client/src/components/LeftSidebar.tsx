import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function LeftSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const navItems = [
    {
      href: "/",
      label: "Página inicial",
      icon: "fa-solid fa-house",
      iconColor: "text-cyan-500",
      active: location === "/",
    },
    {
      href: "/news",
      label: "Noticias",
      icon: "fa-solid fa-newspaper",
      iconColor: "text-blue-500",
      active: location.startsWith("/news"),
    },
    {
      href: user ? `/profile/${user.habboUsername || user.displayName}` : "/login",
      label: "Perfil Speed",
      icon: "fa-solid fa-user",
      iconColor: "text-indigo-400",
      active: location.startsWith("/profile") || location === "/login",
    },
    {
      href: "/forum",
      label: "Cihabbo Foro",
      icon: "fa-solid fa-comments",
      iconColor: "text-teal-400",
      active: location.startsWith("/forum"),
    },
    {
      href: "/futbol-hub",
      label: "Fútbol Hub",
      icon: "fa-solid fa-futbol",
      iconColor: "text-emerald-500",
      active: location.startsWith("/futbol-hub"),
    },
    {
      href: "/tienda",
      label: "Tienda SP",
      icon: "fa-solid fa-cart-shopping",
      iconColor: "text-yellow-500",
      active: location === "/tienda" || location === "/shop" || location === "/catalog",
    },
    {
      href: "/badges",
      label: "Mis Badges",
      icon: "fa-solid fa-award",
      iconColor: "text-amber-500",
      active: location.startsWith("/badges"),
    },
    {
      href: "/radio",
      label: "Radio en Vivo",
      icon: "fa-solid fa-radio",
      iconColor: "text-red-400",
      active: location.startsWith("/radio") || location.startsWith("/song-history"),
    },
    {
      href: "/team",
      label: "Equipo Staff",
      icon: "fa-solid fa-users",
      iconColor: "text-purple-400",
      active: location.startsWith("/team"),
    },
    {
      href: "/feria",
      label: "Feria & Logros",
      icon: "fa-solid fa-trophy",
      iconColor: "text-amber-400",
      active: location.startsWith("/feria"),
    },
    {
      href: "/rooms",
      label: "Habbo Hotel",
      icon: "fa-solid fa-hotel",
      iconColor: "text-cyan-400",
      active: location.startsWith("/rooms"),
    },
    {
      href: "/herramientas",
      label: "Herramientas",
      icon: "fa-solid fa-screwdriver-wrench",
      iconColor: "text-slate-400",
      active: location.startsWith("/herramientas") || location.startsWith("/armario") || location.startsWith("/imager"),
    },
  ];

  return (
    <aside className="w-full lg:w-48 flex-shrink-0" data-testid="left-sidebar-navigation">
      <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl shadow-xs border transition-all flex-shrink-0 ${
              item.active
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black border-cyan-400 shadow-cyan-500/10"
                : "bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold border-slate-200/80 dark:border-slate-800/80 hover:border-cyan-400"
            }`}
          >
            <i className={`${item.icon} ${item.active ? item.iconColor : "text-slate-400"} w-4 text-center transition-colors`}></i>
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
