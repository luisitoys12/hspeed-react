import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Award, Radio, Trophy, Sparkles, Compass, Cat, Hammer, CalendarDays, RefreshCw } from "lucide-react";

const HOTELS = [
  { value: "all", label: "Todos los Hoteles" },
  { value: "es", label: "Habbo.es (España)" },
  { value: "com", label: "Habbo.com" },
  { value: "com.br", label: "Habbo Brasil" },
  { value: "de", label: "Habbo.de" },
  { value: "fi", label: "Habbo.fi" },
  { value: "fr", label: "Habbo.fr" },
  { value: "it", label: "Habbo.it" },
  { value: "nl", label: "Habbo.nl" },
  { value: "tr", label: "Habbo.com.tr" },
];

const CATEGORIES = [
  { id: "all", label: "Todas", icon: Sparkles },
  { id: "special", label: "Especiales", icon: Award },
  { id: "radio", label: "Radio", icon: Radio },
  { id: "achievements", label: "Logros", icon: Compass },
  { id: "pets", label: "Mascotas", icon: Cat },
  { id: "games", label: "Juegos", icon: Trophy },
  { id: "building", label: "Construcción", icon: Hammer },
  { id: "events", label: "Eventos", icon: CalendarDays },
];

const getBadgeCategory = (badge: any): string => {
  if (badge.category) {
    const cat = badge.category.toLowerCase();
    if (cat === "especial" || cat === "especiales" || cat === "staff") return "special";
    if (cat === "radio" || cat === "música" || cat === "musica") return "radio";
    if (cat === "logros" || cat === "achievements" || cat === "identity" || cat === "tutorial" || cat === "explore" || cat === "social") return "achievements";
    if (cat === "mascotas" || cat === "pets") return "pets";
    if (cat === "juegos" || cat === "games") return "games";
    if (cat === "construcción" || cat === "construccion" || cat === "room_builder" || cat === "salas") return "building";
    if (cat === "eventos" || cat === "events" || cat === "general") return "events";
  }

  const code = (badge.code || badge.badge_code || "").toUpperCase();
  const name = (badge.name || badge.badge_name || "").toLowerCase();
  const desc = (badge.description || badge.badge_description || "").toLowerCase();

  if (
    code.startsWith("ADM") ||
    code.startsWith("COM") ||
    code.startsWith("HS") ||
    name.includes("staff") ||
    name.includes("admin") ||
    name.includes("habbospeed") ||
    desc.includes("exclusiva de administrador") ||
    desc.includes("staff de habbospeed")
  ) {
    return "special";
  }

  if (
    name.includes("radio") ||
    name.includes("música") ||
    name.includes("musica") ||
    name.includes("dj") ||
    name.includes("micrófono") ||
    name.includes("microfono") ||
    name.includes("locutor") ||
    name.includes("oyente") ||
    desc.includes("radio") ||
    desc.includes("sintonizar") ||
    desc.includes("locutor") ||
    desc.includes("oyente") ||
    code.startsWith("UK084") ||
    code.startsWith("ES992")
  ) {
    return "radio";
  }

  if (code.startsWith("ACH") || code.startsWith("ACH_")) {
    return "achievements";
  }

  if (
    name.includes("mascota") ||
    name.includes("pet") ||
    name.includes("perro") ||
    name.includes("gato") ||
    name.includes("caballo") ||
    name.includes("animal") ||
    desc.includes("mascota") ||
    desc.includes("gato") ||
    desc.includes("perro") ||
    desc.includes("animal")
  ) {
    return "pets";
  }

  if (
    name.includes("juego") ||
    name.includes("game") ||
    name.includes("torneo") ||
    name.includes("concurso") ||
    name.includes("ganador") ||
    name.includes("campeón") ||
    name.includes("campeon") ||
    desc.includes("juego") ||
    desc.includes("ganar") ||
    desc.includes("partida") ||
    desc.includes("ganador") ||
    desc.includes("campeón")
  ) {
    return "games";
  }

  if (
    name.includes("sala") ||
    name.includes("build") ||
    name.includes("constru") ||
    name.includes("arquitecto") ||
    desc.includes("sala") ||
    desc.includes("construir") ||
    desc.includes("arquitecto")
  ) {
    return "building";
  }

  return "events";
};

export default function BadgesPage() {
  const [hotel, setHotel] = useState("es");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Pagination State
  const [badges, setBadges] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isAutoLoadingAll, setIsAutoLoadingAll] = useState(false);
  const LIMIT = 500;

  const qc = useQueryClient();

  // Fetch local fansite badges
  const { data: localBadges } = useQuery<any[]>({
    queryKey: ["/api/badges", activeSearch],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/badges${activeSearch ? `?q=${encodeURIComponent(activeSearch)}` : ""}`);
      return res.json();
    },
  });

  const fetchBadges = useCallback(async (pageNum: number, searchVal: string, hotelVal: string, catVal: string, append: boolean) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setPage(0);
    }

    try {
      // Map category to a typical term to help backend narrow it down if no search term is entered
      let categoryTerm = "";
      if (!searchVal && catVal !== "all") {
        if (catVal === "special") categoryTerm = "staff";
        else if (catVal === "radio") categoryTerm = "dj";
        else if (catVal === "achievements") categoryTerm = "ACH";
        else if (catVal === "pets") categoryTerm = "pet";
        else if (catVal === "games") categoryTerm = "game";
        else if (catVal === "building") categoryTerm = "build";
        else if (catVal === "events") categoryTerm = "event";
      }

      const queryTerm = searchVal || categoryTerm;
      const res = await apiRequest(
        "GET", 
        `/api/habbo/badges/${hotelVal}?limit=${LIMIT}&offset=${pageNum * LIMIT}&term=${encodeURIComponent(queryTerm)}`
      );
      
      const d = await res.json();
      const rawList = Array.isArray(d) ? d : (d.badges || d.data || d.items || []);
      const mappedList = rawList.map((b: any) => ({
        code: b.code || b.badge_code || "",
        name: b.name || b.badge_name || b.code || "",
        description: b.description || b.badge_description || "",
        url_habbo: b.url_habbo || b.image_url || `https://images.habbo.com/c_images/album1584/${b.code}.gif`,
      }));

      if (append) {
        setBadges(prev => [...prev, ...mappedList]);
      } else {
        setBadges(mappedList);
      }

      setHasMore(mappedList.length === LIMIT);
    } catch (e) {
      console.error("Error fetching badges:", e);
      if (!append) setBadges([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load or filters change
  useEffect(() => {
    setIsAutoLoadingAll(false);
    fetchBadges(0, activeSearch, hotel, selectedCategory, false);
  }, [hotel, activeSearch, selectedCategory, fetchBadges]);

  const handleSearch = () => {
    setIsAutoLoadingAll(false);
    setActiveSearch(searchInput.trim());
  };

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setPage(prev => {
      const nextPage = prev + 1;
      fetchBadges(nextPage, activeSearch, hotel, selectedCategory, true);
      return nextPage;
    });
  }, [loadingMore, hasMore, activeSearch, hotel, selectedCategory, fetchBadges]);

  // Automatic pagination loop for loading all badges
  useEffect(() => {
    if (isAutoLoadingAll && !loadingMore && !loading && hasMore) {
      const timer = setTimeout(() => {
        handleLoadMore();
      }, 300);
      return () => clearTimeout(timer);
    } else if (isAutoLoadingAll && !hasMore) {
      setIsAutoLoadingAll(false);
    }
  }, [isAutoLoadingAll, loadingMore, loading, hasMore, handleLoadMore]);

  const handleRefresh = async () => {
    setIsAutoLoadingAll(false);
    await qc.invalidateQueries({ queryKey: ["/api/badges"] });
    fetchBadges(0, activeSearch, hotel, selectedCategory, false);
  };

  // Combine fansite and habbo badges
  const allBadges = [
    ...(localBadges || []).map(b => ({ ...b, category: "special" })),
    ...badges,
  ];

  // Filter combined list by category (local filtering)
  const displayBadges = allBadges.filter((b) => {
    if (selectedCategory !== "all") {
      const cat = getBadgeCategory(b);
      if (cat !== selectedCategory) return false;
    }
    return true;
  });

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Header */}
      <div className="site-panel-strong p-5 sm:p-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="site-kicker">Colección</p>
          <h1 className="site-title mt-2 flex items-center gap-3">
            <Award className="w-6 h-6 text-yellow-400 animate-bounce" />
            Explorador de Placas
          </h1>
          <p className="text-xs text-muted-foreground mt-2 max-w-2xl">
            Busca y explora la base de datos completa de placas de Habbo. Carga miles de placas con paginación optimizada.
          </p>
        </div>
        <Badge variant="outline" className="w-fit border-primary/30 bg-primary/5 text-primary text-[10px] py-1 font-bold">
          {displayBadges.length} cargadas
        </Badge>
      </div>

      {/* Filters */}
      <div className="site-panel p-3 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código o palabra clave... (Ej: ADM, ACH, dragon, staff)"
              className="pl-9 bg-card/50 border-border/40 focus:border-primary/60 transition-colors text-xs h-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              data-testid="input-badge-search"
            />
          </div>
          <Button onClick={handleSearch} className="bg-primary hover:bg-primary/80 text-white font-bold text-xs h-9 px-5">
            Buscar
          </Button>
        </div>

        <Select value={hotel} onValueChange={(v) => { setHotel(v); setSelectedCategory("all"); }}>
          <SelectTrigger className="w-full sm:w-52 bg-card/50 border-border/40 text-xs h-9" data-testid="select-hotel">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HOTELS.map((h) => (
              <SelectItem key={h.value} value={h.value} className="text-xs">{h.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={handleRefresh}
          className="sm:w-auto w-full text-xs h-9 flex items-center gap-1.5"
          data-testid="button-badges-refresh"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Actualizar
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="w-full overflow-x-auto no-scrollbar py-2 flex items-center gap-2 border-b border-border/40 pb-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          const count = cat.id === "all" 
            ? allBadges.length 
            : allBadges.filter(b => getBadgeCategory(b) === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 backdrop-blur-md border ${
                isActive
                  ? "bg-primary/25 text-primary border-primary/50 shadow-[0_0_15px_rgba(139,92,246,0.15)] scale-[1.02]"
                  : "bg-card/40 text-muted-foreground border-border/40 hover:text-foreground hover:bg-card/70 hover:border-border/80"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <span>{cat.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                isActive 
                  ? "bg-primary/30 text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Badges Grid */}
      {loading ? (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-3">
          {Array.from({ length: 48 }).map((_, i) => (
            <Skeleton key={i} className="w-12 h-12 rounded-lg bg-card/60" />
          ))}
        </div>
      ) : displayBadges.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground bg-card/10 rounded-xl border border-dashed border-border/40">
          <Award className="w-10 h-10 mx-auto mb-3 opacity-30 text-primary" />
          <p className="text-sm">No se encontraron placas. Intenta buscar por código o cambiar el hotel.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <TooltipProvider>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-3">
              {displayBadges.map((badge, i) => {
                const code = badge.code || badge.badge_code || "";
                const name = (badge.name || badge.badge_name || code).replace(/\n/g, "");
                const description = (badge.description || badge.badge_description || "").replace(/\n/g, "");
                const imgUrl = badge.url_habbo || badge.url_habboassets || badge.imageUrl || badge.image_url || `https://images.habbo.com/c_images/album1584/${code}.gif`;

                return (
                  <Tooltip key={`${code}-${i}`}>
                    <TooltipTrigger asChild>
                      <div
                        className="group w-12 h-12 bg-card/30 border border-border/40 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:border-primary/50 hover:bg-card/60 hover:scale-105 hover:shadow-[0_0_10px_rgba(139,92,246,0.1)] overflow-hidden"
                        data-testid={`badge-${code}`}
                      >
                        <img
                          src={imgUrl}
                          alt={name}
                          className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-110"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.opacity = "0.15";
                          }}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[220px] bg-card border-border/60 backdrop-blur-md p-3 rounded-2xl shadow-xl">
                      <p className="text-xs font-bold text-foreground">{name}</p>
                      {code && <p className="text-[10px] text-primary/80 font-mono mt-0.5 font-bold uppercase">{code}</p>}
                      {description && (
                        <p className="text-[10px] text-muted-foreground leading-normal mt-1.5 border-t border-border/40 pt-1.5">
                          {description}
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>

          {/* Pagination Controls */}
          <div className="flex flex-col items-center justify-center gap-4 pt-4">
            {/* Loading status */}
            {isAutoLoadingAll && (
              <div className="w-full max-w-lg bg-primary/10 border border-primary/20 rounded-2xl p-5 text-center space-y-3 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                <p className="text-xs font-extrabold text-primary flex items-center justify-center gap-2 tracking-wider">
                  <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                  CARGANDO TODAS LAS PLACAS DEL HOTEL HABBO...
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
                  Se han cargado <span className="font-bold text-foreground text-sm">{displayBadges.length}</span> placas.
                  Habbo tiene miles de placas registradas, por lo que este proceso continuará solicitándolas de forma automática y secuencial.
                </p>
                <div className="flex justify-center pt-2">
                  <Button 
                    onClick={() => setIsAutoLoadingAll(false)} 
                    variant="destructive" 
                    size="sm"
                    className="font-extrabold text-xs h-8 px-6 rounded-full hover:scale-105 transition-transform"
                  >
                    Detener Carga
                  </Button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-3">
              {/* Load More Button */}
              {hasMore && !isAutoLoadingAll && (
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore || loading}
                  className="bg-primary hover:bg-primary/95 text-white font-extrabold text-xs h-10 px-8 rounded-full shadow-lg shadow-primary/20 tracking-wider uppercase transition-all duration-300"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> CARGANDO PLACAS...
                    </span>
                  ) : (
                    <span>Cargar más placas (+{LIMIT})</span>
                  )}
                </Button>
              )}

              {/* Load All Button */}
              {hasMore && !isAutoLoadingAll && (
                <Button
                  onClick={() => setIsAutoLoadingAll(true)}
                  disabled={loadingMore || loading}
                  variant="outline"
                  className="border-primary/50 hover:bg-primary/10 text-primary hover:text-primary-foreground font-extrabold text-xs h-10 px-8 rounded-full shadow-md tracking-wider uppercase transition-all duration-300"
                >
                  <span>Cargar todas las placas</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
