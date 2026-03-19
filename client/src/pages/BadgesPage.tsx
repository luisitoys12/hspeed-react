import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Award } from "lucide-react";

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

export default function BadgesPage() {
  const [search, setSearch] = useState("");
  const [hotel, setHotel] = useState("es");
  const [searchInput, setSearchInput] = useState("");

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
    if (!searchInput) return true;
    const code = b.code || b.badge_code || "";
    const name = b.name || b.badge_name || "";
    return (
      code.toLowerCase().includes(searchInput.toLowerCase()) ||
      name.toLowerCase().includes(searchInput.toLowerCase())
    );
  });

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Award className="w-5 h-5 text-yellow-400" />
        <h1 className="text-xl font-bold">Explorador de Placas</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código o nombre..."
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            data-testid="input-badge-search"
          />
        </div>
        <Select value={hotel} onValueChange={(v) => setHotel(v)}>
          <SelectTrigger className="w-full sm:w-52" data-testid="select-hotel">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HOTELS.map((h) => (
              <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Badge count */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs border-primary/30 text-primary/80">
          {displayBadges.length} placas
        </Badge>
        <span className="text-xs text-muted-foreground">Hotel: {hotel}</span>
      </div>

      {/* Badges Grid */}
      {loadingExternal ? (
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
          {Array.from({ length: 48 }).map((_, i) => (
            <Skeleton key={i} className="w-12 h-12 rounded-lg" />
          ))}
        </div>
      ) : (
        <TooltipProvider>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
            {displayBadges.map((badge, i) => {
              const code = badge.code || badge.badge_code || "";
              const name = badge.name || badge.badge_name || code;
              const description = badge.description || badge.badge_description || "";
              const imgUrl = badge.url_habbo || badge.url_habboassets || badge.imageUrl || badge.image_url || `https://images.habbo.com/c_images/album1584/${code}.gif`;

              return (
                <Tooltip key={`${code}-${i}`}>
                  <TooltipTrigger asChild>
                    <div
                      className="w-12 h-12 bg-card border border-border rounded-lg flex items-center justify-center cursor-pointer badge-hover hover:border-primary/40 transition-colors overflow-hidden"
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
                  <TooltipContent side="top" className="max-w-[180px] bg-card border-border">
                    <p className="text-xs font-semibold">{name}</p>
                    {code && <p className="text-[10px] text-muted-foreground font-mono">{code}</p>}
                    {description && <p className="text-[10px] text-muted-foreground mt-1">{description}</p>}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      )}

      {!loadingExternal && displayBadges.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Award className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No se encontraron placas</p>
        </div>
      )}
    </div>
  );
}
