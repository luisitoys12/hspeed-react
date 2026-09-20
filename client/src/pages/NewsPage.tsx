import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Newspaper, Star, Calendar, ArrowRight } from "lucide-react";
import type { News } from "@shared/schema";
import { proxyImage } from "@/lib/habboProxy";
import PageContainer from "@/components/PageContainer";
import PageHeaderCard from "@/components/PageHeaderCard";

export default function NewsPage() {
  const { data: allNews, isLoading } = useQuery<News[]>({
    queryKey: ["/api/news"],
  });

  const news = allNews || [];
  const featured = news.filter((n: any) => n.featured);
  const regular = news.filter((n: any) => !n.featured);
  const sorted = [...featured, ...regular];

  return (
    <PageContainer>
      {/* Header Card */}
      <PageHeaderCard
        title="Portal de Noticias"
        kicker="HabboSpeed News"
        subtitle="Entérate de las últimas novedades, eventos de la comunidad, actualizaciones del hotel y reportajes exclusivos."
        icon={<Newspaper className="w-5 h-5 text-cyan-500" />}
        badge={
          featured.length > 0 ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              <Star className="w-2.5 h-2.5" /> {featured.length} destacada{featured.length > 1 ? "s" : ""}
            </span>
          ) : undefined
        }
      />

      {/* Featured banner (first featured article) */}
      {!isLoading && featured.length > 0 && (
        <Link href={`/news/${featured[0].id}`}>
          <div className="block group" data-testid="card-featured-hero">
            <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden shadow-xs border border-slate-200/90 dark:border-slate-800">
              {featured[0].imageUrl ? (
                <img
                  src={proxyImage(featured[0].imageUrl)}
                  alt={featured[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full bg-slate-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-1 bg-amber-400 text-black text-[10px] font-black px-2.5 py-1 rounded-md shadow">
                <Star className="w-3 h-3" /> Destacada
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <span className="bg-cyan-500 text-black font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider mb-2 inline-block">
                  {featured[0].category}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight group-hover:text-cyan-300 transition-colors">
                  {featured[0].title}
                </h2>
                <p className="text-sm text-slate-300 mt-1 line-clamp-2">
                  {featured[0].summary}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Calendar className="w-3 h-3" /> {featured[0].date}
                  </span>
                  <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                    Leer artículo <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* All news grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden p-3.5 space-y-3"
            >
              <Skeleton className="h-40 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl text-center py-16 text-slate-400">
          <Newspaper className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-bold">No hay noticias publicadas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((article: any) => (
            <Link href={`/news/${article.id}`} key={article.id}>
              <div
                className="block group h-full"
                data-testid={`card-news-${article.id}`}
              >
                <div
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:border-cyan-400 dark:hover:border-cyan-400 transition-all h-full flex flex-col"
                >
                  {/* Thumbnail */}
                  <div className="relative h-40 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {article.imageUrl ? (
                      <img
                        src={proxyImage(article.imageUrl)}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).parentElement!.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-800">
                        <Newspaper className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                    {article.featured && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-400 text-black text-[9px] font-black px-2 py-0.5 rounded-md shadow">
                        <Star className="w-2.5 h-2.5" /> Destacada
                      </div>
                    )}
                  </div>
                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[9px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-1.5 py-0.5 rounded">
                        {article.category || "Habbo"}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Calendar className="w-2.5 h-2.5" /> {article.date}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 leading-snug group-hover:text-cyan-500 transition-colors line-clamp-2 flex-1">
                      {article.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                      {article.summary}
                    </p>
                    <span className="text-xs text-cyan-600 dark:text-cyan-400 font-black mt-3 flex items-center gap-1">
                      Leer más <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
