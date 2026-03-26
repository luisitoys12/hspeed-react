import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
  if (item?.Revision && item?.ClassName) {
    return `https://images.habbo.com/dcr/hof_furni/${item.Revision}/${item.ClassName}_icon.png`;
  }
  if (item?.ClassName) {
    return `https://images.habbo.com/dcr/hof_furni/0/${item.ClassName}_icon.png`;
  }
  return null;
}

function getName(item: FurniItem): string {
  return item?.FurniName || item?.itemName || item?.ClassName || item?.className || "—";
}

function FurniCard({ item, onClick }: { item: FurniItem; onClick: () => void }) {
  const price = getPrice(item);
  const imgUrl = getImageUrl(item);
  const name = getName(item);
  const hist = item?.marketData?.history || [];
  const prices = hist.map((h: any) => Array.isArray(h) ? h[0] : h.price).filter(Boolean);
  const minP = prices.length ? Math.min(...prices) : null;
  const maxP = prices.length ? Math.max(...prices) : null;
  const trend = prices.length >= 2 ? (prices[prices.length - 1] > prices[0] ? "up" : "down") : null;

  return (
    <button
      onClick={onClick}
      className="group bg-card border border-border rounded-xl p-3 flex flex-col items-center gap-2 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all text-left w-full"
      data-testid={`card-furni-${item.ClassName || name}`}
    >
      <div className="w-16 h-16 rounded-lg bg-secondary/40 border border-border/50 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-primary/30 transition-colors">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={name}
            className="w-12 h-12 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.2"; }}
          />
        ) : (
          <ShoppingBag className="w-6 h-6 text-muted-foreground/30" />
        )}
      </div>
      <div className="w-full text-center space-y-0.5">
        <p className="text-[11px] font-semibold leading-tight line-clamp-2 text-foreground/90 group-hover:text-primary transition-colors">{name}</p>
        <p className="text-sm font-black text-yellow-400">
          {price > 0 ? `${price.toLocaleString()}c` : "—"}
        </p>
        {minP !== null && maxP !== null && minP !== maxP && (
          <p className="text-[9px] text-muted-foreground">
            mín {minP.toLocaleString()} – máx {maxP.toLocaleString()}
          </p>
        )}
      </div>
      {trend && (
        <div className={`flex items-center gap-0.5 text-[9px] font-bold ${
          trend === "up" ? "text-green-400" : "text-red-400"
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
  const imgUrl = getImageUrl(item);
  const name = getName(item);
  const hist = (item?.marketData?.history || []).map((h: any) => ({
    price: Array.isArray(h) ? h[0] : h.price,
    amount: Array.isArray(h) ? h[1] : h.amount,
    date: Array.isArray(h) ? new Date((h[4] || 0) * 1000).toLocaleDateString("es-MX") : (h.date || "—"),
  }));
  const prices = hist.map((h: any) => h.price).filter(Boolean);
  const minP = prices.length ? Math.min(...prices) : null;
  const maxP = prices.length ? Math.max(...prices) : null;
  const avgP = prices.length ? Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length) : null;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            {imgUrl && (
              <img src={imgUrl} alt={name} className="w-8 h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            )}
            {name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Precio actual", val: price > 0 ? `${price.toLocaleString()}c` : "—", color: "text-yellow-400" },
              { label: "Mínimo", val: minP ? `${minP.toLocaleString()}c` : "—", color: "text-green-400" },
              { label: "Máximo", val: maxP ? `${maxP.toLocaleString()}c` : "—", color: "text-red-400" },
            ].map((s) => (
              <div key={s.label} className="bg-secondary/40 rounded-lg p-2.5 text-center">
                <p className="text-[9px] text-muted-foreground">{s.label}</p>
                <p className={`text-sm font-black ${s.color}`}>{s.val}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 text-xs">
            <Badge variant="outline" className="border-primary/30 text-primary/80">.{hotel}</Badge>
            {item.ClassName && <Badge variant="outline" className="text-muted-foreground font-mono text-[10px]">{item.ClassName}</Badge>}
          </div>
          {hist.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-2 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-primary" /> Historial reciente</p>
              <div className="overflow-x-auto max-h-44 overflow-y-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-1 text-muted-foreground">Fecha</th>
                      <th className="text-right py-1 text-muted-foreground">Precio</th>
                      <th className="text-right py-1 text-muted-foreground">Cant.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hist.slice(-20).reverse().map((h: any, i: number) => (
                      <tr key={i} className="border-b border-border/30 hover:bg-secondary/20">
                        <td className="py-1 text-muted-foreground">{h.date}</td>
                        <td className="py-1 text-right font-mono text-yellow-400">{h.price?.toLocaleString()}c</td>
                        <td className="py-1 text-right text-muted-foreground">{h.amount ?? "—"}</td>
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
      const res = await apiRequest("GET", `/api/habbo/furni?hotel=${hotel}&limit=200`);
      return res.json();
    },
    staleTime: 1000 * 60 * 30,
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold">Marketplace</h1>
          <Badge variant="outline" className="border-primary/30 text-primary/70 text-[10px]">Habbo.{hotel}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Select value={hotel} onValueChange={(v) => { setHotel(v); setPage(1); }}>
            <SelectTrigger className="w-28 h-8 text-xs" data-testid="select-marketplace-hotel">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HOTELS.map((h) => <SelectItem key={h} value={h}>.{h}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search bar always visible */}
      <div className="flex gap-2">
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
      <div className="flex gap-1 bg-secondary/40 rounded-xl p-1">
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
        <div className="flex items-center gap-2">
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
