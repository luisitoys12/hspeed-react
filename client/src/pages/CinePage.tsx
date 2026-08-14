import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Zap,
  Play,
  Pause,
  Users,
  Plus,
  Lock,
  Share2,
  ExternalLink,
  Volume2,
  VolumeX,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

interface CineSession {
  id: number;
  hostUserId: number;
  videoId: string;
  title: string;
  thumbnailUrl: string;
  status: "waiting" | "playing" | "paused" | "ended";
  currentTime: number;
  participants: { userId: number; joinedAt: string }[];
  isPublic: boolean;
  password: string | null;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
  host?: { displayName: string; habboUsername: string; avatarUrl: string };
}

export default function CinePage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newVideoId, setNewVideoId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState("");
  const [activeSession, setActiveSession] = useState<CineSession | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const { data: sessions, isLoading } = useQuery<CineSession[]>({
    queryKey: ["/api/cine-sessions"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      videoId: string;
      title: string;
      isPublic: boolean;
      password?: string;
    }) => {
      const res = await apiRequest(
        "POST",
        "/api/cine-sessions",
        data,
        token ? `Bearer ${token}` : undefined,
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cine-sessions"] });
      toast({
        title: "Sala creada",
        description: "Comparte el enlace con tus amigos",
      });
      setShowCreateDialog(false);
      setNewVideoId("");
      setNewTitle("");
    },
    onError: (err: any) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
  });

  const joinMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const res = await apiRequest(
        "POST",
        `/api/cine-sessions/${sessionId}/join`,
        {},
        token ? `Bearer ${token}` : undefined,
      );
      return res.json();
    },
    onSuccess: (session) => {
      setActiveSession(session);
      toast({
        title: "¡Unido a la sala!",
        description: "Disfruta del video con amigos",
      });
    },
    onError: (err: any) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
  });

  const leaveMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      await apiRequest(
        "POST",
        `/api/cine-sessions/${sessionId}/leave`,
        {},
        token ? `Bearer ${token}` : undefined,
      );
    },
    onSuccess: () => {
      setActiveSession(null);
      queryClient.invalidateQueries({ queryKey: ["/api/cine-sessions"] });
      toast({ title: "Has salido de la sala" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      sessionId,
      data,
    }: {
      sessionId: number;
      data: Partial<CineSession>;
    }) => {
      const res = await apiRequest(
        "PUT",
        `/api/cine-sessions/${sessionId}`,
        data,
        token ? `Bearer ${token}` : undefined,
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cine-sessions"] });
    },
  });

  const extractVideoId = (url: string): string => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : "";
  };

  const handleCreate = () => {
    const videoId = extractVideoId(newVideoId);
    if (!videoId) {
      toast({
        title: "URL inválida",
        description: "Introduce una URL de YouTube válida",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate({
      videoId,
      title: newTitle || "Cine HabboSpeed",
      isPublic,
      password: isPublic ? undefined : password,
    });
  };

  const handleJoin = (session: CineSession) => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Necesitas una cuenta para unirte",
        variant: "destructive",
      });
      return;
    }
    if (session.password && !session.isPublic) {
      const pass = prompt("Esta sala es privada. Introduce la contraseña:");
      if (pass !== session.password) {
        toast({ title: "Contraseña incorrecta", variant: "destructive" });
        return;
      }
    }
    joinMutation.mutate(session.id);
  };

  const handleLeave = () => {
    if (activeSession) leaveMutation.mutate(activeSession.id);
  };

  const handlePlayPause = () => {
    if (!activeSession) return;
    const newStatus = activeSession.status === "playing" ? "paused" : "playing";
    updateMutation.mutate({
      sessionId: activeSession.id,
      data: { status: newStatus },
    });
    setActiveSession({ ...activeSession, status: newStatus });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getThumbnail = (videoId: string) =>
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl">
          <Play className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Modo Cine</h1>
          <p className="text-xs text-muted-foreground">
            Ve videos de YouTube sincronizado con amigos
          </p>
        </div>
      </div>

      {/* Sala activa */}
      {activeSession && (
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={getThumbnail(activeSession.videoId)}
                  alt={activeSession.title}
                  className="w-16 h-9 rounded object-cover"
                />
                <div>
                  <h3 className="font-bold">{activeSession.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {activeSession.host?.displayName || "Host"} ·{" "}
                    {activeSession.participants.length} viendo
                  </p>
                </div>
              </div>
              <Button variant="destructive" size="sm" onClick={handleLeave}>
                Salir
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-black rounded-lg relative overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${activeSession.videoId}?enablejsapi=1&autoplay=${activeSession.status === "playing" ? 1 : 0}`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handlePlayPause}
                      className={
                        activeSession.status === "playing"
                          ? "text-green-400"
                          : ""
                      }
                    >
                      {activeSession.status === "playing" ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </Button>
                    <span className="text-white text-sm font-mono">
                      {formatTime(currentTime)} /{" "}
                      {formatTime(activeSession.currentTime || 0)}
                    </span>
                  </div>
                  <div className="flex-1" />
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="text-white text-sm">
                      {activeSession.participants.length}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        navigator.clipboard.writeText(window.location.href)
                      }
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Crear sala */}
      {!activeSession && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Crear nueva sala
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="URL de YouTube (ej: https://youtube.com/watch?v=...)"
              value={newVideoId}
              onChange={(e) => setNewVideoId(e.target.value)}
            />
            <Input
              placeholder="Título de la sala (opcional)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm">
                  Sala pública (cualquiera puede unirse)
                </span>
              </label>
              {!isPublic && (
                <Input
                  type="password"
                  placeholder="Contraseña (solo si es privada)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-48"
                />
              )}
            </div>
            <Button
              className="w-full"
              onClick={handleCreate}
              disabled={createMutation.isPending || !newVideoId}
            >
              <Plus className="w-4 h-4 mr-2" />{" "}
              {createMutation.isPending ? "Creando..." : "Crear sala de cine"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Salas disponibles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Play className="w-4 h-4" /> Salas disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="h-48">
                  <Skeleton className="h-full w-full" />
                </Card>
              ))}
            </div>
          ) : sessions?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Play className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p>No hay salas activas. ¡Crea la primera!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions
                .filter((s: CineSession) => s.status !== "ended")
                .map((session) => (
                  <Card
                    key={session.id}
                    className={`relative overflow-hidden transition-all hover:shadow-xl ${
                      session.status === "playing"
                        ? "border-green-500/30 bg-green-500/5"
                        : ""
                    }`}
                  >
                    <div className="aspect-video relative bg-black">
                      <img
                        src={getThumbnail(session.videoId)}
                        alt={session.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute top-2 left-2">
                        <Badge
                          variant="secondary"
                          className={`text-[8px] ${
                            session.status === "playing"
                              ? "bg-green-500/20 text-green-400"
                              : session.status === "paused"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-purple-500/20 text-purple-400"
                          }`}
                        >
                          {session.status === "playing"
                            ? "�� En vivo"
                            : session.status === "paused"
                              ? "��� Pausado"
                              : "��� Esperando"}
                        </Badge>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                        <h4 className="font-bold truncate">{session.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] mt-1">
                          <Users className="w-3 h-3" />
                          <span>{session.participants.length} viendo</span>
                          <span>·</span>
                          <span>
                            {session.isPublic ? (
                              "Público"
                            ) : (
                              <>
                                {" "}
                                <Lock className="w-3 h-3" /> Privado
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              session.host?.avatarUrl ||
                              `https://www.habbo.es/habbo-imaging/avatarimage?user=${session.host?.habboUsername}&size=s&headonly=1`
                            }
                            alt={session.host?.displayName}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm font-medium">
                            {session.host?.displayName}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleJoin(session)}
                          disabled={joinMutation.isPending}
                        >
                          {joinMutation.isPending ? (
                            <span className="animate-spin">���</span>
                          ) : (
                            "Unirse"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <CardContent className="p-4">
          <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4" /> ¿Cómo funciona?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <Play className="w-3 h-3" /> Sincronización perfecta
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" /> Chat de voz opcional
            </div>
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3" /> Salas privadas con contraseña
            </div>
            <div className="flex items-center gap-1">
              <Share2 className="w-3 h-3" /> Comparte el enlace
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> Control de playback
            </div>
            <div className="flex items-center gap-1">
              <Volume2 className="w-3 h-3" /> Control de volumen individual
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
