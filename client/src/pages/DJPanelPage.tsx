import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Radio, Headphones, Clock, Trash2, Music, Award, MessageSquare, Shield } from "lucide-react";
import { Link } from "wouter";

const DJ_SECTIONS = [
  { id: "estado", label: "Estado DJ", icon: Radio },
  { id: "peticiones", label: "Peticiones", icon: Music },
  { id: "puntos", label: "SpeedPoints", icon: Award },
];

// ============ DJ STATUS SECTION ============
function DjStatusSection() {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [currentDj, setCurrentDj] = useState("");
  const [nextDj, setNextDj] = useState("");
  const [djMessage, setDjMessage] = useState("");
  const [initialized, setInitialized] = useState(false);

  const { data: djPanel, isLoading } = useQuery<any>({
    queryKey: ["/api/dj-panel"],
    refetchInterval: 10000,
  });

  if (djPanel && !initialized) {
    setCurrentDj(djPanel.currentDj || "AutoDJ");
    setNextDj(djPanel.nextDj || "");
    setDjMessage(djPanel.djMessage || "");
    setInitialized(true);
  }

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

  const handleSave = () => {
    updatePanelMutation.mutate({
      currentDj: currentDj.trim() || "AutoDJ",
      nextDj: nextDj.trim(),
      djMessage: djMessage.trim(),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold mb-1">Estado del DJ</h2>
        <p className="text-xs text-muted-foreground">Configura quién está en antena y el mensaje para los oyentes.</p>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="text-center p-3 rounded-xl bg-primary/10 border border-primary/20">
          <div className="flex items-center justify-center gap-2 mb-1">
            {djPanel?.currentDj && djPanel.currentDj !== "AutoDJ" && (
              <img
                src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${djPanel.currentDj}&size=s&headonly=1`}
                alt={djPanel.currentDj}
                className="w-8 h-8 rounded bg-secondary"
              />
            )}
            <p className="text-sm font-bold text-primary">{djPanel?.currentDj || "AutoDJ"}</p>
          </div>
          <p className="text-[10px] text-muted-foreground">DJ Actual</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-secondary/30 border border-border/50">
          <div className="flex items-center justify-center gap-2 mb-1">
            {djPanel?.nextDj && (
              <img
                src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${djPanel.nextDj}&size=s&headonly=1`}
                alt={djPanel.nextDj}
                className="w-8 h-8 rounded bg-secondary"
              />
            )}
            <p className="text-sm font-bold text-foreground">{djPanel?.nextDj || "—"}</p>
          </div>
          <p className="text-[10px] text-muted-foreground">Siguiente DJ</p>
        </div>
      </div>

      {djPanel?.djMessage && (
        <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <p className="text-xs text-yellow-200/80 italic">"{djPanel.djMessage}"</p>
        </div>
      )}

      {/* Edit Form */}
      <div className="space-y-3 max-w-lg">
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">DJ en antena ahora</Label>
          <div className="flex gap-2">
            <Input
              placeholder="AutoDJ"
              value={currentDj}
              onChange={(e) => setCurrentDj(e.target.value)}
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
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Próximo DJ</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Nombre del próximo DJ..."
              value={nextDj}
              onChange={(e) => setNextDj(e.target.value)}
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
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Mensaje del DJ</Label>
          <Textarea
            placeholder="Mensaje para los oyentes..."
            rows={3}
            value={djMessage}
            onChange={(e) => setDjMessage(e.target.value)}
            className="resize-none"
            data-testid="input-dj-message"
          />
        </div>
        <Button
          className="bg-primary hover:bg-primary/80 text-white text-xs"
          onClick={handleSave}
          disabled={updatePanelMutation.isPending}
          data-testid="button-save-dj-panel"
        >
          {updatePanelMutation.isPending ? "Guardando..." : "Guardar Panel DJ"}
        </Button>
      </div>
    </div>
  );
}

// ============ REQUESTS SECTION ============
function RequestsSection() {
  const { token } = useAuth();
  const { toast } = useToast();

  const { data: requests, isLoading } = useQuery<any[]>({
    queryKey: ["/api/requests"],
    refetchInterval: 10000,
  });

  const deleteRequestMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/requests/${id}`, undefined, token ? `Bearer ${token}` : undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      toast({ title: "Petición eliminada" });
    },
  });

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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-semibold mb-1">Peticiones de los oyentes</h2>
          <p className="text-xs text-muted-foreground">Gestiona las solicitudes de saludos, canciones y más.</p>
        </div>
        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
          {(requests || []).length} pendientes
        </Badge>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : (requests || []).length === 0 ? (
        <div className="text-center py-10">
          <Music className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No hay peticiones pendientes</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {(requests || []).map((req: any) => (
            <div
              key={req.id}
              className="flex items-start justify-between bg-secondary/30 rounded-lg px-3 py-2 border border-border"
              data-testid={`card-request-${req.id}`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge className={`text-[9px] px-1.5 py-0.5 ${requestTypeColors[req.type] || "bg-muted text-muted-foreground"}`}>
                    {requestTypeLabels[req.type] || req.type}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    de <span className="text-foreground font-medium">{req.userName}</span>
                  </span>
                </div>
                <p className="text-xs text-foreground/80 break-words mt-0.5">{req.details}</p>
                {req.createdAt && (
                  <p className="text-[9px] text-muted-foreground mt-1">
                    {new Date(req.createdAt).toLocaleString("es-ES", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive/60 hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
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
    </div>
  );
}

// ============ SPEED POINTS SECTION ============
function SpeedPointsSection() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [pointsAmount, setPointsAmount] = useState("");

  const { data: users } = useQuery<any[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/users", undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
  });

  const givePointsMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const res = await apiRequest("PUT", `/api/users/${id}/points`, { amount }, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setPointsAmount("");
      setSelectedUserId("");
      toast({ title: "SpeedPoints asignados" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold mb-1">Dar SpeedPoints</h2>
        <p className="text-xs text-muted-foreground">Recompensa a los oyentes con SpeedPoints durante tu turno.</p>
      </div>

      <div className="space-y-3 max-w-lg">
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Seleccionar usuario</Label>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="text-xs" data-testid="select-points-user">
              <SelectValue placeholder="Selecciona usuario..." />
            </SelectTrigger>
            <SelectContent>
              {(users || []).map((u: any) => (
                <SelectItem key={u.id} value={String(u.id)} className="text-xs">
                  {u.displayName} ({u.speedPoints || 0} pts)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Cantidad de puntos</Label>
          <div className="flex gap-2 mb-2">
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
            placeholder="O escribe cantidad..."
            className="text-xs"
            value={pointsAmount}
            onChange={(e) => setPointsAmount(e.target.value)}
            min={1}
            data-testid="input-points-amount"
          />
        </div>

        <Button
          className="bg-primary hover:bg-primary/80 text-white text-xs"
          onClick={() => {
            if (selectedUserId && pointsAmount) {
              givePointsMutation.mutate({ id: selectedUserId, amount: parseInt(pointsAmount) });
            }
          }}
          disabled={givePointsMutation.isPending || !selectedUserId || !pointsAmount}
          data-testid="button-give-points"
        >
          <Award className="w-3 h-3 mr-1.5" />
          {givePointsMutation.isPending ? "Otorgando..." : `Dar ${pointsAmount || "0"} SpeedPoints`}
        </Button>
      </div>
    </div>
  );
}

// ============ MAIN DJ PANEL ============
export default function DJPanelPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("estado");

  const canAccess = user && (user.role === "admin" || user.role === "dj");

  if (!user) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-64 gap-4 text-center">
        <Shield className="w-14 h-14 text-muted-foreground/30" />
        <h2 className="text-lg font-bold">Acceso restringido</h2>
        <p className="text-sm text-muted-foreground">Debes iniciar sesión para acceder al Panel DJ.</p>
        <Link href="/login">
          <a className="text-primary text-sm hover:underline">Iniciar sesión</a>
        </Link>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-64 gap-4 text-center">
        <Shield className="w-14 h-14 text-muted-foreground/30" />
        <h2 className="text-lg font-bold">Acceso restringido</h2>
        <p className="text-sm text-muted-foreground">Solo DJs y administradores pueden acceder a este panel.</p>
        <Link href="/">
          <a className="text-primary text-sm hover:underline">Volver al Inicio</a>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Headphones className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold" data-testid="text-djpanel-title">Panel DJ</h1>
        <Badge className="bg-primary/10 text-primary border-primary/30 text-[9px]">DJ</Badge>
        {user.habboUsername && (
          <img
            src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${user.habboUsername}&size=s&headonly=1`}
            alt={user.displayName}
            className="w-8 h-8 rounded bg-secondary ml-auto"
          />
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-secondary/50 border border-border h-auto flex-wrap gap-0.5">
          {DJ_SECTIONS.map(({ id, label, icon: Icon }) => (
            <TabsTrigger key={id} value={id} className="text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-white" data-testid={`tab-dj-${id}`}>
              <Icon className="w-3 h-3" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="estado">
          <Card className="bg-card border-border">
            <CardContent className="p-5"><DjStatusSection /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="peticiones">
          <Card className="bg-card border-border">
            <CardContent className="p-5"><RequestsSection /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="puntos">
          <Card className="bg-card border-border">
            <CardContent className="p-5"><SpeedPointsSection /></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
