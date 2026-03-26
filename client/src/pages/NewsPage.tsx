import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Newspaper, Star, Calendar, ArrowRight } from "lucide-react";
import type { News } from "@shared/schema";

const CATEGORIES = ["Todas", "Noticias", "Eventos", "Actualizaciones", "Comunidad", "Exclusiva"];

export default function NewsPage() {
  const { data: allNews, isLoading } = useQuery<News[]>({
    queryKey: ["/api/news"],
  });

  const news = allNews || [];
  const featured = news.filter((n: any) => n.featured);
  const regular = news.filter((n: any) => !n.featured);
  const sorted = [...featured, ...regular];

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Newspaper className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">Noticias</h1>
        {featured.length > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full">
            <Star className="w-2.5 h-2.5" /> {featured.length} destacada{featured.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Featured banner (first featured article) */}
      {!isLoading && featured.length > 0 && (
        <Link href={`/news/${featured[0].id}`}>
          <a className="block group" data-testid="card-featured-hero">
            <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden shadow-xl border border-yellow-400/20">
              {featured[0].imageUrl ? (
                <img
                  src={featured[0].imageUrl}
                  alt={featured[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/30 via-card to-card" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-1 bg-yellow-500/90 text-black text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                <Star className="w-3 h-3" /> Destacada
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <Badge className="bg-primary/90 text-white border-0 text-[9px] mb-2">{featured[0].category}</Badge>
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight group-hover:text-yellow-200 transition-colors">
                  {featured[0].title}
                </h2>
                <p className="text-sm text-white/70 mt-1 line-clamp-2">{featured[0].summary}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="flex items-center gap-1 text-[10px] text-white/50">
                    <Calendar className="w-3 h-3" /> {featured[0].date}
                  </span>
                  <span className="text-[10px] text-yellow-300 font-medium flex items-center gap-1">
                    Leer artículo <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          </a>
        </Link>
      )}

      {/* All news grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
              <Skeleton className="h-40" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Newspaper className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No hay noticias publicadas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((article: any) => (
            <Link href={`/news/${article.id}`} key={article.id}>
              <a className="block group h-full" data-testid={`card-news-${article.id}`}>
                <div className={`bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all h-full flex flex-col ${
                  article.featured
                    ? "border-yellow-400/30 hover:border-yellow-400/50 shadow-yellow-400/5"
                    : "border-border hover:border-primary/30"
                }`}>
                  {/* Thumbnail */}
                  <div className="relative h-40 overflow-hidden bg-secondary/30">
                    {article.imageUrl ? (
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-card">
                        <Newspaper className="w-8 h-8 text-muted-foreground/20" />
                      </div>
                    )}
                    {article.featured && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-yellow-500/90 text-black text-[9px] font-bold px-2 py-0.5 rounded-full">
                        <Star className="w-2.5 h-2.5" /> Destacada
                      </div>
                    )}
                  </div>
                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-[8px] border-primary/20 text-primary/70 px-1.5 py-0">{article.category}</Badge>
                      <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                        <Calendar className="w-2.5 h-2.5" /> {article.date}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2 flex-1">
                      {article.title}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-2">{article.summary}</p>
                    <span className="text-[10px] text-primary font-medium mt-3 flex items-center gap-1">
                      Leer más <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
