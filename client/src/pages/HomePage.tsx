import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTheme } from "@/hooks/useTheme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Calendar, Zap, Star, TrendingUp, Users, Radio, Newspaper } from "lucide-react";
import type { News, Event, Poll } from "@shared/schema";

function HeroBanner({ slides }: { slides: any[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { theme, decorations, colors } = useTheme();

  const defaultSlides = [
    { title: "Bienvenido a HabboSpeed", subtitle: "La radio y fansite #1 de la comunidad Habbo en español", cta: { text: "Explorar", href: "/news" } },
    { title: "Eventos en vivo", subtitle: "Participa en nuestros eventos semanales y gana premios increíbles", cta: { text: "Ver Eventos", href: "/events" } },
    { title: "Comunidad activa", subtitle: "Únete a miles de jugadores en nuestro foro", cta: { text: "Ir al Foro", href: "/forum" } },
  ];

  const displaySlides = (slides && slides.length > 0) ? slides : defaultSlides;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displaySlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [displaySlides.length]);

  const slide = displaySlides[currentSlide];
  const emoji = decorations?.emoji || "⚡";
  const themeName = theme?.name || "HabboSpeed";

  return (
    <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden glow-themed" data-testid="hero-banner">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-theme-gradient opacity-90" />
      
      {/* Pattern overlay */}
      <div className={`absolute inset-0 bg-pattern-${decorations?.pattern || 'grid'} opacity-40`} />
      
      {/* Shimmer */}
      <div className="absolute inset-0 shimmer-bg" />

      {/* Image if available */}
      {slide.imageUrl && (
        <img src={slide.imageUrl} alt={slide.title} className="absolute inset-0 w-full h-full object-cover opacity-20" />
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{emoji}</span>
          <span className="font-pixel text-[8px] text-white/70 uppercase tracking-wider">{themeName}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 drop-shadow-lg max-w-lg">
          {slide.title}
        </h1>
        <p className="text-sm sm:text-base text-white/80 max-w-md leading-relaxed">
          {slide.subtitle}
        </p>
        {slide.cta && (
          <Link href={slide.cta.href || slide.href || "/"}>
            <a className="mt-4 inline-flex items-center gap-2 text-xs font-semibold bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-5 py-2.5 rounded-lg transition-all border border-white/20" data-testid="button-hero-cta">
              {slide.cta.text || "Ver más"} <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </Link>
        )}
      </div>

      {/* Decorative emojis */}
      {decorations?.accentEmojis && (
        <div className="absolute right-6 top-6 hidden sm:flex flex-col gap-2 opacity-30">
          {decorations.accentEmojis.slice(0, 3).map((e, i) => (
            <span key={i} className="text-2xl" style={{ animationDelay: `${i * 0.3}s` }}>{e}</span>
          ))}
        </div>
      )}

      {/* Navigation dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {displaySlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-1.5 rounded-full transition-all ${i === currentSlide ? "bg-white w-6" : "bg-white/30 w-1.5"}`}
            data-testid={`button-slide-${i}`}
          />
        ))}
      </div>

      {/* Arrow controls */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + displaySlides.length) % displaySlides.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors"
        data-testid="button-slide-prev"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % displaySlides.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors"
        data-testid="button-slide-next"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function BadgesMarquee() {
  const { data: badges } = useQuery<any[]>({
    queryKey: ["/api/habbo/badges/es"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/habbo/badges/es?limit=30");
      const d = await res.json();
      return Array.isArray(d) ? d : (d.data || []);
    },
    retry: false,
    staleTime: 60000,
  });

  if (!badges || badges.length === 0) return null;

  const doubled = [...badges, ...badges];

  return (
    <div className="overflow-hidden relative">
      <div className="flex gap-3 animate-marquee" style={{ width: "max-content" }}>
        {doubled.map((badge: any, i) => (
          <div key={i} className="flex-shrink-0 badge-hover">
            <img
              src={`https://images.habbo.com/c_images/album1584/${badge.code || badge.badge_code}.gif`}
              alt={badge.name || badge.badge_name || badge.code}
              className="w-8 h-8 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.2"; }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function PollCard({ poll }: { poll: Poll }) {
  const [voted, setVoted] = useState<number | null>(null);
  const options = (poll.options as any[]) || [];
  const totalVotes = options.reduce((sum: number, opt: any) => sum + (opt.votes || 0), 0);

  const voteMutation = useMutation({
    mutationFn: async (optionIndex: number) => {
      const res = await apiRequest("PUT", `/api/polls/${poll.id}`, {
        options: options.map((opt: any, i: number) => i === optionIndex ? { ...opt, votes: (opt.votes || 0) + 1 } : opt)
      });
      return res.json();
    },
    onSuccess: (_, optionIndex) => {
      setVoted(optionIndex);
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
    },
  });

  return (
    <Card className="card-themed">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          {poll.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {options.map((opt: any, i: number) => {
          const pct = totalVotes > 0 ? Math.round((opt.votes || 0) / totalVotes * 100) : 0;
          const isVoted = voted === i;
          return (
            <button
              key={i}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs border transition-all ${
                voted !== null
                  ? "cursor-default"
                  : "hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
              } ${isVoted ? "border-primary bg-primary/10" : "border-border bg-secondary/10"}`}
              onClick={() => voted === null && voteMutation.mutate(i)}
              disabled={voted !== null}
              data-testid={`button-poll-option-${i}`}
            >
              <div className="flex justify-between mb-1">
                <span>{opt.name || opt.text || opt.label}</span>
                {voted !== null && <span className="text-muted-foreground">{pct}%</span>}
              </div>
              {voted !== null && (
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              )}
            </button>
          );
        })}
        <p className="text-xs text-muted-foreground">{totalVotes} votos en total</p>
      </CardContent>
    </Card>
  );
}

function QuickStatsBar() {
  const { decorations } = useTheme();
  const emoji = decorations?.emoji || "⚡";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { icon: <Radio className="w-4 h-4" />, label: "Radio 24/7", value: "En Vivo", color: "text-red-400" },
        { icon: <Users className="w-4 h-4" />, label: "Comunidad", value: "Activa", color: "text-green-400" },
        { icon: <Newspaper className="w-4 h-4" />, label: "Noticias", value: "Diarias", color: "text-blue-400" },
        { icon: <span className="text-sm">{emoji}</span>, label: "Temática", value: decorations?.emoji ? "Activa" : "Clásico", color: "text-yellow-400" },
      ].map((stat, i) => (
        <div key={i} className="card-themed rounded-xl p-3 flex items-center gap-3">
          <div className={`${stat.color}`}>{stat.icon}</div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            <p className={`text-xs font-semibold ${stat.color}`}>{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const { data: config } = useQuery<any>({ queryKey: ["/api/config"], retry: false });
  const { data: news, isLoading: newsLoading } = useQuery<News[]>({ queryKey: ["/api/news"] });
  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({ queryKey: ["/api/events"] });
  const { data: polls } = useQuery<Poll[]>({ queryKey: ["/api/polls"] });
  const { decorations } = useTheme();

  const latestNews = (news || []).slice(0, 4);
  const upcomingEvents = (events || []).slice(0, 3);
  const activePolls = (polls || []).filter(p => p.isActive).slice(0, 2);
  const slides = Array.isArray(config?.slideshow) ? config.slideshow : [];

  return (
    <div className={`bg-pattern-${decorations?.pattern || 'grid'} min-h-screen`}>
      <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Hero Banner */}
        <HeroBanner slides={slides} />

        {/* Quick Stats */}
        <QuickStatsBar />

        {/* Badges Marquee */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Últimas Placas</h2>
          </div>
          <div className="card-themed rounded-xl p-3 overflow-hidden">
            <BadgesMarquee />
          </div>
        </div>

        {/* Main Grid: News + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Latest News - 2 columns */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Últimas Noticias
              </h2>
              <Link href="/news">
                <a className="text-xs text-primary hover:text-primary/80 transition-colors">Ver todas →</a>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {newsLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="card-themed">
                      <Skeleton className="h-36 rounded-t-lg" />
                      <CardContent className="p-3 space-y-2">
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-1/2" />
                      </CardContent>
                    </Card>
                  ))
                : latestNews.map((article) => (
                    <Link href={`/news/${article.id}`} key={article.id}>
                      <a className="block group" data-testid={`card-news-${article.id}`}>
                        <Card className="card-themed overflow-hidden h-full">
                          {article.imageUrl && (
                            <div className="h-36 overflow-hidden">
                              <img
                                src={article.imageUrl}
                                alt={article.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
                              />
                            </div>
                          )}
                          <CardContent className="p-3">
                            <Badge variant="outline" className="text-[9px] border-primary/30 text-primary/80 mb-1.5">{article.category}</Badge>
                            <h3 className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">{article.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{article.summary}</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-2">{article.date}</p>
                          </CardContent>
                        </Card>
                      </a>
                    </Link>
                  ))}
              {!newsLoading && latestNews.length === 0 && (
                <div className="col-span-2 text-center py-8 text-muted-foreground text-sm">No hay noticias aún</div>
              )}
            </div>
          </div>

          {/* Right Column: Events + Polls */}
          <div className="space-y-4">
            {/* Upcoming Events */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Próximos Eventos
                </h2>
                <Link href="/events">
                  <a className="text-xs text-primary hover:text-primary/80">Ver más →</a>
                </Link>
              </div>
              <div className="space-y-2">
                {eventsLoading
                  ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)
                  : upcomingEvents.length > 0
                    ? upcomingEvents.map((event) => (
                        <Card key={event.id} className="card-themed p-3" data-testid={`card-event-${event.id}`}>
                          <p className="text-xs font-semibold truncate">{event.title}</p>
                          <p className="text-[10px] text-primary mt-0.5">{event.date} · {event.time}</p>
                          <p className="text-[10px] text-muted-foreground truncate">🏠 {event.roomName}</p>
                        </Card>
                      ))
                    : <p className="text-xs text-muted-foreground text-center py-4">No hay eventos próximos</p>
                }
              </div>
            </div>

            {/* Active Polls */}
            {activePolls.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Encuestas
                </h2>
                <div className="space-y-3">
                  {activePolls.map((poll) => <PollCard key={poll.id} poll={poll} />)}
                </div>
              </div>
            )}

            {/* Quick Links */}
            <Card className="card-themed">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Herramientas</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                {[
                  { href: "/imager", label: "Habbo Imager", emoji: "👤" },
                  { href: "/badges", label: "Buscador Placas", emoji: "🏅" },
                  { href: "/marketplace", label: "Marketplace", emoji: "💰" },
                  { href: "/schedule", label: "Programación", emoji: "📻" },
                ].map((tool) => (
                  <Link key={tool.href} href={tool.href}>
                    <a className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors border border-border/50" data-testid={`link-tool-${tool.label.toLowerCase().replace(/\s/g,'-')}`}>
                      <span>{tool.emoji}</span>
                      {tool.label}
                    </a>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
