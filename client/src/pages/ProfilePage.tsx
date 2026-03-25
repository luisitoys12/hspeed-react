import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User, Zap, Calendar, Shield, Users, Home,
  Star, Edit3, Save, X, Wifi, WifiOff, Trophy,
  Coins, Crown, MessageCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ROLE_LABELS: Record<string, { label: string; color: string; icon?: any }> = {
  admin: { label: "Administrador", color: "bg-red-500/10 text-red-400 border-red-500/30", icon: Crown },
  dj: { label: "DJ", color: "bg-primary/10 text-primary border-primary/30", icon: Star },
  moderador: { label: "Moderador", color: "bg-orange-500/10 text-orange-400 border-orange-500/30", icon: Shield },
  colaborador: { label: "Colaborador", color: "bg-green-500/10 text-green-400 border-green-500/30" },
  user: { label: "Usuario", color: "bg-secondary text-muted-foreground border-border" },
  pending: { label: "Pendiente", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" },
};

function SpeedPointsBadge({ points }: { points: number }) {
  const level =
    points >= 10000 ? { name: "Leyenda", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" } :
    points >= 5000  ? { name: "Élite",   color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/30" } :
    points >= 2000  ? { name: "Pro",     color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/30" } :
    points >= 500   ? { name: "Activo",  color: "text-green-400",  bg: "bg-green-400/10 border-green-400/30" } :
                      { name: "Nuevo",   color: "text-muted-foreground", bg: "bg-secondary border-border" };
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold ${level.bg} ${level.color}`}>
      <Coins className="w-3.5 h-3.5" />
      <span>{points.toLocaleString()} SP</span>
      <span className="text-[10px] opacity-70">· {level.name}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: "", habboUsername: "" });
  const qc = useQueryClient();
  const { toast } = useToast();

  // Habbo API: perfil público
  const { data: habboUser, isLoading: loadingHabbo } = useQuery<any>({
    queryKey: ["/api/habbo/user", username],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/habbo/user/${username}`);
      if (!res.ok) return null;
      return res.json();
    },
    retry: false,
  });

  // Habbo API: salas públicas
  const { data: habboRooms } = useQuery<any[]>({
    queryKey: ["/api/habbo/rooms", username],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/habbo/rooms/${username}`);
      if (!res.ok) return [];
      return res.json();
    },
    retry: false,
    enabled: !!username,
  });

  // Habbo API: grupos
  const { data: habboGroups } = useQuery<any[]>({
    queryKey: ["/api/habbo/groups", username],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/habbo/groups/${username}`);
      if (!res.ok) return [];
      return res.json();
    },
    retry: false,
    enabled: !!username,
  });

  // Usuario local (Speed Points, role, etc.)
  const { data: localUser } = useQuery<any>({
    queryKey: ["/api/users/by-habbo", username],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/users/by-habbo/${username}`);
      if (!res.ok) return null;
      return res.json();
    },
    retry: false,
    enabled: !!username,
  });

  const isOwnProfile = currentUser?.habboUsername?.toLowerCase() === username?.toLowerCase()
    || currentUser?.displayName?.toLowerCase() === username?.toLowerCase();

  const updateMutation = useMutation({
    mutationFn: async (data: { displayName?: string; habboUsername?: string }) => {
      const res = await apiRequest("PATCH", `/api/users/${currentUser?.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "✅ Perfil actualizado" });
      qc.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setEditing(false);
    },
    onError: () => toast({ title: "Error al guardar", variant: "destructive" }),
  });

  const onlineStatus = habboUser?.online;
  const isOnline = onlineStatus === true;
  const hasHabboData = !!habboUser && !loadingHabbo;

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold">Perfil</h1>
        </div>
        {isOwnProfile && !editing && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => {
              setEditForm({
                displayName: currentUser?.displayName || "",
                habboUsername: currentUser?.habboUsername || username || "",
              });
              setEditing(true);
            }}
          >
            <Edit3 className="w-3.5 h-3.5" /> Editar perfil
          </Button>
        )}
      </div>

      {/* Edit form */}
      {editing && (
        <Card className="bg-card border-primary/30">
          <CardHeader className="pb-3">
            <p className="text-sm font-semibold">Editar perfil</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Nombre a mostrar</Label>
              <Input
                className="mt-1"
                value={editForm.displayName}
                onChange={(e) => setEditForm((p) => ({ ...p, displayName: e.target.value }))}
                placeholder="Tu nombre..."
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Usuario Habbo</Label>
              <Input
                className="mt-1"
                value={editForm.habboUsername}
                onChange={(e) => setEditForm((p) => ({ ...p, habboUsername: e.target.value }))}
                placeholder="Tu username en Habbo..."
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => updateMutation.mutate(editForm)}
                disabled={updateMutation.isPending}
              >
                <Save className="w-3.5 h-3.5" /> Guardar
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main profile card */}
      {loadingHabbo ? (
        <div className="flex gap-6">
          <Skeleton className="w-36 h-56 rounded-xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-8 w-36 rounded-xl" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-6">

          {/* Avatar column */}
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <div className="relative">
              <div className="bg-secondary/50 rounded-2xl border border-border overflow-hidden w-36 h-52 flex items-end justify-center">
                <img
                  src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${username}&size=b`}
                  alt={username}
                  className="h-full w-auto object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.2"; }}
                  data-testid="img-profile-avatar"
                />
              </div>
              {/* Online/Offline badge */}
              {hasHabboData && (
                <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold shadow ${
                  isOnline
                    ? "bg-green-500/20 text-green-400 border-green-500/40"
                    : "bg-muted text-muted-foreground border-border"
                }`}>
                  {isOnline
                    ? <><Wifi className="w-2.5 h-2.5" /> En línea</>
                    : <><WifiOff className="w-2.5 h-2.5" /> Desconectado</>}
                </div>
              )}
            </div>

            {/* Role badge */}
            {localUser?.role && ROLE_LABELS[localUser.role] && (
              <Badge variant="outline" className={`text-[10px] ${ROLE_LABELS[localUser.role].color}`}>
                {ROLE_LABELS[localUser.role].label}
              </Badge>
            )}
          </div>

          {/* Info column */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-black" data-testid="text-profile-username">@{username}</h2>
              {habboUser?.motto && (
                <p className="text-sm text-muted-foreground mt-1 italic">"{habboUser.motto}"</p>
              )}
            </div>

            {/* Speed Points gamification */}
            {localUser?.speedPoints !== undefined && (
              <SpeedPointsBadge points={localUser.speedPoints} />
            )}

            {/* Habbo stats */}
            {hasHabboData && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { icon: Star,    label: "Nivel",    value: habboUser.level ?? "—" },
                  { icon: Users,   label: "Likes",    value: (habboUser.totalLikes ?? 0).toLocaleString() },
                  { icon: Home,    label: "Salas",    value: habboUser.roomCount ?? 0 },
                  { icon: Trophy,  label: "Estrellas", value: habboUser.starGemCount ?? 0 },
                ].map((s) => (
                  <Card key={s.label} className="bg-card border-border">
                    <CardContent className="p-3 text-center">
                      <s.icon className="w-4 h-4 text-primary mx-auto mb-1" />
                      <p className="text-base font-bold text-primary">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Member since */}
            {habboUser?.memberSince && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <span>Miembro de Habbo desde {new Date(habboUser.memberSince).toLocaleDateString("es-ES", { year: "numeric", month: "long" })}</span>
              </div>
            )}

            {!hasHabboData && !loadingHabbo && (
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <WifiOff className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Usuario de Habbo no encontrado o perfil privado</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Rooms section */}
      {habboRooms && habboRooms.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold">Salas públicas ({habboRooms.length})</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {habboRooms.slice(0, 6).map((room: any, i: number) => (
              <Card key={i} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-3 flex items-center gap-3">
                  {room.thumbnailUrl && (
                    <img
                      src={room.thumbnailUrl}
                      alt={room.name}
                      className="w-14 h-10 rounded-lg object-cover bg-secondary flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{room.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {room.usersCount ?? 0} usuarios · {room.description?.slice(0, 40) || ""}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Groups section */}
      {habboGroups && habboGroups.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold">Grupos ({habboGroups.length})</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {habboGroups.slice(0, 12).map((g: any, i: number) => (
              <div key={i} className="flex items-center gap-1.5 bg-secondary/60 hover:bg-secondary rounded-xl px-3 py-1.5 text-xs transition-colors">
                {g.badgeUrl && (
                  <img
                    src={g.badgeUrl}
                    alt={g.name}
                    className="w-5 h-5 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                <span className="font-medium">{g.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Speed Points history / gamificación placeholder */}
      {localUser && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <p className="text-sm font-bold">Speed Points</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Puntos acumulados</span>
              <span className="text-sm font-black text-yellow-400">{(localUser.speedPoints ?? 0).toLocaleString()} SP</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-theme-gradient rounded-full transition-all"
                style={{ width: `${Math.min(100, ((localUser.speedPoints ?? 0) / 10000) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Gana SP participando en el chat, solicitando canciones y asistiendo a eventos.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
