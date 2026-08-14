import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { proxyImage } from "@/lib/habboProxy";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sparkles,
  Trophy,
  Coins,
  Fish,
  Flame,
  Shield,
  ArrowRight,
  Award,
  Search,
} from "lucide-react";

function badgeImageUrl(badgeCode: string) {
  return proxyImage(
    `https://images.habbo.com/c_images/album1584/${badgeCode}.gif`,
  );
}

function furniIconUrl(classname: string) {
  return proxyImage(
    `https://images.habbo.com/dcr/hof_furni/0/${classname}_icon.png`,
  );
}

function LogrosTab() {
  const [query, setQuery] = useState("");
  const { data, isLoading, error } = useQuery<any[]>({
    queryKey: ["/api/habbo/achievements"],
  });

  const achievements: any[] = Array.isArray(data) ? data : [];
  const filtered = query
    ? achievements.filter((a: any) => {
        const name = a?.achievement?.name || a?.name || "";
        return name.toLowerCase().includes(query.toLowerCase());
      })
    : achievements;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="w-4 h-4 text-yellow-400" />
        <p className="text-sm text-muted-foreground">
          Catálogo completo de logros e insignias de Habbo, con sus niveles.
        </p>
      </div>

      <Input
        placeholder="Buscar logro por nombre..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        data-testid="input-search-achievement"
      />

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      )}

      {error && !isLoading && (
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="p-4 text-sm text-destructive">
            No se pudo cargar el catálogo de logros. Inténtalo más tarde.
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          data-testid="grid-achievements"
        >
          {filtered.slice(0, 60).map((a: any, i: number) => {
            const ach = a?.achievement || a;
            const levels = a?.levelRequirements || [];
            return (
              <Card
                key={`ach-${ach?.id || i}`}
                className="bg-card border-border"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold truncate">
                      {ach?.name || "—"}
                    </p>
                    {ach?.category && (
                      <Badge
                        variant="outline"
                        className="text-[9px] border-primary/20 text-primary/70 flex-shrink-0"
                      >
                        {ach.category}
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {levels.length > 0
                      ? `${levels.length} niveles`
                      : "Sin niveles registrados"}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Trophy className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No se encontraron logros con ese nombre</p>
        </div>
      )}
    </div>
  );
}

function PreciosMercadoTab() {
  const [roomItemsText, setRoomItemsText] = useState("throne\ndino_egg");
  const [wallItemsText, setWallItemsText] = useState("");
  const [results, setResults] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const roomItems = roomItemsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((item) => ({ item }));
      const wallItems = wallItemsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((item) => ({ item }));
      const res = await apiRequest("POST", "/api/habbo/marketplace-stats", {
        roomItems,
        wallItems,
      });
      if (!res.ok) throw new Error("Error al consultar precios");
      return res.json();
    },
    onSuccess: (data) => setResults(data),
  });

  const roomStats: any[] = results?.roomItems || results?.roomItemStats || [];
  const wallStats: any[] = results?.wallItems || results?.wallItemStats || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Coins className="w-4 h-4 text-yellow-400" />
        <p className="text-sm text-muted-foreground">
          Consulta el precio de mercado de varios furnis a la vez. Un classname
          por línea.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">
            Room items (classname)
          </p>
          <Textarea
            value={roomItemsText}
            onChange={(e) => setRoomItemsText(e.target.value)}
            rows={5}
            placeholder="throne&#10;dino_egg"
            data-testid="input-room-items"
          />
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">
            Wall items (classname)
          </p>
          <Textarea
            value={wallItemsText}
            onChange={(e) => setWallItemsText(e.target.value)}
            rows={5}
            placeholder="poster_1"
            data-testid="input-wall-items"
          />
        </div>
      </div>

      <Button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="w-full sm:w-auto"
        data-testid="button-check-prices"
      >
        <Search className="w-4 h-4 mr-2" />
        {mutation.isPending ? "Consultando..." : "Consultar precios"}
      </Button>

      {mutation.isError && (
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="p-4 text-sm text-destructive">
            No se pudieron obtener los precios. Verifica los classnames e
            inténtalo de nuevo.
          </CardContent>
        </Card>
      )}

      {results && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          data-testid="grid-price-results"
        >
          {[...roomStats, ...wallStats].map((stat: any, i: number) => {
            const name =
              stat?.item || stat?.className || stat?.classname || "—";
            const avg =
              stat?.averagePrice ?? stat?.avgPrice ?? stat?.currentAveragePrice;
            const min = stat?.minPrice ?? stat?.lowestPrice;
            return (
              <Card key={`stat-${name}-${i}`} className="bg-card border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <img
                    src={furniIconUrl(name)}
                    alt={name}
                    className="w-10 h-10 object-contain flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = "0.15";
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold font-mono truncate">
                      {name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {avg !== undefined
                        ? `Prom: ${Number(avg).toLocaleString()}c`
                        : "Sin datos"}
                      {min !== undefined
                        ? ` · Min: ${Number(min).toLocaleString()}c`
                        : ""}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {roomStats.length === 0 && wallStats.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full text-center py-8">
              No hay datos de mercado para esos items.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function RankingDerbyTab() {
  const {
    data: leaderboard,
    isLoading: loadingLb,
    error: errorLb,
  } = useQuery<any>({
    queryKey: ["/api/habbo/skills-leaderboard"],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        "/api/habbo/skills-leaderboard?skillType=FISHING&page=1",
      );
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
    retry: false,
  });

  const { data: derby, isLoading: loadingDerby } = useQuery<any>({
    queryKey: ["/api/habbo/derby-status"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/habbo/derby-status");
      if (!res.ok) return null;
      return res.json();
    },
    retry: false,
  });

  const entries: any[] = leaderboard?.entries || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Fish className="w-4 h-4 text-blue-400" />
        <p className="text-sm text-muted-foreground">
          Ranking de pesca (Habbo Origins) y estado del derby de pesca actual.
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Fish className="w-4 h-4 text-primary" />
            Estado del Derby
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {loadingDerby ? (
            <Skeleton className="h-10 w-full" />
          ) : derby ? (
            <pre
              className="text-xs bg-secondary/40 rounded-lg p-3 overflow-x-auto"
              data-testid="text-derby-status"
            >
              {JSON.stringify(derby, null, 2)}
            </pre>
          ) : (
            <p className="text-xs text-muted-foreground">
              No hay ningún derby activo en este momento.
            </p>
          )}
        </CardContent>
      </Card>

      {loadingLb && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      )}

      {errorLb && !loadingLb && (
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="p-4 text-sm text-destructive">
            No se pudo cargar el ranking de pesca.
          </CardContent>
        </Card>
      )}

      {!loadingLb && !errorLb && entries.length > 0 && (
        <div className="space-y-1.5" data-testid="list-leaderboard">
          {entries.map((e: any, i: number) => (
            <div
              key={`lb-${e.uniqueId || i}`}
              className="flex items-center gap-3 bg-secondary/40 rounded-lg p-2.5"
            >
              <span className="w-6 text-center text-xs font-bold text-muted-foreground">
                #{i + 1}
              </span>
              <span className="text-sm font-medium flex-1 truncate">
                {e.name || e.username || e.uniqueId}
              </span>
              <Badge
                variant="outline"
                className="text-xs border-blue-500/30 text-blue-400"
              >
                {(e.score ?? e.value ?? 0).toLocaleString?.() ?? e.score}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {!loadingLb && !errorLb && entries.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Aún no hay datos de ranking disponibles.
        </p>
      )}
    </div>
  );
}

function EnlaceHerramienta({
  href,
  icon: Icon,
  title,
  desc,
}: {
  href: string;
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <Link href={href}>
      <Card
        className="bg-card border-border hover:border-primary/40 transition-colors cursor-pointer h-full"
        data-testid={`link-tool-${title.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-xs text-muted-foreground truncate">{desc}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </CardContent>
      </Card>
    </Link>
  );
}

export default function FeriaPage() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">Feria</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        El punto de encuentro de todas las herramientas de HabboSpeed: logros,
        precios de mercado, rankings y mucho más.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <EnlaceHerramienta
          href="/herramientas"
          icon={Flame}
          title="Hot Looks"
          desc="Avatares más populares del momento"
        />
        <EnlaceHerramienta
          href="/herramientas"
          icon={Shield}
          title="Buscador de Grupos"
          desc="Busca clanes y sus miembros"
        />
      </div>

      <Tabs defaultValue="logros">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="logros" data-testid="tab-logros">
            <Trophy className="w-3.5 h-3.5 mr-1.5" /> Logros
          </TabsTrigger>
          <TabsTrigger value="precios" data-testid="tab-precios">
            <Coins className="w-3.5 h-3.5 mr-1.5" /> Precios
          </TabsTrigger>
          <TabsTrigger value="ranking" data-testid="tab-ranking">
            <Fish className="w-3.5 h-3.5 mr-1.5" /> Ranking
          </TabsTrigger>
        </TabsList>
        <TabsContent value="logros" className="mt-4">
          <LogrosTab />
        </TabsContent>
        <TabsContent value="precios" className="mt-4">
          <PreciosMercadoTab />
        </TabsContent>
        <TabsContent value="ranking" className="mt-4">
          <RankingDerbyTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
