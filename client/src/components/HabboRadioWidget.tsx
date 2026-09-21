import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { proxyImage } from "@/lib/habboProxy";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function HabboRadioWidget() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isDjOrAdmin = user && (user.role === "admin" || user.role === "dj");

  // Audio Stream State
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Modales y menús
  const [showDjMenu, setShowDjMenu] = useState(false);
  const [showPeticionModal, setShowPeticionModal] = useState(false);
  const [showEditShowModal, setShowEditShowModal] = useState(false);
  const [showRequestsListModal, setShowRequestsListModal] = useState(false);
  const [showLiveConnectModal, setShowLiveConnectModal] = useState(false);

  // Formularios
  const [peticionSong, setPeticionSong] = useState("");
  const [peticionArtist, setPeticionArtist] = useState("");
  const [newShowTitle, setNewShowTitle] = useState("");

  // Queries
  const { data: nowPlaying } = useQuery<any>({
    queryKey: ["/api/nowplaying"],
    refetchInterval: 12000,
    retry: false,
  });

  const { data: djPanel } = useQuery<any>({
    queryKey: ["/api/dj-panel"],
    refetchInterval: 12000,
    retry: false,
  });

  const { data: siteConfig } = useQuery<any>({
    queryKey: ["/api/config"],
    retry: false,
  });

  const { data: requestsList = [] } = useQuery<any[]>({
    queryKey: ["/api/requests"],
    refetchInterval: 15000,
    retry: false,
  });

  // Datos del DJ activo (habbospeed por defecto con avatar real)
  const djName =
    djPanel?.currentDj && djPanel.currentDj !== "AutoDJ"
      ? djPanel.currentDj
      : nowPlaying?.live?.streamer_name && nowPlaying.live.streamer_name !== "AutoDJ"
      ? nowPlaying.live.streamer_name
      : "habbospeed";
  const showName =
    djPanel?.currentShow && djPanel.currentShow !== "AutoDJ"
      ? djPanel.currentShow
      : "HabboSpeed Hits 2026";
  const listenersCount =
    typeof nowPlaying?.listeners === "object" && nowPlaying?.listeners !== null
      ? (nowPlaying.listeners.current ?? 0)
      : typeof nowPlaying?.listeners === "number"
      ? nowPlaying.listeners
      : 0;
  const currentSong =
    nowPlaying?.now_playing?.song?.artist
      ? `${nowPlaying.now_playing.song.artist} - ${nowPlaying.now_playing.song.title}`
      : nowPlaying?.now_playing?.song?.title || "Sintonizando HabboSpeed Radio...";

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const getStreamUrl = () => {
    const publicUrl =
      nowPlaying?.station?.listen_url ||
      siteConfig?.listenUrl;
    if (publicUrl && (publicUrl.startsWith("http://") || publicUrl.startsWith("https://"))) {
      return publicUrl;
    }
    return "/api/radio-stream";
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      audio.src = "";
      setIsPlaying(false);
    } else {
      const streamUrl = getStreamUrl();
      const finalUrl = streamUrl.includes("?")
        ? `${streamUrl}&_t=${Date.now()}`
        : `${streamUrl}?_t=${Date.now()}`;

      audio.src = finalUrl;
      audio.volume = isMuted ? 0 : volume / 100;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn("Primary stream playback notice:", err.message);
            // Fallback a proxy same-origin si la URL pública falla
            if (!finalUrl.includes("/api/radio-stream")) {
              audio.src = `/api/radio-stream?_t=${Date.now()}`;
              audio.play().then(() => setIsPlaying(true)).catch((e) => {
                console.error("Audio playback error:", e.message);
                setIsPlaying(false);
              });
            } else {
              setIsPlaying(false);
            }
          });
      }
      setIsPlaying(true);
    }
  };

  // Mutación para pedir canción
  const peticionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/requests", {
        type: "cancion",
        userName: user?.displayName || "Oyente",
        details: `${peticionArtist} - ${peticionSong}`,
      });
    },
    onSuccess: () => {
      toast({
        title: "¡Petición enviada!",
        description: "Tu tema ha sido añadido a la cola del DJ",
      });
      setPeticionSong("");
      setPeticionArtist("");
      setShowPeticionModal(false);
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo enviar la petición",
        variant: "destructive",
      });
    },
  });

  // Mutación para actualizar emisión DJ
  const updateShowMutation = useMutation({
    mutationFn: async (showTitle: string) => {
      return apiRequest("POST", "/api/dj-panel/update", {
        currentShow: showTitle,
        currentDj: user?.habboUsername || user?.displayName || "DinhuLOL",
      });
    },
    onSuccess: () => {
      toast({
        title: "¡Programa actualizado!",
        description: "El título de tu emisión ahora se muestra al aire",
      });
      setShowEditShowModal(false);
      queryClient.invalidateQueries({ queryKey: ["/api/dj-panel"] });
    },
  });

  // Tomar el turno
  const takeTurnMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/dj-panel/update", {
        currentDj: user?.habboUsername || user?.displayName || "DJ Conectado",
        currentShow: "En Vivo con " + (user?.displayName || "DJ"),
      });
    },
    onSuccess: () => {
      toast({
        title: "¡Turno tomado!",
        description: "Ahora estás transmitiendo como DJ oficial al aire",
      });
      setShowDjMenu(false);
      queryClient.invalidateQueries({ queryKey: ["/api/dj-panel"] });
    },
  });

  return (
    <div
      className="bg-[#0b1424] text-white rounded-2xl p-3.5 shadow-sm border border-slate-800 w-full font-sans select-none relative overflow-hidden"
      data-testid="habbo-radio-widget"
    >
      <audio
        ref={audioRef}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => {
          console.warn("Audio element error on primary stream, switching to fallback proxy");
          if (audioRef.current && !audioRef.current.src.includes("/api/radio-stream")) {
            audioRef.current.src = `/api/radio-stream?_t=${Date.now()}`;
            audioRef.current.play().catch(() => {});
          }
        }}
      />

      {/* 1. Header de Ventana con título y botón minimizar */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10 text-xs text-slate-300 font-bold">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-user-astronaut text-cyan-400 text-xs"></i>
          <span className="text-slate-200 font-black tracking-wide text-[11px]">
            Hello Radio HabboSpeed
          </span>
        </div>
        <button
          title="Minimizar"
          className="text-slate-400 hover:text-white transition-colors w-4 h-4 flex items-center justify-center cursor-pointer"
        >
          <span className="w-2.5 h-0.5 bg-slate-400 rounded-full block"></span>
        </button>
      </div>

      {/* 2. Tarjeta del DJ al Aire */}
      <div className="flex items-center justify-between gap-2.5 mb-3 bg-white/5 p-2.5 rounded-2xl border border-white/5 relative">
        {/* Bust Avatar en Cuadro Celeste */}
        <div className="w-14 h-14 rounded-2xl bg-cyan-400/90 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner border border-cyan-300/50">
          <img
            src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(
              djName,
            )}&direction=2&head_direction=2&gesture=sml&size=m`}
            alt={djName}
            className="w-12 h-14 object-contain translate-y-1 scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://www.habbo.es/habbo-imaging/avatarimage?user=habbospeed&size=m";
            }}
          />
        </div>

        {/* Textos del DJ */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="bg-rose-500/90 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shadow-sm">
              ON AIR DJ
            </span>
          </div>
          <h4 className="text-sm font-black text-white truncate leading-tight">
            {djName}
          </h4>
          <p className="text-[10px] text-slate-300 truncate font-semibold">
            {showName}
          </p>
          <p className="text-[9px] text-cyan-400 font-bold mt-0.5">
            35 mins al aire
          </p>
        </div>

        {/* Full Avatar de Pie en el lateral derecho con postura */}
        <div className="w-11 h-16 flex items-end justify-center flex-shrink-0 relative">
          <div className="absolute bottom-0 w-8 h-2 bg-black/40 rounded-full blur-[1px]"></div>
          <img
            src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(
              djName,
            )}&action=wav&direction=2&head_direction=3&gesture=sml&size=m`}
            alt={djName}
            className="h-full w-auto object-contain relative z-10 drop-shadow"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://www.habbo.es/habbo-imaging/avatarimage?user=habbospeed&size=m";
            }}
          />
        </div>
      </div>

      {/* 3. Título de Canción Actual (Marquee) */}
      <div className="text-center py-1 mb-3">
        <p className="text-xs font-bold text-slate-200 truncate tracking-wide">
          {currentSong}
        </p>
      </div>

      {/* 4. Barra de Reproducción y Volumen */}
      <div className="bg-[#111c30] p-2 rounded-2xl border border-white/5 flex items-center gap-3 mb-3">
        {/* Botón Circular Verde Play/Pause */}
        <button
          onClick={togglePlay}
          className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          data-testid="button-radio-play"
        >
          <i
            className={`fa-solid ${
              isPlaying ? "fa-pause" : "fa-play translate-x-0.5"
            } text-xs`}
          ></i>
        </button>

        {/* Barra de Volumen con Knob Circular Blanco */}
        <div className="flex-1 relative flex items-center">
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              setIsMuted(false);
            }}
            className="w-full h-1.5 bg-slate-700/80 rounded-full appearance-none cursor-pointer accent-white"
          />
        </div>

        {/* Icono de Mute/Unmute */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="text-slate-400 hover:text-white text-xs px-1 cursor-pointer transition-colors"
        >
          <i
            className={`fa-solid ${
              isMuted || volume === 0 ? "fa-volume-xmark" : "fa-volume-high"
            }`}
          ></i>
        </button>
      </div>

      {/* 5. Botones de Acción (Pedir Canción + Menú Panel DJ) */}
      <div className="grid grid-cols-12 gap-2 mb-3 relative">
        {/* Botón Grande Cyan/Azul: Pedir Canción */}
        <button
          onClick={() => setShowPeticionModal(true)}
          className="col-span-8 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-black py-2 px-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer group"
        >
          <i className="fa-solid fa-music text-xs group-hover:scale-110 transition-transform"></i>
          <span>Pedir Canción</span>
        </button>

        {/* Botón Secundario: Panel DJ Opciones con Chevron */}
        <div className="col-span-4 relative">
          <button
            onClick={() => setShowDjMenu(!showDjMenu)}
            className="w-full h-full bg-[#162238] hover:bg-[#1e2e4b] border border-white/10 text-slate-200 hover:text-white text-xs font-bold py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title="Opciones de Radio"
          >
            <i className="fa-solid fa-sliders text-xs text-cyan-400"></i>
            <i className="fa-solid fa-chevron-down text-[8px] opacity-70"></i>
          </button>

          {/* Menú Desplegable con OPCIONES PARA EL OYENTE */}
          {showDjMenu && (
            <div className="absolute right-0 bottom-full mb-2 w-56 bg-[#0e1726] border border-white/15 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in text-slate-200">
              <div className="text-[10px] font-black uppercase tracking-wider text-cyan-400 px-2.5 py-1 border-b border-white/10 mb-1 flex items-center justify-between">
                <span>Opciones de Radio</span>
                <i className="fa-solid fa-radio text-[10px]"></i>
              </div>

              {/* Opción 1 (Oyente): Pedir Canción o Saludo */}
              <button
                onClick={() => {
                  setShowDjMenu(false);
                  setShowPeticionModal(true);
                }}
                className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-slate-200"
              >
                <i className="fa-solid fa-music text-cyan-400 w-4 text-center"></i>
                <span>Pedir Canción / Saludo</span>
              </button>

              {/* Opción 2 (Oyente): Historial de Canciones Recientes */}
              <Link
                href="/song-history"
                onClick={() => setShowDjMenu(false)}
                className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-slate-200"
              >
                <i className="fa-solid fa-clock-rotate-left text-amber-400 w-4 text-center"></i>
                <span>Temas Anteriores</span>
              </Link>

              {/* Opción 3 (Oyente): Horarios de los DJs */}
              <Link
                href="/dj-horarios"
                onClick={() => setShowDjMenu(false)}
                className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-slate-200"
              >
                <i className="fa-solid fa-calendar-week text-emerald-400 w-4 text-center"></i>
                <span>Horarios de DJs</span>
              </Link>

              {/* Opción 4 (Oyente): Copiar Link para VLC / App Externa */}
              <button
                onClick={() => {
                  const url = nowPlaying?.station?.listen_url || "https://springer-shoulder-paintings-town.trycloudflare.com/listen/habboradio/radio.mp3";
                  navigator.clipboard.writeText(url);
                  toast({
                    title: "¡Enlace copiado!",
                    description: "Pégalo en VLC, Winamp o tu reproductor móvil.",
                  });
                  setShowDjMenu(false);
                }}
                className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-slate-200"
              >
                <i className="fa-solid fa-satellite-dish text-purple-400 w-4 text-center"></i>
                <span>Escuchar en App Externa</span>
              </button>

              {/* Separador y Opción para Prender Live / Datos DJ (CONFIDENCIAL: SOLO DJS Y ADMINS) */}
              {isDjOrAdmin && (
                <div className="border-t border-white/10 my-1 pt-1">
                  <button
                    onClick={() => {
                      setShowDjMenu(false);
                      setShowLiveConnectModal(true);
                    }}
                    className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 text-xs font-extrabold rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-tower-broadcast text-rose-400 w-4 text-center animate-pulse"></i>
                    <span>Emitir en Vivo (Datos DJ)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 6. Footer de Estadísticas y Oyentes */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <span className="truncate">hSpeed Radio 24/7</span>
        <div className="flex items-center gap-1.5 flex-shrink-0 font-bold text-slate-200">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          <span>{listenersCount} listeners</span>
        </div>
      </div>

      {/* ================= MODALES DE INTERACCIÓN ================= */}

      {/* Modal 1: Pedir Canción */}
      <Dialog open={showPeticionModal} onOpenChange={setShowPeticionModal}>
        <DialogContent className="bg-[#0b1424] text-white border border-white/15 rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-black flex items-center gap-2 text-cyan-400">
              <i className="fa-solid fa-music"></i>
              Pedir Canción al DJ
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-xs text-slate-300 font-bold">Título de la Canción</Label>
              <Input
                value={peticionSong}
                onChange={(e) => setPeticionSong(e.target.value)}
                placeholder="Ej. Houdini"
                className="mt-1 bg-white/5 border-white/10 text-white rounded-xl text-xs"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-300 font-bold">Artista o Banda</Label>
              <Input
                value={peticionArtist}
                onChange={(e) => setPeticionArtist(e.target.value)}
                placeholder="Ej. Dua Lipa"
                className="mt-1 bg-white/5 border-white/10 text-white rounded-xl text-xs"
              />
            </div>
            <Button
              onClick={() => peticionMutation.mutate()}
              disabled={peticionMutation.isPending || !peticionSong.trim()}
              className="w-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black rounded-xl text-xs mt-2"
            >
              {peticionMutation.isPending ? "Enviando..." : "Enviar Petición al Aire"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Editar Programa DJ */}
      <Dialog open={showEditShowModal} onOpenChange={setShowEditShowModal}>
        <DialogContent className="bg-[#0b1424] text-white border border-white/15 rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-black flex items-center gap-2 text-cyan-400">
              <i className="fa-solid fa-pen-to-square"></i>
              Editar Programa DJ al Aire
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-xs text-slate-300 font-bold">Nombre del Programa / Show</Label>
              <Input
                value={newShowTitle}
                onChange={(e) => setNewShowTitle(e.target.value)}
                placeholder="Ej. Las Más Pedidas con Dinhu"
                className="mt-1 bg-white/5 border-white/10 text-white rounded-xl text-xs"
              />
            </div>
            <Button
              onClick={() => updateShowMutation.mutate(newShowTitle)}
              disabled={updateShowMutation.isPending || !newShowTitle.trim()}
              className="w-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black rounded-xl text-xs mt-2"
            >
              {updateShowMutation.isPending ? "Guardando..." : "Actualizar Programa"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal 3: Cola de Peticiones y Saludos */}
      <Dialog open={showRequestsListModal} onOpenChange={setShowRequestsListModal}>
        <DialogContent className="bg-[#0b1424] text-white border border-white/15 rounded-3xl max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-black flex items-center gap-2 text-cyan-400">
              <i className="fa-solid fa-list-check"></i>
              Peticiones y Saludos Recientes
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            {requestsList.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No hay peticiones pendientes en este momento.
              </p>
            ) : (
              requestsList.slice(0, 10).map((r, i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 p-2.5 rounded-xl flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-slate-200 truncate">
                      {r.details || r.song || "Petición"}
                    </p>
                    <p className="text-[10px] text-cyan-400">
                      Por: {r.userName || "Oyente"}
                    </p>
                  </div>
                  <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-bold">
                    {r.type || "cancion"}
                  </span>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal 4: Datos para Prender Live Rápido y Fácil (CONFIDENCIAL: SOLO DJS Y ADMINS) */}
      {isDjOrAdmin && (
        <Dialog open={showLiveConnectModal} onOpenChange={setShowLiveConnectModal}>
          <DialogContent className="bg-[#0b1424] text-white border border-white/15 rounded-3xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-black flex items-center gap-2 text-cyan-400">
                <i className="fa-solid fa-tower-broadcast text-rose-500 animate-pulse"></i>
                Emitir en Vivo · Datos para Salir al Aire
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 pt-2 text-xs">
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Configura tu software de transmisión (BUTT, SAM Broadcaster, Mixxx o VirtualDJ) con estos parámetros para prender live de inmediato:
              </p>

              <div className="space-y-2 bg-white/5 border border-white/10 p-3 rounded-2xl">
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400 font-bold">Tipo de Servidor:</span>
                  <span className="font-mono font-black text-cyan-300">Icecast v2 / AzuraCast</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400 font-bold">Servidor / Host:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-white">127.0.0.1</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("127.0.0.1");
                        toast({ title: "¡Copiado!", description: "Host copiado al portapapeles" });
                      }}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 bg-white/10 px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400 font-bold">Puerto:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-white">8005</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("8005");
                        toast({ title: "¡Copiado!", description: "Puerto copiado al portapapeles" });
                      }}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 bg-white/10 px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400 font-bold">Punto de Montaje (Mount):</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-white">/listen/habboradio/radio.mp3</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("/listen/habboradio/radio.mp3");
                        toast({ title: "¡Copiado!", description: "Mount copiado al portapapeles" });
                      }}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 bg-white/10 px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 font-bold">Bitrate / Códec:</span>
                  <span className="font-mono font-black text-emerald-400">320 kbps MP3 (Stereo)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  onClick={() => {
                    takeTurnMutation.mutate();
                    setShowLiveConnectModal(false);
                  }}
                  className="bg-rose-500 hover:bg-rose-400 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <i className="fa-solid fa-microphone"></i>
                  <span>Tomar Turno al Aire</span>
                </Button>
                <Link
                  href="/djpanel"
                  onClick={() => setShowLiveConnectModal(false)}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 py-2 px-3 text-center transition-colors"
                >
                  <i className="fa-solid fa-headphones"></i>
                  <span>Panel DJ Completo</span>
                </Link>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
