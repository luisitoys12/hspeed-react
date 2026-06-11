import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { proxyImage } from "@/lib/habboProxy";
import { Play, Pause, Square, Radio, Headphones, Volume2, VolumeX, MessageSquare, Gift, Clock, Megaphone, CalendarDays, MessagesSquare, Zap, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

interface NowPlayingData {
  now_playing?: { song?: { title?: string; artist?: string } };
  listeners?: { current?: number };
  live?: { is_live?: boolean; streamer_name?: string };
  station?: { listen_url?: string };
}

interface ChatMessage {
  id?: number;
  userName?: string;
  habboUsername?: string;
  message?: string;
  content?: string;
  createdAt?: string;
}

interface ScheduleItem {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
  showName: string;
  djName: string;
}

const DAYS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function getHabboAvatar(username: string, fullBody = false) {
  return proxyImage(
    fullBody
      ? `https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&action=wav&direction=2&head_direction=2&img_format=png&gesture=sml&size=b`
      : `https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&gesture=std&action=std&direction=2&head_direction=2&headonly=1&size=s`
  );
}

function AvatarImage({ username, alt, fullBody = false }: { username: string; alt: string; fullBody?: boolean }) {
  const [src, setSrc] = useState(getHabboAvatar(username, fullBody));
  return (
    <img
      src={src}
      alt={alt}
      className={fullBody ? "w-full h-full object-contain" : "object-cover"}
      onError={() => {
        if (src !== "/habbo-radio/frank_small_03.gif") {
          setSrc("/habbo-radio/frank_small_03.gif");
        }
      }}
    />
  );
}

function getProgramProgress(startTime: string, endTime: string) {
  const now = new Date();
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const totalMin = endMin > startMin ? endMin - startMin : 1440 - startMin + endMin;
  const elapsedMin = nowMin >= startMin ? nowMin - startMin : 1440 - startMin + nowMin;
  if (totalMin <= 0) return 50;
  return Math.max(0, Math.min(100, (elapsedMin / totalMin) * 100));
}

export default function HabboRadioHero() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [showPeticionesModal, setShowPeticionesModal] = useState(false);
  const [peticionForm, setPeticionForm] = useState({ songTitle: "", artist: "", details: "" });
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  
  const { user: currentUser, login, token } = useAuth();
  const qc = useQueryClient();
  const [chatInput, setChatInput] = useState("");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginPending, setLoginPending] = useState(false);

  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) return;
    setLoginPending(true);
    try {
      await login(loginForm.email, loginForm.password);
      toast({ title: "¡Sesión iniciada!", description: "Bienvenido de vuelta a HabboSpeed." });
    } catch (err: any) {
      toast({ title: "Error al iniciar sesión", description: err.message, variant: "destructive" });
    } finally {
      setLoginPending(false);
    }
  };

  const sendChatMutation = useMutation({
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
      setChatInput("");
      qc.invalidateQueries({ queryKey: ["/api/chat", 6] });
      qc.invalidateQueries({ queryKey: ["/api/chat"] });
    },
    onError: (err: any) => {
      toast({ title: "Error al enviar", description: err.message, variant: "destructive" });
    },
  });

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMutation.mutate(chatInput.trim());
  };

  const { data: nowPlaying } = useQuery<NowPlayingData>({
    queryKey: ["/api/nowplaying"],
    refetchInterval: 15000,
    retry: false,
  });

  const { data: config } = useQuery<any>({
    queryKey: ["/api/config"],
    retry: false,
  });

  const { data: djPanel } = useQuery<any>({
    queryKey: ["/api/dj-panel"],
    refetchInterval: 15000,
    retry: false,
  });

  const { data: scheduleData } = useQuery<ScheduleItem[]>({
    queryKey: ["/api/schedule"],
    retry: false,
    staleTime: 60000,
  });

  const { data: chatMessages } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat", 6],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/chat?limit=6");
      if (!response.ok) throw new Error("chat_error");
      return response.json();
    },
    refetchInterval: 5000,
    retry: false,
  });

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    const listenUrl = nowPlaying?.station?.listen_url || config?.listenUrl;
    if (!listenUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.src = "";
      setIsPlaying(false);
      return;
    }

    audioRef.current.src = listenUrl;
    audioRef.current.play().catch(() => {});
    setIsPlaying(true);
  };

  const handleSendPeticion = async () => {
    if (!peticionForm.songTitle.trim() || !peticionForm.artist.trim()) {
      toast({ title: "Error", description: "Por favor rellena canción y artista", variant: "destructive" });
      return;
    }
    try {
      const response = await apiRequest("POST", "/api/peticiones", {
        songTitle: peticionForm.songTitle.trim(),
        artist: peticionForm.artist.trim(),
        details: peticionForm.details.trim(),
      });
      if (response.ok) {
        toast({ title: "¡Petición enviada!", description: "Tu canción ha sido agregada a la cola" });
        setPeticionForm({ songTitle: "", artist: "", details: "" });
        setShowPeticionesModal(false);
      }
    } catch (err) {
      toast({ title: "Error", description: "No se pudo enviar la petición", variant: "destructive" });
    }
  };

  const rawDj = nowPlaying?.live?.streamer_name || djPanel?.currentDj || "HabboSpeed";
  const isAutoDj = !rawDj || ["autodj", "auto dj", "azuracast autodj", "habbospeed"].includes(rawDj.toLowerCase());
  const currentDj = isAutoDj ? "HabboSpeed" : rawDj;
  const nextDj = djPanel?.nextDj || "Dj_Invitado";
  const currentSong = nowPlaying?.now_playing?.song;
  const songTitle = currentSong?.artist && currentSong?.title ? `${currentSong.artist} - ${currentSong.title}` : "Wulf - All Things Under The Sun";
  const listeners = nowPlaying?.listeners?.current ?? 50;
  const isLive = nowPlaying?.live?.is_live ?? true;

  const today = DAYS_ES[new Date().getDay()];
  const currentSchedule = useMemo(
    () => (scheduleData || []).find((item) => item.day === today),
    [scheduleData, today]
  );
  const programStart = currentSchedule?.startTime || "01:00";
  const programEnd = currentSchedule?.endTime || "02:00";
  const programProgress = currentSchedule ? getProgramProgress(programStart, programEnd) : 12;

  const liveMessages = (chatMessages || []).slice(0, 6).map((message, index) => ({
    key: `live-${message.id ?? index}-${message.userName || "anon"}`,
    user: message.userName || "Anon",
    text: message.message || message.content || "",
    avatar: message.habboUsername || message.userName || "HabboSpeed",
    featured: index === 0,
  }));
  const wallColors = ["#B793F7", "#93F7C9", "#26d7ff", "#F7D96A", "#F79393", "#F6A7F0"];

  return (
    <section className="relative overflow-hidden rounded-[2.25rem] bg-[#1e0a72] text-white border border-white/10 shadow-[0_28px_80px_rgba(0,0,0,0.3)]">
      <audio ref={audioRef} preload="none" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 py-5 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:py-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="hidden sm:flex h-[104px] w-[170px] items-center justify-between overflow-visible rounded-2xl border border-white/15 bg-white/10 shadow-[0_0_0_12px_rgba(10,8,36,0.18)] relative px-3">
              <div className="h-[90px] w-[70px] overflow-hidden">
                <AvatarImage username={currentDj} alt={currentDj} fullBody />
              </div>
              <img
                src="https://static.habbo-happy.net/img/furni/big/594402946997433.gif"
                alt="Micrófono"
                className="h-[76px] w-[76px] object-contain -scale-x-100"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/70">DJ actual</p>
              <p className="text-[1.05rem] font-semibold leading-tight sm:text-[1.15rem]">{currentDj}</p>
              <p className="mt-1 text-sm text-white/72 truncate max-w-md">{songTitle}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[auto_1fr] lg:gap-4 lg:min-w-0">
            <div className="flex items-center justify-center gap-2 rounded-full bg-[#14073f] px-4 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.05)] shrink-0">
              <Headphones className="h-5 w-5" />
              <span className="text-2xl font-bold leading-none">{listeners}</span>
            </div>

            <div className="flex flex-col gap-3 rounded-[1.4rem] bg-[#14073f] px-4 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.05)] min-w-0">
              <div className="flex items-center gap-3 min-w-0">
                <button onClick={togglePlay} className="flex h-11 w-11 items-center justify-center rounded-full bg-fuchsia-500 text-white transition hover:bg-fuchsia-400 shrink-0" aria-label={isPlaying ? "Stop" : "Play"}>
                  {isPlaying ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/80">
                    <Radio className="h-3.5 w-3.5" />
                    Radio en vivo
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-sky-400" style={{ width: `${programProgress}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-white/60 shrink-0">
                  <button onClick={() => setIsMuted((value) => !value)} className="transition hover:text-white" aria-label="Mute">
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(event) => {
                      setVolume(Number(event.target.value));
                      setIsMuted(false);
                    }}
                    className="w-24 accent-sky-400"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => setShowPeticionesModal(true)} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold text-white/85 transition hover:bg-white/10">
                  <Megaphone className="h-3.5 w-3.5" />
                  Peticiones
                </button>
                <a href="/dj-panel#saludos" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold text-white/85 transition hover:bg-white/10">
                  <MessagesSquare className="h-3.5 w-3.5" />
                  Saludos ⚡
                </a>
                <a href="/schedule" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold text-white/85 transition hover:bg-white/10">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Horarios
                </a>
              </div>
            </div>

            <div className="hidden lg:flex flex-col items-end gap-1 rounded-2xl border-l border-white/10 pl-4 text-right min-w-[200px]">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/65">Horario del programa</p>
              <p className="text-sm text-white/75">{programStart} - {programEnd}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-white/60">
                <Clock className="h-3.5 w-3.5" />
                <span>{currentSchedule?.showName || "HabboRadio en vivo"}</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-end gap-3 text-right">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] ${isLive ? "border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-100" : "border-white/10 bg-white/5 text-white/60"}`}>
              <span className={`h-2 w-2 rounded-full ${isLive ? "bg-fuchsia-400" : "bg-white/30"}`} />
              {isLive ? "En vivo" : "AutoDJ"}
            </span>
            <div className="rounded-2xl border border-white/10 bg-[#14073f] px-4 py-3 min-w-[210px]">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/65">Next DJ</p>
              <p className="text-sm text-white/90 mt-1">{nextDj}</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-xs text-white/70">{programStart}</span>
                <div className="h-1.5 w-24 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-sky-400" style={{ width: `${programProgress}%` }} />
                </div>
                <span className="text-xs text-white/70">{programEnd}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-2 min-h-[340px] overflow-hidden rounded-t-[2rem] bg-[#2a0e83] shadow-[0_-20px_70px_rgba(0,0,0,0.25)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_8%,rgba(111,83,246,0.32),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_18%,transparent_72%,rgba(0,0,0,0.18))]" />
          <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_50%_0,rgba(255,255,255,0.08),transparent_55%)]" />

          <div className="relative grid min-h-[340px] gap-8 px-5 py-8 lg:grid-cols-[1.05fr_1fr] lg:px-10">
            <div className="flex flex-col justify-center max-w-xl w-full">
              {currentUser ? (
                /* VISTA LOGGED IN: Panel útil con info de usuario y quick-chat para el muro */
                <div className="space-y-4 w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/15 overflow-hidden flex-shrink-0">
                      <img
                        src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(currentUser.habboUsername || currentUser.displayName)}&size=s&headonly=1`}
                        alt={currentUser.displayName}
                        className="w-full h-full object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/habbo-radio/frank_small_03.gif"; }}
                      />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#26d7ff]">Conectado</p>
                      <h3 className="text-lg font-bold text-white leading-tight">{currentUser.displayName}</h3>
                      <p className="text-xs text-white/70 flex items-center gap-1.5 mt-0.5">
                        <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span>{currentUser.speedPoints} SpeedPoints</span>
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSendChatMessage} className="space-y-2.5">
                    <Label htmlFor="player-chat-msg" className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                      Enviar mensaje al chat en vivo
                    </Label>
                    <div className="flex gap-2">
                      <input
                        id="player-chat-msg"
                        type="text"
                        placeholder="Escribe un mensaje..."
                        className="flex-1 px-3 py-2 text-xs rounded-lg bg-[#14073f]/65 border border-white/15 focus:outline-none focus:border-cyan-400 text-white placeholder-white/40 font-sans"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        maxLength={200}
                      />
                      <Button
                        type="submit"
                        size="sm"
                        className="bg-[#26d7ff] hover:bg-[#61e4ff] text-[#1a1553] font-bold text-xs"
                        disabled={sendChatMutation.isPending || !chatInput.trim()}
                      >
                        Enviar
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                /* VISTA GUEST: Formulario de Login directo integrado en el Player */
                <div className="space-y-4 w-full">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#26d7ff]">Inicia sesión</p>
                    <h2 className="mt-1.5 text-2xl font-bold leading-tight text-white tracking-tight sm:text-3xl">Únete a HabboRadio</h2>
                    <p className="text-xs text-white/70 mt-1">Conéctate al instante para enviar saludos, pedir canciones y chatear.</p>
                  </div>

                  <form onSubmit={handleInlineLogin} className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <input
                          type="email"
                          placeholder="Tu correo"
                          required
                          className="w-full px-3 py-2 text-xs rounded-lg bg-[#14073f]/65 border border-white/15 focus:outline-none focus:border-cyan-400 text-white placeholder-white/40 font-sans"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <input
                          type="password"
                          placeholder="Tu contraseña"
                          required
                          className="w-full px-3 py-2 text-xs rounded-lg bg-[#14073f]/65 border border-white/15 focus:outline-none focus:border-cyan-400 text-white placeholder-white/40 font-sans"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        size="sm"
                        className="flex-1 bg-[#26d7ff] hover:bg-[#61e4ff] text-[#1a1553] font-bold text-xs"
                        disabled={loginPending}
                      >
                        {loginPending ? "Ingresando..." : "Iniciar Sesión"}
                      </Button>
                      <a
                        href="/register"
                        className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                      >
                        Crear cuenta
                      </a>
                    </div>
                  </form>
                </div>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-x-0 top-0 h-24 bg-[url('/habbo-radio/mountains-small.png')] bg-[length:auto_64px] bg-repeat-x opacity-95" />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-[url('/habbo-radio/grass.png')] bg-[length:auto_80px] bg-repeat-x" />
              <div className="absolute bottom-8 right-2 hidden h-28 w-28 rounded-xl bg-[url('/habbo-radio/room.png')] bg-contain bg-no-repeat bg-center lg:block" />

              <div className="relative ml-auto mt-14 flex max-w-[34rem] flex-col gap-2.5 lg:mt-16">
                <div className="mb-2 flex items-center gap-2 self-end rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/80">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Muro de mensajes
                </div>

                {liveMessages.length > 0 ? (
                  liveMessages.map((message, index) => (
                    <div
                      key={message.key}
                      className={`flex items-center gap-3 rounded-full px-3 py-2.5 shadow-lg backdrop-blur ${index === 2 ? "bg-cyan-400 text-[#1a1553]" : "bg-white text-slate-900"}`}
                      style={index !== 2 ? { backgroundColor: wallColors[index % wallColors.length] } : undefined}
                    >
                      <div className="h-8 w-8 rounded-full bg-[#140936] overflow-hidden flex-shrink-0 ring-2 ring-white/50">
                        <AvatarImage username={message.avatar} alt={message.user} />
                      </div>
                      <p className="text-xs leading-tight">
                        <strong>{message.user}</strong>: {message.text}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/15 bg-white/8 px-4 py-5 text-sm text-white/80 backdrop-blur">
                    <p className="font-semibold">Aún no hay mensajes en vivo.</p>
                    <p className="mt-1 text-xs text-white/70">En cuanto entren mensajes reales del chat, aparecerán aquí automáticamente.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-4 border-t border-white/10 bg-[#37149e]/85 px-5 py-4 text-white/85 lg:px-10">
            <div className="flex items-center gap-2">
              <div className="h-12 w-12 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                <AvatarImage username={currentDj} alt={currentDj} fullBody />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/60">Actual</p>
                <p className="text-sm font-semibold">{currentDj}</p>
              </div>
            </div>
            <div className="hidden h-10 w-px bg-white/10 sm:block" />
            <div className="hidden sm:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/60">Sonando ahora</p>
              <p className="text-sm font-medium">{songTitle}</p>
            </div>
            <div className="ml-auto flex items-center gap-3 text-xs text-white/70">
              <Gift className="h-4 w-4" />
              <span>HabboSpeed ⚡ - Peticiones, saludos y radio en vivo</span>
            </div>
          </div>
        </div>

        {/* Modal de Peticiones */}
        <Dialog open={showPeticionesModal} onOpenChange={setShowPeticionesModal}>
          <DialogContent className="bg-card border-border max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                Enviar Petición
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="song-title" className="text-xs text-muted-foreground mb-1.5 block">
                  Nombre de la canción
                </Label>
                <input
                  id="song-title"
                  type="text"
                  placeholder="Ej: Levitating"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-secondary/30 border border-border focus:outline-none focus:border-primary/50"
                  value={peticionForm.songTitle}
                  onChange={(e) => setPeticionForm({ ...peticionForm, songTitle: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="artist" className="text-xs text-muted-foreground mb-1.5 block">
                  Artista
                </Label>
                <input
                  id="artist"
                  type="text"
                  placeholder="Ej: Dua Lipa"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-secondary/30 border border-border focus:outline-none focus:border-primary/50"
                  value={peticionForm.artist}
                  onChange={(e) => setPeticionForm({ ...peticionForm, artist: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="details" className="text-xs text-muted-foreground mb-1.5 block">
                  Detalles (opcional)
                </Label>
                <Textarea
                  id="details"
                  placeholder="Agrega un comentario especial..."
                  rows={3}
                  className="text-xs resize-none"
                  value={peticionForm.details}
                  onChange={(e) => setPeticionForm({ ...peticionForm, details: e.target.value })}
                />
              </div>
              <Button
                onClick={handleSendPeticion}
                className="w-full bg-primary hover:bg-primary/80 text-white text-xs"
              >
                <Megaphone className="w-3 h-3 mr-1.5" />
                Enviar Petición
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}