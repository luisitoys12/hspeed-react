import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface SongHistoryItem {
  id: number;
  title: string;
  artist: string;
  album?: string;
  coverUrl?: string;
  playedAt: string;
  playedByDj?: string;
  durationSeconds?: number;
  requestedBy?: string;
  playCount: number;
}

export default function SongHistoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: history = [], isLoading } = useQuery<SongHistoryItem[]>({
    queryKey: ["/api/song-history"],
    refetchInterval: 15000, // Refresh every 15 seconds to see live song updates
  });

  const { data: topSongs = [] } = useQuery<SongHistoryItem[]>({
    queryKey: ["/api/song-history/top"],
  });

  const requestMutation = useMutation({
    mutationFn: async (songStr: string) => {
      if (!user) throw new Error("Debes iniciar sesión para pedir una canción.");
      return apiRequest("POST", "/api/requests", {
        type: "cancion",
        details: songStr,
        userName: user.displayName,
      });
    },
    onSuccess: () => {
      toast({
        title: "¡Petición enviada!",
        description: "Tu solicitud de canción ha sido enviada al DJ de turno.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error al pedir canción",
        description: err.message || "Por favor, inténtalo más tarde.",
        variant: "destructive",
      });
    },
  });

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold uppercase tracking-tight text-white mb-2 font-cabinet">
          Historial de <span className="text-primary">Canciones</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Descubre las últimas canciones que sonaron en la radio de HabboSpeed y solicita que vuelvan a sonar en vivo.
        </p>
      </div>

      {/* Top 3 Songs of the Week */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold uppercase tracking-wide text-white mb-6 font-cabinet flex items-center gap-2">
          <i className="fa-solid fa-crown text-primary"></i> Las Más Sonadas
        </h2>
        
        {topSongs.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm border border-dashed border-border rounded-xl bg-card/20">
            Aún no hay suficientes datos para calcular el top de canciones.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topSongs.slice(0, 3).map((song, index) => {
              const bgTiers = [
                "border-primary/40 bg-gradient-to-br from-primary/10 to-card",
                "border-zinc-400/40 bg-gradient-to-br from-zinc-400/5 to-card",
                "border-amber-700/40 bg-gradient-to-br from-amber-700/5 to-card"
              ];
              const badgeColors = ["bg-primary text-black", "bg-zinc-400 text-black", "bg-amber-700 text-white"];
              
              return (
                <Card key={song.id || index} className={`relative overflow-hidden border ${bgTiers[index] || "border-border"}`}>
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                      <img 
                        src={song.coverUrl || "https://images.habbo.com/c_images/Official_Rooms/official_room_wide.png"} 
                        alt="album art" 
                        className="w-16 h-16 rounded-lg object-cover border border-border/60"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.habbo.com/c_images/Official_Rooms/official_room_wide.png";
                        }}
                      />
                      <span className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${badgeColors[index] || "bg-card text-white"}`}>
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate text-sm">{song.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full w-fit font-bold">
                        <i className="fa-solid fa-circle-play"></i> {song.playCount} reproducida(s)
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold uppercase tracking-wide text-white mb-6 font-cabinet flex items-center gap-2">
            <i className="fa-solid fa-compact-disc text-primary spin-slow"></i> Timeline de Emisión
          </h2>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-24 bg-card/40 rounded-xl border border-border animate-pulse" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-xl bg-card/20">
              <i className="fa-solid fa-circle-info text-2xl text-muted-foreground mb-3 block"></i>
              <p className="text-muted-foreground text-sm">No se ha registrado música recientemente.</p>
            </div>
          ) : (
            <div className="space-y-4 relative before:absolute before:left-8 before:top-4 before:bottom-4 before:w-0.5 before:bg-border/60">
              {history.map((song, index) => {
                const isLiveNow = index === 0;
                return (
                  <div key={song.id} className="relative pl-14 group">
                    {/* Time indicator point */}
                    <div className={`absolute left-6 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-full border-2 bg-background flex items-center justify-center transition-all duration-300 z-10 ${
                      isLiveNow ? "border-primary animate-pulse w-5 h-5 shadow-[0_0_10px_rgba(245,166,35,0.6)]" : "border-border group-hover:border-primary/60"
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${isLiveNow ? "bg-primary" : "bg-muted-foreground"}`} />
                    </div>

                    <Card className={`border transition-all duration-300 ${
                      isLiveNow ? "border-primary/50 bg-gradient-to-r from-primary/5 to-card" : "border-border hover:border-zinc-800"
                    }`}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <img 
                          src={song.coverUrl || "https://images.habbo.com/c_images/Official_Rooms/official_room_wide.png"} 
                          alt="Cover" 
                          className="w-12 h-12 rounded object-cover border border-border/80"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.habbo.com/c_images/Official_Rooms/official_room_wide.png";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="font-bold text-white truncate text-sm">{song.title}</h4>
                            {isLiveNow && (
                              <span className="text-[9px] bg-primary text-black font-extrabold px-1.5 py-0.5 rounded uppercase flex items-center gap-1 animate-pulse">
                                <span className="w-1 h-1 bg-black rounded-full" /> al aire
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <i className="fa-solid fa-clock"></i>
                              {formatDistanceToNow(new Date(song.playedAt), { addSuffix: true, locale: es })}
                            </span>
                            {song.durationSeconds && (
                              <span className="flex items-center gap-1">
                                <i className="fa-solid fa-hourglass"></i>
                                {formatDuration(song.durationSeconds)}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-primary/80">
                              <i className="fa-solid fa-headphones"></i>
                              DJ: {song.playedByDj || "AutoDJ"}
                            </span>
                          </div>
                        </div>

                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-shrink-0 text-xs border border-border hover:bg-primary hover:text-black gap-1.5"
                          disabled={!user || requestMutation.isPending}
                          onClick={() => requestMutation.mutate(`${song.artist} - ${song.title}`)}
                        >
                          <i className="fa-solid fa-paper-plane"></i>
                          <span className="hidden sm:inline">Pedir otra vez</span>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Info Card */}
        <div>
          <Card className="border border-border bg-card/60 backdrop-blur sticky top-24">
            <div className="p-6">
              <h3 className="text-lg font-bold uppercase tracking-wider text-white font-cabinet flex items-center gap-2 mb-4">
                <i className="fa-solid fa-circle-question text-primary"></i> ¿Cómo funciona?
              </h3>
              <div className="text-xs text-muted-foreground space-y-4 leading-relaxed">
                <p>
                  Cada vez que un DJ reproduce un tema en nuestra emisora, el historial se actualiza en tiempo real. 
                </p>
                <p>
                  Si tienes tu cuenta de HabboSpeed conectada, puedes hacer clic en <strong className="text-white">"Pedir otra vez"</strong> para enviar instantáneamente el nombre del tema al sistema de peticiones del DJ.
                </p>
                <p className="border-t border-border/60 pt-4">
                  El DJ en vivo podrá ver tu solicitud y programar la canción en los próximos minutos si encaja con su show actual. ¡Mantente atento a la radio!
                </p>
                {!user && (
                  <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg text-center mt-6">
                    <p className="text-primary font-bold mb-2">¡Inicia sesión!</p>
                    <p className="mb-3 text-[11px]">Necesitas ingresar para solicitar canciones directamente.</p>
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold bg-primary text-black border-none hover:bg-primary/90" onClick={() => window.location.hash = "/login"}>
                      Iniciar Sesión
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
