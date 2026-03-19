import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Radio, Headphones, User, Clock, Trash2, Music, Award, MessageSquare, Send, ChevronRight } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function DJPanelPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Only DJ or admin can access
  const canAccess = user && (user.role === "admin" || user.role === "dj");

  // DJ Panel data
  const { data: djPanel, isLoading: djLoading } = useQuery<any>({
    queryKey: ["/api/dj-panel"],
    refetchInterval: 10000,
  });

  // Song requests
  const { data: requests, isLoading: reqLoading } = useQuery<any[]>({
    queryKey: ["/api/requests"],
    refetchInterval: 10000,
  });

  // Users list (for giving points)
  const { data: allUsers } = useQuery<any[]>({
    queryKey: ["/api/dj-panel/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/team-users");
      return res.json();
    },
    enabled: !!canAccess,
  });

  // State for forms
  const [currentDj, setCurrentDj] = useState("");
  const [nextDj, setNextDj] = useState("");
  const [djMessage, setDjMessage] = useState("");
  const [pointsUser, setPointsUser] = useState("");
  const [pointsAmount, setPointsAmount] = useState("10");
  const [initialized, setInitialized] = useState(false);

  // Initialize form from server data
  if (djPanel && !initialized) {
    setCurrentDj(djPanel.currentDj || "AutoDJ");
    setNextDj(djPanel.nextDj || "");
    setDjMessage(djPanel.djMessage || "");
    setInitialized(true);
  }

  // Update DJ Panel
  const updatePanelMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", "/api/dj-panel", data, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dj-panel"] });
      toast({ title: "Panel DJ actualizado" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  // Delete request
  const deleteRequestMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/requests/${id}`, undefined, token ? `Bearer ${token}` : undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      toast({ title: "Petición eliminada" });
    },
  });

  // Give points
  const givePointsMutation = useMutation({
    mutationFn: async ({ userId, points }: { userId: number; points: number }) => {
      const res = await apiRequest("PUT", `/api/users/${userId}/points`, { points }, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({ title: "Puntos otorgados", description: `${data.displayName} ahora tiene ${data.speedPoints} SpeedPoints` });
      setPointsUser("");
      setPointsAmount("10");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  // Not authorized
  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Debes iniciar sesión para acceder al Panel DJ.</p>
        <Link href="/login">
          <a className="text-primary text-sm mt-2 inline-block">← Iniciar Sesión</a>
        </Link>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Solo DJs y administradores pueden acceder a este panel.</p>
        <Link href="/">
          <a className="text-primary text-sm mt-2 inline-block">← Volver al Inicio</a>
        </Link>
      </div>
    );
  }

  const handleSavePanel = () => {
    updatePanelMutation.mutate({
      currentDj: currentDj.trim() || "AutoDJ",
      nextDj: nextDj.trim(),
      djMessage: djMessage.trim(),
    });
  };

  const handleGivePoints = () => {
    if (!pointsUser || !pointsAmount) return;
    const targetUser = (allUsers || []).find(
      (u: any) => u.displayName?.toLowerCase() === pointsUser.toLowerCase() ||
        u.habboUsername?.toLowerCase() === pointsUser.toLowerCase()
    );
    if (!targetUser) {
      toast({ title: "Error", description: "Usuario no encontrado. Escribe el nombre exacto.", variant: "destructive" });
      return;
    }
    givePointsMutation.mutate({ userId: targetUser.id, points: parseInt(pointsAmount) });
  };

  const requestTypeLabels: Record<string, string> = {
    saludo: "Saludo",
    grito: "Grito",
    concurso: "Concurso",
    cancion: "Canción",
    declaracion: "Declaración",
  };

  const requestTypeColors: Record<string, string> = {
    saludo: "bg-blue-500/20 text-blue-400",
    grito: "bg-red-500/20 text-red-400",
    concurso: "bg-yellow-500/20 text-yellow-400",
    cancion: "bg-green-500/20 text-green-400",
    declaracion: "bg-pink-500/20 text-pink-400",
  };

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Headphones className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold" data-testid="text-djpanel-title">Panel DJ</h1>
            <p className="text-xs text-muted-foreground">Gestiona tu turno, peticiones y SpeedPoints</p>
          </div>
        </div>
        {user.habboUsername && (
          <img
            src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${user.habboUsername}&size=b&headonly=1`}
            alt={user.displayName}
            className="w-12 h-12 rounded-lg bg-secondary"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: DJ Info */}
        <div className="space-y-4">
          {/* Current DJ Status */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                Estado del DJ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {djLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Headphones className="w-3 h-3" /> DJ Actual
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={currentDj}
                        onChange={(e) => setCurrentDj(e.target.value)}
                        placeholder="AutoDJ"
                        className="text-sm h-9"
                        data-testid="input-current-dj"
                      />
                      {currentDj && currentDj !== "AutoDJ" && (
                        <img
                          src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${currentDj}&size=s&headonly=1`}
                          alt={currentDj}
                          className="w-9 h-9 rounded bg-secondary flex-shrink-0"
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Siguiente DJ
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={nextDj}
                        onChange={(e) => setNextDj(e.target.value)}
                        placeholder="Nombre del siguiente DJ..."
                        className="text-sm h-9"
                        data-testid="input-next-dj"
                      />
                      {nextDj && (
                        <img
                          src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${nextDj}&size=s&headonly=1`}
                          alt={nextDj}
                          className="w-9 h-9 rounded bg-secondary flex-shrink-0"
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3" /> Mensaje / Nota
                    </label>
                    <Textarea
                      value={djMessage}
                      onChange={(e) => setDjMessage(e.target.value)}
                      placeholder="Escribe un mensaje o nota para el turno..."
                      className="text-sm resize-none"
                      rows={3}
                      data-testid="input-dj-message"
                    />
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary/80 text-white text-xs"
                    onClick={handleSavePanel}
                    disabled={updatePanelMutation.isPending}
                    data-testid="button-save-dj-panel"
                  >
                    {updatePanelMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Give SpeedPoints */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" />
                Dar SpeedPoints
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Usuario</label>
                <Input
                  value={pointsUser}
                  onChange={(e) => setPointsUser(e.target.value)}
                  placeholder="Nombre del usuario..."
                  className="text-sm h-9"
                  list="user-list"
                  data-testid="input-points-user"
                />
                <datalist id="user-list">
                  {(allUsers || []).map((u: any) => (
                    <option key={u.id} value={u.displayName}>
                      {u.habboUsername ? `(${u.habboUsername})` : ""}
                    </option>
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Cantidad</label>
                <div className="flex gap-2">
                  {[5, 10, 25, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      className={`px-3 py-1.5 rounded text-xs border transition-colors ${
                        pointsAmount === String(amt)
                          ? "border-primary bg-primary/20 text-primary"
                          : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/50"
                      }`}
                      onClick={() => setPointsAmount(String(amt))}
                      data-testid={`button-points-${amt}`}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
                <Input
                  type="number"
                  value={pointsAmount}
                  onChange={(e) => setPointsAmount(e.target.value)}
                  placeholder="O escribe cantidad..."
                  className="text-sm h-9"
                  min={1}
                  data-testid="input-points-amount"
                />
              </div>
              <Button
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-xs"
                onClick={handleGivePoints}
                disabled={givePointsMutation.isPending || !pointsUser || !pointsAmount}
                data-testid="button-give-points"
              >
                <Award className="w-3 h-3 mr-1.5" />
                {givePointsMutation.isPending ? "Otorgando..." : `Dar ${pointsAmount} SpeedPoints`}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Requests */}
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Music className="w-4 h-4 text-green-400" />
                Peticiones ({(requests || []).length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reqLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 rounded-lg" />
                  ))}
                </div>
              ) : (requests || []).length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">No hay peticiones pendientes</p>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {(requests || []).map((req: any) => (
                    <div
                      key={req.id}
                      className="bg-secondary/30 rounded-lg p-3 border border-border/50 flex items-start gap-3"
                      data-testid={`card-request-${req.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-[9px] px-1.5 py-0.5 ${requestTypeColors[req.type] || "bg-muted text-muted-foreground"}`}>
                            {requestTypeLabels[req.type] || req.type}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            de <span className="text-foreground font-medium">{req.userName}</span>
                          </span>
                        </div>
                        <p className="text-xs text-foreground/80 break-words">{req.details}</p>
                        {req.createdAt && (
                          <p className="text-[9px] text-muted-foreground mt-1">
                            {new Date(req.createdAt).toLocaleString("es-ES", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10 flex-shrink-0"
                        onClick={() => deleteRequestMutation.mutate(req.id)}
                        disabled={deleteRequestMutation.isPending}
                        data-testid={`button-delete-request-${req.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-lg font-bold text-primary">{djPanel?.currentDj || "AutoDJ"}</p>
                  <p className="text-[10px] text-muted-foreground">DJ Actual</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary/30 border border-border/50">
                  <p className="text-lg font-bold text-foreground">{djPanel?.nextDj || "—"}</p>
                  <p className="text-[10px] text-muted-foreground">Siguiente DJ</p>
                </div>
              </div>
              {djPanel?.djMessage && (
                <div className="mt-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-xs text-yellow-200/80 italic">"{djPanel.djMessage}"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
