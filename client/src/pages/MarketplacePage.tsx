import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ShoppingBag, Search, TrendingUp, TrendingDown, Flame, Tag, Coins, Star, X
} from "lucide-react";

const HOTELS = ["es", "com", "com.br", "de", "fi", "fr", "it", "nl"];

const TABS = [
  { key: "catalog", label: "Catálogo", icon: ShoppingBag },
  { key: "top", label: "Top Caros", icon: Flame },
  { key: "cheap", label: "Chollos", icon: Tag },
  { key: "search", label: "Buscar", icon: Search },
];

type FurniItem = {
  FurniName?: string;
  itemName?: string;
  ClassName?: string;
  className?: string;
  Revision?: number;
  marketData?: { averagePrice?: number; history?: any[] };
  avgPrice?: number;
  avg_price?: number;
};

function getPrice(item: FurniItem): number {
  const avg = item?.marketData?.averagePrice ?? item?.avgPrice ?? item?.avg_price;
  if (avg) return avg;
  const hist = item?.marketData?.history || [];
  if (hist.length > 0) {
    const last = hist[hist.length - 1];
    return Array.isArray(last) ? last[0] : (last.price ?? 0);
  }
  return 0;
}

function getImageUrl(item: FurniItem): string | null {
  const revision = item?.Revision ?? (item as any)?.revision ?? 0;
  const classname = item?.ClassName ?? item?.className ?? (item as any)?.classname;
  if (classname) {
    return `https://images.habbo.com/dcr/hof_furni/${revision}/${classname}_icon.png`;
  }
  return null;
}

function getName(item: FurniItem): string {
  return item?.FurniName || item?.itemName || (item as any)?.name || item?.ClassName || item?.className || (item as any)?.classname || "—";
}

function FurniImage({ item, className = "w-12 h-12" }: { item: FurniItem; className?: string }) {
  const [error, setError] = useState(false);
  const imgUrl = getImageUrl(item);
  const name = getName(item);
  
  if (!imgUrl || error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 text-primary font-black text-[10px] sm:text-xs shadow-inner shadow-primary/10 select-none`}>
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={imgUrl}
      alt={name}
      className={`${className} object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-transform duration-300 group-hover:scale-110`}
      onError={() => setError(true)}
    />
  );
}

function FurniCard({ item, onClick }: { item: FurniItem; onClick: () => void }) {
  const price = getPrice(item);
  const name = getName(item);
  const hist = item?.marketData?.history || [];
  const prices = hist.map((h: any) => Array.isArray(h) ? h[0] : h.price).filter(Boolean);
  const minP = prices.length ? Math.min(...prices) : null;
  const maxP = prices.length ? Math.max(...prices) : null;
  const trend = prices.length >= 2 ? (prices[prices.length - 1] > prices[0] ? "up" : "down") : null;

  return (
    <button
      onClick={onClick}
      className="group bg-card/60 backdrop-blur-md border border-border/80 rounded-2xl p-4 flex flex-col items-center gap-3 hover:border-primary/45 hover:shadow-xl hover:shadow-primary/5 transition-all text-left w-full hover:-translate-y-0.5 duration-300"
      data-testid={`card-furni-${item.ClassName || name}`}
    >
      <div className="w-16 h-16 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-primary/25 transition-all duration-300 shadow-inner group-hover:shadow-primary/5">
        <FurniImage item={item} className="w-12 h-12" />
      </div>
      <div className="w-full text-center space-y-1">
        <p className="text-[11px] font-bold leading-tight line-clamp-2 text-foreground/90 group-hover:text-primary transition-colors duration-200">{name}</p>
        <p className="text-sm font-black text-yellow-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
          {price > 0 ? `${price.toLocaleString()}c` : "—"}
        </p>
        {minP !== null && maxP !== null && minP !== maxP && (
          <p className="text-[9px] text-muted-foreground/80 font-medium font-sans">
            mín {minP.toLocaleString()} – máx {maxP.toLocaleString()}
          </p>
        )}
      </div>
      {trend && (
        <div className={`flex items-center gap-0.5 text-[9px] font-black px-2 py-0.5 rounded-full ${
          trend === "up" 
            ? "bg-green-500/10 text-green-400 border border-green-500/20" 
            : "bg-red-500/10 text-red-400 border border-red-500/20"
        }`}>
          {trend === "up" ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
          {trend === "up" ? "Subiendo" : "Bajando"}
        </div>
      )}
    </button>
  );
}

function FurniModal({ item, hotel, onClose }: { item: FurniItem; hotel: string; onClose: () => void }) {
  const price = getPrice(item);
  const name = getName(item);
  const hist = (item?.marketData?.history || []).map((h: any) => {
    let dateStr = "—";
    if (Array.isArray(h)) {
      dateStr = new Date((h[4] || 0) * 1000).toLocaleDateString("es-MX");
    } else if (h.date) {
      try {
        const d = new Date(h.date);
        dateStr = isNaN(d.getTime()) ? h.date : d.toLocaleDateString("es-MX");
      } catch {
        dateStr = h.date;
      }
    }
    return {
      price: Array.isArray(h) ? h[0] : h.price,
      amount: Array.isArray(h) ? h[1] : h.amount,
      date: dateStr,
    };
  });
  const prices = hist.map((h: any) => h.price).filter(Boolean);
  const minP = prices.length ? Math.min(...prices) : null;
  const maxP = prices.length ? Math.max(...prices) : null;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md bg-card/95 backdrop-blur-lg border border-border/80 shadow-2xl rounded-3xl p-6">
        <DialogHeader className="border-b border-border/40 pb-4 mb-4">
          <DialogTitle className="text-base font-black flex items-center gap-3 text-foreground">
            <div className="w-10 h-10 rounded-lg bg-secondary/60 flex items-center justify-center border border-border">
              <FurniImage item={item} className="w-8 h-8" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-black text-foreground">{name}</span>
              <span className="text-[10px] text-muted-foreground font-mono font-bold uppercase">{item.ClassName || (item as any).classname || "—"}</span>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Precio Promedio", val: price > 0 ? `${price.toLocaleString()}c` : "—", color: "text-yellow-400" },
              { label: "Precio Mínimo", val: minP ? `${minP.toLocaleString()}c` : "—", color: "text-green-400" },
              { label: "Precio Máximo", val: maxP ? `${maxP.toLocaleString()}c` : "—", color: "text-red-400" },
            ].map((s) => (
              <div key={s.label} className="bg-secondary/40 hover:bg-secondary/60 border border-border/40 rounded-2xl p-3 text-center transition-colors">
                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-1">{s.label}</p>
                <p className={`text-sm font-black ${s.color} drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]`}>{s.val}</p>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-primary/5 border-primary/30 text-primary font-bold text-[10px] px-2.5 py-0.5">Hotel Habbo.{hotel.toUpperCase()}</Badge>
            {item.Revision && <Badge variant="outline" className="bg-secondary/30 text-muted-foreground border-border/60 font-mono text-[10px] px-2.5 py-0.5">Rev: {item.Revision}</Badge>}
          </div>

          {hist.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-black text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-primary" /> Historial de Mercado (15 Días)
              </p>
              <div className="overflow-x-auto border border-border/50 rounded-2xl max-h-48 overflow-y-auto shadow-inner bg-secondary/10 font-sans">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50 text-[10px] uppercase font-bold tracking-wider">
                      <th className="text-left py-2 px-3 text-muted-foreground">Fecha de Venta</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">Precio Promedio</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">Volumen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hist.slice(-20).reverse().map((h: any, i: number) => (
                      <tr key={i} className="border-b border-border/20 hover:bg-primary/5 transition-colors">
                        <td className="py-2 px-3 text-muted-foreground font-medium">{h.date}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-yellow-400">{h.price?.toLocaleString()}c</td>
                        <td className="py-2 px-3 text-right text-muted-foreground font-mono">{h.amount ?? "—"} uds.</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function MarketplacePage() {
  const [tab, setTab] = useState("catalog");
  const [hotel, setHotel] = useState("es");
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<FurniItem | null>(null);
  const PER_PAGE = 48;

  // Catalog: furnis from habbo API via our backend
  const { data: catalogRaw, isLoading: catalogLoading } = useQuery<any[]>({
    queryKey: ["/api/habbo/furni", hotel],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/habbo/furni?hotel=${hotel}&limit=0`);
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  // Search query
  const { data: searchData, isLoading: searchLoading } = useQuery<any>({
    queryKey: ["/api/habbo/marketplace", searchQuery, hotel],
    queryFn: async () => {
      if (!searchQuery) return null;
      const res = await apiRequest("GET", `/api/habbo/marketplace/${encodeURIComponent(searchQuery)}?hotel=${hotel}`);
      if (!res.ok) throw new Error("no results");
      return res.json();
    },
    enabled: !!searchQuery && tab === "search",
    retry: false,
  });

  const catalog: FurniItem[] = Array.isArray(catalogRaw) ? catalogRaw : [];

  const sorted = [...catalog].sort((a, b) =>
    sortOrder === "desc" ? getPrice(b) - getPrice(a) : getPrice(a) - getPrice(b)
  );

  const topExpensive = [...catalog].sort((a, b) => getPrice(b) - getPrice(a)).slice(0, 50);
  const topCheap = [...catalog].filter(i => getPrice(i) > 0).sort((a, b) => getPrice(a) - getPrice(b)).slice(0, 50);

  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const paginated = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const searchResults: FurniItem[] = searchData
    ? Array.isArray(searchData) ? searchData : [searchData]
    : [];

  const handleSearch = () => {
    if (search.trim()) {
      setSearchQuery(search.trim());
      setTab("search");
    }
  };

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["/api/habbo/furni"] });
    await queryClient.invalidateQueries({ queryKey: ["/api/habbo/marketplace"] });
  };

  const renderGrid = (items: FurniItem[], loading: boolean, emptyMsg: string) => {
    if (loading) return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {Array.from({ length: 24 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
    );
    if (!items.length) return (
      <div className="text-center py-16 text-muted-foreground">
        <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-20" />
        <p className="text-sm">{emptyMsg}</p>
      </div>
    );
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {items.map((item, i) => (
          <FurniCard key={i} item={item} onClick={() => setSelectedItem(item)} />
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="site-panel-strong p-5 sm:p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="site-kicker">Mercado</p>
          <h1 className="site-title mt-2 flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Marketplace
          </h1>
          <p className="text-xs text-muted-foreground mt-2 max-w-2xl">
            Explora furnis, compara precios y sigue el pulso del mercado con una interfaz más clara.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary/80 text-[10px]">Habbo.{hotel}</Badge>
          <Select value={hotel} onValueChange={(v) => { setHotel(v); setPage(1); }}>
            <SelectTrigger className="w-28 h-8 text-xs" data-testid="select-marketplace-hotel">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HOTELS.map((h) => <SelectItem key={h} value={h}>.{h}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="h-8 text-xs px-3"
            data-testid="button-marketplace-refresh"
          >
            Actualizar
          </Button>
        </div>
      </div>

      {/* Search bar always visible */}
      <div className="site-panel p-3 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar furni (ej: throne, disco_ball)..."
            className="pl-9 h-9 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            data-testid="input-marketplace-search"
          />
        </div>
        <Button size="sm" onClick={handleSearch} className="bg-primary hover:bg-primary/80 text-white text-xs px-4" data-testid="button-marketplace-search">
          Buscar
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-border/60 backdrop-blur-sm">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-1 justify-center ${
              tab === t.key
                ? "bg-card border border-border shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid={`tab-marketplace-${t.key}`}
          >
            <t.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Sort control (catalog only) */}
      {tab === "catalog" && (
        <div className="site-panel p-3 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Ordenar:</span>
          <Select value={sortOrder} onValueChange={(v) => { setSortOrder(v as any); setPage(1); }}>
            <SelectTrigger className="w-44 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Más caros primero</SelectItem>
              <SelectItem value="asc">Más baratos primero</SelectItem>
            </SelectContent>
          </Select>
          {catalog.length > 0 && (
            <span className="text-xs text-muted-foreground ml-auto">{catalog.length} furnis</span>
          )}
        </div>
      )}

      {/* Tab Content */}
      {tab === "catalog" && (
        <div className="space-y-4">
          {renderGrid(paginated, catalogLoading, "No se encontraron furnis. Intenta cambiar el hotel.")}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 pt-2">
              <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={page === 1} className="text-xs px-2 h-7">«</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="text-xs px-2 h-7">‹</Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(p)}
                    className={`text-xs px-2.5 h-7 ${p === page ? "bg-primary text-white" : ""}`}
                  >
                    {p}
                  </Button>
                );
              })}
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="text-xs px-2 h-7">›</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(totalPages)} disabled={page === totalPages} className="text-xs px-2 h-7">»</Button>
            </div>
          )}
        </div>
      )}

      {tab === "top" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <h2 className="text-sm font-bold">Top 50 Furnis más caros</h2>
          </div>
          {renderGrid(topExpensive, catalogLoading, "Sin datos disponibles.")}
        </div>
      )}

      {tab === "cheap" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-green-400" />
            <h2 className="text-sm font-bold">Top 50 Chollos / más baratos</h2>
          </div>
          {renderGrid(topCheap, catalogLoading, "Sin datos disponibles.")}
        </div>
      )}

      {tab === "search" && (
        <div className="space-y-3">
          {!searchQuery ? (
            <div className="text-center py-16 text-muted-foreground">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Escribe el nombre de un furni y presiona Buscar</p>
              <p className="text-xs mt-1 opacity-60">Ej: throne, disco_ball, rare_dragonlamp</p>
            </div>
          ) : searchLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <p className="text-xs text-muted-foreground">{searchResults.length} resultado(s) para "{searchQuery}"</p>
              {renderGrid(searchResults, false, "")}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <X className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Sin resultados para "{searchQuery}"</p>
            </div>
          )}
        </div>
      )}

      {/* Furni Detail Modal */}
      {selectedItem && (
        <FurniModal item={selectedItem} hotel={hotel} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}
