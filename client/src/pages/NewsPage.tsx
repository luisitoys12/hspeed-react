import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Newspaper } from "lucide-react";
import type { News } from "@shared/schema";

const CATEGORIES = ["Todas", "General", "Actualización", "Evento", "Comunidad", "Radio"];

export default function NewsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todas");

  const { data: news, isLoading } = useQuery<News[]>({ queryKey: ["/api/news"] });

  const filtered = (news || []).filter((n) => {
    const matchesSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.summary.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "Todas" || n.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Newspaper className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">Noticias</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar noticias..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-news-search"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-white border-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
              data-testid={`button-category-${cat}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-card border-border overflow-hidden">
                <Skeleton className="h-40" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </CardContent>
              </Card>
            ))
          : filtered.map((article) => (
              <Link href={`/news/${article.id}`} key={article.id}>
                <a className="block group" data-testid={`card-news-${article.id}`}>
                  <Card className="bg-card border-border hover:border-primary/30 transition-all hover:glow-purple overflow-hidden h-full">
                    <div className="h-40 overflow-hidden bg-secondary/50">
                      {article.imageUrl ? (
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Newspaper className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-[9px] border-primary/30 text-primary/80">
                          {article.category}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{article.date}</span>
                      </div>
                      <h3 className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{article.summary}</p>
                    </CardContent>
                  </Card>
                </a>
              </Link>
            ))}
      </div>

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Newspaper className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No se encontraron noticias</p>
        </div>
      )}
    </div>
  );
}
