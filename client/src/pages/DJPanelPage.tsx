import { useState, useEffect } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Radio, Headphones, Clock, Trash2, Music, Award, MessageSquare, Shield,
  Calendar, Plus, Send, Megaphone, BellRing, Ban, LayoutGrid
} from "lucide-react";
import { Link } from "wouter";

const DJ_SECTIONS = [
  { id: "timetable", label: "Timetable", icon: LayoutGrid },
  { id: "estado", label: "Estado DJ", icon: Radio },
  { id: "peticiones", label: "Peticiones", icon: Music },
  { id: "puntos", label: "SpeedPoints", icon: Award },
  { id: "horarios", label: "Horarios", icon: Clock },
  { id: "eventos", label: "Eventos", icon: Calendar },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "mensajes", label: "Mensajes", icon: Megaphone },
  { id: "banned", label: "Canciones Baneadas", icon: Ban },
];

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const DAY_COLORS: Record<string, string> = {
  Lunes:     "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Martes:    "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Miércoles: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  Jueves:    "bg-green-500/20 text-green-300 border-green-500/30",
  Viernes:   "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Sábado:    "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Domingo:   "bg-red-500/20 text-red-300 border-red-500/30",
};

// ============ DJ STATUS SECTION ============
function DjStatusSection() {
  const { token } = useAuth();
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
    setCurrentDj(djPanel.currentDj || "HabboSpeed");
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
      currentDj: currentDj.trim() || "HabboSpeed",
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
            {djPanel?.currentDj && djPanel.currentDj !== "HabboSpeed" && (
              <img
                src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${djPanel.currentDj}&size=s&headonly=1`}
                alt={djPanel.currentDj}
                className="w-8 h-8 rounded bg-secondary"
              />
            )}
            <p className="text-sm font-bold text-primary">{djPanel?.currentDj || "HabboSpeed"}</p>
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
              placeholder="HabboSpeed"
              value={currentDj}
              onChange={(e) => setCurrentDj(e.target.value)}
              data-testid="input-current-dj"
            />
            {currentDj && currentDj !== "HabboSpeed" && (
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

// ============ HORARIOS SECTION ============
function HorariosSection() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ day: "Lunes", startTime: "", endTime: "", showName: "", djName: "" });

  const { data: schedule, isLoading } = useQuery<any[]>({
    queryKey: ["/api/schedule"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/schedule", data, token ? `Bearer ${token}` : undefined);
      if (!res.ok) throw new Error("Error al crear el horario");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule"] });
      setOpen(false);
      setForm({ day: "Lunes", startTime: "", endTime: "", showName: "", djName: "" });
      toast({ title: "Horario creado correctamente" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/schedule/${id}`, undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule"] });
      toast({ title: "Horario eliminado" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // Group schedule entries by day
  const scheduleByDay = DAYS.reduce<Record<string, any[]>>((acc, day) => {
    acc[day] = (schedule || []).filter((s: any) => s.day === day).sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-semibold mb-1">Horarios Semanales</h2>
          <p className="text-xs text-muted-foreground">Visualiza y gestiona la programación de la radio por días.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/80 text-white text-xs" data-testid="button-new-schedule">
              <Plus className="w-3 h-3 mr-1" />Nuevo Horario
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle className="text-sm">Nuevo Horario</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Día de la semana</Label>
                <Select value={form.day} onValueChange={v => setForm(p => ({ ...p, day: v }))}>
                  <SelectTrigger className="mt-1 text-xs" data-testid="select-schedule-day">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Hora de inicio</Label>
                  <Input
                    className="mt-1"
                    type="time"
                    value={form.startTime}
                    onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))}
                    data-testid="input-schedule-start"
                  />
                </div>
                <div>
                  <Label className="text-xs">Hora de fin</Label>
                  <Input
                    className="mt-1"
                    type="time"
                    value={form.endTime}
                    onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))}
                    data-testid="input-schedule-end"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Nombre del programa</Label>
                <Input
                  className="mt-1"
                  placeholder="Ej: Speed Nights, Morning Mix..."
                  value={form.showName}
                  onChange={e => setForm(p => ({ ...p, showName: e.target.value }))}
                  data-testid="input-schedule-showname"
                />
              </div>
              <div>
                <Label className="text-xs">DJ</Label>
                <Input
                  className="mt-1"
                  placeholder="Nombre del DJ..."
                  value={form.djName}
                  onChange={e => setForm(p => ({ ...p, djName: e.target.value }))}
                  data-testid="input-schedule-djname"
                />
              </div>
              <Button
                className="w-full bg-primary hover:bg-primary/80 text-white text-xs"
                onClick={() => createMutation.mutate(form)}
                disabled={createMutation.isPending || !form.showName || !form.djName || !form.startTime || !form.endTime}
                data-testid="button-submit-schedule"
              >
                {createMutation.isPending ? "Creando..." : "Crear Horario"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {DAYS.map(day => {
            const entries = scheduleByDay[day];
            return (
              <div key={day} className={`rounded-xl border p-3 ${DAY_COLORS[day]}`} data-testid={`card-day-${day}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold">{day}</span>
                  <Badge className={`text-[9px] px-1.5 py-0 ${DAY_COLORS[day]}`}>
                    {entries.length} {entries.length === 1 ? "programa" : "programas"}
                  </Badge>
                </div>
                {entries.length === 0 ? (
                  <p className="text-[10px] opacity-50 italic">Sin programación</p>
                ) : (
                  <div className="space-y-1.5">
                    {entries.map((entry: any) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2"
                        data-testid={`card-schedule-${entry.id}`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 opacity-60 flex-shrink-0" />
                            <span className="text-[10px] font-mono opacity-80">{entry.startTime} – {entry.endTime}</span>
                          </div>
                          <p className="text-xs font-medium truncate">{entry.showName}</p>
                          <p className="text-[10px] opacity-60">DJ: {entry.djName}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-current opacity-50 hover:opacity-100 hover:bg-black/20 flex-shrink-0"
                          onClick={() => deleteMutation.mutate(entry.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-schedule-${entry.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============ EVENTOS SECTION ============
function EventosSection() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", server: "es", date: "", time: "", roomName: "", roomOwner: "", host: "", imageUrl: "" });

  const { data: events, isLoading } = useQuery<any[]>({
    queryKey: ["/api/events"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/events", data, token ? `Bearer ${token}` : undefined);
      if (!res.ok) throw new Error("Error al crear el evento");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setOpen(false);
      setForm({ title: "", server: "es", date: "", time: "", roomName: "", roomOwner: "", host: "", imageUrl: "" });
      toast({ title: "Evento creado" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/events/${id}`, undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Evento eliminado" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // Sort upcoming events first
  const sortedEvents = (events || []).slice().sort((a: any, b: any) => {
    const da = new Date(`${a.date}T${a.time || "00:00"}`);
    const db = new Date(`${b.date}T${b.time || "00:00"}`);
    return da.getTime() - db.getTime();
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-semibold mb-1">Eventos</h2>
          <p className="text-xs text-muted-foreground">Próximos eventos en Habbo Speed.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/80 text-white text-xs" data-testid="button-new-event">
              <Plus className="w-3 h-3 mr-1" />Nuevo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader><DialogTitle className="text-sm">Nuevo Evento</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Título del evento</Label>
                <Input className="mt-1" placeholder="Ej: Noche Speed..." value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} data-testid="input-event-title" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Fecha</Label>
                  <Input className="mt-1" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} data-testid="input-event-date" />
                </div>
                <div>
                  <Label className="text-xs">Hora</Label>
                  <Input className="mt-1" type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} data-testid="input-event-time" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Nombre de la sala</Label>
                  <Input className="mt-1" value={form.roomName} onChange={e => setForm(p => ({ ...p, roomName: e.target.value }))} data-testid="input-event-room" />
                </div>
                <div>
                  <Label className="text-xs">Dueño de la sala</Label>
                  <Input className="mt-1" value={form.roomOwner} onChange={e => setForm(p => ({ ...p, roomOwner: e.target.value }))} data-testid="input-event-owner" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Anfitrión</Label>
                  <Input className="mt-1" value={form.host} onChange={e => setForm(p => ({ ...p, host: e.target.value }))} data-testid="input-event-host" />
                </div>
                <div>
                  <Label className="text-xs">Servidor</Label>
                  <Select value={form.server} onValueChange={v => setForm(p => ({ ...p, server: v }))}>
                    <SelectTrigger className="mt-1 text-xs" data-testid="select-event-server"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["es", "com", "com.br", "de", "fr"].map(s => <SelectItem key={s} value={s}>.{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">URL de imagen (opcional)</Label>
                <Input className="mt-1" placeholder="https://..." value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} data-testid="input-event-image" />
              </div>
              <Button
                className="w-full bg-primary hover:bg-primary/80 text-white text-xs"
                onClick={() => createMutation.mutate(form)}
                disabled={createMutation.isPending || !form.title || !form.date}
                data-testid="button-submit-event"
              >
                {createMutation.isPending ? "Creando..." : "Crear Evento"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
      ) : sortedEvents.length === 0 ? (
        <div className="text-center py-10">
          <Calendar className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No hay eventos programados</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedEvents.map((item: any) => (
            <div
              key={item.id}
              className="flex items-start justify-between bg-secondary/30 rounded-lg px-3 py-3 border border-border"
              data-testid={`card-event-${item.id}`}
            >
              <div className="flex gap-3 min-w-0 flex-1">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-12 h-12 rounded object-cover flex-shrink-0 bg-secondary"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <Badge variant="outline" className="text-[9px] border-border">.{item.server}</Badge>
                    <span className="text-[10px] text-muted-foreground">{item.date} · {item.time}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Sala: <span className="text-foreground/70">{item.roomName}</span>
                    {item.host && <> · Anfitrión: <span className="text-foreground/70">{item.host}</span></>}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive/60 hover:text-destructive hover:bg-destructive/10 flex-shrink-0 ml-2"
                onClick={() => deleteMutation.mutate(item.id)}
                disabled={deleteMutation.isPending}
                data-testid={`button-delete-event-${item.id}`}
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

// ============ CHAT SECTION ============
function ChatSection() {
  const { token } = useAuth();
  const { toast } = useToast();

  const { data: chatMessages, isLoading } = useQuery<any[]>({
    queryKey: ["/api/chat"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/chat?limit=100", undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    refetchInterval: 15000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/chat/${id}`, undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat"] });
      toast({ title: "Mensaje eliminado" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-semibold mb-1">Moderación del Chat</h2>
          <p className="text-xs text-muted-foreground">Revisa y elimina mensajes inapropiados del chat.</p>
        </div>
        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
          {(chatMessages || []).length} mensajes
        </Badge>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
        </div>
      ) : (chatMessages || []).length === 0 ? (
        <div className="text-center py-10">
          <MessageSquare className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No hay mensajes en el chat</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
          {(chatMessages || []).map((msg: any) => (
            <div
              key={msg.id}
              className="flex items-start justify-between bg-secondary/30 rounded-lg px-3 py-2 border border-border group"
              data-testid={`card-chat-${msg.id}`}
            >
              <div className="flex items-start gap-2 min-w-0 flex-1">
                {msg.username && (
                  <img
                    src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${msg.username}&size=s&headonly=1`}
                    alt={msg.username}
                    className="w-7 h-7 rounded bg-secondary flex-shrink-0 mt-0.5"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    data-testid={`img-chat-avatar-${msg.id}`}
                  />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-primary">{msg.username || msg.displayName || "Anónimo"}</span>
                    {msg.createdAt && (
                      <span className="text-[9px] text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleString("es-ES", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-foreground/80 break-words">{msg.message || msg.content}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive/40 hover:text-destructive hover:bg-destructive/10 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => deleteMutation.mutate(msg.id)}
                disabled={deleteMutation.isPending}
                data-testid={`button-delete-chat-${msg.id}`}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ MENSAJES SECTION ============
function MensajesSection() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [announcement, setAnnouncement] = useState("");
  const [currentDj, setCurrentDj] = useState("");
  const [nextDj, setNextDj] = useState("");
  const [initialized, setInitialized] = useState(false);

  const { data: djPanel, isLoading } = useQuery<any>({
    queryKey: ["/api/dj-panel"],
  });

  if (djPanel && !initialized) {
    setCurrentDj(djPanel.currentDj || "HabboSpeed");
    setNextDj(djPanel.nextDj || "");
    setAnnouncement(djPanel.djMessage || "");
    setInitialized(true);
  }

  const sendMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        "PUT",
        "/api/dj-panel",
        { currentDj: currentDj || "HabboSpeed", nextDj, djMessage: announcement },
        token ? `Bearer ${token}` : undefined
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dj-panel"] });
      toast({ title: "Anuncio publicado", description: "El mensaje del DJ ha sido actualizado." });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold mb-1">Mensajes y Anuncios</h2>
        <p className="text-xs text-muted-foreground">Publica anuncios que aparecerán en el panel del DJ para todos los oyentes.</p>
      </div>

      {/* Current broadcast preview */}
      {djPanel?.djMessage && (
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-1.5">
            <BellRing className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Mensaje actual en emisión</span>
          </div>
          <p className="text-xs text-foreground/80 italic">"{djPanel.djMessage}"</p>
        </div>
      )}

      <div className="space-y-3 max-w-lg">
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">DJ en antena</Label>
          <Input
            placeholder="HabboSpeed"
            value={currentDj}
            onChange={e => setCurrentDj(e.target.value)}
            data-testid="input-msg-current-dj"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Próximo DJ</Label>
          <Input
            placeholder="Nombre del próximo DJ..."
            value={nextDj}
            onChange={e => setNextDj(e.target.value)}
            data-testid="input-msg-next-dj"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Texto del anuncio</Label>
          <Textarea
            placeholder="Escribe aquí el anuncio o mensaje para los oyentes..."
            rows={4}
            value={announcement}
            onChange={e => setAnnouncement(e.target.value)}
            className="resize-none"
            data-testid="input-announcement-text"
          />
          <p className="text-[10px] text-muted-foreground mt-1">{announcement.length} caracteres</p>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-primary hover:bg-primary/80 text-white text-xs flex-1"
            onClick={() => sendMutation.mutate()}
            disabled={sendMutation.isPending}
            data-testid="button-send-announcement"
          >
            <Send className="w-3 h-3 mr-1.5" />
            {sendMutation.isPending ? "Publicando..." : "Publicar Anuncio"}
          </Button>
          {announcement && (
            <Button
              variant="outline"
              className="text-xs"
              onClick={() => setAnnouncement("")}
              data-testid="button-clear-announcement"
            >
              Limpiar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ TIMETABLE SECTION ============
function TimetableSection() {
  const { token, user, isAdmin } = useAuth();
  const { toast } = useToast();

  // Live clock
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Booking state: which cell is "pending click" for booking
  const [pendingCell, setPendingCell] = useState<{ day: string; hour: string } | null>(null);
  const [bookingForm, setBookingForm] = useState({ showName: "", djName: "" });

  const { data: schedule, isLoading } = useQuery<any[]>({
    queryKey: ["/api/schedule"],
    refetchInterval: 30000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/schedule", data, token ? `Bearer ${token}` : undefined);
      if (!res.ok) throw new Error("Error al reservar el slot");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule"] });
      setPendingCell(null);
      setBookingForm({ showName: "", djName: "" });
      toast({ title: "Slot reservado correctamente" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/schedule/${id}`, undefined, token ? `Bearer ${token}` : undefined);
      if (!res.ok) throw new Error("Error al eliminar el slot");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule"] });
      toast({ title: "Slot eliminado" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // Generate hours 00:00..23:00
  const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

  // Current week dates (Mon=0 ... Sun=6)
  const getWeekDates = () => {
    const today = new Date(now);
    // JS getDay: 0=Sun,1=Mon..6=Sat; convert to Mon=0..Sun=6
    const dow = (today.getDay() + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - dow);
    return DAYS.map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };
  const weekDates = getWeekDates();

  // Current day name (CDMX time matches JS local since server/browser are aligned)
  const currentDayIdx = (now.getDay() + 6) % 7; // 0=Lunes..6=Domingo
  const currentHourStr = `${String(now.getHours()).padStart(2, "0")}:00`;

  // DJ color palette based on name hash
  const DJ_PALETTE = [
    "bg-cyan-500/30 text-cyan-200 border-cyan-500/40",
    "bg-purple-500/30 text-purple-200 border-purple-500/40",
    "bg-green-500/30 text-green-200 border-green-500/40",
    "bg-yellow-500/30 text-yellow-200 border-yellow-500/40",
    "bg-orange-500/30 text-orange-200 border-orange-500/40",
    "bg-pink-500/30 text-pink-200 border-pink-500/40",
  ];

  const djColorMap: Record<string, string> = {};
  const getDjColor = (djName: string) => {
    if (!djColorMap[djName]) {
      let hash = 0;
      for (let i = 0; i < djName.length; i++) hash = (hash * 31 + djName.charCodeAt(i)) >>> 0;
      djColorMap[djName] = DJ_PALETTE[hash % DJ_PALETTE.length];
    }
    return djColorMap[djName];
  };

  // Find schedule entry for a specific day+hour cell
  const getEntryForCell = (day: string, hour: string) => {
    if (!schedule) return null;
    return schedule.find((s: any) => {
      if (s.day !== day) return false;
      const start = s.startTime.slice(0, 5);
      const end = s.endTime.slice(0, 5);
      return hour >= start && hour < end;
    }) || null;
  };

  const handleCellClick = (day: string, hour: string) => {
    const entry = getEntryForCell(day, hour);
    if (entry) return; // occupied
    if (pendingCell?.day === day && pendingCell?.hour === hour) {
      setPendingCell(null);
    } else {
      setPendingCell({ day, hour });
      setBookingForm({ showName: "", djName: user?.displayName || "" });
    }
  };

  const canDelete = (entry: any) => {
    if (isAdmin) return true;
    return user?.displayName === entry.djName;
  };

  const clockStr = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold mb-0.5">📻 Horario de Radio (Hora CDMX)</h2>
          <p className="text-xs text-muted-foreground">Haz clic en una celda vacía para reservar tu slot.</p>
        </div>
        <div className="font-mono text-lg font-bold text-primary tabular-nums bg-primary/10 px-3 py-1 rounded-lg border border-primary/20" data-testid="text-live-clock">
          {clockStr}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
        </div>
      ) : (
        <div className="overflow-x-auto -mx-1">
          <div className="min-w-[700px] px-1">
            {/* Column headers */}
            <div className="grid gap-0.5 mb-1" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
              <div />
              {DAYS.map((day, idx) => (
                <div
                  key={day}
                  className={`text-center rounded py-1.5 text-[10px] font-semibold border ${
                    idx === currentDayIdx
                      ? "bg-primary/20 text-primary border-primary/40"
                      : "bg-secondary/30 text-muted-foreground border-border/40"
                  }`}
                  data-testid={`col-header-${day}`}
                >
                  <div>{day.slice(0, 3)}</div>
                  <div className="text-[9px] font-normal opacity-70">
                    {weekDates[idx].getDate()}/{weekDates[idx].getMonth() + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* Hour rows */}
            <div className="space-y-0.5">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className={`grid gap-0.5 ${
                    hour === currentHourStr ? "ring-1 ring-primary/60 rounded" : ""
                  }`}
                  style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}
                  data-testid={`row-hour-${hour}`}
                >
                  {/* Hour label */}
                  <div className={`text-[10px] font-mono flex items-center justify-end pr-2 ${
                    hour === currentHourStr ? "text-primary font-bold" : "text-muted-foreground"
                  }`}>
                    {hour}
                  </div>

                  {/* Day cells */}
                  {DAYS.map((day) => {
                    const entry = getEntryForCell(day, hour);
                    const isPending = pendingCell?.day === day && pendingCell?.hour === hour;

                    if (entry) {
                      const colorClass = getDjColor(entry.djName);
                      return (
                        <div
                          key={day}
                          className={`relative rounded px-1.5 py-1 border text-[9px] leading-tight min-h-[32px] flex flex-col justify-center ${colorClass}`}
                          data-testid={`cell-${day}-${hour}-occupied`}
                        >
                          <div className="font-semibold truncate">{entry.djName}</div>
                          {entry.showName && <div className="opacity-70 truncate">{entry.showName}</div>}
                          {canDelete(entry) && (
                            <button
                              className="absolute top-0.5 right-0.5 w-3.5 h-3.5 flex items-center justify-center rounded bg-black/30 hover:bg-red-500/60 text-white opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity"
                              onClick={() => deleteMutation.mutate(entry.id)}
                              disabled={deleteMutation.isPending}
                              data-testid={`button-delete-slot-${entry.id}`}
                              title="Cancelar slot"
                            >
                              <Trash2 className="w-2 h-2" />
                            </button>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={day}
                        className={`rounded min-h-[32px] border cursor-pointer transition-colors ${
                          isPending
                            ? "border-primary/60 bg-primary/10"
                            : "border-transparent bg-secondary/20 hover:bg-secondary/40"
                        }`}
                        onClick={() => handleCellClick(day, hour)}
                        data-testid={`cell-${day}-${hour}-empty`}
                      >
                        {isPending && (
                          <div className="p-1 flex items-center justify-center">
                            <span className="text-[9px] text-primary font-medium">+</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Booking inline form */}
      {pendingCell && (
        <div className="mt-3 p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3 max-w-sm" data-testid="booking-form">
          <p className="text-xs font-semibold text-primary">
            Reservar slot: {pendingCell.day} {pendingCell.hour}
          </p>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Tu nombre DJ</Label>
            <Input
              className="text-xs"
              placeholder="Nombre del DJ"
              value={bookingForm.djName}
              onChange={e => setBookingForm(p => ({ ...p, djName: e.target.value }))}
              data-testid="input-booking-djname"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Nombre del programa</Label>
            <Input
              className="text-xs"
              placeholder="Ej: Speed Nights..."
              value={bookingForm.showName}
              onChange={e => setBookingForm(p => ({ ...p, showName: e.target.value }))}
              data-testid="input-booking-showname"
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/80 text-white text-xs flex-1"
              disabled={createMutation.isPending || !bookingForm.djName}
              onClick={() => {
                const endHour = String((parseInt(pendingCell.hour.slice(0, 2)) + 1) % 24).padStart(2, "0") + ":00";
                createMutation.mutate({
                  day: pendingCell.day,
                  startTime: pendingCell.hour,
                  endTime: endHour,
                  showName: bookingForm.showName || bookingForm.djName,
                  djName: bookingForm.djName,
                });
              }}
              data-testid="button-confirm-booking"
            >
              {createMutation.isPending ? "Reservando..." : "Reservar"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => setPendingCell(null)}
              data-testid="button-cancel-booking"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ BANNED SONGS SECTION ============
function BannedSongsSection() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", artist: "", reason: "" });

  const { data: bannedSongs, isLoading } = useQuery<any[]>({
    queryKey: ["/api/banned-songs"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/banned-songs", undefined, token ? `Bearer ${token}` : undefined);
      if (!res.ok) throw new Error("Error al cargar canciones baneadas");
      return res.json();
    },
  });

  const banMutation = useMutation({
    mutationFn: async (data: { title: string; artist: string; reason: string }) => {
      const res = await apiRequest("POST", "/api/banned-songs", data, token ? `Bearer ${token}` : undefined);
      if (!res.ok) throw new Error("Error al banear la canción");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banned-songs"] });
      setShowForm(false);
      setForm({ title: "", artist: "", reason: "" });
      toast({ title: "Canción baneada correctamente" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const unbanMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/banned-songs/${id}`, undefined, token ? `Bearer ${token}` : undefined);
      if (!res.ok) throw new Error("Error al desbanear la canción");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banned-songs"] });
      toast({ title: "Canción desbaneada" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-semibold mb-1 flex items-center gap-2">
            <Ban className="w-4 h-4 text-red-400" />
            Canciones Baneadas
          </h2>
          <p className="text-xs text-muted-foreground">Gestiona las canciones prohibidas en la radio.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-[10px]">
            {(bannedSongs || []).length} baneadas
          </Badge>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white text-xs"
            onClick={() => setShowForm(p => !p)}
            data-testid="button-toggle-ban-form"
          >
            <Ban className="w-3 h-3 mr-1" />
            {showForm ? "Cancelar" : "Banear Canción"}
          </Button>
        </div>
      </div>

      {/* Inline ban form */}
      {showForm && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 space-y-3" data-testid="ban-song-form">
          <p className="text-xs font-semibold text-red-400">Nueva canción baneada</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Título</Label>
              <Input
                className="text-xs"
                placeholder="Nombre de la canción..."
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                data-testid="input-ban-title"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Artista</Label>
              <Input
                className="text-xs"
                placeholder="Nombre del artista..."
                value={form.artist}
                onChange={e => setForm(p => ({ ...p, artist: e.target.value }))}
                data-testid="input-ban-artist"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Motivo del baneo</Label>
            <Textarea
              className="text-xs resize-none"
              placeholder="Describe el motivo..."
              rows={3}
              value={form.reason}
              onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
              data-testid="input-ban-reason"
            />
          </div>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white text-xs"
            disabled={banMutation.isPending || !form.title || !form.artist}
            onClick={() => banMutation.mutate(form)}
            data-testid="button-submit-ban"
          >
            {banMutation.isPending ? "Baneando..." : "Confirmar Baneo"}
          </Button>
        </div>
      )}

      {/* Banned songs list */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      ) : (bannedSongs || []).length === 0 ? (
        <div className="text-center py-10">
          <Ban className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No hay canciones baneadas</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {(bannedSongs || []).map((song: any) => (
            <div
              key={song.id}
              className="flex items-start justify-between bg-red-500/5 rounded-lg px-3 py-2.5 border border-red-500/20"
              data-testid={`card-banned-song-${song.id}`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-foreground">{song.title}</span>
                  <span className="text-[10px] text-muted-foreground">—</span>
                  <span className="text-[10px] text-foreground/70">{song.artist}</span>
                </div>
                {song.reason && (
                  <p className="text-[10px] text-red-300/70 mt-0.5 italic">Motivo: {song.reason}</p>
                )}
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {song.bannedBy && (
                    <span className="text-[9px] text-muted-foreground">
                      Baneado por: <span className="text-foreground/60">{song.bannedBy}</span>
                    </span>
                  )}
                  {song.createdAt && (
                    <span className="text-[9px] text-muted-foreground">
                      {new Date(song.createdAt).toLocaleString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 flex-shrink-0 ml-2"
                onClick={() => unbanMutation.mutate(song.id)}
                disabled={unbanMutation.isPending}
                data-testid={`button-unban-song-${song.id}`}
                title="Desbanear"
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

// ============ MAIN DJ PANEL ============
export default function DJPanelPage() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState("home");

  const canAccess = user && (user.role === "admin" || user.role === "dj");

  const { data: requests = [] } = useQuery<any[]>({
    queryKey: ["/api/requests"],
    enabled: !!user && !!canAccess,
  });

  const { data: djPanel } = useQuery<any>({
    queryKey: ["/api/dj-panel"],
    enabled: !!user && !!canAccess,
  });

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

  const menuGroups = [
    {
      title: "General",
      items: [
        { id: "home", label: "Inicio DJ", icon: "fa-solid fa-house" },
        { id: "estado", label: "Estado Emisión", icon: "fa-solid fa-radio" },
        { id: "timetable", label: "Timetable Horario", icon: "fa-solid fa-calendar-week" },
      ]
    },
    {
      title: "Interacción",
      items: [
        { id: "peticiones", label: "Peticiones", icon: "fa-solid fa-music" },
        { id: "chat", label: "Chat de Muro", icon: "fa-solid fa-comments" },
        { id: "mensajes", label: "Mensajes DJ", icon: "fa-solid fa-bullhorn" },
      ]
    },
    {
      title: "Herramientas",
      items: [
        { id: "puntos", label: "SpeedPoints", icon: "fa-solid fa-coins" },
        { id: "horarios", label: "Horarios DJ", icon: "fa-solid fa-clock" },
        { id: "eventos", label: "Eventos", icon: "fa-solid fa-calendar-days" },
        { id: "banned", label: "Canciones", icon: "fa-solid fa-ban" },
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar Menu */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-card border border-border rounded-xl p-4 sticky top-24">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <i className="fa-solid fa-headphones"></i>
              </div>
              <div>
                <h2 className="font-bold text-white text-xs uppercase tracking-wider font-cabinet">Panel DJ</h2>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold text-primary">Locución</span>
              </div>
            </div>

            <nav className="space-y-6">
              {menuGroups.map((group, groupIdx) => (
                <div key={groupIdx} className="space-y-2">
                  <h3 className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground px-2">
                    {group.title}
                  </h3>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                            isActive
                              ? "bg-primary text-black"
                              : "text-muted-foreground hover:bg-zinc-800 hover:text-white"
                          }`}
                        >
                          <span className="w-4 text-center"><i className={item.icon}></i></span>
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === "home" ? (
            <div className="space-y-8">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-primary/10 via-card to-card border border-primary/20 rounded-xl p-6 relative overflow-hidden">
                <div className="relative z-10 max-w-md">
                  <h2 className="text-2xl font-black uppercase text-white font-cabinet mb-1">
                    ¡Al Aire, DJ {user.displayName}!
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Gestiona tu emisión en vivo, revisa las peticiones de canciones o saludos de los usuarios en tiempo real, y otorga SpeedPoints para premiar a tu audiencia.
                  </p>
                </div>
                {user.habboUsername && (
                  <img
                    src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${user.habboUsername}&size=l`}
                    alt={user.displayName}
                    className="absolute -right-4 -bottom-10 w-36 h-36 object-contain opacity-30 sm:opacity-100"
                  />
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Peticiones", value: requests.length || "0", icon: "fa-solid fa-music", color: "text-blue-400 bg-blue-500/5" },
                  { label: "DJ en Transmisión", value: djPanel?.currentDj || "AutoDJ", icon: "fa-solid fa-radio", color: "text-primary bg-primary/5" },
                  { label: "Rango", value: user.role.toUpperCase(), icon: "fa-solid fa-headphones", color: "text-red-400 bg-red-500/5" },
                  { label: "Mis SP", value: `${user.speedPoints} SP`, icon: "fa-solid fa-coins", color: "text-yellow-400 bg-yellow-500/5" },
                ].map((stat, i) => (
                  <Card key={i} className="border border-border bg-card/60">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">{stat.label}</span>
                        <p className="text-lg font-black text-white mt-1 truncate max-w-[120px]">{stat.value}</p>
                      </div>
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm ${stat.color}`}>
                        <i className={stat.icon}></i>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick Actions */}
              <Card className="border border-border bg-card">
                <CardContent className="p-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white font-cabinet mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-bolt text-primary"></i> Accesos Rápidos
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Estado Locución", action: () => setActiveTab("estado"), icon: "fa-solid fa-radio" },
                      { label: "Ver Peticiones", action: () => setActiveTab("peticiones"), icon: "fa-solid fa-music" },
                      { label: "Dar SpeedPoints", action: () => setActiveTab("puntos"), icon: "fa-solid fa-coins" },
                      { label: "Chat del Hotel", action: () => setActiveTab("chat"), icon: "fa-solid fa-comments" },
                    ].map((act, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center gap-2 border-border bg-zinc-950 text-xs font-bold text-muted-foreground hover:text-white hover:bg-zinc-900"
                        onClick={act.action}
                      >
                        <i className={`${act.icon} text-lg text-primary`}></i>
                        <span>{act.label}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                {activeTab === "timetable" && <TimetableSection />}
                {activeTab === "estado" && <DjStatusSection />}
                {activeTab === "peticiones" && <RequestsSection />}
                {activeTab === "puntos" && <SpeedPointsSection />}
                {activeTab === "horarios" && <HorariosSection />}
                {activeTab === "eventos" && <EventosSection />}
                {activeTab === "chat" && <ChatSection />}
                {activeTab === "mensajes" && <MensajesSection />}
                {activeTab === "banned" && <BannedSongsSection />}
              </CardContent>
            </Card>
          )}
        </main>

      </div>
    </div>
  );
}
