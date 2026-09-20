import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Home, User, Globe, Trophy, Sparkles, Copy, Search } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { PageHeaderCard } from "@/components/PageHeaderCard";
import type { Event } from "@shared/schema";

const DEFAULT_EVENTS: any[] = [
  {
    id: 101,
    title: "Gran Fiesta Hip Hop en HabboSpeed",
    description: "Música en vivo con nuestros mejores DJs, sorteos de créditos y placas exclusivas para todos los asistentes.",
    date: "Viernes 20 Sept",
    time: "20:00 CDMX / 23:00 ARG",
    roomName: "HabboSpeed Lounge Central",
    roomOwner: "Frank",
    host: "DJ_SpeedMix",
    server: "ES",
    imageUrl: "https://images.habbo.com/c_images/reception/rec_background_beach.png",
    roomCode: "67891234",
  },
  {
    id: 102,
    title: "Torneo de Penales Fútbol Hub",
    description: "Compite en el mini-juego de penales de HabboSpeed y gana 500 SpeedPoints y furnis raros.",
    date: "Sábado 21 Sept",
    time: "18:00 CDMX / 21:00 ARG",
    roomName: "Estadio HSpeed Arena",
    roomOwner: "HabboAdmin",
    host: "Striker_Pro",
    server: "ES",
    imageUrl: "https://images.habbo.com/c_images/reception/rec_background_habboween.png",
    roomCode: "99881122",
  },
  {
    id: 103,
    title: "Búsqueda del Tesoro Pirata",
    description: "Supera los laberintos y acertijos de la comunidad para reclamar los cofres misteriosos del hotel.",
    date: "Domingo 22 Sept",
    time: "19:00 CDMX / 22:00 ARG",
    roomName: "Galeón Perdido",
    roomOwner: "CaptainHabbo",
    host: "Staff_Events",
    server: "GLOBAL",
    imageUrl: "https://images.habbo.com/c_images/reception/rec_background_beach.png",
    roomCode: "44556677",
  },
  {
    id: 104,
    title: "Noche de Trivia Habbo & Cultura Pop",
    description: "Demuestra tus conocimientos en preguntas rápidas y acumula puntos en el leaderboard oficial.",
    date: "Miércoles 25 Sept",
    time: "21:00 CDMX / 00:00 ARG",
    roomName: "Auditorio HSpeed Trivia",
    roomOwner: "HabboSpeed",
    host: "QuizMaster",
    server: "ES",
    imageUrl: "https://images.habbo.com/c_images/reception/rec_background_habboween.png",
    roomCode: "11223344",
  },
];

export default function EventsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedServer, setSelectedServer] = useState<string>("all");

  const { data: serverEvents, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const allEvents = (serverEvents && serverEvents.length > 0) ? serverEvents : DEFAULT_EVENTS;

  const filteredEvents = allEvents.filter((ev: any) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      (ev.roomName && ev.roomName.toLowerCase().includes(search.toLowerCase())) ||
      (ev.host && ev.host.toLowerCase().includes(search.toLowerCase()));

    const matchesServer = selectedServer === "all" || ev.server === selectedServer;
    return matchesSearch && matchesServer;
  });

  const handleCopyRoom = (code: string) => {
    const cmd = `:room ${code}`;
    navigator.clipboard.writeText(cmd);
    toast({
      title: "¡Comando copiado!",
      description: `Usa "${cmd}" en el chat de Habbo para ingresar a la sala del evento.`,
    });
  };

  return (
    <PageContainer>
      <PageHeaderCard
        title="Eventos de la Comunidad"
        description="Participa en torneos, fiestas y concursos organizados por el equipo de HabboSpeed."
        icon={<Calendar className="w-5 h-5 text-amber-500" />}
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative w-44 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar eventos..."
                className="pl-8 h-8 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
              {["all", "ES", "GLOBAL"].map((srv) => (
                <button
                  key={srv}
                  onClick={() => setSelectedServer(srv)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    selectedServer === srv
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {srv === "all" ? "Todos" : srv}
                </button>
              ))}
            </div>
          </div>
        }
      />

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                  <Skeleton className="h-44" />
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </CardContent>
                </Card>
              ))
            : filteredEvents.map((event: any) => (
                <div
                  key={event.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  data-testid={`card-event-${event.id}`}
                >
                  <div>
                    {/* Event Image */}
                    <div className="h-40 overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                      <img
                        src={event.imageUrl || "https://images.habbo.com/c_images/reception/rec_background_beach.png"}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/fallback-news.png";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <Badge className="bg-slate-900/80 backdrop-blur-md text-white border-white/10 text-[9px] font-black">
                          {event.server || "ES"}
                        </Badge>
                      </div>
                      <div className="absolute bottom-2.5 left-3 text-white">
                        <div className="flex items-center gap-2 text-[10px] font-black bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{event.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Event Content */}
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{event.date}</span>
                      </div>

                      <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {event.title}
                      </h3>

                      {event.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {event.description}
                        </p>
                      )}

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <Home className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate font-semibold text-slate-800 dark:text-slate-200">{event.roomName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">Host: <strong className="text-slate-800 dark:text-slate-200">{event.host || event.roomOwner}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-4 pb-4 pt-1">
                    <Button
                      onClick={() => handleCopyRoom(event.roomCode || "12345678")}
                      className="w-full bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 text-white dark:text-slate-950 font-black text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Copy className="w-3.5 h-3.5 text-amber-400 dark:text-slate-950" />
                      <span>Copiar :room {event.roomCode || "12345678"}</span>
                    </Button>
                  </div>
                </div>
              ))}
        </div>

        {!isLoading && filteredEvents.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 text-slate-400 space-y-2">
            <Calendar className="w-10 h-10 mx-auto opacity-30" />
            <p className="text-sm font-bold">No se encontraron eventos con los filtros seleccionados.</p>
          </div>
        )}
    </PageContainer>
  );
}
