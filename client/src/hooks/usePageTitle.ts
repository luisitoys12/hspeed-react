import { useEffect } from "react";

const ROUTE_TITLES: Record<string, string> = {
  "/": "HabboSpeed - Inicio",
  "/news": "HabboSpeed - Noticias",
  "/events": "HabboSpeed - Eventos",
  "/schedule": "HabboSpeed - Horarios",
  "/team": "HabboSpeed - Equipo",
  "/badges": "HabboSpeed - Placas",
  "/marketplace": "HabboSpeed - Marketplace",
  "/imager": "HabboSpeed - Imager",
  "/forum": "HabboSpeed - Foro",
  "/contact": "HabboSpeed - Contacto",
  "/login": "HabboSpeed - Iniciar Sesión",
  "/register": "HabboSpeed - Registro",
  "/panel": "HabboSpeed - Panel de Administración",
  "/djpanel": "HabboSpeed - Panel DJ",
  "/messages": "HabboSpeed - Mensajes",
  "/legal": "HabboSpeed - Legal",
  "/privacy": "HabboSpeed - Privacidad",
};

export function usePageTitle(path: string) {
  useEffect(() => {
    // Try exact match first
    if (ROUTE_TITLES[path]) {
      document.title = ROUTE_TITLES[path];
      return;
    }
    // Try prefix match for dynamic routes
    if (path.startsWith("/news/")) {
      document.title = "HabboSpeed - Noticia";
    } else if (path.startsWith("/forum/")) {
      document.title = "HabboSpeed - Foro";
    } else if (path.startsWith("/profile/")) {
      document.title = "HabboSpeed - Perfil";
    } else if (path.startsWith("/panel/")) {
      document.title = "HabboSpeed - Panel de Administración";
    } else {
      document.title = "HabboSpeed";
    }
  }, [path]);
}
