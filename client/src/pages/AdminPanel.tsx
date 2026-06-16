import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Newspaper, Calendar, Clock, Users, Shield, Plus, Trash2, Edit, Palette, Check, Radio, Headphones, UsersRound, Download, Ban, Mail, Flag, ScrollText, ShoppingCart, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import type { Theme } from "@shared/schema";
import NewsAdmin from "@/components/admin/NewsAdmin";

const SECTIONS = [
  { id: "themes", label: "Temáticas", icon: Palette },
  { id: "news", label: "Noticias", icon: Newspaper },
  { id: "events", label: "Eventos", icon: Calendar },
  { id: "schedule", label: "Horarios", icon: Clock },
  { id: "users", label: "Usuarios", icon: Users },
  { id: "team", label: "Equipo", icon: UsersRound },
  { id: "downloads", label: "Descargas", icon: Download },
  { id: "shop", label: "Tienda", icon: ShoppingCart },
  { id: "banned", label: "Canciones", icon: Ban },
  { id: "contacts", label: "Contactos", icon: Mail },
  { id: "reports", label: "Reportes", icon: Flag },
  { id: "logs", label: "Logs", icon: ScrollText },
  { id: "dj", label: "Panel DJ", icon: Radio },
  { id: "config", label: "Configuración", icon: Settings },
];

// ============ THEMES ADMIN ============
function ThemesAdmin() {
  const { theme: activeTheme, themes, setActiveTheme, isSettingTheme } = useTheme();
  const { toast } = useToast();

  const handleSetTheme = (slug: string) => {
    setActiveTheme(slug);
    toast({ title: "Temática cambiada", description: `Tema activo: ${slug}` });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold mb-1">Temática Activa</h2>
        <p className="text-xs text-muted-foreground">Selecciona una temática y todo el sitio cambiará de colores, decoraciones y efectos.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {themes.map((t: Theme) => {
          const colors = t.colors as any;
          const decorations = t.decorations as any;
          const isActive = activeTheme?.slug === t.slug;
          return (
            <button
              key={t.id}
              onClick={() => handleSetTheme(t.slug)}
              disabled={isSettingTheme}
              className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                isActive ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-border hover:border-primary/40 bg-card"
              }`}
              data-testid={`button-theme-${t.slug}`}
            >
              {isActive && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="flex gap-1 mb-3">
                <div className="h-6 flex-1 rounded" style={{ background: colors?.gradientFrom || "#7c3aed" }} />
                <div className="h-6 flex-1 rounded" style={{ background: colors?.gradientTo || "#3b82f6" }} />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{decorations?.emoji || "⚡"}</span>
                <span className="text-sm font-semibold">{t.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t.description}</p>
              {decorations?.accentEmojis && (
                <div className="flex gap-1 mt-2">
                  {(decorations.accentEmojis as string[]).map((e: string, i: number) => (
                    <span key={i} className="text-xs opacity-50">{e}</span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
      {activeTheme && (
        <div className="p-4 rounded-xl bg-muted/30 border border-border">
          <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Vista previa de colores</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries((activeTheme.colors as any) || {}).map(([key, value]) => {
              if (typeof value !== 'string') return null;
              const isHSL = /^\d/.test(value);
              return (
                <div key={key} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <div className="w-4 h-4 rounded border border-border flex-shrink-0" style={{ background: isHSL ? `hsl(${value})` : value }} />
                  {key}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============ EVENTS ADMIN ============
function EventsAdmin() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", server: "es", date: "", time: "", roomName: "", roomOwner: "", host: "", imageUrl: "", imageHint: "" });
  const { data: events } = useQuery<any[]>({ queryKey: ["/api/events"] });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/events", data, token ? `Bearer ${token}` : undefined);
      if (!res.ok) throw new Error("Error al crear evento");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/events"] }); setOpen(false); toast({ title: "Evento creado" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/events/${id}`, undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/events"] }); toast({ title: "Evento eliminado" }); },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold">Gestión de Eventos ({events?.length || 0})</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/80 text-white text-xs" data-testid="button-new-event"><Plus className="w-3 h-3 mr-1" />Nuevo Evento</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader><DialogTitle className="text-sm">Nuevo Evento</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Título</Label><Input className="mt-1" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Fecha</Label><Input className="mt-1" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
                <div><Label className="text-xs">Hora</Label><Input className="mt-1" type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Nombre Sala</Label><Input className="mt-1" value={form.roomName} onChange={e => setForm(p => ({ ...p, roomName: e.target.value }))} /></div>
                <div><Label className="text-xs">Dueño Sala</Label><Input className="mt-1" value={form.roomOwner} onChange={e => setForm(p => ({ ...p, roomOwner: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Anfitrión</Label><Input className="mt-1" value={form.host} onChange={e => setForm(p => ({ ...p, host: e.target.value }))} /></div>
                <div><Label className="text-xs">Servidor</Label>
                  <Select value={form.server} onValueChange={v => setForm(p => ({ ...p, server: v }))}>
                    <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{["es","com","com.br","de","fr"].map(s => <SelectItem key={s} value={s}>.{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label className="text-xs">URL Imagen</Label><Input className="mt-1" placeholder="https://..." value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} /></div>
              <Button className="w-full bg-primary hover:bg-primary/80 text-white text-xs" onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.title} data-testid="button-submit-event">Crear Evento</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-2">
        {(events || []).map(item => (
          <div key={item.id} className="flex items-center justify-between bg-secondary/30 rounded-lg px-3 py-2 border border-border">
            <div>
              <p className="text-sm">{item.title}</p>
              <p className="text-[10px] text-muted-foreground">{item.date} · {item.time} · Sala: {item.roomName}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/60 hover:text-destructive" onClick={() => deleteMutation.mutate(item.id)} data-testid={`button-delete-event-${item.id}`}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ SCHEDULE ADMIN ============
function ScheduleAdmin() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ day: "Lunes", startTime: "", endTime: "", showName: "", djName: "" });
  const { data: schedule } = useQuery<any[]>({ queryKey: ["/api/schedule"] });
  const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/schedule", data, token ? `Bearer ${token}` : undefined);
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/schedule"] }); setOpen(false); toast({ title: "Horario creado" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { const res = await apiRequest("DELETE", `/api/schedule/${id}`, undefined, token ? `Bearer ${token}` : undefined); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/schedule"] }); toast({ title: "Horario eliminado" }); },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold">Horarios ({schedule?.length || 0})</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/80 text-white text-xs" data-testid="button-new-schedule"><Plus className="w-3 h-3 mr-1" />Nuevo Horario</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle className="text-sm">Nuevo Horario</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Día</Label>
                <Select value={form.day} onValueChange={v => setForm(p => ({ ...p, day: v }))}>
                  <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Inicio</Label><Input className="mt-1" type="time" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} /></div>
                <div><Label className="text-xs">Fin</Label><Input className="mt-1" type="time" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} /></div>
              </div>
              <div><Label className="text-xs">Nombre del programa</Label><Input className="mt-1" value={form.showName} onChange={e => setForm(p => ({ ...p, showName: e.target.value }))} /></div>
              <div><Label className="text-xs">DJ</Label><Input className="mt-1" value={form.djName} onChange={e => setForm(p => ({ ...p, djName: e.target.value }))} /></div>
              <Button className="w-full bg-primary hover:bg-primary/80 text-white text-xs" onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending} data-testid="button-submit-schedule">Crear</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-2">
        {(schedule || []).map(item => (
          <div key={item.id} className="flex items-center justify-between bg-secondary/30 rounded-lg px-3 py-2 border border-border">
            <div>
              <p className="text-sm">{item.showName} — {item.djName}</p>
              <p className="text-[10px] text-muted-foreground">{item.day} · {item.startTime} – {item.endTime}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/60 hover:text-destructive" onClick={() => deleteMutation.mutate(item.id)} data-testid={`button-delete-schedule-${item.id}`}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ USERS ADMIN ============
function UsersAdmin() {
  const { token } = useAuth();
  const { toast } = useToast();
  const { data: users } = useQuery<any[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/users", undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/users/${id}`, data, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/users"] }); toast({ title: "Usuario actualizado" }); },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold">Usuarios ({users?.length || 0})</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-xs">Usuario</TableHead>
              <TableHead className="text-xs">Email</TableHead>
              <TableHead className="text-xs">Rol</TableHead>
              <TableHead className="text-xs">Estado</TableHead>
              <TableHead className="text-xs">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(users || []).map(u => (
              <TableRow key={u.id} className="border-border">
                <TableCell className="text-xs">{u.displayName}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <Select value={u.role} onValueChange={v => updateMutation.mutate({ id: u.id, data: { role: v } })}>
                    <SelectTrigger className="h-7 text-[11px] w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>{["admin", "dj", "user", "pending"].map(r => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}</SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[9px] ${u.approved ? "border-green-500/30 text-green-400" : "border-yellow-500/30 text-yellow-400"}`}>
                    {u.approved ? "Aprobado" : "Pendiente"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {!u.approved && (
                    <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 border-green-500/30 text-green-400 hover:bg-green-500/10" onClick={() => updateMutation.mutate({ id: u.id, data: { approved: true } })} data-testid={`button-approve-user-${u.id}`}>
                      Aprobar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ============ DJ PANEL ADMIN ============
function DjPanelAdmin() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [djForm, setDjForm] = useState({ currentDj: "", nextDj: "", djMessage: "" });
  const [loaded, setLoaded] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [pointsAmount, setPointsAmount] = useState("");

  const { data: djPanel } = useQuery<any>({ queryKey: ["/api/dj-panel"], retry: false });
  const { data: requests } = useQuery<any[]>({
    queryKey: ["/api/requests"],
    queryFn: async () => { const res = await apiRequest("GET", "/api/requests", undefined, token ? `Bearer ${token}` : undefined); return res.json(); },
    retry: false,
  });
  const { data: users } = useQuery<any[]>({
    queryKey: ["/api/users"],
    queryFn: async () => { const res = await apiRequest("GET", "/api/users", undefined, token ? `Bearer ${token}` : undefined); return res.json(); },
  });

  if (djPanel && !loaded) { setDjForm({ currentDj: djPanel.currentDj || "", nextDj: djPanel.nextDj || "", djMessage: djPanel.djMessage || "" }); setLoaded(true); }

  const saveDjPanelMutation = useMutation({
    mutationFn: async (data: any) => { const res = await apiRequest("PUT", "/api/dj-panel", data, token ? `Bearer ${token}` : undefined); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/dj-panel"] }); toast({ title: "Panel DJ actualizado" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const givePointsMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => { const res = await apiRequest("PUT", `/api/users/${id}/points`, { amount }, token ? `Bearer ${token}` : undefined); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/users"] }); setPointsAmount(""); toast({ title: "SpeedPoints asignados" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteRequestMutation = useMutation({
    mutationFn: async (id: number) => { const res = await apiRequest("DELETE", `/api/requests/${id}`, undefined, token ? `Bearer ${token}` : undefined); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/requests"] }); toast({ title: "Solicitud eliminada" }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2"><Headphones className="w-5 h-5 text-primary" /><h2 className="text-sm font-semibold">Panel DJ</h2></div>
      <div className="space-y-3 max-w-lg">
        <div><Label className="text-xs text-muted-foreground mb-1.5 block">DJ en antena ahora</Label><Input placeholder="Nombre del DJ actual..." value={djForm.currentDj} onChange={e => setDjForm(p => ({ ...p, currentDj: e.target.value }))} data-testid="input-dj-current" /></div>
        <div><Label className="text-xs text-muted-foreground mb-1.5 block">Próximo DJ</Label><Input placeholder="Nombre del próximo DJ..." value={djForm.nextDj} onChange={e => setDjForm(p => ({ ...p, nextDj: e.target.value }))} data-testid="input-dj-next" /></div>
        <div><Label className="text-xs text-muted-foreground mb-1.5 block">Mensaje del DJ</Label><Textarea placeholder="Mensaje para los oyentes..." rows={3} value={djForm.djMessage} onChange={e => setDjForm(p => ({ ...p, djMessage: e.target.value }))} data-testid="input-dj-message" /></div>
        <Button className="bg-primary hover:bg-primary/80 text-white text-xs" onClick={() => saveDjPanelMutation.mutate(djForm)} disabled={saveDjPanelMutation.isPending} data-testid="button-save-dj-panel">Guardar Panel DJ</Button>
      </div>
      <div className="space-y-3 max-w-lg border-t border-border pt-5">
        <h3 className="text-xs font-semibold">Dar SpeedPoints</h3>
        <div className="flex gap-2">
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="flex-1 text-xs" data-testid="select-points-user"><SelectValue placeholder="Selecciona usuario..." /></SelectTrigger>
            <SelectContent>{(users || []).map((u: any) => <SelectItem key={u.id} value={String(u.id)} className="text-xs">{u.displayName} ({u.speedPoints || 0} pts)</SelectItem>)}</SelectContent>
          </Select>
          <Input type="number" placeholder="Puntos" className="w-28" value={pointsAmount} onChange={e => setPointsAmount(e.target.value)} data-testid="input-points-amount" />
          <Button className="bg-primary hover:bg-primary/80 text-white text-xs" onClick={() => { if (selectedUserId && pointsAmount) givePointsMutation.mutate({ id: selectedUserId, amount: parseInt(pointsAmount) }); }} disabled={givePointsMutation.isPending || !selectedUserId || !pointsAmount} data-testid="button-give-points">Dar Puntos</Button>
        </div>
      </div>
      <div className="space-y-3 border-t border-border pt-5">
        <h3 className="text-xs font-semibold">Solicitudes ({requests?.length || 0})</h3>
        <div className="space-y-2">
          {(requests || []).length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No hay solicitudes pendientes</p>}
          {(requests || []).map((req: any) => (
            <div key={req.id} className="flex items-center justify-between bg-secondary/30 rounded-lg px-3 py-2 border border-border">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><Badge variant="outline" className="text-[9px] border-primary/30 text-primary/80">{req.type}</Badge><span className="text-xs font-medium">{req.userName}</span></div>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">{req.details}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/60 hover:text-destructive flex-shrink-0" onClick={() => deleteRequestMutation.mutate(req.id)} data-testid={`button-delete-request-${req.id}`}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ CONFIG ADMIN ============
function ConfigAdmin() {
  const { token } = useAuth();
  const { toast } = useToast();
  const { data: config } = useQuery<any>({ queryKey: ["/api/config"] });
  const [form, setForm] = useState({ radioService: "azuracast", apiUrl: "", listenUrl: "" });
  const [loaded, setLoaded] = useState(false);

  if (config && !loaded) { setForm({ radioService: config.radioService || "azuracast", apiUrl: config.apiUrl || "", listenUrl: config.listenUrl || "" }); setLoaded(true); }

  const maintenanceMutation = useMutation({
    mutationFn: async (enabled: boolean) => { const res = await apiRequest("PUT", "/api/config", { maintenanceMode: enabled }, token ? `Bearer ${token}` : undefined); return res.json(); },
    onSuccess: (_, enabled) => { queryClient.invalidateQueries({ queryKey: ["/api/config"] }); toast({ title: enabled ? "Modo mantenimiento ACTIVADO" : "Modo mantenimiento DESACTIVADO" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => { const res = await apiRequest("PUT", "/api/config", data, token ? `Bearer ${token}` : undefined); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/config"] }); toast({ title: "Configuración guardada" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-4 max-w-lg">
      <h2 className="text-sm font-semibold">Configuración del Sistema</h2>
      <div className={`p-4 rounded-xl border ${config?.maintenanceMode ? "bg-yellow-500/10 border-yellow-500/30" : "bg-green-500/10 border-green-500/30"}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold">{config?.maintenanceMode ? "🔧 Modo Mantenimiento ACTIVO" : "✅ Sitio Público"}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{config?.maintenanceMode ? "Solo staff puede acceder." : "Todos pueden acceder al sitio normalmente."}</p>
          </div>
          <Button size="sm" className={`text-xs ${config?.maintenanceMode ? "bg-green-600 hover:bg-green-700" : "bg-yellow-600 hover:bg-yellow-700"}`} onClick={() => maintenanceMutation.mutate(!config?.maintenanceMode)} disabled={maintenanceMutation.isPending} data-testid="button-toggle-maintenance">
            {config?.maintenanceMode ? "Abrir Sitio" : "Activar Mantenimiento"}
          </Button>
        </div>
      </div>
      <div className="space-y-3">
        <div><Label className="text-xs text-muted-foreground mb-1.5 block">Servicio de Radio</Label>
          <Select value={form.radioService} onValueChange={v => setForm(p => ({ ...p, radioService: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="azuracast">AzuraCast</SelectItem><SelectItem value="shoutcast">SHOUTcast</SelectItem><SelectItem value="icecast">Icecast</SelectItem></SelectContent>
          </Select>
        </div>
        <div><Label className="text-xs text-muted-foreground mb-1.5 block">URL API Now Playing</Label><Input placeholder="https://radio.example.com/api/nowplaying/station" value={form.apiUrl} onChange={e => setForm(p => ({ ...p, apiUrl: e.target.value }))} data-testid="input-config-api-url" /></div>
        <div><Label className="text-xs text-muted-foreground mb-1.5 block">URL Stream</Label><Input placeholder="https://radio.example.com/listen/station/radio.mp3" value={form.listenUrl} onChange={e => setForm(p => ({ ...p, listenUrl: e.target.value }))} data-testid="input-config-listen-url" /></div>
        <Button className="bg-primary hover:bg-primary/80 text-white text-xs" onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending} data-testid="button-save-config">Guardar Configuración</Button>
      </div>
    </div>
  );
}

// ============ TEAM ADMIN ============
function TeamAdmin() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editMember, setEditMember] = useState<any>(null);
  const [form, setForm] = useState({ displayName: "", habboUsername: "", role: "colaborador", motto: "" });
  const ROLES = ["admin", "dj", "moderador", "colaborador", "periodista", "diseñador", "builder", "mentor", "eventos"];

  const { data: team } = useQuery<any[]>({
    queryKey: ["/api/team"],
    queryFn: async () => { const res = await apiRequest("GET", "/api/team", undefined, token ? `Bearer ${token}` : undefined); return res.json(); },
  });

  const openAdd = () => { setEditMember(null); setForm({ displayName: "", habboUsername: "", role: "colaborador", motto: "" }); setOpen(true); };
  const openEdit = (m: any) => { setEditMember(m); setForm({ displayName: m.displayName || "", habboUsername: m.habboUsername || "", role: m.role || "colaborador", motto: m.motto || "" }); setOpen(true); };

  const createMutation = useMutation({
    mutationFn: async (data: any) => { const res = await apiRequest("POST", "/api/team", data, token ? `Bearer ${token}` : undefined); if (!res.ok) throw new Error("Error"); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/team"] }); setOpen(false); toast({ title: "Miembro agregado" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => { const res = await apiRequest("PUT", `/api/team/${id}`, data, token ? `Bearer ${token}` : undefined); if (!res.ok) throw new Error("Error"); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/team"] }); setOpen(false); toast({ title: "Miembro actualizado" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { const res = await apiRequest("DELETE", `/api/team/${id}`, undefined, token ? `Bearer ${token}` : undefined); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/team"] }); toast({ title: "Miembro eliminado" }); },
  });

  const ROLE_COLORS: Record<string, string> = { admin: "border-red-500/30 text-red-400", dj: "border-primary/30 text-primary", moderador: "border-blue-500/30 text-blue-400", colaborador: "border-green-500/30 text-green-400", periodista: "border-yellow-500/30 text-yellow-400", diseñador: "border-pink-500/30 text-pink-400", builder: "border-orange-500/30 text-orange-400", mentor: "border-purple-500/30 text-purple-400", eventos: "border-cyan-500/30 text-cyan-400" };
  const headonlyUrl = (u: string) => u ? `https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(u)}&size=s&headonly=1` : null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold">Equipo ({team?.length || 0})</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/80 text-white text-xs" onClick={openAdd} data-testid="button-add-team-member"><Plus className="w-3 h-3 mr-1" />Agregar Miembro</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader><DialogTitle className="text-sm">{editMember ? "Editar Miembro" : "Agregar Miembro"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              {form.habboUsername && <div className="flex justify-center"><img src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(form.habboUsername)}&size=l&direction=2&head_direction=2`} alt="Avatar" className="h-24" /></div>}
              <div><Label className="text-xs">Nombre para mostrar</Label><Input className="mt-1" value={form.displayName} onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))} data-testid="input-team-display-name" /></div>
              <div><Label className="text-xs">Usuario de Habbo</Label><Input className="mt-1" value={form.habboUsername} onChange={e => setForm(p => ({ ...p, habboUsername: e.target.value }))} placeholder="Username en Habbo.es" data-testid="input-team-habbo-username" /></div>
              <div><Label className="text-xs">Rol</Label>
                <Select value={form.role} onValueChange={v => setForm(p => ({ ...p, role: v }))}>
                  <SelectTrigger className="mt-1 text-xs" data-testid="select-team-role"><SelectValue /></SelectTrigger>
                  <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r} className="text-xs capitalize">{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Motto (opcional)</Label><Input className="mt-1" value={form.motto} onChange={e => setForm(p => ({ ...p, motto: e.target.value }))} data-testid="input-team-motto" /></div>
              <Button className="w-full bg-primary hover:bg-primary/80 text-white text-xs" onClick={() => editMember ? updateMutation.mutate({ id: editMember.id, data: form }) : createMutation.mutate(form)} disabled={createMutation.isPending || updateMutation.isPending || !form.displayName || !form.habboUsername} data-testid="button-submit-team-member">
                {editMember ? "Guardar Cambios" : "Agregar Miembro"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-2">
        {(team || []).map(m => (
          <div key={m.id} className="flex items-center gap-3 bg-secondary/30 rounded-lg px-3 py-2 border border-border">
            {headonlyUrl(m.habboUsername) && <img src={headonlyUrl(m.habboUsername)!} alt={m.displayName} className="w-10 h-10 flex-shrink-0" />}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap"><span className="text-sm font-medium">{m.displayName}</span><Badge variant="outline" className={`text-[9px] capitalize ${ROLE_COLORS[m.role] || "border-border"}`}>{m.role}</Badge></div>
              <p className="text-[10px] text-muted-foreground">{m.habboUsername}</p>
              {m.motto && <p className="text-[10px] text-muted-foreground italic truncate">{m.motto}</p>}
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => openEdit(m)} data-testid={`button-edit-team-${m.id}`}><Edit className="w-3.5 h-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/60 hover:text-destructive" onClick={() => deleteMutation.mutate(m.id)} data-testid={`button-delete-team-${m.id}`}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        ))}
        {(team || []).length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No hay miembros en el equipo</p>}
      </div>
    </div>
  );
}

// ============ DOWNLOADS ADMIN ============
function DownloadsAdmin() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", fileUrl: "", category: "general" });

  const { data: downloads } = useQuery<any[]>({
    queryKey: ["/api/downloads"],
    queryFn: async () => { const res = await apiRequest("GET", "/api/downloads", undefined, token ? `Bearer ${token}` : undefined); return res.json(); },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => { const res = await apiRequest("POST", "/api/downloads", data, token ? `Bearer ${token}` : undefined); if (!res.ok) throw new Error("Error"); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/downloads"] }); setOpen(false); setForm({ title: "", description: "", fileUrl: "", category: "general" }); toast({ title: "Descarga creada" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { const res = await apiRequest("DELETE", `/api/downloads/${id}`, undefined, token ? `Bearer ${token}` : undefined); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/downloads"] }); toast({ title: "Descarga eliminada" }); },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold">Descargas ({downloads?.length || 0})</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" className="bg-primary hover:bg-primary/80 text-white text-xs" data-testid="button-new-download"><Plus className="w-3 h-3 mr-1" />Nueva Descarga</Button></DialogTrigger>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader><DialogTitle className="text-sm">Nueva Descarga</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Título</Label><Input className="mt-1" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} data-testid="input-download-title" /></div>
              <div><Label className="text-xs">Descripción</Label><Textarea className="mt-1 resize-none" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
              <div><Label className="text-xs">URL del archivo</Label><Input className="mt-1" placeholder="https://..." value={form.fileUrl} onChange={e => setForm(p => ({ ...p, fileUrl: e.target.value }))} data-testid="input-download-url" /></div>
              <div><Label className="text-xs">Categoría</Label>
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="general">General</SelectItem><SelectItem value="software">Software</SelectItem><SelectItem value="recurso">Recurso</SelectItem><SelectItem value="otro">Otro</SelectItem></SelectContent>
                </Select>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/80 text-white text-xs" onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.title || !form.fileUrl} data-testid="button-submit-download">Crear Descarga</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow className="border-border"><TableHead className="text-xs">Título</TableHead><TableHead className="text-xs">Categoría</TableHead><TableHead className="text-xs">Agregado por</TableHead><TableHead className="text-xs">Descargas</TableHead><TableHead className="text-xs">Acciones</TableHead></TableRow></TableHeader>
          <TableBody>
            {(downloads || []).map(d => (
              <TableRow key={d.id} className="border-border">
                <TableCell className="text-xs">{d.title}</TableCell>
                <TableCell><Badge variant="outline" className="text-[9px] border-border capitalize">{d.category}</Badge></TableCell>
                <TableCell className="text-xs text-muted-foreground">{d.addedBy || "—"}</TableCell>
                <TableCell className="text-xs">{d.downloadCount || 0}</TableCell>
                <TableCell><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/60 hover:text-destructive" onClick={() => deleteMutation.mutate(d.id)} data-testid={`button-delete-download-${d.id}`}><Trash2 className="w-3.5 h-3.5" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {(downloads || []).length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No hay descargas</p>}
      </div>
    </div>
  );
}

// ============ BANNED SONGS ADMIN ============
function BannedSongsAdmin() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", artist: "", reason: "" });

  const { data: bannedSongs } = useQuery<any[]>({
    queryKey: ["/api/banned-songs"],
    queryFn: async () => { const res = await apiRequest("GET", "/api/banned-songs", undefined, token ? `Bearer ${token}` : undefined); return res.json(); },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => { const res = await apiRequest("POST", "/api/banned-songs", data, token ? `Bearer ${token}` : undefined); if (!res.ok) throw new Error("Error"); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/banned-songs"] }); setOpen(false); setForm({ title: "", artist: "", reason: "" }); toast({ title: "Canción baneada" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { const res = await apiRequest("DELETE", `/api/banned-songs/${id}`, undefined, token ? `Bearer ${token}` : undefined); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/banned-songs"] }); toast({ title: "Canción desbaneada" }); },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold">Canciones Baneadas ({bannedSongs?.length || 0})</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" className="bg-primary hover:bg-primary/80 text-white text-xs" data-testid="button-ban-song"><Plus className="w-3 h-3 mr-1" />Banear Canción</Button></DialogTrigger>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader><DialogTitle className="text-sm">Banear Canción</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Título</Label><Input className="mt-1" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} data-testid="input-ban-song-title" /></div>
              <div><Label className="text-xs">Artista</Label><Input className="mt-1" value={form.artist} onChange={e => setForm(p => ({ ...p, artist: e.target.value }))} data-testid="input-ban-song-artist" /></div>
              <div><Label className="text-xs">Razón</Label><Textarea className="mt-1 resize-none" rows={3} value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} data-testid="input-ban-song-reason" /></div>
              <Button className="w-full bg-primary hover:bg-primary/80 text-white text-xs" onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.title || !form.artist} data-testid="button-submit-ban-song">Banear Canción</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow className="border-border"><TableHead className="text-xs">Título</TableHead><TableHead className="text-xs">Artista</TableHead><TableHead className="text-xs">Razón</TableHead><TableHead className="text-xs">Baneada por</TableHead><TableHead className="text-xs">Acciones</TableHead></TableRow></TableHeader>
          <TableBody>
            {(bannedSongs || []).map(song => (
              <TableRow key={song.id} className="border-border">
                <TableCell className="text-xs font-medium">{song.title}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{song.artist}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{song.reason}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{song.bannedBy || "—"}</TableCell>
                <TableCell><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/60 hover:text-destructive" onClick={() => deleteMutation.mutate(song.id)} data-testid={`button-unban-song-${song.id}`}><Trash2 className="w-3.5 h-3.5" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {(bannedSongs || []).length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No hay canciones baneadas</p>}
      </div>
    </div>
  );
}

// ============ CONTACTS ADMIN ============
function ContactsAdmin() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: messages } = useQuery<any[]>({
    queryKey: ["/api/contact-messages"],
    queryFn: async () => { const res = await apiRequest("GET", "/api/contact-messages", undefined, token ? `Bearer ${token}` : undefined); return res.json(); },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => { const res = await apiRequest("PUT", `/api/contact-messages/${id}/status`, { status }, token ? `Bearer ${token}` : undefined); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/contact-messages"] }); toast({ title: "Estado actualizado" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { const res = await apiRequest("DELETE", `/api/contact-messages/${id}`, undefined, token ? `Bearer ${token}` : undefined); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/contact-messages"] }); toast({ title: "Mensaje eliminado" }); },
  });

  const STATUS_STYLES: Record<string, string> = { pending: "border-yellow-500/30 text-yellow-400", read: "border-blue-500/30 text-blue-400", replied: "border-green-500/30 text-green-400", archived: "border-gray-500/30 text-gray-400" };
  const STATUS_LABELS: Record<string, string> = { pending: "Pendiente", read: "Leído", replied: "Respondido", archived: "Archivado" };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold">Mensajes de Contacto ({messages?.length || 0})</h2>
      <div className="space-y-2">
        {(messages || []).map(msg => (
          <div key={msg.id} className="bg-secondary/30 rounded-lg border border-border overflow-hidden">
            <div className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-secondary/50" onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)} data-testid={`contact-message-${msg.id}`}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap"><span className="text-xs font-medium">{msg.name}</span><span className="text-[10px] text-muted-foreground">{msg.email}</span><Badge variant="outline" className={`text-[9px] ${STATUS_STYLES[msg.status] || "border-border"}`}>{STATUS_LABELS[msg.status] || msg.status}</Badge></div>
                <p className="text-[10px] text-muted-foreground truncate">{msg.subject} — {msg.message?.slice(0, 60)}...</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-[10px] text-muted-foreground">{msg.createdAt ? new Date(msg.createdAt).toLocaleDateString("es") : ""}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/60 hover:text-destructive" onClick={e => { e.stopPropagation(); deleteMutation.mutate(msg.id); }} data-testid={`button-delete-contact-${msg.id}`}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
            {expandedId === msg.id && (
              <div className="px-3 pb-3 border-t border-border/50 pt-2 space-y-2">
                <p className="text-xs">{msg.message}</p>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 border-blue-500/30 text-blue-400" onClick={() => updateStatusMutation.mutate({ id: msg.id, status: "read" })} data-testid={`button-mark-read-${msg.id}`}>Marcar leído</Button>
                  <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 border-green-500/30 text-green-400" onClick={() => updateStatusMutation.mutate({ id: msg.id, status: "replied" })} data-testid={`button-mark-replied-${msg.id}`}>Respondido</Button>
                  <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 border-gray-500/30 text-gray-400" onClick={() => updateStatusMutation.mutate({ id: msg.id, status: "archived" })} data-testid={`button-mark-archived-${msg.id}`}>Archivar</Button>
                </div>
              </div>
            )}
          </div>
        ))}
        {(messages || []).length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No hay mensajes de contacto</p>}
      </div>
    </div>
  );
}

// ============ REPORTS ADMIN ============
function ReportsAdmin() {
  const { token } = useAuth();
  const { toast } = useToast();

  const { data: reports } = useQuery<any[]>({
    queryKey: ["/api/reported-messages"],
    queryFn: async () => { const res = await apiRequest("GET", "/api/reported-messages", undefined, token ? `Bearer ${token}` : undefined); return res.json(); },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => { const res = await apiRequest("PUT", `/api/reported-messages/${id}/status`, { status }, token ? `Bearer ${token}` : undefined); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/reported-messages"] }); toast({ title: "Estado actualizado" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { const res = await apiRequest("DELETE", `/api/reported-messages/${id}`, undefined, token ? `Bearer ${token}` : undefined); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/reported-messages"] }); toast({ title: "Reporte eliminado" }); },
  });

  const STATUS_STYLES: Record<string, string> = { pending: "border-yellow-500/30 text-yellow-400", warned: "border-orange-500/30 text-orange-400", banned: "border-red-500/30 text-red-400", dismissed: "border-gray-500/30 text-gray-400" };
  const STATUS_LABELS: Record<string, string> = { pending: "Pendiente", warned: "Advertido", banned: "Baneado", dismissed: "Descartado" };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold">Reportes ({reports?.length || 0})</h2>
      <div className="space-y-2">
        {(reports || []).map(report => (
          <div key={report.id} className="bg-secondary/30 rounded-lg border border-border px-3 py-2">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] text-muted-foreground">Por: <span className="text-foreground">{report.reporterName}</span></span>
                  <span className="text-[10px] text-muted-foreground">Sender: <span className="text-foreground">{report.senderName}</span></span>
                  <Badge variant="outline" className={`text-[9px] ${STATUS_STYLES[report.status] || "border-border"}`}>{STATUS_LABELS[report.status] || report.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{report.subject || report.content?.slice(0, 80)}</p>
                {report.reason && <p className="text-[10px] text-muted-foreground mt-0.5">Razón: {report.reason}</p>}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap mt-2">
              <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 border-orange-500/30 text-orange-400" onClick={() => updateStatusMutation.mutate({ id: report.id, status: "warned" })} data-testid={`button-warn-report-${report.id}`}>Advertir</Button>
              <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 border-red-500/30 text-red-400" onClick={() => updateStatusMutation.mutate({ id: report.id, status: "banned" })} data-testid={`button-ban-report-${report.id}`}>Banear</Button>
              <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 border-gray-500/30 text-gray-400" onClick={() => updateStatusMutation.mutate({ id: report.id, status: "dismissed" })} data-testid={`button-dismiss-report-${report.id}`}>Descartar</Button>
              <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 border-destructive/30 text-destructive" onClick={() => deleteMutation.mutate(report.id)} data-testid={`button-delete-report-${report.id}`}>Eliminar</Button>
            </div>
          </div>
        ))}
        {(reports || []).length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No hay reportes</p>}
      </div>
    </div>
  );
}

// ============ PANEL LOGS ADMIN ============
function PanelLogsAdmin() {
  const { token } = useAuth();

  const { data: logs } = useQuery<any[]>({
    queryKey: ["/api/panel-logs"],
    queryFn: async () => { const res = await apiRequest("GET", "/api/panel-logs?limit=200", undefined, token ? `Bearer ${token}` : undefined); return res.json(); },
    refetchInterval: 30000,
  });

  const ACTION_COLOR = (action: string) => {
    if (!action) return "text-muted-foreground";
    const a = action.toLowerCase();
    if (a.includes("creat") || a.includes("add") || a.includes("agreg") || a.includes("nuevo") || a.includes("nueva")) return "text-green-400";
    if (a.includes("delet") || a.includes("elimin") || a.includes("remov") || a.includes("ban")) return "text-red-400";
    if (a.includes("updat") || a.includes("edit") || a.includes("actualiz") || a.includes("modif") || a.includes("cambi")) return "text-blue-400";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Logs del Panel ({logs?.length || 0})</h2>
        <span className="text-[10px] text-muted-foreground">Auto-actualiza cada 30s</span>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow className="border-border"><TableHead className="text-xs">Fecha</TableHead><TableHead className="text-xs">Usuario</TableHead><TableHead className="text-xs">Acción</TableHead><TableHead className="text-xs">Detalles</TableHead></TableRow></TableHeader>
          <TableBody>
            {(logs || []).map((log, i) => (
              <TableRow key={log.id ?? i} className="border-border">
                <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">{log.createdAt ? new Date(log.createdAt).toLocaleString("es") : "—"}</TableCell>
                <TableCell className="text-xs">{log.userName || log.userId || "—"}</TableCell>
                <TableCell className={`text-xs font-medium ${ACTION_COLOR(log.action)}`}>{log.action}</TableCell>
                <TableCell className="text-[10px] text-muted-foreground max-w-xs truncate">{log.details || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {(logs || []).length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No hay logs disponibles</p>}
      </div>
    </div>
  );
}

// ============ SHOP ADMIN ============
function ShopAdmin() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({
    name: "", description: "", category: "decoracion", price: 0,
    imageUrl: "", previewUrl: "", isLimited: false, stock: 0, isActive: true,
  });

  const { data: products } = useQuery<any[]>({
    queryKey: ["/api/shop/products"],
    queryFn: async () => { const res = await apiRequest("GET", "/api/shop/products?all=true", undefined, token ? `Bearer ${token}` : undefined); return res.json(); },
  });

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: "", description: "", category: "decoracion", price: 0, imageUrl: "", previewUrl: "", isLimited: false, stock: 0, isActive: true });
    setOpen(true);
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({
      name: item.name || "", description: item.description || "", category: item.category || "decoracion",
      price: item.price || 0, imageUrl: item.imageUrl || "", previewUrl: item.previewUrl || "",
      isLimited: item.isLimited || false, stock: item.stock ?? 0, isActive: item.isActive ?? true,
    });
    setOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/shop/products", data, token ? `Bearer ${token}` : undefined);
      if (!res.ok) throw new Error("Error al crear producto");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/shop/products"] }); setOpen(false); toast({ title: "Producto creado" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/shop/products/${id}`, data, token ? `Bearer ${token}` : undefined);
      if (!res.ok) throw new Error("Error al actualizar");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/shop/products"] }); setOpen(false); toast({ title: "Producto actualizado" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/shop/products/${id}`, undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/shop/products"] }); toast({ title: "Producto eliminado" }); },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const CATEGORIES = [
    { value: "decoracion", label: "Decoración" },
    { value: "objeto", label: "Objeto" },
    { value: "tema", label: "Tema" },
    { value: "fondo", label: "Fondo" },
    { value: "efecto", label: "Efecto" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold">Gestión de Tienda ({products?.length || 0})</h2>
        <Button size="sm" className="bg-primary hover:bg-primary/80 text-white text-xs" onClick={openCreate} data-testid="button-new-product">
          <Plus className="w-3 h-3 mr-1" />Nuevo Producto
        </Button>
      </div>

      <div className="space-y-2">
        {(products || []).map((p: any) => (
          <div key={p.id} className="flex items-center gap-2 bg-secondary/30 rounded-lg px-3 py-2 border border-border">
            {p.imageUrl && (
              <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded object-cover flex-shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-sm truncate font-medium">{p.name}</p>
                <Badge variant="outline" className="text-[9px] border-primary/30 text-primary">{CATEGORIES.find(c => c.value === p.category)?.label || p.category}</Badge>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-bold text-yellow-400">{p.price} SP</span>
                {p.isLimited && <Badge variant="outline" className="text-[9px] border-red-500/30 text-red-400">Limitado ({p.stock})</Badge>}
                {!p.isActive && <Badge variant="outline" className="text-[9px] border-gray-500/30 text-gray-400">Inactivo</Badge>}
                {p.isActive && <Badge variant="outline" className="text-[9px] border-green-500/30 text-green-400">Activo</Badge>}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => openEdit(p)} data-testid={`button-edit-product-${p.id}`}>
                <Edit className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/60 hover:text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate(p.id)} data-testid={`button-delete-product-${p.id}`}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
        {(products || []).length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">No hay productos en la tienda</p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader><DialogTitle className="text-sm">{editItem ? "Editar Producto" : "Nuevo Producto"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Nombre</Label><Input className="mt-1" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} data-testid="input-product-name" /></div>
            <div><Label className="text-xs">Descripción</Label><Textarea className="mt-1 resize-none" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Categoría</Label>
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Precio (SP)</Label><Input className="mt-1" type="number" min={0} value={form.price} onChange={e => setForm(p => ({ ...p, price: parseInt(e.target.value) || 0 }))} /></div>
            </div>
            <div><Label className="text-xs">URL de imagen</Label><Input className="mt-1" placeholder="https://..." value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} /></div>
            <div><Label className="text-xs">URL de preview (opcional)</Label><Input className="mt-1" placeholder="https://..." value={form.previewUrl} onChange={e => setForm(p => ({ ...p, previewUrl: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Stock</Label><Input className="mt-1" type="number" min={0} value={form.stock} onChange={e => setForm(p => ({ ...p, stock: parseInt(e.target.value) || 0 }))} /></div>
              <div className="flex items-end gap-2 pb-1">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setForm(p => ({ ...p, isLimited: !p.isLimited }))} className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${form.isLimited ? "border-red-500/50 bg-red-500/10 text-red-400" : "border-border bg-secondary/30 text-muted-foreground"}`}>
                    Limitado
                  </button>
                  <button type="button" onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))} className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${form.isActive ? "border-green-500/50 bg-green-500/10 text-green-400" : "border-border bg-secondary/30 text-muted-foreground"}`}>
                    Activo
                  </button>
                </div>
              </div>
            </div>
            <Button className="w-full bg-primary hover:bg-primary/80 text-white text-xs" onClick={() => {
              if (editItem) updateMutation.mutate({ id: editItem.id, data: form });
              else createMutation.mutate(form);
            }} disabled={isPending || !form.name} data-testid="button-submit-product">
              {isPending ? "Guardando..." : editItem ? "Guardar Cambios" : "Crear Producto"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ FORUM ADMIN ============
function ForumAdmin() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [catForm, setCatForm] = useState({ name: "", description: "", color: "#7c3aed", icon: "fa-solid fa-comments" });
  const [catOpen, setCatOpen] = useState(false);

  const { data: categories = [], refetch: refetchCats } = useQuery<any[]>({
    queryKey: ["/api/forum/categories"],
    queryFn: async () => (await apiRequest("GET", "/api/forum/categories", undefined, token ? `Bearer ${token}` : undefined)).json(),
  });

  const createCatMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/forum/categories", data, `Bearer ${token}`),
    onSuccess: () => { toast({ title: "Categoría creada" }); setCatOpen(false); setCatForm({ name: "", description: "", color: "#7c3aed", icon: "fa-solid fa-comments" }); refetchCats(); queryClient.invalidateQueries({ queryKey: ["/api/forum/categories"] }); },
    onError: () => toast({ title: "Error al crear categoría", variant: "destructive" }),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-1">Foro — Categorías y Hilos</h2>
          <p className="text-xs text-muted-foreground">Gestiona categorías del foro y modera los hilos de la comunidad.</p>
        </div>
        <Dialog open={catOpen} onOpenChange={setCatOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary text-white hover:bg-primary/80 text-xs"><Plus className="w-3.5 h-3.5 mr-1" /> Nueva Categoría</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-sm">
            <DialogHeader><DialogTitle>Nueva Categoría de Foro</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <div><Label className="text-xs">Nombre</Label><Input className="mt-1 text-xs" placeholder="Ej: General, Radio..." value={catForm.name} onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><Label className="text-xs">Descripción</Label><Textarea className="mt-1 text-xs resize-none" rows={2} placeholder="Describe esta categoría..." value={catForm.description} onChange={e => setCatForm(p => ({ ...p, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Color</Label><Input className="mt-1 text-xs" type="color" value={catForm.color} onChange={e => setCatForm(p => ({ ...p, color: e.target.value }))} /></div>
                <div><Label className="text-xs">Icono (FA class)</Label><Input className="mt-1 text-xs" placeholder="fa-solid fa-comments" value={catForm.icon} onChange={e => setCatForm(p => ({ ...p, icon: e.target.value }))} /></div>
              </div>
              <Button className="w-full bg-primary text-white text-xs" disabled={!catForm.name} onClick={() => createCatMutation.mutate(catForm)}>Crear Categoría</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat: any) => (
          <div key={cat.id} className="p-4 rounded-xl border border-border bg-zinc-900/60 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm" style={{ background: cat.color || "#7c3aed" }}>
                <i className={cat.icon || "fa-solid fa-comments"}></i>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{cat.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{cat.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{cat.threadCount || 0} hilos</span>
              <span style={{ color: cat.color || "#7c3aed" }}>●</span>
            </div>
          </div>
        ))}
        {categories.length === 0 && <p className="text-xs text-muted-foreground col-span-3">No hay categorías. Crea la primera.</p>}
      </div>
    </div>
  );
}

// ============ TICKETS ADMIN ============
function TicketsAdmin() {
  const { token } = useAuth();
  const { toast } = useToast();

  const { data: tickets = [], refetch } = useQuery<any[]>({
    queryKey: ["/api/tickets/all"],
    queryFn: async () => (await apiRequest("GET", "/api/tickets/all", undefined, `Bearer ${token}`)).json(),
    enabled: !!token,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) =>
      apiRequest("PUT", `/api/tickets/${id}/status`, { status }, `Bearer ${token}`),
    onSuccess: () => { toast({ title: "Estado actualizado" }); refetch(); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const statusColor: Record<string, string> = {
    open: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    resolved: "bg-green-500/10 text-green-400 border-green-500/30",
    closed: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
  };

  const openCount = tickets.filter((t: any) => t.status === "open").length;
  const inProgressCount = tickets.filter((t: any) => t.status === "in_progress").length;
  const resolvedCount = tickets.filter((t: any) => t.status === "resolved").length;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-1">Tickets de Soporte</h2>
        <p className="text-xs text-muted-foreground">Gestiona las solicitudes de ayuda y soporte de los usuarios.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Abiertos", value: openCount, color: "text-yellow-400", bg: "bg-yellow-500/5 border-yellow-500/20" },
          { label: "En Progreso", value: inProgressCount, color: "text-blue-400", bg: "bg-blue-500/5 border-blue-500/20" },
          { label: "Resueltos", value: resolvedCount, color: "text-green-400", bg: "bg-green-500/5 border-green-500/20" },
        ].map((s, i) => (
          <div key={i} className={`p-3 rounded-xl border ${s.bg} text-center`}>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Ticket Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">ID</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Asunto</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Categoría</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Estado</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-8">No hay tickets</TableCell></TableRow>
            ) : tickets.map((ticket: any) => (
              <TableRow key={ticket.id} className="border-border hover:bg-zinc-800/40">
                <TableCell className="text-xs text-muted-foreground font-mono">#{ticket.id}</TableCell>
                <TableCell>
                  <p className="text-xs font-semibold text-white truncate max-w-[200px]">{ticket.subject}</p>
                  <p className="text-[10px] text-muted-foreground truncate max-w-[200px] mt-0.5">{ticket.description}</p>
                </TableCell>
                <TableCell><Badge variant="outline" className="text-[10px] capitalize">{ticket.category || "general"}</Badge></TableCell>
                <TableCell>
                  <span className={`text-[10px] px-2 py-1 rounded-full border font-bold ${statusColor[ticket.status] || statusColor["open"]}`}>
                    {ticket.status === "open" ? "Abierto" : ticket.status === "in_progress" ? "En Progreso" : ticket.status === "resolved" ? "Resuelto" : "Cerrado"}
                  </span>
                </TableCell>
                <TableCell>
                  <Select value={ticket.status} onValueChange={(val) => updateStatus.mutate({ id: ticket.id, status: val })}>
                    <SelectTrigger className="h-7 text-[10px] w-28 bg-zinc-800 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open" className="text-xs">Abierto</SelectItem>
                      <SelectItem value="in_progress" className="text-xs">En Progreso</SelectItem>
                      <SelectItem value="resolved" className="text-xs">Resuelto</SelectItem>
                      <SelectItem value="closed" className="text-xs">Cerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ============ ROOMS ADMIN ============
function RoomsAdmin() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<any>(null);
  const emptyForm = { name: "", description: "", ownerHabbo: "", roomCode: "", thumbnailUrl: "", hotel: "es", category: "social", isActive: true, featured: false };
  const [form, setForm] = useState({ ...emptyForm });

  const { data: rooms = [], refetch } = useQuery<any[]>({
    queryKey: ["/api/rooms"],
    queryFn: async () => (await apiRequest("GET", "/api/rooms?includeInactive=true", undefined, `Bearer ${token}`)).json(),
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/rooms", data, `Bearer ${token}`),
    onSuccess: () => { toast({ title: "Sala creada" }); setOpen(false); setForm({ ...emptyForm }); refetch(); queryClient.invalidateQueries({ queryKey: ["/api/rooms"] }); },
    onError: () => toast({ title: "Error al crear sala", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest("PUT", `/api/rooms/${id}`, data, `Bearer ${token}`),
    onSuccess: () => { toast({ title: "Sala actualizada" }); setOpen(false); setEditRoom(null); setForm({ ...emptyForm }); refetch(); queryClient.invalidateQueries({ queryKey: ["/api/rooms"] }); },
    onError: () => toast({ title: "Error al actualizar sala", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/rooms/${id}`, undefined, `Bearer ${token}`),
    onSuccess: () => { toast({ title: "Sala eliminada" }); refetch(); queryClient.invalidateQueries({ queryKey: ["/api/rooms"] }); },
    onError: () => toast({ title: "Error al eliminar", variant: "destructive" }),
  });

  const openEdit = (room: any) => {
    setEditRoom(room);
    setForm({ name: room.name, description: room.description || "", ownerHabbo: room.ownerHabbo || "", roomCode: room.roomCode || "", thumbnailUrl: room.thumbnailUrl || "", hotel: room.hotel || "es", category: room.category || "social", isActive: room.isActive !== false, featured: !!room.featured });
    setOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-1">Salas Comunitarias</h2>
          <p className="text-xs text-muted-foreground">Gestiona las salas Habbo destacadas de la comunidad HabboSpeed.</p>
        </div>
        <Button size="sm" className="bg-primary text-white hover:bg-primary/80 text-xs" onClick={() => { setEditRoom(null); setForm({ ...emptyForm }); setOpen(true); }}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Nueva Sala
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle>{editRoom ? "Editar Sala" : "Nueva Sala Comunitaria"}</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div><Label className="text-xs">Nombre de la Sala</Label><Input className="mt-1 text-xs" placeholder="Mi Sala Habbo" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><Label className="text-xs">Descripción</Label><Textarea className="mt-1 text-xs resize-none" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Dueño (Habbo Nick)</Label><Input className="mt-1 text-xs" value={form.ownerHabbo} onChange={e => setForm(p => ({ ...p, ownerHabbo: e.target.value }))} /></div>
              <div><Label className="text-xs">Código de Sala</Label><Input className="mt-1 text-xs font-mono" placeholder="r-xxxxxx" value={form.roomCode} onChange={e => setForm(p => ({ ...p, roomCode: e.target.value }))} /></div>
            </div>
            <div><Label className="text-xs">URL de Imagen (opcional)</Label><Input className="mt-1 text-xs" placeholder="https://..." value={form.thumbnailUrl} onChange={e => setForm(p => ({ ...p, thumbnailUrl: e.target.value }))} /></div>
            <div><Label className="text-xs">Categoría</Label>
              <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                  {["social", "oficial", "musica", "vip", "evento", "otro"].map(c => <SelectItem key={c} value={c} className="text-xs capitalize">{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${form.isActive ? "border-green-500/50 bg-green-500/10 text-green-400" : "border-border bg-secondary/30 text-muted-foreground"}`}>Activa</button>
              <button type="button" onClick={() => setForm(p => ({ ...p, featured: !p.featured }))} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${form.featured ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-400" : "border-border bg-secondary/30 text-muted-foreground"}`}>Destacada ⭐</button>
            </div>
            <Button className="w-full bg-primary text-white text-xs" disabled={!form.name} onClick={() => editRoom ? updateMutation.mutate({ id: editRoom.id, data: form }) : createMutation.mutate(form)}>
              {editRoom ? "Guardar Cambios" : "Crear Sala"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Sala</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Dueño</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Cat.</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Estado</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-8">No hay salas registradas</TableCell></TableRow>
            ) : rooms.map((room: any) => (
              <TableRow key={room.id} className="border-border hover:bg-zinc-800/40">
                <TableCell>
                  <p className="text-xs font-semibold text-white">{room.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">{room.description}</p>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{room.ownerHabbo || "—"}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px] capitalize">{room.category}</Badge></TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${room.isActive ? "bg-green-400" : "bg-zinc-500"}`}></span>
                    {room.featured && <span className="text-yellow-400 text-[10px]">⭐</span>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:bg-zinc-700" onClick={() => openEdit(room)}><Edit className="w-3 h-3" /></Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:bg-red-500/10 hover:text-red-400" onClick={() => deleteMutation.mutate(room.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ============ VIP ADMIN ============
function VipAdmin() {
  const { token } = useAuth();
  const { toast } = useToast();

  const { data: memberships = [], refetch } = useQuery<any[]>({
    queryKey: ["/api/vip/admin/all"],
    queryFn: async () => (await apiRequest("GET", "/api/vip/admin/all", undefined, `Bearer ${token}`)).json(),
    enabled: !!token,
  });

  const updateMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: any }) =>
      apiRequest("PUT", `/api/vip/admin/${userId}`, data, `Bearer ${token}`),
    onSuccess: () => { toast({ title: "Membresía actualizada" }); refetch(); },
    onError: () => toast({ title: "Error al actualizar", variant: "destructive" }),
  });

  const tierColors: Record<string, string> = {
    silver: "bg-zinc-400/10 text-zinc-300 border-zinc-400/30",
    gold: "bg-yellow-400/10 text-yellow-400 border-yellow-400/30",
    platinum: "bg-cyan-400/10 text-cyan-300 border-cyan-400/30",
    diamond: "bg-purple-400/10 text-purple-300 border-purple-400/30",
  };

  const activeCount = memberships.filter((m: any) => m.isActive).length;
  const tiers = ["silver", "gold", "platinum", "diamond"];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-1">Membresías VIP</h2>
        <p className="text-xs text-muted-foreground">Gestiona las membresías VIP de los usuarios y sus beneficios.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tiers.map(tier => {
          const count = memberships.filter((m: any) => m.tier === tier && m.isActive).length;
          return (
            <div key={tier} className={`p-3 rounded-xl border text-center ${tierColors[tier] || "border-border"}`}>
              <p className="text-xl font-black">{count}</p>
              <p className="text-[10px] uppercase tracking-wider mt-0.5 font-bold capitalize">{tier}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Usuario ID</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Tier</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Vence</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Estado</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memberships.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-8">No hay membresías registradas</TableCell></TableRow>
            ) : memberships.map((m: any) => (
              <TableRow key={m.id} className="border-border hover:bg-zinc-800/40">
                <TableCell className="text-xs font-mono text-muted-foreground">#{m.userId}</TableCell>
                <TableCell>
                  <span className={`text-[10px] px-2 py-1 rounded-full border font-bold capitalize ${tierColors[m.tier] || "border-border"}`}>{m.tier}</span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {m.expiresAt ? new Date(m.expiresAt).toLocaleDateString("es-MX") : "—"}
                </TableCell>
                <TableCell>
                  <span className={`text-[10px] px-2 py-1 rounded-full border font-bold ${m.isActive ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-zinc-500/10 text-zinc-400 border-zinc-500/30"}`}>
                    {m.isActive ? "Activa" : "Inactiva"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Select value={m.tier} onValueChange={(tier) => updateMutation.mutate({ userId: m.userId, data: { tier } })}>
                      <SelectTrigger className="h-7 text-[10px] w-24 bg-zinc-800 border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>{tiers.map(t => <SelectItem key={t} value={t} className="text-xs capitalize">{t}</SelectItem>)}</SelectContent>
                    </Select>
                    <button
                      onClick={() => updateMutation.mutate({ userId: m.userId, data: { isActive: !m.isActive } })}
                      className={`text-[10px] px-2 py-1 rounded border transition-colors ${m.isActive ? "border-red-500/30 text-red-400 hover:bg-red-500/10" : "border-green-500/30 text-green-400 hover:bg-green-500/10"}`}
                    >{m.isActive ? "Desactivar" : "Activar"}</button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ============ ALLIANCES ADMIN ============
function AlliancesAdmin() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    logoUrl: "",
    websiteUrl: "",
    description: "",
    isActive: true,
    sortOrder: 0
  });

  const { data: alliances = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/alliances"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/alliances");
      return res.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/alliances", data, token ? `Bearer ${token}` : undefined);
      if (!res.ok) throw new Error("Error al crear alianza");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alliances"] });
      setOpen(false);
      resetForm();
      toast({ title: "Alianza creada" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/alliances/${id}`, data, token ? `Bearer ${token}` : undefined);
      if (!res.ok) throw new Error("Error al actualizar alianza");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alliances"] });
      setOpen(false);
      resetForm();
      toast({ title: "Alianza actualizada" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/alliances/${id}`, undefined, token ? `Bearer ${token}` : undefined);
      if (!res.ok) throw new Error("Error al eliminar alianza");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alliances"] });
      toast({ title: "Alianza eliminada" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const resetForm = () => {
    setForm({ name: "", logoUrl: "", websiteUrl: "", description: "", isActive: true, sortOrder: 0 });
    setEditingId(null);
  };

  const handleEdit = (alliance: any) => {
    setEditingId(alliance.id);
    setForm({
      name: alliance.name,
      logoUrl: alliance.logoUrl,
      websiteUrl: alliance.websiteUrl || "",
      description: alliance.description || "",
      isActive: alliance.isActive,
      sortOrder: alliance.sortOrder
    });
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.logoUrl) {
      toast({ title: "Error", description: "El nombre y el logo son requeridos", variant: "destructive" });
      return;
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Nuestras Alianzas ({alliances.length})</h2>
          <p className="text-xs text-muted-foreground">Gestiona las webs amigas y alianzas del portal de radio.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); setOpen(v); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/80 text-white text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Nueva Alianza
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-white">
                {editingId ? "Editar Alianza" : "Nueva Alianza"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Nombre de la Alianza *</Label>
                <Input className="mt-1" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Descripción</Label>
                <Textarea className="mt-1" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">URL del Logo (imgur, beeimg, habbo) *</Label>
                <Input className="mt-1" placeholder="https://..." value={form.logoUrl} onChange={e => setForm(p => ({ ...p, logoUrl: e.target.value }))} />
                {form.logoUrl && (
                  <div className="mt-2 p-2 bg-black/30 rounded border border-border flex items-center justify-center h-20">
                    <img src={form.logoUrl} alt="Preview Logo" className="max-h-16 object-contain" onError={(e) => { (e.target as HTMLImageElement).src = "/habbo-radio/frank_small_03.gif"; }} />
                  </div>
                )}
              </div>
              <div>
                <Label className="text-xs">URL de la Web</Label>
                <Input className="mt-1" placeholder="https://..." value={form.websiteUrl} onChange={e => setForm(p => ({ ...p, websiteUrl: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Orden (menor primero)</Label>
                  <Input className="mt-1" type="number" value={form.sortOrder} onChange={e => setForm(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))} />
                </div>
                <div>
                  <Label className="text-xs">Estado</Label>
                  <Select value={form.isActive ? "true" : "false"} onValueChange={v => setForm(p => ({ ...p, isActive: v === "true" }))}>
                    <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Activa</SelectItem>
                      <SelectItem value="false">Inactiva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/80 text-white text-xs mt-2" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId ? "Actualizar Alianza" : "Crear Alianza"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground w-16">Logo</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Nombre</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Web</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground w-20">Orden</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground w-24">Estado</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground w-24">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center text-xs py-8 text-muted-foreground">Cargando...</TableCell></TableRow>
            ) : alliances.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-xs py-8 text-muted-foreground">No hay alianzas registradas</TableCell></TableRow>
            ) : alliances.map((a: any) => (
              <TableRow key={a.id} className="border-border hover:bg-zinc-800/40">
                <TableCell>
                  <img src={a.logoUrl} alt={a.name} className="h-8 w-8 object-contain bg-black/10 rounded" onError={(e) => { (e.target as HTMLImageElement).src = "/habbo-radio/frank_small_03.gif"; }} />
                </TableCell>
                <TableCell className="font-bold text-white text-xs">{a.name}</TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground max-w-[150px] truncate">{a.websiteUrl || "—"}</TableCell>
                <TableCell className="text-xs text-muted-foreground font-bold">{a.sortOrder}</TableCell>
                <TableCell>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${a.isActive ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-zinc-500/10 text-zinc-400 border-zinc-500/30"}`}>
                    {a.isActive ? "Activa" : "Inactiva"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-primary/80 hover:text-primary" onClick={() => handleEdit(a)}>
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/60 hover:text-destructive" onClick={() => deleteMutation.mutate(a.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ============ MAIN PANEL ============
export default function AdminPanel() {
  const { section } = useParams<{ section?: string }>();
  const { user, isAdmin, token } = useAuth();
  const [activeTab, setActiveTab] = useState(section || "home");

  const { data: allUsers = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/users", undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    enabled: !!user && isAdmin,
  });

  const { data: djPanel } = useQuery<any>({
    queryKey: ["/api/dj-panel"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/dj-panel", undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    enabled: !!user && isAdmin,
  });

  if (!user || !isAdmin) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-64 gap-4 text-center">
        <Shield className="w-14 h-14 text-muted-foreground/30" />
        <h2 className="text-lg font-bold">Acceso restringido</h2>
        <p className="text-sm text-muted-foreground">Necesitas permisos de administrador</p>
        <Link href="/login" className="text-primary text-sm hover:underline">Iniciar sesión</Link>
      </div>
    );
  }

  const menuGroups = [
    {
      title: "General",
      items: [
        { id: "home", label: "Inicio", icon: "fa-solid fa-house" },
        { id: "config", label: "Configuración", icon: "fa-solid fa-gears" },
        { id: "themes", label: "Temáticas", icon: "fa-solid fa-palette" },
        { id: "logs", label: "Logs", icon: "fa-solid fa-scroll" },
      ]
    },
    {
      title: "Contenido",
      items: [
        { id: "news", label: "Noticias", icon: "fa-solid fa-newspaper" },
        { id: "events", label: "Eventos", icon: "fa-solid fa-calendar-days" },
        { id: "schedule", label: "Horarios", icon: "fa-solid fa-calendar-plus" },
        { id: "downloads", label: "Descargas", icon: "fa-solid fa-download" },
      ]
    },
    {
      title: "Comunidad",
      items: [
        { id: "users", label: "Usuarios", icon: "fa-solid fa-users" },
        { id: "team", label: "Equipo", icon: "fa-solid fa-user-shield" },
        { id: "shop", label: "Tienda", icon: "fa-solid fa-store" },
        { id: "contacts", label: "Mensajes", icon: "fa-solid fa-envelope" },
        { id: "forum", label: "Foro", icon: "fa-solid fa-comments" },
        { id: "rooms", label: "Salas", icon: "fa-solid fa-hotel" },
        { id: "vip", label: "Membresías VIP", icon: "fa-solid fa-crown" },
        { id: "tickets", label: "Tickets Soporte", icon: "fa-solid fa-ticket" },
        { id: "alliances", label: "Alianzas", icon: "fa-solid fa-handshake" },
      ]
    },
    {
      title: "Radio y Reportes",
      items: [
        { id: "dj", label: "Estado DJ", icon: "fa-solid fa-radio" },
        { id: "banned", label: "Canciones", icon: "fa-solid fa-ban" },
        { id: "reports", label: "Reportes", icon: "fa-solid fa-flag" },
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Navigation Menu */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-card border border-border rounded-xl p-4 sticky top-24">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <div>
                <h2 className="font-bold text-white text-xs uppercase tracking-wider font-cabinet">Panel Control</h2>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold text-primary">Administración</span>
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
                    ¡Bienvenido, {user.displayName}!
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Este es el centro de control de HabboSpeed. Usa el menú lateral para gestionar la radio, configurar temas, aprobar noticias y moderar la comunidad.
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
                  { label: "Usuarios", value: allUsers.length || "—", icon: "fa-solid fa-users", color: "text-blue-400 bg-blue-500/5" },
                  { label: "DJ en Vivo", value: djPanel?.currentDj || "AutoDJ", icon: "fa-solid fa-radio", color: "text-primary bg-primary/5" },
                  { label: "Rango", value: user.role.toUpperCase(), icon: "fa-solid fa-shield", color: "text-red-400 bg-red-500/5" },
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

              {/* Fast Actions */}
              <Card className="border border-border bg-card">
                <CardContent className="p-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white font-cabinet mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-bolt text-primary"></i> Accesos Rápidos
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Nueva Noticia", action: () => setActiveTab("news"), icon: "fa-solid fa-newspaper" },
                      { label: "Cambiar Tema", action: () => setActiveTab("themes"), icon: "fa-solid fa-palette" },
                      { label: "Estado DJ", action: () => setActiveTab("dj"), icon: "fa-solid fa-radio" },
                      { label: "Ajustes Radio", action: () => setActiveTab("config"), icon: "fa-solid fa-gears" },
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
                {activeTab === "themes" && <ThemesAdmin />}
                {activeTab === "news" && <NewsAdmin />}
                {activeTab === "events" && <EventsAdmin />}
                {activeTab === "schedule" && <ScheduleAdmin />}
                {activeTab === "users" && <UsersAdmin />}
                {activeTab === "team" && <TeamAdmin />}
                {activeTab === "downloads" && <DownloadsAdmin />}
                {activeTab === "shop" && <ShopAdmin />}
                {activeTab === "banned" && <BannedSongsAdmin />}
                {activeTab === "contacts" && <ContactsAdmin />}
                {activeTab === "reports" && <ReportsAdmin />}
                {activeTab === "logs" && <PanelLogsAdmin />}
                {activeTab === "dj" && <DjPanelAdmin />}
                {activeTab === "config" && <ConfigAdmin />}
                {activeTab === "forum" && <ForumAdmin />}
                {activeTab === "tickets" && <TicketsAdmin />}
                {activeTab === "rooms" && <RoomsAdmin />}
                {activeTab === "vip" && <VipAdmin />}
                {activeTab === "alliances" && <AlliancesAdmin />}
              </CardContent>
            </Card>
          )}
        </main>

      </div>
    </div>
  );
}
