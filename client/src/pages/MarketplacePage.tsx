import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Search, TrendingUp, TrendingDown, Minus } from "lucide-react";

const HOTELS = ["es", "com", "com.br", "de", "fi", "fr", "it", "nl"];

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [hotel, setHotel] = useState("es");
  const [query, setQuery] = useState("");

  const { data, isLoading, error } = useQuery<any>({
    queryKey: ["/api/habbo/marketplace", query, hotel],
    queryFn: async () => {
      if (!query) return null;
      const res = await apiRequest("GET", `/api/habbo/marketplace/${encodeURIComponent(query)}?hotel=${hotel}`);
      if (!res.ok) throw new Error("Item no encontrado");
      return res.json();
    },
    enabled: !!query,
    retry: false,
  });

  const handleSearch = () => {
    if (search.trim()) setQuery(search.trim());
  };

  const item = Array.isArray(data) ? data[0] : data;
  const furniName = item?.FurniName || item?.itemName || query;
  const className = item?.ClassName || item?.className || query;
  const avgPrice = item?.marketData?.averagePrice || item?.avgPrice || item?.avg_price;
  const rawHistory = item?.marketData?.history || [];
  const priceHistory = rawHistory.map((h: any) => ({
    price: Array.isArray(h) ? h[0] : h.price,
    amount: Array.isArray(h) ? h[1] : h.amount,
    total: Array.isArray(h) ? h[2] : h.total,
    offers: Array.isArray(h) ? h[3] : h.offers,
    date: Array.isArray(h) ? new Date((h[4] || 0) * 1000).toLocaleDateString('es-MX') : (h.date || h.timestamp || '—'),
  }));
  const currentPrice = priceHistory.length > 0 ? priceHistory[priceHistory.length - 1]?.price : null;
  const furniImageUrl = item?.Revision ? `https://images.habbo.com/dcr/hof_furni/${item.Revision}/${item.ClassName}_icon.png` : null;

  const trend = priceHistory.length >= 2
    ? (priceHistory[priceHistory.length - 1]?.price || 0) > (priceHistory[0]?.price || 0) ? "up" : "down"
    : null;

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <ShoppingBag className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">Marketplace</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        Consulta el historial de precios de furni en el marketplace de Habbo.
      </p>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Nombre del furni (ej: throne, disco_ball)..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            data-testid="input-marketplace-search"
          />
        </div>
        <Select value={hotel} onValueChange={setHotel}>
          <SelectTrigger className="w-28" data-testid="select-marketplace-hotel">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HOTELS.map((h) => (
              <SelectItem key={h} value={h}>.{h}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleSearch}
          className="bg-primary hover:bg-primary/80 text-white"
          data-testid="button-marketplace-search"
        >
          Buscar
        </Button>
      </div>

      {/* Results */}
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-32 rounded-xl" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
          </div>
        </div>
      )}

      {error && (
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="p-4 text-sm text-destructive">
            Item no encontrado o error al consultar la API
          </CardContent>
        </Card>
      )}

      {data && !isLoading && (
        <div className="space-y-4">
          {/* Item Header */}
          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                {furniImageUrl && (
                  <img
                    src={furniImageUrl}
                    alt={furniName}
                    className="w-16 h-16 object-contain bg-secondary/50 rounded-lg p-2"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-lg font-bold">{furniName}</h2>
                  <p className="text-xs text-muted-foreground font-mono">{className}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="border-primary/30 text-primary/80 text-xs">
                      Hotel: .{hotel}
                    </Badge>
                    {trend === "up" && <TrendingUp className="w-4 h-4 text-green-400" />}
                    {trend === "down" && <TrendingDown className="w-4 h-4 text-red-400" />}
                    {trend === null && <Minus className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Precio Actual</p>
                <p className="text-xl font-bold text-primary" data-testid="text-current-price">
                  {currentPrice ? `${currentPrice.toLocaleString()} 🪙` : "—"}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Precio Medio</p>
                <p className="text-xl font-bold text-yellow-400">
                  {avgPrice ? `${avgPrice.toLocaleString()} 🪙` : "—"}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Registros</p>
                <p className="text-xl font-bold text-muted-foreground">{priceHistory.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Price History Table */}
          {priceHistory.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Historial de Precios
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-muted-foreground font-medium">Fecha</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">Precio</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {priceHistory.slice(-20).reverse().map((entry: any, i: number) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                          <td className="py-2 text-muted-foreground">{entry.date || "—"}</td>
                          <td className="py-2 text-right font-mono text-yellow-400">
                            {entry.price?.toLocaleString() || "—"} 🪙
                          </td>
                          <td className="py-2 text-right text-muted-foreground">{entry.amount || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!query && (
        <div className="text-center py-16 text-muted-foreground">
          <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Busca un furni para ver su historial de precios</p>
          <p className="text-xs mt-1 opacity-60">Ejemplos: throne, disco_ball, rare_dragonlamp</p>
        </div>
      )}
    </div>
  );
}
