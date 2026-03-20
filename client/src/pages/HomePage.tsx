import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Zap,
  Star,
  TrendingUp,
  Users,
  Radio,
  Newspaper,
  Send,
  MessageSquare,
  Headphones,
  Music,
  Award,
  ExternalLink,
  Clock,
  ArrowRight,
  Package,
} from "lucide-react";
import type { News, Event, Poll } from "@shared/schema";

/* ======================================
   DJ INFO BAR — inspired by HabboRadio top bar
   When no DJ is on air → show "HabboSpeed" with fansite avatar
   ====================================== */
function DJInfoBar() {
  const { data: djPanel } = useQuery<any>({
    queryKey: ["/api/dj-panel"],
    refetchInterval: 15000,
    retry: false,
  });

  const rawDj = djPanel?.currentDj || "";
  const isAutoDJ = !rawDj || rawDj.toLowerCase() === "autodj" || rawDj.toLowerCase() === "auto dj" || rawDj.toLowerCase() === "habbospeed";
  const currentDj = isAutoDJ ? "HabboSpeed" : rawDj;
  const nextDj = djPanel?.nextDj || "";
  const djMessage = djPanel?.djMessage || "";

  return (
    <div className="bg-gradient-to-r from-primary/20 via-card to-primary/20 border border-border rounded-xl overflow-hidden" data-testid="dj-info-bar">
      <div className="flex items-center gap-4 px-4 py-3">
        {/* Current DJ */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="relative">
            {isAutoDJ ? (
              <img
                src="https://www.habbo.es/habbo-imaging/avatarimage?user=HabboSpeed&size=b&headonly=1"
                alt="HabboSpeed"
                className="w-11 h-11 rounded-lg bg-secondary/50"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://images.habbo.com/c_images/web_promo_small/feature_avatar_chat.png"; }}
              />
            ) : (
              <img
                src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${currentDj}&size=b&headonly=1`}
                alt={currentDj}
                className="w-11 h-11 rounded-lg bg-secondary/50"
                onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
              />
            )}
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${isAutoDJ ? "bg-yellow-500" : "bg-red-500 animate-pulse"}`} />
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-medium">
              {isAutoDJ ? "Radio" : "DJ Actual"}
            </p>
            <p className="text-sm font-bold text-foreground">{currentDj}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-border hidden sm:block" />

        {/* Next DJ */}
        {nextDj && (
          <>
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <div>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-medium">Siguiente</p>
                <p className="text-xs font-semibold text-foreground">{nextDj}</p>
              </div>
            </div>
            <div className="h-8 w-px bg-border hidden md:block" />
          </>
        )}

        {/* DJ Message — scrolling marquee style */}
        {djMessage && (
          <div className="flex-1 min-w-0 overflow-hidden hidden md:block">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3 h-3 text-primary flex-shrink-0" />
              <p className="text-xs text-muted-foreground truncate italic">"{djMessage}"</p>
            </div>
          </div>
        )}

        {/* Live indicator */}
        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${isAutoDJ ? "bg-yellow-500/15 border border-yellow-500/30" : "bg-red-500/15 border border-red-500/30"}`}>
            <Radio className={`w-3 h-3 ${isAutoDJ ? "text-yellow-400" : "text-red-400"}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isAutoDJ ? "text-yellow-400" : "text-red-400"}`}>
              {isAutoDJ ? "AutoRadio" : "En Vivo"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================================
   HERO BANNER — Large visual banner with real images
   ====================================== */
function HeroBanner({ slides }: { slides: any[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const defaultSlides = [
    {
      title: "Bienvenido a HabboSpeed",
      subtitle: "La radio y fansite #1 de la comunidad Habbo en español",
      cta: { text: "Explorar", href: "/news" },
      imageUrl: "/slides/slide-welcome.png",
    },
    {
      title: "Eventos en vivo",
      subtitle: "Participa en nuestros eventos semanales y gana premios increíbles",
      cta: { text: "Ver Eventos", href: "/events" },
      imageUrl: "/slides/slide-events.png",
    },
    {
      title: "Únete al equipo",
      subtitle: "¿Eres DJ, periodista o diseñador? Tenemos un lugar para ti",
      cta: { text: "Ver Equipo", href: "/team" },
      imageUrl: "/slides/slide-team.png",
    },
  ];

  const displaySlides = slides?.length > 0 ? slides : defaultSlides;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displaySlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [displaySlides.length]);

  const slide = displaySlides[currentSlide];

  return (
    <div className="relative h-48 sm:h-56 rounded-xl overflow-hidden group" data-testid="hero-banner">
      {/* Background — dark base + image */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      {slide.imageUrl && (
        <img src={slide.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70 transition-opacity duration-700" />
      )}
      {/* Overlay gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end px-6 sm:px-10 pb-10">
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-1.5 max-w-lg drop-shadow-lg">{slide.title}</h1>
        <p className="text-sm text-white/80 max-w-md leading-relaxed drop-shadow">{slide.subtitle}</p>
        {slide.cta && (
          <Link href={slide.cta.href || "/"}>
            <a className="mt-3 inline-flex items-center gap-2 text-xs font-semibold bg-primary/90 hover:bg-primary backdrop-blur text-white px-4 py-2 rounded-lg transition-all shadow-lg" data-testid="button-hero-cta">
              {slide.cta.text || "Ver más"} <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </Link>
        )}
      </div>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {displaySlides.map((_: any, i: number) => (
          <button key={i} onClick={() => setCurrentSlide(i)} className={`h-1.5 rounded-full transition-all ${i === currentSlide ? "bg-white w-6" : "bg-white/40 w-2"}`} data-testid={`button-slide-${i}`} />
        ))}
      </div>

      {/* Arrows */}
      <button onClick={() => setCurrentSlide((prev) => (prev - 1 + displaySlides.length) % displaySlides.length)} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity" data-testid="button-slide-prev"><ChevronLeft className="w-4 h-4" /></button>
      <button onClick={() => setCurrentSlide((prev) => (prev + 1) % displaySlides.length)} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity" data-testid="button-slide-next"><ChevronRight className="w-4 h-4" /></button>
    </div>
  );
}

/* ======================================
   MESSAGE BOARD — HabboRadio-style rolling messages
   This IS the chat - prominent and visible
   ====================================== */
function MessageBoard() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: chatMessages, isError } = useQuery<any[]>({
    queryKey: ["/api/chat"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/chat?limit=30");
      return res.json();
    },
    refetchInterval: 4000,
    retry: 2,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!token) throw new Error("Debes iniciar sesión para chatear");
      const res = await fetch(`/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Error al enviar" }));
        throw new Error(err.message || "Error al enviar mensaje");
      }
      return res.json();
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/chat"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMutation.mutate(message.trim());
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden" data-testid="message-board">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider">Chat en Vivo</span>
          <span className="text-[10px] text-muted-foreground">({(chatMessages || []).length} mensajes)</span>
        </div>
        {user && (
          <div className="flex items-center gap-1.5">
            {user.habboUsername && (
              <img
                src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${user.habboUsername}&size=s&headonly=1`}
                alt=""
                className="w-5 h-5 rounded"
              />
            )}
            <span className="text-[10px] text-muted-foreground">{user.displayName}</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="h-44 overflow-y-auto px-3 py-2 space-y-1" data-testid="chat-messages">
        {(chatMessages || []).map((msg: any, i: number) => (
          <div key={msg.id || i} className="flex items-start gap-2 py-1 hover:bg-secondary/20 rounded px-1 transition-colors">
            <img
              src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${msg.habboUsername || msg.userName || 'HabboSpeed'}&size=s&headonly=1`}
              alt=""
              className="w-6 h-6 rounded flex-shrink-0 bg-secondary/50 mt-0.5"
              onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
            />
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-primary mr-1.5">{msg.userName || 'Anon'}:</span>
              <span className="text-[11px] text-foreground/85 break-words">{msg.message || msg.content}</span>
            </div>
            {msg.createdAt && (
              <span className="text-[8px] text-muted-foreground/50 ml-auto flex-shrink-0 mt-1">
                {new Date(msg.createdAt).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
        ))}
        {(!chatMessages || chatMessages.length === 0) && !isError && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-xs">Sé el primero en escribir</p>
          </div>
        )}
        {isError && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-xs text-red-400">Error al cargar mensajes</p>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border px-3 py-2.5 bg-secondary/20">
        {user ? (
          <div className="flex gap-2">
            <Input
              placeholder="Escribe un mensaje..."
              className="text-xs h-8 bg-background/50 border-border/50 focus:border-primary/50"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              maxLength={200}
              data-testid="input-chat-message"
            />
            <Button
              size="icon"
              className="h-8 w-8 bg-primary hover:bg-primary/80 flex-shrink-0"
              onClick={handleSend}
              disabled={sendMutation.isPending || !message.trim()}
              data-testid="button-chat-send"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-0.5">
            <Link href="/login"><a className="text-primary hover:underline font-medium">Inicia sesión</a></Link> para chatear
          </p>
        )}
      </div>
    </div>
  );
}

/* ======================================
   NEWS GRID — card-based news display
   ====================================== */
function NewsGrid({ news, loading }: { news: News[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
            <Skeleton className="h-32" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (news.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No hay noticias aún</p>;
  }

  // First news item is featured (large), rest are normal
  const featured = news[0];
  const rest = news.slice(1, 5);

  return (
    <div className="space-y-3">
      {/* Featured news */}
      <Link href={`/news/${featured.id}`}>
        <a className="block group" data-testid={`card-news-featured-${featured.id}`}>
          <div className="relative bg-card border border-border rounded-xl overflow-hidden">
            {featured.imageUrl && (
              <div className="h-44 sm:h-52 overflow-hidden">
                <img src={featured.imageUrl} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <Badge className="bg-primary/90 text-white border-0 text-[9px] mb-2">{featured.category}</Badge>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight group-hover:text-primary/90 transition-colors">{featured.title}</h3>
              <p className="text-xs text-white/60 mt-1 line-clamp-1">{featured.summary}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] text-white/40">{featured.date}</span>
                <span className="text-[10px] text-primary font-medium">Leer más →</span>
              </div>
            </div>
          </div>
        </a>
      </Link>

      {/* Rest as grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rest.map((article) => (
          <Link href={`/news/${article.id}`} key={article.id}>
            <a className="block group" data-testid={`card-news-${article.id}`}>
              <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors h-full">
                {article.imageUrl && (
                  <div className="h-28 overflow-hidden">
                    <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} />
                  </div>
                )}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="outline" className="text-[8px] border-primary/20 text-primary/70 py-0 px-1.5">{article.category}</Badge>
                    <span className="text-[9px] text-muted-foreground">{article.date}</span>
                  </div>
                  <h3 className="text-xs font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">{article.title}</h3>
                  <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{article.summary}</p>
                </div>
              </div>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ======================================
   FURNI STRIP — Últimos Furnis Agregados
   ====================================== */
function FurniStrip() {
  // Fetch latest furni via backend proxy (avoids CORS)
  const { data: furnis } = useQuery<any[]>({
    queryKey: ["/api/habbo/furni"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/habbo/furni?limit=24");
      return res.json();
    },
    retry: false,
    staleTime: 300000,
  });

  const items = furnis && furnis.length > 0 ? furnis : [];

  if (items.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden" data-testid="furni-strip">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-secondary/20">
        <Package className="w-3.5 h-3.5 text-orange-400" />
        <span className="text-xs font-bold uppercase tracking-wider">Últimos Furnis Agregados</span>
        <Link href="/marketplace"><a className="text-[10px] text-primary ml-auto hover:underline">Ver todos →</a></Link>
      </div>
      <div className="px-3 py-3 overflow-hidden">
        <div className="flex gap-3 animate-marquee" style={{ width: "max-content" }}>
          {[...items, ...items].map((item: any, i: number) => {
            const iconUrl = item.iconUrl || `https://images.habbo.com/dcr/hof_furni/${item.revision}/${item.classname}_icon.png`;
            const name = item.name || item.classname || "Furni";
            return (
              <div key={i} className="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary/30 border border-border/30 flex items-center justify-center hover:scale-110 hover:border-primary/40 transition-all cursor-pointer group relative">
                <img
                  src={iconUrl}
                  alt={name}
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-card border border-border text-[8px] text-muted-foreground px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none max-w-[100px] truncate">
                  {name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ======================================
   BADGES STRIP — scrolling badges display
   ====================================== */
function BadgesStrip() {
  const { data: badges } = useQuery<any[]>({
    queryKey: ["/api/habbo/badges/es"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/habbo/badges/es?limit=24");
      const d = await res.json();
      return Array.isArray(d) ? d : (d.badges || d.data || []);
    },
    retry: false,
    staleTime: 120000,
  });

  if (!badges || badges.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden" data-testid="badges-strip">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-secondary/20">
        <Star className="w-3.5 h-3.5 text-yellow-400" />
        <span className="text-xs font-bold uppercase tracking-wider">Últimas Placas</span>
        <Link href="/badges"><a className="text-[10px] text-primary ml-auto hover:underline">Ver todas →</a></Link>
      </div>
      <div className="px-3 py-3 overflow-hidden">
        <div className="flex gap-2 animate-marquee" style={{ width: "max-content" }}>
          {[...badges, ...badges].map((badge: any, i: number) => (
            <img
              key={i}
              src={badge.url_habbo || badge.url_habboassets || `https://images.habbo.com/c_images/album1584/${badge.code || badge.badge_code}.gif`}
              alt={badge.name || badge.code || ""}
              className="w-9 h-9 object-contain flex-shrink-0 hover:scale-110 transition-transform cursor-pointer"
              onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.15"; }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ======================================
   EVENTS SIDEBAR
   ====================================== */
function EventsSidebar({ events, loading }: { events: Event[]; loading: boolean }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-secondary/20">
        <Calendar className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-bold uppercase tracking-wider">Próximos Eventos</span>
        <Link href="/events"><a className="text-[10px] text-primary ml-auto hover:underline">Ver más →</a></Link>
      </div>
      <div className="p-3 space-y-2">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)
        ) : events.length > 0 ? (
          events.slice(0, 3).map((event) => (
            <div key={event.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/20 border border-border/40 hover:border-primary/20 transition-colors" data-testid={`card-event-${event.id}`}>
              <div className="w-10 h-10 rounded-lg bg-primary/15 flex flex-col items-center justify-center flex-shrink-0">
                <Calendar className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate">{event.title}</p>
                <p className="text-[10px] text-primary">{event.date} · {event.time}</p>
                <p className="text-[9px] text-muted-foreground truncate">{event.roomName}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">No hay eventos próximos</p>
        )}
      </div>
    </div>
  );
}

/* ======================================
   POLL WIDGET
   ====================================== */
function PollWidget({ poll }: { poll: Poll }) {
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
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-secondary/20">
        <Zap className="w-3.5 h-3.5 text-yellow-400" />
        <span className="text-xs font-bold uppercase tracking-wider">Encuesta</span>
      </div>
      <div className="p-3 space-y-2">
        <p className="text-xs font-semibold mb-2">{poll.title}</p>
        {options.map((opt: any, i: number) => {
          const pct = totalVotes > 0 ? Math.round((opt.votes || 0) / totalVotes * 100) : 0;
          return (
            <button
              key={i}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs border transition-all ${voted !== null ? "cursor-default" : "hover:border-primary/40 hover:bg-primary/5 cursor-pointer"} ${voted === i ? "border-primary bg-primary/10" : "border-border/50 bg-secondary/10"}`}
              onClick={() => voted === null && voteMutation.mutate(i)}
              disabled={voted !== null}
              data-testid={`button-poll-option-${i}`}
            >
              <div className="flex justify-between mb-0.5">
                <span>{opt.name || opt.text || opt.label}</span>
                {voted !== null && <span className="text-muted-foreground text-[10px]">{pct}%</span>}
              </div>
              {voted !== null && (
                <div className="h-1 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
              )}
            </button>
          );
        })}
        <p className="text-[10px] text-muted-foreground text-center">{totalVotes} votos</p>
      </div>
    </div>
  );
}

/* ======================================
   QUICK TOOLS — HabboFans-style tools grid
   ====================================== */
function QuickTools() {
  const tools = [
    { href: "/imager", label: "Habbo Imager", icon: <Users className="w-4 h-4" />, color: "text-cyan-400" },
    { href: "/badges", label: "Buscador Placas", icon: <Award className="w-4 h-4" />, color: "text-yellow-400" },
    { href: "/marketplace", label: "Marketplace", icon: <TrendingUp className="w-4 h-4" />, color: "text-green-400" },
    { href: "/schedule", label: "Programación", icon: <Radio className="w-4 h-4" />, color: "text-red-400" },
    { href: "/forum", label: "Foro", icon: <MessageSquare className="w-4 h-4" />, color: "text-violet-400" },
    { href: "/djpanel", label: "Panel DJ", icon: <Headphones className="w-4 h-4" />, color: "text-primary" },
  ];

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-secondary/20">
        <Zap className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-bold uppercase tracking-wider">Herramientas</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5 p-3">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href}>
            <a className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-all border border-transparent hover:border-border/50" data-testid={`link-tool-${tool.label.toLowerCase().replace(/\s/g, '-')}`}>
              <span className={tool.color}>{tool.icon}</span>
              <span className="truncate">{tool.label}</span>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ======================================
   STATS BAR — Site statistics
   ====================================== */
function StatsBar() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {[
        { icon: <Radio className="w-4 h-4" />, label: "Radio", value: "24/7", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
        { icon: <Users className="w-4 h-4" />, label: "Comunidad", value: "Activa", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
        { icon: <Newspaper className="w-4 h-4" />, label: "Noticias", value: "Diarias", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
        { icon: <Music className="w-4 h-4" />, label: "Peticiones", value: "Abiertas", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
      ].map((stat, i) => (
        <div key={i} className={`rounded-xl p-3 flex items-center gap-2.5 border ${stat.bg}`}>
          <span className={stat.color}>{stat.icon}</span>
          <div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            <p className={`text-xs font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ======================================
   MAIN HOMEPAGE
   ====================================== */
export default function HomePage() {
  const { data: config } = useQuery<any>({ queryKey: ["/api/config"], retry: false });
  const { data: news, isLoading: newsLoading } = useQuery<News[]>({ queryKey: ["/api/news"] });
  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({ queryKey: ["/api/events"] });
  const { data: polls } = useQuery<Poll[]>({ queryKey: ["/api/polls"] });

  const latestNews = (news || []).slice(0, 5);
  const activePolls = (polls || []).filter((p) => p.isActive).slice(0, 1);
  const slides = Array.isArray(config?.slideshow) ? config.slideshow : [];

  return (
    <div className="min-h-screen">
      <div className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
        {/* DJ Info Bar */}
        <DJInfoBar />

        {/* Hero + Message Board (chat) — side by side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <HeroBanner slides={slides} />
          </div>
          <div className="lg:col-span-2">
            <MessageBoard />
          </div>
        </div>

        {/* Stats Bar */}
        <StatsBar />

        {/* Furni Strip — Últimos Furnis Agregados */}
        <FurniStrip />

        {/* Badges Strip */}
        <BadgesStrip />

        {/* Main Grid: News + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* News — 2 columns */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Últimas Noticias
              </h2>
              <Link href="/news"><a className="text-xs text-primary hover:underline">Ver todas →</a></Link>
            </div>
            <NewsGrid news={latestNews} loading={newsLoading} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Events */}
            <EventsSidebar events={(events || []).slice(0, 3)} loading={eventsLoading} />

            {/* Polls */}
            {activePolls.length > 0 && <PollWidget poll={activePolls[0]} />}

            {/* Quick Tools */}
            <QuickTools />
          </div>
        </div>
      </div>
    </div>
  );
}
