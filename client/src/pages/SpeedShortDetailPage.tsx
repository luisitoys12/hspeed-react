import { useParams, Link } from "wouter";
import { proxyImage } from "@/lib/habboProxy";
import {
  ArrowLeft,
  Play,
  Heart,
  MessageSquare,
  Share2,
  ExternalLink,
} from "lucide-react";
import { SEOMeta } from "@/components/SEOMeta";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
  description?: string;
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
    description:
      "Tour completo por el nuevo rare Throne Room, descubre todos sus secretos y detalles ocultos.",
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
    description:
      "Guía completa para farmear SpeedPoints de forma eficiente en la nueva temporada.",
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
    description:
      "Tour por mi colección de más de 500 placas raras y exclusivas de Habbo.",
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
    description: "Los mejores momentos del evento Feria HabboSpeed 2026.",
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
    description:
      "Los mejores fails y momentos graciosos de la comunidad HabboSpeed.",
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
    description:
      "Paso a paso para crear una sala estilo cyberpunk con neones y efectos.",
  },
];

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  gameplay: { label: "Gameplay", color: "bg-blue-500/20 text-blue-400" },
  tutorial: { label: "Tutorial", color: "bg-purple-500/20 text-purple-400" },
  showcase: { label: "Showcase", color: "bg-yellow-500/20 text-yellow-400" },
  evento: { label: "Evento", color: "bg-orange-500/20 text-orange-400" },
  diversion: { label: "Diversión", color: "bg-pink-500/20 text-pink-400" },
};

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
}

export default function SpeedShortDetailPage() {
  const { id } = useParams<{ id: string }>();
  const short = mockSpeedShorts.find((s) => s.id === id);
  const cat = short ? CATEGORY_LABELS[short.category] : null;

  if (!short) {
    return (
      <div className="p-4 lg:p-6 max-w-5xl mx-auto text-center py-12">
        <SEOMeta
          title="SpeedShort no encontrado"
          description="El video que buscas no existe."
        />
        <div className="bg-card border border-border rounded-2xl p-8">
          <p className="text-muted-foreground mb-4">SpeedShort no encontrado</p>
          <Link href="/tendencias">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-colors">
              Volver a Tendencias
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const youtubeUrl = `https://www.youtube.com/watch?v=${short.videoId}`;
  const youtubeEmbedUrl = `https://www.youtube.com/embed/${short.videoId}`;

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-6">
      <SEOMeta
        title={`${short.title} | HabboSpeed`}
        description={short.description || short.title}
        image={short.thumbnail}
        url={`/tendencias/${short.id}`}
      />

      <Link
        href="/tendencias"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Tendencias
      </Link>

      <article className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="relative aspect-video bg-secondary/30">
          <iframe
            src={youtubeEmbedUrl}
            title={short.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          />
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${cat?.color || "bg-secondary text-muted-foreground"}`}
            >
              {cat?.label || short.category}
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold">{short.title}</h1>

          {short.description && (
            <p className="text-muted-foreground text-base leading-relaxed">
              {short.description}
            </p>
          )}

          <div className="flex items-center gap-4 pt-4 border-t border-border/50">
            <img
              src={proxyImage(short.authorAvatar)}
              alt={short.author}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold">{short.author}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(short.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Heart className="w-4 h-4" />
              <span>{formatNumber(short.likes)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
              <span>{formatNumber(Math.floor(short.views * 0.02))}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Play className="w-4 h-4" />
              <span>{formatNumber(short.views)}</span>
            </div>
            <Link
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Ver en YouTube
            </Link>
          </div>

          <div className="flex gap-2 pt-4 border-t border-border/50">
            <button className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors">
              <Heart className="w-4 h-4" />
              Like
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors">
              <MessageSquare className="w-4 h-4" />
              Comentar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors">
              <Share2 className="w-4 h-4" />
              Compartir
            </button>
          </div>
        </div>
      </article>

      <section className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4">Más SpeedShorts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockSpeedShorts
            .filter((s) => s.id !== short.id)
            .slice(0, 6)
            .map((s) => {
              const c = CATEGORY_LABELS[s.category];
              return (
                <Link href={`/tendencias/${s.id}`} key={s.id}>
                  <div className="group block bg-secondary/30 border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={s.thumbnail}
                        alt={s.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute top-2 left-2">
                        <span
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium ${c?.color || "bg-secondary text-muted-foreground"}`}
                        >
                          {c?.label || s.category}
                        </span>
                      </div>
                      <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 text-white text-[10px] px-2 py-1 rounded">
                        <Play className="w-3 h-3" />
                        <span>{formatNumber(s.views)}</span>
                      </div>
                    </div>
                    <div className="p-3 space-y-2">
                      <h3 className="text-sm font-bold line-clamp-2 group-hover:text-primary transition-colors">
                        {s.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <img
                          src={proxyImage(s.authorAvatar)}
                          alt={s.author}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="font-medium truncate max-w-[120px]">
                          {s.author}
                        </span>
                        <span>·</span>
                        <span>{formatDate(s.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      </section>
    </div>
  );
}
