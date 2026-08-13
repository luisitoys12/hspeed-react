import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Play,
  TrendingUp,
  Trophy,
  Award,
  Heart,
  MessageSquare,
  Share2,
  ExternalLink,
  Clock,
  Video,
  Sparkles,
  Flame,
  Newspaper,
} from "lucide-react";
import type { News } from "@shared/schema";
import { proxyImage } from "@/lib/habboProxy";

interface SpeedShort {
  id: string;
  title: string;
  videoId: string;
  thumbnail: string;
  author: string;
  authorAvatar: string;
  views: number;
  likes: number;
  createdAt: string;
  category: "gameplay" | "tutorial" | "showcase" | "evento" | "diversion";
}

const mockSpeedShorts: SpeedShort[] = [
  {
    id: "1",
    title: "Nuevo rare Throne Room - Tour completo",
    videoId: "dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    author: "HabboSpeed",
    authorAvatar:
      "https://www.habbo.es/habbo-imaging/avatarimage?user=HabboSpeed&size=s&headonly=1",
    views: 12500,
    likes: 892,
    createdAt: "2026-08-10",
    category: "showcase",
  },
  {
    id: "2",
    title: "Cómo ganar SpeedPoints rápido en 2026",
    videoId: "dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    author: "HabboGuides",
    authorAvatar:
      "https://www.habbo.es/habbo-imaging/avatarimage?user=HabboGuides&size=s&headonly=1",
    views: 8900,
    likes: 567,
    createdAt: "2026-08-08",
    category: "tutorial",
  },
  {
    id: "3",
    title: "Mi colección de placas raras - 500+ placas",
    videoId: "dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    author: "CollectorPro",
    authorAvatar:
      "https://www.habbo.es/habbo-imaging/avatarimage?user=CollectorPro&size=s&headonly=1",
    views: 15200,
    likes: 1234,
    createdAt: "2026-08-05",
    category: "showcase",
  },
  {
    id: "4",
    title: "Evento Feria HabboSpeed - Highlights",
    videoId: "dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    author: "HabboEvents",
    authorAvatar:
      "https://www.habbo.es/habbo-imaging/avatarimage?user=HabboEvents&size=s&headonly=1",
    views: 6700,
    likes: 445,
    createdAt: "2026-08-03",
    category: "evento",
  },
  {
    id: "5",
    title: "Fails épicos en Habbo - Compilación #42",
    videoId: "dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    author: "HabboFails",
    authorAvatar:
      "https://www.habbo.es/habbo-imaging/avatarimage?user=HabboFails&size=s&headonly=1",
    views: 23400,
    likes: 2100,
    createdAt: "2026-08-01",
    category: "diversion",
  },
  {
    id: "6",
    title: "Guía: Decorar sala estilo Cyberpunk",
    videoId: "dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    author: "DecoMaster",
    authorAvatar:
      "https://www.habbo.es/habbo-imaging/avatarimage?user=DecoMaster&size=s&headonly=1",
    views: 5600,
    likes: 389,
    createdAt: "2026-07-28",
    category: "tutorial",
  },
];

const CATEGORY_LABELS: Record<
  string,
  { label: string; icon: any; color: string }
> = {
  gameplay: {
    label: "Gameplay",
    icon: Video,
    color: "bg-blue-500/20 text-blue-400",
  },
  tutorial: {
    label: "Tutorial",
    icon: Sparkles,
    color: "bg-purple-500/20 text-purple-400",
  },
  showcase: {
    label: "Showcase",
    icon: Trophy,
    color: "bg-yellow-500/20 text-yellow-400",
  },
  evento: {
    label: "Evento",
    icon: Flame,
    color: "bg-orange-500/20 text-orange-400",
  },
  diversion: {
    label: "Diversión",
    icon: Heart,
    color: "bg-pink-500/20 text-pink-400",
  },
};

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export default function TendenciasPage() {
  const { data: allNews, isLoading: loadingNews } = useQuery<News[]>({
    queryKey: ["/api/news"],
  });

  const news = allNews || [];
  const trendingNews = news
    .filter(
      (n: any) =>
        n.featured ||
        (n.reactions &&
          Object.values(n.reactions as Record<string, number>).reduce(
            (a: number, b: number) => a + b,
            0,
          ) > 10),
    )
    .sort((a, b) => {
      const aReactions = a.reactions
        ? Object.values(a.reactions as Record<string, number>).reduce(
            (sum: number, v: number) => sum + v,
            0,
          )
        : 0;
      const bReactions = b.reactions
        ? Object.values(b.reactions as Record<string, number>).reduce(
            (sum: number, v: number) => sum + v,
            0,
          )
        : 0;
      return bReactions - aReactions;
    })
    .slice(0, 5);

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 p-2 rounded-xl">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Tendencias & SpeedShorts</h1>
          <p className="text-xs text-muted-foreground">
            Lo más visto, compartido y comentado en HabboSpeed
          </p>
        </div>
      </div>

      {/* SpeedShorts Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">SpeedShorts</h2>
            <Badge
              variant="secondary"
              className="text-[9px] bg-primary/10 text-primary"
            >
              {mockSpeedShorts.length} videos
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="gap-1">
            <ExternalLink className="w-3 h-3" />
            Ver todo en YouTube
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockSpeedShorts.map((short) => {
            const cat = CATEGORY_LABELS[short.category];
            const CatIcon = cat.icon;
            return (
              <Link href={`/tendencias/short/${short.id}`} key={short.id}>
                <article className="group block bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all">
                  <div className="relative aspect-video overflow-hidden bg-secondary/30">
                    <img
                      src={short.thumbnail}
                      alt={short.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute top-2 left-2">
                      <span
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium ${cat.color}`}
                      >
                        <CatIcon className="w-2.5 h-2.5" /> {cat.label}
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 text-white text-[10px] px-2 py-1 rounded">
                      <Play className="w-3 h-3" />
                      <span>{formatNumber(short.views)}</span>
                    </div>
                    <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center text-white shadow-xl hover:bg-primary transition-colors">
                        <Play className="w-6 h-6 ml-1" />
                      </div>
                    </button>
                  </div>
                  <div className="p-3 space-y-2">
                    <h3 className="text-sm font-bold line-clamp-2 group-hover:text-primary transition-colors">
                      {short.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <img
                        src={proxyImage(short.authorAvatar)}
                        alt={short.author}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="font-medium truncate max-w-[120px]">
                        {short.author}
                      </span>
                      <span>·</span>
                      <span>{formatDate(short.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />{" "}
                        {formatNumber(short.likes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />{" "}
                        {formatNumber(Math.floor(short.views * 0.02))}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-3 h-3" /> Compartir
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trending News */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold">Noticias en tendencia</h2>
          </div>
        </div>

        {loadingNews ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                <Skeleton className="h-40" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : trendingNews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingNews.map((article: any) => (
              <Link href={`/news/${article.id}`} key={article.id}>
                <article className="block group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all">
                  <div className="relative h-40 overflow-hidden bg-secondary/30">
                    {article.imageUrl ? (
                      <img
                        src={proxyImage(article.imageUrl)}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-card">
                        <Newspaper className="w-8 h-8 text-muted-foreground/20" />
                      </div>
                    )}
                    <Badge className="absolute top-2 left-2 bg-primary/90 text-white border-0 text-[8px]">
                      {article.category}
                    </Badge>
                  </div>
                  <div className="p-3 space-y-1.5">
                    <h3 className="text-sm font-bold line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {article.summary}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />{" "}
                        {article.reactions
                          ? Object.values(
                              article.reactions as Record<string, number>,
                            ).reduce((a: number, b: number) => a + b, 0)
                          : 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />{" "}
                        {Math.floor(
                          (article.reactions
                            ? Object.values(
                                article.reactions as Record<string, number>,
                              ).reduce((a: number, b: number) => a + b, 0)
                            : 0) * 0.3,
                        )}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Flame className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No hay noticias en tendencia aún</p>
          </div>
        )}
      </section>

      {/* Community Highlights */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-bold">Destacados de la comunidad</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href="/badges"
            className="group block p-4 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center group-hover:bg-yellow-500/40 transition-colors">
                <Award className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="font-semibold text-sm">Placas nuevas</p>
                <p className="text-[10px] text-muted-foreground">
                  Descubre las últimas
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/marketplace"
            className="group block p-4 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/40 transition-colors">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="font-semibold text-sm">Mercadillo</p>
                <p className="text-[10px] text-muted-foreground">
                  Precios actualizados
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/feria"
            className="group block p-4 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/40 transition-colors">
                <Sparkles className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="font-semibold text-sm">Feria HabboSpeed</p>
                <p className="text-[10px] text-muted-foreground">
                  Herramientas y juegos
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/rooms"
            className="group block p-4 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/40 transition-colors">
                <Heart className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="font-semibold text-sm">Salas top</p>
                <p className="text-[10px] text-muted-foreground">
                  Comunidad activa
                </p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl bg-gradient-to-r from-primary/20 via-card to-purple-500/10 border border-primary/20 p-6 text-center">
        <h3 className="text-lg font-bold mb-2">
          ¿Quieres aparecer en Tendencias?
        </h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
          Sube tus SpeedShorts a YouTube con #HabboSpeed y etiquétanos. Los
          mejores videos se destacan aquí cada semana.
        </p>
        <Button className="gap-2 bg-primary hover:bg-primary/80">
          <Video className="w-4 h-4" />
          Subir mi SpeedShort
        </Button>
      </section>
    </div>
  );
}
