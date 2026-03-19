import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Home, User, Globe } from "lucide-react";
import type { Event } from "@shared/schema";

export default function EventsPage() {
  const { data: events, isLoading } = useQuery<Event[]>({ queryKey: ["/api/events"] });

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Calendar className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">Eventos</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-card border-border overflow-hidden">
                <Skeleton className="h-44" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-2/3" />
                </CardContent>
              </Card>
            ))
          : (events || []).map((event) => (
              <Card
                key={event.id}
                className="bg-card border-border hover:border-primary/30 hover:glow-purple transition-all overflow-hidden"
                data-testid={`card-event-${event.id}`}
              >
                <div className="h-44 overflow-hidden bg-secondary/50 relative">
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-primary/80 text-white text-[9px]">{event.server}</Badge>
                  </div>
                </div>
                <CardContent className="p-4 space-y-2">
                  <h3 className="text-sm font-bold leading-tight">{event.title}</h3>

                  <div className="flex items-center gap-1.5 text-xs text-primary">
                    <Calendar className="w-3 h-3" />
                    <span>{event.date}</span>
                    <Clock className="w-3 h-3 ml-1" />
                    <span>{event.time}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Home className="w-3 h-3" />
                      <span className="truncate">Sala: {event.roomName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span className="truncate">Dueño: {event.roomOwner}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Globe className="w-3 h-3" />
                      <span className="truncate">Anfitrión: {event.host}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {!isLoading && (!events || events.length === 0) && (
        <div className="text-center py-16 text-muted-foreground">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay eventos programados</p>
        </div>
      )}
    </div>
  );
}
