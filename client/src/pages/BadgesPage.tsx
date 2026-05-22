import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Award, Radio, Trophy, Sparkles, Compass, Cat, Hammer, CalendarDays } from "lucide-react";

const HOTELS = [
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

  // 1. Staff / Especiales
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

  // 2. Radio
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

  // 3. Logros / Achievements
  if (code.startsWith("ACH") || code.startsWith("ACH_")) {
    return "achievements";
  }

  // 4. Mascotas / Pets
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

  // 5. Juegos / Games
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

  // 6. Salas / Room Builder
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

  // Default: Eventos / Internacionales
  return "events";
};

export default function BadgesPage() {
  const [search, setSearch] = useState("");
  const [hotel, setHotel] = useState("es");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: habboApiBadges, isLoading: loadingExternal } = useQuery<any[]>({
    queryKey: ["/api/habbo/badges", hotel],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/habbo/badges/${hotel}?limit=100`);
      const d = await res.json();
      return Array.isArray(d) ? d : (d.badges || d.data || d.items || []);
    },
    staleTime: 120000,
    retry: false,
  });

  const { data: localBadges } = useQuery<any[]>({
    queryKey: ["/api/badges", search],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/badges${search ? `?q=${encodeURIComponent(search)}` : ""}`);
      return res.json();
    },
  });

  const allBadges = [
    ...(habboApiBadges || []),
    ...(localBadges || []),
  ];

  const displayBadges = allBadges.filter((b) => {
    // 1. Text search filter
    if (searchInput) {
      const code = b.code || b.badge_code || "";
      const name = b.name || b.badge_name || "";
      const matchesText = (
        code.toLowerCase().includes(searchInput.toLowerCase()) ||
        name.toLowerCase().includes(searchInput.toLowerCase())
      );
      if (!matchesText) return false;
    }

    // 2. Category filter
    if (selectedCategory !== "all") {
      const cat = getBadgeCategory(b);
      if (cat !== selectedCategory) return false;
    }

    return true;
  });

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-6">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="flex items-center gap-3">
        <Award className="w-6 h-6 text-yellow-400 animate-pulse" />
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Explorador de Placas
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código o nombre..."
            className="pl-9 bg-card/50 border-border/40 focus:border-primary/60 transition-colors"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            data-testid="input-badge-search"
          />
        </div>
        <Select value={hotel} onValueChange={(v) => { setHotel(v); setSelectedCategory("all"); }}>
          <SelectTrigger className="w-full sm:w-52 bg-card/50 border-border/40" data-testid="select-hotel">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HOTELS.map((h) => (
              <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category Tabs */}
      <div className="w-full overflow-x-auto no-scrollbar py-2 flex items-center gap-2 border-b border-border/40 pb-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          
          // Count badges in this category
          const count = cat.id === "all" 
            ? allBadges.length 
            : allBadges.filter(b => getBadgeCategory(b) === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 backdrop-blur-md border ${
                isActive
                  ? "bg-primary/20 text-primary border-primary/50 shadow-[0_0_15px_rgba(139,92,246,0.15)] scale-[1.02]"
                  : "bg-card/40 text-muted-foreground border-border/40 hover:text-foreground hover:bg-card/70 hover:border-border/80"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <span>{cat.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                isActive 
                  ? "bg-primary/30 text-primary-foreground font-bold" 
                  : "bg-muted text-muted-foreground"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Badge count */}
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs border-primary/30 bg-primary/5 text-primary">
            {displayBadges.length} {displayBadges.length === 1 ? 'placa' : 'placas'}
          </Badge>
          <span className="text-xs text-muted-foreground">Hotel: {hotel}</span>
        </div>
      </div>

      {/* Badges Grid */}
      {loadingExternal ? (
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
          {Array.from({ length: 48 }).map((_, i) => (
            <Skeleton key={i} className="w-12 h-12 rounded-lg bg-card/60" />
          ))}
        </div>
      ) : (
        <TooltipProvider>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
            {displayBadges.map((badge, i) => {
              const code = badge.code || badge.badge_code || "";
              const name = (badge.name || badge.badge_name || code).replace(/\n/g, "");
              const description = (badge.description || badge.badge_description || "").replace(/\n/g, "");
              const imgUrl = badge.url_habbo || badge.url_habboassets || badge.imageUrl || badge.image_url || `https://images.habbo.com/c_images/album1584/${code}.gif`;

              return (
                <Tooltip key={`${code}-${i}`}>
                  <TooltipTrigger asChild>
                    <div
                      className="w-12 h-12 bg-card/30 border border-border/40 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:border-primary/50 hover:bg-card/60 hover:scale-105 hover:shadow-[0_0_10px_rgba(139,92,246,0.1)] overflow-hidden"
                      data-testid={`badge-${code}`}
                    >
                      <img
                        src={imgUrl}
                        alt={name}
                        className="w-10 h-10 object-contain"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.opacity = "0.15";
                        }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px] bg-card border-border/60 backdrop-blur-md">
                    <p className="text-xs font-semibold text-foreground">{name}</p>
                    {code && <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{code}</p>}
                    {description && <p className="text-[10px] text-muted-foreground/80 mt-1.5 border-t border-border/40 pt-1">{description}</p>}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      )}

      {!loadingExternal && displayBadges.length === 0 && (
        <div className="text-center py-16 text-muted-foreground bg-card/10 rounded-xl border border-dashed border-border/40">
          <Award className="w-10 h-10 mx-auto mb-3 opacity-30 text-primary" />
          <p className="text-sm">No se encontraron placas en esta categoría</p>
        </div>
      )}
    </div>
  );
}

