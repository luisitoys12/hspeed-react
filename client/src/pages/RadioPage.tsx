import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { proxyImage } from "@/lib/habboProxy";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Radio,
  Send,
  Headphones,
  Music,
  Clock,
  Sparkles,
  MessageSquare,
  Gift
} from "lucide-react";

interface NowPlayingData {
  now_playing?: { song?: { title?: string; artist?: string; album?: string; art?: string } };
  listeners?: { current?: number };
  live?: { is_live?: boolean; streamer_name?: string };
  station?: { listen_url?: string };
  song_history?: Array<{ song: { title?: string; artist?: string; art?: string } }>;
}

interface ChatMessage {
  id?: number;
  userName?: string;
  habboUsername?: string;
  message?: string;
  content?: string;
  createdAt?: string;
}

export default function RadioPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Forms state
  const [requestForm, setRequestForm] = useState({ songTitle: "", artist: "", details: "" });
  const [saludoForm, setSaludoForm] = useState({ details: "" });
  const [chatInput, setChatInput] = useState("");

  const { data: nowPlaying } = useQuery<NowPlayingData>({
    queryKey: ["/api/nowplaying"],
    refetchInterval: 10000,
  });

  const { data: config } = useQuery<any>({
    queryKey: ["/api/config"],
  });

  const { data: chatMessages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat?limit=20"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/chat?limit=20");
      if (!response.ok) throw new Error("Error fetching chat");
      return response.json();
    },
    refetchInterval: 4000,
  });

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    const listenUrl = nowPlaying?.station?.listen_url || config?.listenUrl;
    if (!listenUrl) {
      toast({
        title: "Error",
        description: "El stream de la radio no está disponible.",
        variant: "destructive"
      });
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.src = "";
      setIsPlaying(false);
    } else {
      audioRef.current.src = listenUrl;
      audioRef.current.play().catch((err) => {
        console.error("Audio playback error:", err);
      });
      setIsPlaying(true);
    }
  };

  // Chat message submit
  const sendChatMutation = useMutation({
    mutationFn: async (content: string) => {
      const authToken = token || localStorage.getItem("token");
      if (!authToken) throw new Error("Inicia sesión para enviar un mensaje");
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        throw new Error("No se pudo enviar el mensaje");
      }
      return res.json();
    },
    onSuccess: () => {
      setChatInput("");
      qc.invalidateQueries({ queryKey: ["/api/chat?limit=20"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMutation.mutate(chatInput.trim());
  };

  // Request submit
  const sendRequestMutation = useMutation({
    mutationFn: async (data: { type: string; details: string; userName: string }) => {
      const res = await apiRequest("POST", "/api/requests", data);
      if (!res.ok) throw new Error("Error al enviar petición");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Petición enviada", description: "Tu canción ha sido solicitada al DJ." });
      setRequestForm({ songTitle: "", artist: "", details: "" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleSendRequest = () => {
    if (!requestForm.songTitle.trim() || !requestForm.artist.trim()) return;
    const details = `${requestForm.artist.trim()} - ${requestForm.songTitle.trim()}${
      requestForm.details ? ` (${requestForm.details.trim()})` : ""
    }`;
    sendRequestMutation.mutate({
      type: "cancion",
      details,
      userName: user?.displayName || "Anónimo",
    });
  };

  // Saludo submit
  const sendSaludoMutation = useMutation({
    mutationFn: async (data: { type: string; details: string; userName: string }) => {
      const res = await apiRequest("POST", "/api/requests", data);
      if (!res.ok) throw new Error("Error al enviar saludo");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Saludo enviado", description: "Tu dedicatoria ha sido enviada al DJ." });
      setSaludoForm({ details: "" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleSendSaludo = () => {
    if (!saludoForm.details.trim()) return;
    sendSaludoMutation.mutate({
      type: "saludo",
      details: saludoForm.details.trim(),
      userName: user?.displayName || "Anónimo",
    });
  };

  const song = nowPlaying?.now_playing?.song;
  const songTitle = song?.artist && song?.title ? `${song.artist} — ${song.title}` : "Radio HSpeed AutoDJ";
  const coverArt = song?.art || "https://images.habbo.com/c_images/Official_Rooms/official_room_wide.png";
  const listenersCount = nowPlaying?.listeners?.current ?? 0;
  const streamerName = nowPlaying?.live?.streamer_name || "AutoDJ";

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6 font-sans">
      <audio ref={audioRef} crossOrigin="anonymous" />

      {/* Page Header banner */}
      <div className="site-panel-strong p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="site-kicker">Emisión en Vivo</p>
          <h1 className="site-title mt-2 flex items-center gap-3">
            <Radio className="w-5 h-5 text-primary animate-pulse" />
            Portal de Radio HSpeed
          </h1>
          <p className="text-xs text-muted-foreground mt-2 max-w-2xl">
            Sintoniza nuestra música 24/7, pide tus temas favoritos, chatea en tiempo real con la comunidad y envíale saludos al locutor de turno.
          </p>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-2 flex items-center gap-3">
          <Headphones className="w-5 h-5 text-primary animate-bounce" />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Oyentes</p>
            <p className="text-sm font-black text-white">{listenersCount} sintonizados</p>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Interactive Player (Col-span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card className="border border-border bg-card/60 backdrop-blur-md overflow-hidden relative shadow-lg flex-1 flex flex-col">
            <CardHeader className="py-3 px-4 border-b border-border bg-secondary/20 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Music className="w-3.5 h-3.5" />
                Reproductor HSpeed
              </CardTitle>
              {streamerName !== "AutoDJ" && (
                <span className="text-[9px] bg-red-500 text-white font-extrabold px-1.5 py-0.5 rounded uppercase animate-pulse">
                  EN VIVO
                </span>
              )}
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col items-center justify-center space-y-6">
              
              {/* Rotating Vinyl Disc Component */}
              <div className="relative group w-64 h-64 flex items-center justify-center">
                {/* Outer glowing ring */}
                <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                  isPlaying 
                    ? "bg-gradient-to-tr from-primary/30 to-purple-500/30 blur-xl scale-105" 
                    : "bg-transparent"
                }`} />

                {/* Vinyl Record */}
                <div 
                  className={`w-64 h-64 rounded-full bg-zinc-950 border-[6px] border-zinc-900 shadow-2xl relative flex items-center justify-center overflow-hidden ${
                    isPlaying ? "animate-spin" : ""
                  }`}
                  style={{ animationDuration: "6s" }}
                >
                  {/* Vinyl Grooves */}
                  <div className="absolute inset-2 rounded-full border border-zinc-800/40" />
                  <div className="absolute inset-6 rounded-full border border-zinc-800/25" />
                  <div className="absolute inset-12 rounded-full border border-zinc-850" />
                  <div className="absolute inset-16 rounded-full border border-zinc-800/10" />

                  {/* Album Cover Art */}
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-zinc-950 z-10 relative flex items-center justify-center bg-zinc-800">
                    <img 
                      src={proxyImage(coverArt)} 
                      alt="Album art"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.habbo.com/c_images/Official_Rooms/official_room_wide.png";
                      }}
                    />
                    {/* Center spindle hole */}
                    <div className="absolute w-3 h-3 bg-zinc-950 rounded-full border border-zinc-800 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* Dynamic Sound Equalizer Visualizer */}
              <div className="flex items-end justify-center gap-[3px] h-8 w-48">
                {Array.from({ length: 24 }).map((_, i) => {
                  const animDuration = 0.5 + Math.random() * 0.8;
                  const delay = Math.random() * 0.5;
                  return (
                    <div
                      key={i}
                      className="w-[5px] bg-gradient-to-t from-purple-500 via-primary to-cyan-400 rounded-full transition-all duration-300"
                      style={{
                        height: isPlaying ? "100%" : "3px",
                        animation: isPlaying ? `bounceEqualizer ${animDuration}s ease-in-out infinite alternate` : "none",
                        animationDelay: isPlaying ? `${delay}s` : "0s",
                      }}
                    />
                  );
                })}
              </div>

              {/* Song details */}
              <div className="text-center space-y-1 max-w-sm">
                <h3 className="text-sm font-black text-white truncate px-2" title={songTitle}>
                  {song?.title || "Sintonía de HSpeed"}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {song?.artist || "AutoDJ"}
                </p>
                <div className="inline-flex items-center gap-1.5 bg-secondary/30 text-[9px] text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <Headphones className="w-2.5 h-2.5" /> Locutor: {streamerName}
                </div>
              </div>

              {/* Player Controls */}
              <div className="w-full space-y-4 pt-4 border-t border-border/40">
                <div className="flex items-center justify-center gap-4">
                  {/* Play/Pause Button */}
                  <Button
                    onClick={togglePlay}
                    size="icon"
                    className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 text-black shadow-lg hover:scale-105 transition-all"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </Button>

                  {/* Mute Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-9 h-9 rounded-full border border-border/40 hover:bg-zinc-800 text-slate-300"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>

                {/* Volume Slider */}
                <div className="flex items-center gap-3 max-w-xs mx-auto px-4">
                  <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => {
                      setVolume(Number(e.target.value));
                      setIsMuted(false);
                    }}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Side: Shoutbox Chat & Peticiones Form (Col-span 7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 items-stretch">
            
            {/* Box 1: Chat Integrado (Shoutbox) */}
            <Card className="border border-border bg-card/60 backdrop-blur-md flex flex-col overflow-hidden h-[480px] md:h-auto">
              <CardHeader className="py-3 px-4 border-b border-border bg-secondary/20 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Chat de la Radio
                </CardTitle>
                <span className="text-[9px] text-muted-foreground uppercase font-black">Shoutbox</span>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
                {/* Chat Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin max-h-[380px]">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center p-4">
                      <p className="text-xs text-muted-foreground">No hay mensajes en el chat de la radio. ¡Sé el primero!</p>
                    </div>
                  ) : (
                    chatMessages.slice().reverse().map((msg, i) => (
                      <div key={msg.id || i} className="text-xs bg-zinc-950/45 p-2.5 rounded-lg border border-border/30 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-primary">{msg.userName || "Anónimo"}</span>
                          {msg.createdAt && (
                            <span className="text-[9px] text-slate-500 font-mono">
                              {new Date(msg.createdAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300 break-words leading-relaxed">{msg.content || msg.message}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Message input */}
                <form onSubmit={handleSendChat} className="p-3 border-t border-border bg-black/15 flex gap-2">
                  {user ? (
                    <>
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Escribe un mensaje en la sala..."
                        className="h-8 text-xs bg-zinc-950 border-border"
                        disabled={sendChatMutation.isPending}
                      />
                      <Button
                        type="submit"
                        size="icon"
                        disabled={sendChatMutation.isPending || !chatInput.trim()}
                        className="w-8 h-8 rounded bg-primary text-black hover:bg-primary/90 shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  ) : (
                    <div className="w-full text-center py-1 text-[10px] text-muted-foreground uppercase font-black">
                      Inicia sesión para enviar mensajes
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Box 2: Peticiones / Saludos Forms */}
            <Card className="border border-border bg-card/60 backdrop-blur-md flex flex-col shadow-lg overflow-hidden">
              <Tabs defaultValue="pedir" className="w-full flex-1 flex flex-col">
                <CardHeader className="py-2 px-3 border-b border-border bg-secondary/15">
                  <TabsList className="grid grid-cols-2 h-8 bg-zinc-950/60 p-0.5 border border-border/40">
                    <TabsTrigger value="pedir" className="text-[10px] uppercase font-bold py-1 flex items-center justify-center gap-1.5">
                      <Music className="w-3 h-3" /> Pedir Tema
                    </TabsTrigger>
                    <TabsTrigger value="saludo" className="text-[10px] uppercase font-bold py-1 flex items-center justify-center gap-1.5">
                      <Gift className="w-3 h-3" /> Enviar Saludo
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="p-4 flex-1 flex flex-col justify-between">
                  
                  <TabsContent value="pedir" className="mt-0 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-[9.5px] uppercase font-black tracking-wider text-slate-400">Título de Canción</Label>
                        <Input
                          value={requestForm.songTitle}
                          onChange={(e) => setRequestForm({ ...requestForm, songTitle: e.target.value })}
                          placeholder="Ej: La Bachata"
                          className="h-8 text-xs bg-zinc-950 border-border mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-[9.5px] uppercase font-black tracking-wider text-slate-400">Artista / Grupo</Label>
                        <Input
                          value={requestForm.artist}
                          onChange={(e) => setRequestForm({ ...requestForm, artist: e.target.value })}
                          placeholder="Ej: Manuel Turizo"
                          className="h-8 text-xs bg-zinc-950 border-border mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-[9.5px] uppercase font-black tracking-wider text-slate-400">Dedicatoria (Opcional)</Label>
                        <Textarea
                          value={requestForm.details}
                          onChange={(e) => setRequestForm({ ...requestForm, details: e.target.value })}
                          placeholder="Un saludo para todos..."
                          className="text-xs bg-zinc-950 border-border mt-1 h-20 resize-none"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleSendRequest}
                      disabled={sendRequestMutation.isPending || !requestForm.songTitle.trim() || !requestForm.artist.trim()}
                      className="w-full h-8 text-xs bg-primary text-black font-black hover:bg-primary/95 mt-4"
                    >
                      Enviar Petición
                    </Button>
                  </TabsContent>

                  <TabsContent value="saludo" className="mt-0 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-[9.5px] uppercase font-black tracking-wider text-slate-400">Mensaje / Dedicatoria</Label>
                        <Textarea
                          value={saludoForm.details}
                          onChange={(e) => setSaludoForm({ details: e.target.value })}
                          placeholder="Hola DJ, envíame un saludo a mí y a mis amigos de la sala..."
                          className="text-xs bg-zinc-950 border-border mt-1 h-36 resize-none"
                        />
                      </div>
                      <div className="bg-zinc-900 border border-border/40 rounded-xl p-3 text-[10px] text-muted-foreground leading-relaxed">
                        <p className="font-bold text-white mb-0.5 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-primary" /> Consejos del Locutor
                        </p>
                        Los locutores leen los saludos al aire durante las transmisiones en vivo. Escribe claro y con respeto.
                      </div>
                    </div>
                    <Button
                      onClick={handleSendSaludo}
                      disabled={sendSaludoMutation.isPending || !saludoForm.details.trim()}
                      className="w-full h-8 text-xs bg-primary text-black font-black hover:bg-primary/95 mt-4"
                    >
                      Enviar Saludo
                    </Button>
                  </TabsContent>

                </CardContent>
              </Tabs>
            </Card>

          </div>

          {/* Timeline of recent tracks (Bottom of right column) */}
          <Card className="border border-border bg-card/60 backdrop-blur-md overflow-hidden">
            <CardHeader className="py-2.5 px-4 border-b border-border bg-secondary/20 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Timeline de Emisión (Recientes)
              </CardTitle>
              <button
                onClick={() => window.location.hash = "/song-history"}
                className="text-[9px] text-primary hover:underline font-black uppercase tracking-wider"
              >
                Ver historial completo
              </button>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {nowPlaying?.song_history?.slice(0, 4).map((h, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-zinc-950/40 border border-border/40 p-2 rounded-lg">
                    <img
                      src={proxyImage(h.song?.art || "https://images.habbo.com/c_images/Official_Rooms/official_room_wide.png")}
                      alt="Art"
                      className="w-9 h-9 rounded object-cover border border-border/40 flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.habbo.com/c_images/Official_Rooms/official_room_wide.png";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{h.song?.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{h.song?.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Embedded visual styles for animation */}
      <style>{`
        @keyframes bounceEqualizer {
          0% { height: 4px; }
          100% { height: 100%; }
        }
      `}</style>
    </div>
  );
}
