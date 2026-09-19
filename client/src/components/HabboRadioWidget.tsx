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

  // Datos del DJ activo
  const djName =
    djPanel?.currentDj ||
    nowPlaying?.live?.streamer_name ||
    "DinhuLOL";
  const showName =
    djPanel?.currentShow ||
    siteConfig?.currentShow ||
    "Electro Hits & Pop";
  const listenersCount =
    nowPlaying?.listeners?.current ?? 102;
  const currentSong =
    nowPlaying?.now_playing?.song?.title || "Dua Lipa - Houdini";

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    const streamUrl =
      nowPlaying?.station?.listen_url ||
      siteConfig?.listenUrl ||
      "https://streaming.habbospeed.com/radio.mp3";

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.src = "";
      setIsPlaying(false);
    } else {
      audioRef.current.src = streamUrl;
      audioRef.current.play().catch(() => {});
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
      <audio ref={audioRef} preload="none" />

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
            )}&headonly=1&size=m`}
            alt={djName}
            className="w-12 h-12 object-contain scale-110 translate-y-1"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/habbo-radio/frank_small_03.gif";
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
              (e.target as HTMLImageElement).src = "/habbo-radio/frank_small_03.gif";
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
            title="Opciones de Panel DJ"
          >
            <i className="fa-solid fa-sliders text-xs text-cyan-400"></i>
            <i className="fa-solid fa-chevron-down text-[8px] opacity-70"></i>
          </button>

          {/* Menú Desplegable con OPCIONES PANEL DJ */}
          {showDjMenu && (
            <div className="absolute right-0 bottom-full mb-2 w-56 bg-[#0e1726] border border-white/15 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in text-slate-200">
              <div className="text-[10px] font-black uppercase tracking-wider text-cyan-400 px-2.5 py-1 border-b border-white/10 mb-1 flex items-center justify-between">
                <span>Panel DJ HSpeed</span>
                <i className="fa-solid fa-headphones text-[10px]"></i>
              </div>

              {/* Opción 1: Tomar Turno / Iniciar Transmisión */}
              <button
                onClick={() => takeTurnMutation.mutate()}
                className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-tower-broadcast text-rose-400 w-4 text-center"></i>
                <span>Tomar Turno al Aire</span>
              </button>

              {/* Opción 2: Cambiar Título de Emisión */}
              <button
                onClick={() => {
                  setShowDjMenu(false);
                  setShowEditShowModal(true);
                }}
                className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-pen-to-square text-cyan-400 w-4 text-center"></i>
                <span>Editar Programa DJ</span>
              </button>

              {/* Opción 3: Ver Peticiones y Saludos */}
              <button
                onClick={() => {
                  setShowDjMenu(false);
                  setShowRequestsListModal(true);
                }}
                className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-list-check text-amber-400 w-4 text-center"></i>
                <span>Ver Peticiones ({requestsList.length})</span>
              </button>

              {/* Opción 4: Ir al Tablero de Horarios DJ Completo */}
              <Link
                href="/dj-horarios"
                onClick={() => setShowDjMenu(false)}
                className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-cyan-300"
              >
                <i className="fa-solid fa-calendar-week text-cyan-400 w-4 text-center"></i>
                <span>Tablero DJ Horarios</span>
              </Link>
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
    </div>
  );
}
