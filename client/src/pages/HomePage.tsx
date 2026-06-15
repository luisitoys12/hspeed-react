import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { proxyImage } from "@/lib/habboProxy";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronLeft, ChevronRight, Calendar, Zap, Star, TrendingUp,
  Users, Radio, Newspaper, Send, MessageSquare, Headphones, Music,
  Award, Clock, ArrowRight, Package, LogIn, UserPlus,
} from "lucide-react";
import HabboRadioHero from "@/components/HabboRadioHero";
import WorldCupPanel from "@/components/WorldCupPanel";
import FootballNewsSection from "@/components/FootballNewsSection";
import type { News, Event, Poll } from "@shared/schema";

/* ============================================================
   CHAT / MESSAGE BOARD — FIXED
   ============================================================ */
function MessageBoard() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: chatMessages, isError, refetch } = useQuery<any[]>({
    queryKey: ["/api/chat"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/chat?limit=30");
      if (!res.ok) throw new Error("chat_error");
      return res.json();
    },
    refetchInterval: 4000,
    retry: 1,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const authToken = token || localStorage.getItem("token");
      if (!authToken) throw new Error("Debes iniciar sesión para chatear");
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
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
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col h-full" data-testid="message-board">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/30 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider">Chat en Vivo</span>
          <span className="text-[10px] text-muted-foreground">({(chatMessages || []).length})</span>
        </div>
        {user && (
          <div className="flex items-center gap-1.5">
            {user.habboUsername && (
              <img
                src="/habbo-radio/frank_small_03.gif"
                alt=""
                className="w-5 h-5 rounded"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">{user.displayName}</span>
          </div>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 min-h-0" style={{ maxHeight: "240px" }} data-testid="chat-messages">
        {isError ? (
          <div className="flex flex-col items-center justify-center h-full py-8 gap-2 text-center">
            <MessageSquare className="w-7 h-7 text-muted-foreground/30" />
            <p className="text-xs text-red-400">No se pudo cargar el chat</p>
            <p className="text-[10px] text-muted-foreground">Intenta recargar la página</p>
            <button onClick={() => refetch()} className="text-[10px] text-primary hover:underline mt-1">Reintentar</button>
          </div>
        ) : (chatMessages || []).length > 0 ? (
          (chatMessages || []).map((msg: any, i: number) => (
            <div key={msg.id || i} className="flex items-start gap-2 py-0.5 hover:bg-secondary/20 rounded px-1 transition-colors">
              <img
                src="/habbo-radio/frank_small_03.gif"
                alt=""
                className="w-6 h-6 rounded flex-shrink-0 bg-secondary/50 mt-0.5"
                onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
              />
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold text-primary mr-1">{msg.userName || "Anon"}:</span>
                <span className="text-[11px] text-foreground/85 break-words">{msg.message || msg.content}</span>
              </div>
              {msg.createdAt && (
                <span className="text-[8px] text-muted-foreground/50 ml-auto flex-shrink-0 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-8 gap-2">
            <MessageSquare className="w-8 h-8 opacity-25" />
            <p className="text-xs font-medium text-muted-foreground">¡Sé el primero en escribir!</p>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border px-3 py-2.5 bg-secondary/20 flex-shrink-0">
        {user ? (
          <div className="flex gap-2">
            <Input
              placeholder="Escribe un mensaje..."
              className="text-xs h-8 bg-background/50 border-border/50 focus:border-primary/50"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (message.trim()) sendMutation.mutate(message.trim()); } }}
              maxLength={200}
              data-testid="input-chat-message"
            />
            <Button
              size="icon"
              className="h-8 w-8 bg-primary hover:bg-primary/80 flex-shrink-0"
              onClick={() => message.trim() && sendMutation.mutate(message.trim())}
              disabled={sendMutation.isPending || !message.trim()}
              data-testid="button-chat-send"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-0.5">
            <Link href="/login" className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium">
              <LogIn className="w-3 h-3" /> Inicia sesión
            </Link>
            <span className="text-muted-foreground text-xs">o</span>
            <Link href="/register" className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium">
              <UserPlus className="w-3 h-3" /> Regístrate
            </Link>
            <span className="text-xs text-muted-foreground">para chatear</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   NEWS GRID (RubyXD / HabNubis Style)
   ============================================================ */
function NewsGrid({ news, loading }: { news: News[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-md">
            <Skeleton className="h-44" />
            <div className="p-4 space-y-2.5">
              <Skeleton className="h-3.5 w-1/4" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3.5 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (!news.length) return <p className="text-sm text-muted-foreground text-center py-8">No hay noticias aún</p>;
  const featured = news[0];
  const rest = news.slice(1, 5);
  
  return (
    <div className="space-y-4">
      {/* Featured News - Hero Card */}
      <Link href={`/news/${featured.id}`} className="block group" data-testid={`card-news-featured-${featured.id}`}>
          <div className="relative bg-card border border-primary/20 glow-border-themed rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-primary/40 group">
            {featured.imageUrl && (
              <div className="h-48 sm:h-64 overflow-hidden relative">
                <img 
                  src={featured.imageUrl} 
                  alt={featured.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent z-10" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-pixel bg-theme-gradient text-white border-0 mb-3 shadow-md">
                {featured.category}
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-white leading-tight group-hover:text-primary transition-colors duration-300 drop-shadow-md">
                {featured.title}
              </h3>
              <p className="text-xs text-white/80 mt-1.5 line-clamp-2 max-w-xl font-medium leading-relaxed drop-shadow">
                {featured.summary}
              </p>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10">
                <span className="text-[10px] text-white/50 font-semibold">{featured.date}</span>
                <span className="text-[10px] text-primary font-bold group-hover:underline flex items-center gap-1 ml-auto">
                  Leer noticia completa <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </div>
      </Link>

      {/* Secondary News - RubyXD Rectangular Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {rest.map((article) => (
          <Link href={`/news/${article.id}`} key={article.id} className="block group" data-testid={`card-news-${article.id}`}>
              <div className="bg-card border border-border/50 hover:border-primary/30 glow-border-themed rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl h-full flex flex-col">
                {article.imageUrl && (
                  <div className="h-36 overflow-hidden relative">
                    <img 
                      src={article.imageUrl} 
                      alt={article.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                      onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/25 to-transparent z-10" />
                  </div>
                )}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-full text-[8px] font-bold border border-primary/20 bg-primary/5 text-primary">
                        {article.category}
                      </span>
                      <span className="text-[9px] text-muted-foreground font-semibold">{article.date}</span>
                    </div>
                    <h3 className="text-xs font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2 text-foreground/95">
                      {article.title}
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>
                  <div className="text-[9px] text-primary font-bold group-hover:underline mt-3 pt-2.5 border-t border-border/30 flex items-center gap-1">
                    Leer más <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   FURNI STRIP
   ============================================================ */
function FurniStrip() {
  const { data: furnis } = useQuery<any[]>({
    queryKey: ["/api/habbo/furni"],
    queryFn: async () => { const r = await apiRequest("GET", "/api/habbo/furni?limit=24"); return r.json(); },
    retry: false, staleTime: 300000,
  });
  const items = furnis?.length ? furnis : [];
  if (!items.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden" data-testid="furni-strip">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-secondary/20">
        <Package className="w-3.5 h-3.5 text-orange-400" />
        <span className="text-xs font-bold uppercase tracking-wider">Últimos Furnis Agregados</span>
        <Link href="/marketplace" className="text-[10px] text-primary ml-auto hover:underline">Ver todos →</Link>
      </div>
      <div className="px-3 py-3 overflow-hidden">
        <div className="flex gap-3 animate-marquee" style={{ width: "max-content" }}>
          {[...items, ...items].map((item: any, i: number) => (
            <div key={i} className="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary/30 border border-border/30 flex items-center justify-center hover:scale-110 hover:border-primary/40 transition-all cursor-pointer group relative">
              <img
                src={proxyImage(item.iconUrl)}
                alt={item.name}
                className="w-10 h-10 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-card border border-border text-[8px] text-muted-foreground px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none max-w-[100px] truncate">
                {item.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   RECENT BADGES GRID (Nubis Style: 4x3 Static Grid)
   ============================================================ */
function RecentBadgesGrid() {
  const { data: badges, isLoading } = useQuery<any[]>({
    queryKey: ["/api/habbo/badges/es"],
    queryFn: async () => {
      const r = await apiRequest("GET", "/api/habbo/badges/es?limit=12");
      const d = await r.json();
      return Array.isArray(d) ? d.slice(0, 12) : (d.badges || d.data || []).slice(0, 12);
    },
    retry: false,
    staleTime: 120000,
  });

  const displayBadges = badges?.length ? badges : [];

  return (
    <div className="bg-card border border-primary/20 glow-border-themed rounded-2xl overflow-hidden shadow-2xl backdrop-blur-lg" data-testid="badges-grid">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/50 bg-secondary/20 flex-shrink-0">
        <Star className="w-4 h-4 text-yellow-400" />
        <span className="text-xs font-bold uppercase tracking-wider">Nuevas Placas Descubiertas</span>
        <Link href="/badges" className="text-[10px] text-primary ml-auto hover:underline font-bold">Ver todas →</Link>
      </div>
      <div className="p-4 sm:p-5">
        {isLoading ? (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-3.5">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="w-11 h-11 rounded-xl" />
            ))}
          </div>
        ) : displayBadges.length > 0 ? (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-3 justify-items-center">
            {displayBadges.map((badge: any, i: number) => {
              const code = badge.code || badge.badge_code || "PLA";
              const title = badge.name || `Placa ${code}`;
              const desc = badge.description || "Nueva placa descubierta en el hotel";
              const imgUrl = badge.url_habbo || badge.url_habboassets || proxyImage(`https://images.habbo.com/c_images/album1584/${code}.gif`);

              return (
                <div
                  key={badge.id || i}
                  className="group relative flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-secondary/20 border border-border/40 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 cursor-pointer shadow-md glow-border-themed hover:scale-110"
                >
                  <img
                    src={imgUrl}
                    alt={title}
                    className="w-8 h-8 object-contain transition-all duration-300 group-hover:scale-120 filter drop-shadow-[0_2px_4px_rgba(var(--theme-glow),0.2)]"
                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.2"; }}
                  />
                  {/* Tooltip elegante */}
                  <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none w-36">
                    <div className="bg-popover text-popover-foreground border border-primary/30 text-[9px] px-2.5 py-1.5 rounded-xl shadow-2xl text-center backdrop-blur-md">
                      <p className="font-extrabold text-primary truncate">{title}</p>
                      <p className="text-[8px] text-muted-foreground leading-tight line-clamp-2 mt-0.5">{desc}</p>
                      <span className="text-[7px] text-yellow-400 font-mono block mt-0.5">{code}</span>
                    </div>
                    <div className="w-1.5 h-1.5 bg-popover border-r border-b border-primary/30 rotate-45 -mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">No hay placas recientes disponibles</p>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   EVENTS SIDEBAR
   ============================================================ */
function EventsSidebar({ events, loading }: { events: Event[]; loading: boolean }) {
  return (
  <div className="site-panel overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/70 bg-white/5">
        <Calendar className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-bold uppercase tracking-wider">Próximos Eventos</span>
        <Link href="/events" className="text-[10px] text-primary ml-auto hover:underline">Ver más →</Link>
      </div>
      <div className="p-3 space-y-2">
        {loading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />) :
          events.length > 0 ? events.slice(0, 3).map((event) => (
            <div key={event.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/20 border border-border/40 hover:border-primary/20 transition-colors" data-testid={`card-event-${event.id}`}>
              <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate">{event.title}</p>
                <p className="text-[10px] text-primary">{event.date} · {event.time}</p>
                <p className="text-[9px] text-muted-foreground truncate">{event.roomName}</p>
              </div>
            </div>
          )) : <p className="text-xs text-muted-foreground text-center py-4">No hay eventos próximos</p>}
      </div>
    </div>
  );
}

/* ============================================================
   POLL WIDGET
   ============================================================ */
function PollWidget({ poll }: { poll: Poll }) {
  const [voted, setVoted] = useState<number | null>(null);
  const options = (poll.options as any[]) || [];
  const totalVotes = options.reduce((s: number, o: any) => s + (o.votes || 0), 0);
  const voteMutation = useMutation({
    mutationFn: async (idx: number) => {
      const r = await apiRequest("PUT", `/api/polls/${poll.id}`, {
        options: options.map((o: any, i: number) => i === idx ? { ...o, votes: (o.votes || 0) + 1 } : o),
      });
      return r.json();
    },
    onSuccess: (_, idx) => { setVoted(idx); queryClient.invalidateQueries({ queryKey: ["/api/polls"] }); },
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
            <button key={i}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs border transition-all ${
                voted !== null ? "cursor-default" : "hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
              } ${voted === i ? "border-primary bg-primary/10" : "border-border/50 bg-secondary/10"}`}
              onClick={() => voted === null && voteMutation.mutate(i)}
              disabled={voted !== null}
            >
              <div className="flex justify-between mb-0.5">
                <span>{opt.name || opt.text || opt.label}</span>
                {voted !== null && <span className="text-muted-foreground text-[10px]">{pct}%</span>}
              </div>
              {voted !== null && (
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                </div>
              )}
            </button>
          );
        })}
        <p className="text-[10px] text-muted-foreground text-center">{totalVotes} votos</p>
      </div>
    </div>
  );
}

/* ============================================================
   QUICK TOOLS
   ============================================================ */
function QuickTools() {
  const tools = [
    { href: "/imager",      label: "Habbo Imager",    icon: <Users className="w-4 h-4" />,       color: "text-cyan-400" },
    { href: "/badges",      label: "Buscador Placas",  icon: <Award className="w-4 h-4" />,       color: "text-yellow-400" },
    { href: "/marketplace", label: "Marketplace",      icon: <TrendingUp className="w-4 h-4" />,  color: "text-green-400" },
    { href: "/schedule",    label: "Programación",     icon: <Radio className="w-4 h-4" />,       color: "text-red-400" },
    { href: "/forum",       label: "Foro",             icon: <MessageSquare className="w-4 h-4" />, color: "text-violet-400" },
    { href: "/djpanel",     label: "Panel DJ",         icon: <Headphones className="w-4 h-4" />,  color: "text-primary" },
  ];
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-secondary/20">
        <Zap className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-bold uppercase tracking-wider">Herramientas</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5 p-3">
        {tools.map((t) => (
          <Link key={t.href} href={t.href} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-all border border-transparent hover:border-border/50">
            <span className={t.color}>{t.icon}</span>
            <span className="truncate">{t.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   STATS BAR
   ============================================================ */
function StatsBar() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { icon: <Radio className="w-4 h-4" />,     label: "Radio",     value: "24/7",     color: "text-red-400",    bg: "bg-red-500/10 border-red-500/20" },
        { icon: <Users className="w-4 h-4" />,     label: "Comunidad", value: "Activa",   color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20" },
        { icon: <Newspaper className="w-4 h-4" />, label: "Noticias",  value: "Diarias",  color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20" },
        { icon: <Music className="w-4 h-4" />,     label: "Peticiones", value: "Abiertas", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
      ].map((s, i) => (
        <div key={i} className={`site-panel p-3.5 flex items-center gap-3 border ${s.bg}`}>
          <span className={s.color}>{s.icon}</span>
          <div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className={`text-xs font-bold ${s.color}`}>{s.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   HOME HERO BANNER (Slideshow)
   ============================================================ */
function HomeHeroBanner({ slideshow }: { slideshow: any[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!slideshow || slideshow.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshow.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slideshow]);

  if (!slideshow || slideshow.length === 0) return null;

  return (
    <div className="relative rounded-2xl overflow-hidden h-[300px] border border-border shadow-lg bg-[#0c0634] group w-full">
      {slideshow.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {slide.image && (
            <img
              src={slide.image}
              alt={slide.title || "Slideshow"}
              className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-[8000ms] ease-out"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2 z-20">
            <Badge className="bg-primary hover:bg-primary/80 border-none font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5">
              HabboSpeed Fansite
            </Badge>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight drop-shadow-md">
              {slide.title || "¡Bienvenidos a HabboSpeed!"}
            </h2>
            <p className="text-xs text-white/80 max-w-md drop-shadow">
              Sintoniza nuestra radio 24/7, mantente al día con las últimas noticias de Habbo y explora nuestro catálogo de furnis y placas.
            </p>
          </div>
        </div>
      ))}

      {/* Slide Indicators */}
      {slideshow.length > 1 && (
        <div className="absolute bottom-6 right-6 z-20 flex gap-1.5">
          {slideshow.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentSlide ? "bg-white w-4" : "bg-white/40"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   MAIN HOMEPAGE
   ============================================================ */
export default function HomePage() {
  const { data: config } = useQuery<any>({ queryKey: ["/api/config"], retry: false });
  const { data: news, isLoading: newsLoading } = useQuery<News[]>({ queryKey: ["/api/news"] });
  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({ queryKey: ["/api/events"] });
  const { data: polls } = useQuery<Poll[]>({ queryKey: ["/api/polls"] });

  const latestNews = (news || []).slice(0, 5);
  const activePolls = (polls || []).filter((p) => p.isActive).slice(0, 1);

  const slideshow = config?.slideshow || [
    { image: "https://images.habbo.com/c_images/reception/rec_background_beach.png", title: "¡Bienvenidos a HabboSpeed!", link: "#" },
    { image: "https://images.habbo.com/c_images/reception/rec_background_habboween.png", title: "¡Sintoniza nuestra Radio 24/7!", link: "#" }
  ];

  return (
    <div className="min-h-screen">
      <div className="p-4 lg:p-6 space-y-5 max-w-7xl mx-auto">
        
        {/* Top Grid: Welcome Banner Slideshow & Live Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
          <div className="lg:col-span-2">
            <HomeHeroBanner slideshow={slideshow} />
          </div>
          <div className="h-full min-h-[300px]">
            <MessageBoard />
          </div>
        </div>

        <StatsBar />
        <FurniStrip />
        <RecentBadgesGrid />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-3">
            <div className="site-panel px-4 py-3 flex items-center justify-between">
              <div>
                <p className="site-kicker">Portal de Noticias</p>
                <h2 className="site-title flex items-center gap-2 mt-1">
                  <TrendingUp className="w-4 h-4 text-primary" /> Últimas Noticias
                </h2>
              </div>
              <Link href="/news" className="text-xs text-primary hover:underline font-semibold">Ver todas →</Link>
            </div>
            <NewsGrid news={latestNews} loading={newsLoading} />
          </div>
          <div className="space-y-4">
            <EventsSidebar events={(events || []).slice(0, 3)} loading={eventsLoading} />
            {activePolls.length > 0 && <PollWidget poll={activePolls[0]} />}
            <QuickTools />
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <WorldCupPanel />
          <FootballNewsSection />
        </div>
      </div>
    </div>
  );
}
