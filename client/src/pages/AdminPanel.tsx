import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Newspaper, Calendar, Clock, Users, Shield, Plus, Trash2, Edit, Palette, Check, Radio, Headphones, UsersRound, Download, Ban, Mail, Flag, ScrollText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import type { Theme } from "@shared/schema";

const SECTIONS = [
  { id: "themes", label: "Temáticas", icon: Palette },
  { id: "news", label: "Noticias", icon: Newspaper },
  { id: "events", label: "Eventos", icon: Calendar },
  { id: "schedule", label: "Horarios", icon: Clock },
  { id: "users", label: "Usuarios", icon: Users },
  { id: "team", label: "Equipo", icon: UsersRound },
  { id: "downloads", label: "Descargas", icon: Download },
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
                isActive
                  ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                  : "border-border hover:border-primary/40 bg-card"
              }`}
              data-testid={`button-theme-${t.slug}`}
            >
              {isActive && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              
              {/* Color preview bar */}
              <div className="flex gap-1 mb-3">
                <div className="h-6 flex-1 rounded" style={{ background: colors?.gradientFrom || "#7c3aed" }} />
                <div className="h-6 flex-1 rounded" style={{ background: colors?.gradientTo || "#3b82f6" }} />
              </div>
              
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{decorations?.emoji || "⚡"}</span>
                <span className="text-sm font-semibold">{t.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t.description}</p>
              
              {/* Decoration preview */}
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
                  <div
                    className="w-4 h-4 rounded border border-border flex-shrink-0"
                    style={{ background: isHSL ? `hsl(${value})` : value }}
                  />
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

// ============ NEWS ADMIN ============
function NewsAdmin() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", summary: "", content: "", imageUrl: "", category: "General", date: new Date().toISOString().split("T")[0] });

  const { data: news } = useQuery<any[]>({ queryKey: ["/api/news"] });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/news", data, token ? `Bearer ${token}` : undefined);
      if (!res.ok) throw new Error("Error al crear noticia");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      setOpen(false);
      setForm({ title: "", summary: "", content: "", imageUrl: "", category: "General", date: new Date().toISOString().split("T")[0] });
      toast({ title: "Noticia creada" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/news/${id}`, undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({ title: "Noticia eliminada" });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold">Gestión de Noticias ({news?.length || 0})</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/80 text-white text-xs" data-testid="button-new-news">
              <Plus className="w-3 h-3 mr-1" />Nueva Noticia
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader><DialogTitle className="text-sm">Nueva Noticia</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Título</Label><Input className="mt-1" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} data-testid="input-news-title" /></div>
              <div><Label className="text-xs">Resumen</Label><Textarea className="mt-1 resize-none" rows={2} value={form.summary} onChange={e => setForm(p => ({ ...p, summary: e.target.value }))} /></div>
              <div><Label className="text-xs">Contenido</Label><Textarea className="mt-1" rows={4} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Categoría</Label>
                  <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                    <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["General", "Actualización", "Evento", "Comunidad", "Radio"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Fecha</Label><Input className="mt-1" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
              </div>
              <div><Label className="text-xs">URL de imagen</Label><Input className="mt-1" placeholder="https://..." value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} /></div>
              <Button className="w-full bg-primary hover:bg-primary/80 text-white text-xs" onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.title} data-testid="button-submit-news">Crear Noticia</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {(news || []).map(item => (
          <div key={item.id} className="flex items-center justify-between bg-secondary/30 rounded-lg px-3 py-2 border border-border">
            <div className="min-w-0 flex-1">
              <p className="text-sm truncate">{item.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-[9px] border-border">{item.category}</Badge>
                <span className="text-[10px] text-muted-foreground">{item.date}</span>
              </div>
            </div>
            <Button
              variant="ghost" size="icon"
              className="h-7 w-7 text-destructive/60 hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
              onClick={() => deleteMutation.mutate(item.id)}
              data-testid={`button-delete-news-${item.id}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setOpen(false);
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
                    <SelectContent>
                      {["admin", "dj", "user", "pending"].map(r => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}
                    </SelectContent>
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

  const { data: djPanel } = useQuery<any>({
    queryKey: ["/api/dj-panel"],
    retry: false,
  });

  const { data: requests } = useQuery<any[]>({
    queryKey: ["/api/requests"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/requests", undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    retry: false,
  });

  const { data: users } = useQuery<any[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/users", undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
  });

  if (djPanel && !loaded) {
    setDjForm({
      currentDj: djPanel.currentDj || "",
      nextDj: djPanel.nextDj || "",
      djMessage: djPanel.djMessage || "",
    });
    setLoaded(true);
  }

  const saveDjPanelMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", "/api/dj-panel", data, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dj-panel"] });
      toast({ title: "Panel DJ actualizado" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const givePointsMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const res = await apiRequest("PUT", `/api/users/${id}/points`, { amount }, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setPointsAmount("");
      toast({ title: "SpeedPoints asignados" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteRequestMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/requests/${id}`, undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      toast({ title: "Solicitud eliminada" });
    },
  });

  return (
    <div className="space-y-6">
      {/* DJ Panel Header */}
      <div className="flex items-center gap-2">
        <Headphones className="w-5 h-5 text-primary" />
        <h2 className="text-sm font-semibold">Panel DJ</h2>
      </div>

      {/* DJ Info Card */}
      <div className="space-y-3 max-w-lg">
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">DJ en antena ahora</Label>
          <Input
            placeholder="Nombre del DJ actual..."
            value={djForm.currentDj}
            onChange={(e) => setDjForm((p) => ({ ...p, currentDj: e.target.value }))}
            data-testid="input-dj-current"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Próximo DJ</Label>
          <Input
            placeholder="Nombre del próximo DJ..."
            value={djForm.nextDj}
            onChange={(e) => setDjForm((p) => ({ ...p, nextDj: e.target.value }))}
            data-testid="input-dj-next"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Mensaje del DJ</Label>
          <Textarea
            placeholder="Mensaje para los oyentes..."
            rows={3}
            value={djForm.djMessage}
            onChange={(e) => setDjForm((p) => ({ ...p, djMessage: e.target.value }))}
            data-testid="input-dj-message"
          />
        </div>
        <Button
          className="bg-primary hover:bg-primary/80 text-white text-xs"
          onClick={() => saveDjPanelMutation.mutate(djForm)}
          disabled={saveDjPanelMutation.isPending}
          data-testid="button-save-dj-panel"
        >
          Guardar Panel DJ
        </Button>
      </div>

      {/* Give SpeedPoints */}
      <div className="space-y-3 max-w-lg border-t border-border pt-5">
        <h3 className="text-xs font-semibold">Dar SpeedPoints</h3>
        <div className="flex gap-2">
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="flex-1 text-xs" data-testid="select-points-user">
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
          <Input
            type="number"
            placeholder="Puntos"
            className="w-28"
            value={pointsAmount}
            onChange={(e) => setPointsAmount(e.target.value)}
            data-testid="input-points-amount"
          />
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
            Dar Puntos
          </Button>
        </div>
      </div>

      {/* Song Requests */}
      <div className="space-y-3 border-t border-border pt-5">
        <h3 className="text-xs font-semibold">Solicitudes ({requests?.length || 0})</h3>
        <div className="space-y-2">
          {(requests || []).length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No hay solicitudes pendientes</p>
          )}
          {(requests || []).map((req: any) => (
            <div key={req.id} className="flex items-center justify-between bg-secondary/30 rounded-lg px-3 py-2 border border-border">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px] border-primary/30 text-primary/80">{req.type}</Badge>
                  <span className="text-xs font-medium">{req.userName}</span>
                </div>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">{req.details}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive/60 hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                onClick={() => deleteRequestMutation.mutate(req.id)}
                data-testid={`button-delete-request-${req.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
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

  if (config && !loaded) {
    setForm({ radioService: config.radioService || "azuracast", apiUrl: config.apiUrl || "", listenUrl: config.listenUrl || "" });
    setLoaded(true);
  }

  const maintenanceMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const res = await apiRequest("PUT", "/api/config", { maintenanceMode: enabled }, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: (_, enabled) => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      toast({ title: enabled ? "Modo mantenimiento ACTIVADO" : "Modo mantenimiento DESACTIVADO" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", "/api/config", data, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/config"] }); toast({ title: "Configuración guardada" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-4 max-w-lg">
      <h2 className="text-sm font-semibold">Configuración del Sistema</h2>

      {/* Maintenance Mode Toggle */}
      <div className={`p-4 rounded-xl border ${config?.maintenanceMode ? "bg-yellow-500/10 border-yellow-500/30" : "bg-green-500/10 border-green-500/30"}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold">{config?.maintenanceMode ? "🔧 Modo Mantenimiento ACTIVO" : "✅ Sitio Público"}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {config?.maintenanceMode ? "Solo staff puede acceder. Los visitantes ven la página de mantenimiento." : "Todos pueden acceder al sitio normalmente."}
            </p>
          </div>
          <Button
            size="sm"
            className={`text-xs ${config?.maintenanceMode ? "bg-green-600 hover:bg-green-700" : "bg-yellow-600 hover:bg-yellow-700"}`}
            onClick={() => maintenanceMutation.mutate(!config?.maintenanceMode)}
            disabled={maintenanceMutation.isPending}
            data-testid="button-toggle-maintenance"
          >
            {config?.maintenanceMode ? "Abrir Sitio" : "Activar Mantenimiento"}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Servicio de Radio</Label>
          <Select value={form.radioService} onValueChange={v => setForm(p => ({ ...p, radioService: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="azuracast">AzuraCast</SelectItem>
              <SelectItem value="shoutcast">SHOUTcast</SelectItem>
              <SelectItem value="icecast">Icecast</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">URL de la API Now Playing</Label>
          <Input placeholder="https://radio.example.com/api/nowplaying/station" value={form.apiUrl} onChange={e => setForm(p => ({ ...p, apiUrl: e.target.value }))} data-testid="input-config-api-url" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">URL de escucha (stream)</Label>
          <Input placeholder="https://radio.example.com/listen/station/radio.mp3" value={form.listenUrl} onChange={e => setForm(p => ({ ...p, listenUrl: e.target.value }))} data-testid="input-config-listen-url" />
        </div>
        <Button className="bg-primary hover:bg-primary/80 text-white text-xs" onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending} data-testid="button-save-config">
          Guardar Configuración
        </Button>
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
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/team", undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
  });

  const openAdd = () => {
    setEditMember(null);
    setForm({ displayName: "", habboUsername: "", role: "colaborador", motto: "" });
    setOpen(true);
  };

  const openEdit = (member: any) => {
    setEditMember(member);
    setForm({ displayName: member.displayName || "", habboUsername: member.habboUsername || "", role: member.role || "colaborador", motto: member.motto || "" });
    setOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/team", data, token ? `Bearer ${token}` : undefined);
      if (!res.ok) throw new Error("Error al agregar miembro");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      setOpen(false);
      toast({ title: "Miembro agregado" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/team/${id}`, data, token ? `Bearer ${token}` : undefined);
      if (!res.ok) throw new Error("Error al actualizar miembro");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      setOpen(false);
      toast({ title: "Miembro actualizado" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/team/${id}`, undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      toast({ title: "Miembro eliminado" });
    },
  });

  const handleSubmit = () => {
    if (editMember) {
      updateMutation.mutate({ id: editMember.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const headonlyUrl = (username: string) =>
    username ? `https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&size=s&headonly=1` : null;

  const ROLE_COLORS: Record<string, string> = {
    admin: "border-red-500/30 text-red-400",
    dj: "border-primary/30 text-primary",
    moderador: "border-blue-500/30 text-blue-400",
    colaborador: "border-green-500/30 text-green-400",
    periodista: "border-yellow-500/30 text-yellow-400",
    diseñador: "border-pink-500/30 text-pink-400",
    builder: "border-orange-500/30 text-orange-400",
    mentor: "border-purple-500/30 text-purple-400",
    eventos: "border-cyan-500/30 text-cyan-400",
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold">Equipo ({team?.length || 0})</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/80 text-white text-xs" onClick={openAdd} data-testid="button-add-team-member">
              <Plus className="w-3 h-3 mr-1" />Agregar Miembro
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader><DialogTitle className="text-sm">{editMember ? "Editar Miembro" : "Agregar Miembro"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              {form.habboUsername && (
                <div className="flex justify-center">
                  <img
                    src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(form.habboUsername)}&size=l&direction=2&head_direction=2`}
                    alt="Avatar preview"
                    className="h-24"
                    data-testid="avatar-preview"
                  />
                </div>
              )}
              <div><Label className="text-xs">Nombre para mostrar</Label><Input className="mt-1" value={form.displayName} onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))} data-testid="input-team-display-name" /></div>
              <div>
                <Label className="text-xs">Usuario de Habbo</Label>
                <Input
                  className="mt-1"
                  value={form.habboUsername}
                  onChange={e => setForm(p => ({ ...p, habboUsername: e.target.value }))}
                  placeholder="Username en Habbo.es"
                  data-testid="input-team-habbo-username"
                />
              </div>
              <div>
                <Label className="text-xs">Rol</Label>
                <Select value={form.role} onValueChange={v => setForm(p => ({ ...p, role: v }))}>
                  <SelectTrigger className="mt-1 text-xs" data-testid="select-team-role"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map(r => <SelectItem key={r} value={r} className="text-xs capitalize">{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Motto (opcional)</Label><Input className="mt-1" value={form.motto} onChange={e => setForm(p => ({ ...p, motto: e.target.value }))} data-testid="input-team-motto" /></div>
              <Button
                className="w-full bg-primary hover:bg-primary/80 text-white text-xs"
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending || !form.displayName || !form.habboUsername}
                data-testid="button-submit-team-member"
              >
                {editMember ? "Guardar Cambios" : "Agregar Miembro"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {(team || []).map(member => (
          <div key={member.id} className="flex items-center gap-3 bg-secondary/30 rounded-lg px-3 py-2 border border-border">
            {headonlyUrl(member.habboUsername) && (
              <img src={headonlyUrl(member.habboUsername)!} alt={member.displayName} className="w-10 h-10 flex-shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">{member.displayName}</span>
                <Badge variant="outline" className={`text-[9px] capitalize ${ROLE_COLORS[member.role] || "border-border"}`}>{member.role}</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">{member.habboUsername}</p>
              {member.motto && <p className="text-[10px] text-muted-foreground italic truncate">{member.motto}</p>}
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => openEdit(member)} data-testid={`button-edit-team-${member.id}`}>
                <Edit className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/60 hover:text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate(member.id)} data-testid={`button-delete-team-${member.id}`}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
        {(team || []).length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">No hay miembros en el equipo</p>
        )}
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
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/downloads", undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/downloads", data, token ? `Bearer ${token}` : undefined);
      if (!res.ok) throw new Error("Error al crear descarga");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/downloads"] });
      setOpen(false);
      setForm({ title: "", description: "", fileUrl: "", category: "general" });
      toast({ title: "Descarga creada" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/downloads/${id}`, undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/downloads"] });
      toast({ title: "Descarga eliminada" });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold">Descargas ({downloads?.length || 0})</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/80 text-white text-xs" data-testid="button-new-download">
              <Plus className="w-3 h-3 mr-1" />Nueva Descarga
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader><DialogTitle className="text-sm">Nueva Descarga</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Título</Label><Input className="mt-1" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} data-testid="input-download-title" /></div>
              <div><Label className="text-xs">Descripción</Label><Textarea className="mt-1 resize-none" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} data-testid="input-download-description" /></div>
              <div><Label className="text-xs">URL del archivo</Label><Input className="mt-1" placeholder="https://..." value={form.fileUrl} onChange={e => setForm(p => ({ ...p, fileUrl: e.target.value }))} data-testid="input-download-url" /></div>
              <div>
                <Label className="text-xs">Categoría</Label>
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger className="mt-1 text-xs" data-testid="select-download-category"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="recurso">Recurso</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full bg-primary hover:bg-primary/80 text-white text-xs"
                onClick={() => createMutation.mutate(form)}
                disabled={createMutation.isPending || !form.title || !form.fileUrl}
                data-testid="button-submit-download"
              >
                Crear Descarga
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-xs">Título</TableHead>
              <TableHead className="text-xs">Categoría</TableHead>
              <TableHead className="text-xs">Agregado por</TableHead>
              <TableHead className="text-xs">Descargas</TableHead>
              <TableHead className="text-xs">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(downloads || []).map(d => (
              <TableRow key={d.id} className="border-border">
                <TableCell className="text-xs">{d.title}</TableCell>
                <TableCell><Badge variant="outline" className="text-[9px] border-border capitalize">{d.category}</Badge></TableCell>
                <TableCell className="text-xs text-muted-foreground">{d.addedBy || "—"}</TableCell>
                <TableCell className="text-xs">{d.downloadCount || 0}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/60 hover:text-destructive" onClick={() => deleteMutation.mutate(d.id)} data-testid={`button-delete-download-${d.id}`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {(downloads || []).length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">No hay descargas</p>
        )}
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
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/banned-songs", undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/banned-songs", data, token ? `Bearer ${token}` : undefined);
      if (!res.ok) throw new Error("Error al banear canción");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banned-songs"] });
      setOpen(false);
      setForm({ title: "", artist: "", reason: "" });
      toast({ title: "Canción baneada" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/banned-songs/${id}`, undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banned-songs"] });
      toast({ title: "Canción desbaneada" });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold">Canciones Baneadas ({bannedSongs?.length || 0})</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/80 text-white text-xs" data-testid="button-ban-song">
              <Plus className="w-3 h-3 mr-1" />Banear Canción
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader><DialogTitle className="text-sm">Banear Canción</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Título</Label><Input className="mt-1" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} data-testid="input-ban-song-title" /></div>
              <div><Label className="text-xs">Artista</Label><Input className="mt-1" value={form.artist} onChange={e => setForm(p => ({ ...p, artist: e.target.value }))} data-testid="input-ban-song-artist" /></div>
              <div><Label className="text-xs">Razón</Label><Textarea className="mt-1 resize-none" rows={3} value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} data-testid="input-ban-song-reason" /></div>
              <Button
                className="w-full bg-primary hover:bg-primary/80 text-white text-xs"
                onClick={() => createMutation.mutate(form)}
                disabled={createMutation.isPending || !form.title || !form.artist}
                data-testid="button-submit-ban-song"
              >
                Banear Canción
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-xs">Título</TableHead>
              <TableHead className="text-xs">Artista</TableHead>
              <TableHead className="text-xs">Razón</TableHead>
              <TableHead className="text-xs">Baneada por</TableHead>
              <TableHead className="text-xs">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(bannedSongs || []).map(song => (
              <TableRow key={song.id} className="border-border">
                <TableCell className="text-xs font-medium">{song.title}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{song.artist}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{song.reason}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{song.bannedBy || "—"}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/60 hover:text-destructive" onClick={() => deleteMutation.mutate(song.id)} data-testid={`button-unban-song-${song.id}`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {(bannedSongs || []).length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">No hay canciones baneadas</p>
        )}
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
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/contact-messages", undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/contact-messages/${id}/status`, { status }, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-messages"] });
      toast({ title: "Estado actualizado" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/contact-messages/${id}`, undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-messages"] });
      toast({ title: "Mensaje eliminado" });
    },
  });

  const STATUS_STYLES: Record<string, string> = {
    pending: "border-yellow-500/30 text-yellow-400",
    read: "border-blue-500/30 text-blue-400",
    replied: "border-green-500/30 text-green-400",
    archived: "border-gray-500/30 text-gray-400",
  };

  const STATUS_LABELS: Record<string, string> = {
    pending: "Pendiente",
    read: "Leído",
    replied: "Respondido",
    archived: "Archivado",
  };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold">Mensajes de Contacto ({messages?.length || 0})</h2>
      <div className="space-y-2">
        {(messages || []).map(msg => (
          <div key={msg.id} className="bg-secondary/30 rounded-lg border border-border overflow-hidden">
            <div
              className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
              data-testid={`contact-message-${msg.id}`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium">{msg.name}</span>
                  <span className="text-[10px] text-muted-foreground">{msg.email}</span>
                  <Badge variant="outline" className={`text-[9px] ${STATUS_STYLES[msg.status] || "border-border"}`}>
                    {STATUS_LABELS[msg.status] || msg.status}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground truncate">{msg.subject} — {msg.message?.slice(0, 60)}...</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-[10px] text-muted-foreground">{msg.createdAt ? new Date(msg.createdAt).toLocaleDateString("es") : ""}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/60 hover:text-destructive" onClick={e => { e.stopPropagation(); deleteMutation.mutate(msg.id); }} data-testid={`button-delete-contact-${msg.id}`}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            {expandedId === msg.id && (
              <div className="px-3 pb-3 border-t border-border/50 pt-2 space-y-2">
                <p className="text-xs">{msg.message}</p>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10" onClick={() => updateStatusMutation.mutate({ id: msg.id, status: "read" })} data-testid={`button-mark-read-${msg.id}`}>Marcar leído</Button>
                  <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 border-green-500/30 text-green-400 hover:bg-green-500/10" onClick={() => updateStatusMutation.mutate({ id: msg.id, status: "replied" })} data-testid={`button-mark-replied-${msg.id}`}>Respondido</Button>
                  <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 border-gray-500/30 text-gray-400 hover:bg-gray-500/10" onClick={() => updateStatusMutation.mutate({ id: msg.id, status: "archived" })} data-testid={`button-mark-archived-${msg.id}`}>Archivar</Button>
                </div>
              </div>
            )}
          </div>
        ))}
        {(messages || []).length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">No hay mensajes de contacto</p>
        )}
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
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/reported-messages", undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/reported-messages/${id}/status`, { status }, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reported-messages"] });
      toast({ title: "Estado actualizado" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/reported-messages/${id}`, undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reported-messages"] });
      toast({ title: "Reporte eliminado" });
    },
  });

  const STATUS_STYLES: Record<string, string> = {
    pending: "border-yellow-500/30 text-yellow-400",
    warned: "border-orange-500/30 text-orange-400",
    banned: "border-red-500/30 text-red-400",
    dismissed: "border-gray-500/30 text-gray-400",
  };

  const STATUS_LABELS: Record<string, string> = {
    pending: "Pendiente",
    warned: "Advertido",
    banned: "Baneado",
    dismissed: "Descartado",
  };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold">Reportes ({reports?.length || 0})</h2>
      <div className="space-y-2">
        {(reports || []).map(report => (
          <div key={report.id} className="bg-secondary/30 rounded-lg border border-border px-3 py-2">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] text-muted-foreground">Reportado por: <span className="text-foreground">{report.reporterName}</span></span>
                  <span className="text-[10px] text-muted-foreground">Sender: <span className="text-foreground">{report.senderName}</span></span>
                  <Badge variant="outline" className={`text-[9px] ${STATUS_STYLES[report.status] || "border-border"}`}>
                    {STATUS_LABELS[report.status] || report.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{report.subject || report.content?.slice(0, 80)}</p>
                {report.reason && <p className="text-[10px] text-muted-foreground mt-0.5">Razón: {report.reason}</p>}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap mt-2">
              <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 border-orange-500/30 text-orange-400 hover:bg-orange-500/10" onClick={() => updateStatusMutation.mutate({ id: report.id, status: "warned" })} data-testid={`button-warn-report-${report.id}`}>Advertir</Button>
              <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => updateStatusMutation.mutate({ id: report.id, status: "banned" })} data-testid={`button-ban-report-${report.id}`}>Banear</Button>
              <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 border-gray-500/30 text-gray-400 hover:bg-gray-500/10" onClick={() => updateStatusMutation.mutate({ id: report.id, status: "dismissed" })} data-testid={`button-dismiss-report-${report.id}`}>Descartar</Button>
              <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate(report.id)} data-testid={`button-delete-report-${report.id}`}>Eliminar</Button>
            </div>
          </div>
        ))}
        {(reports || []).length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">No hay reportes</p>
        )}
      </div>
    </div>
  );
}

// ============ PANEL LOGS ADMIN ============
function PanelLogsAdmin() {
  const { token } = useAuth();

  const { data: logs } = useQuery<any[]>({
    queryKey: ["/api/panel-logs"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/panel-logs?limit=200", undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
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
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-xs">Fecha</TableHead>
              <TableHead className="text-xs">Usuario</TableHead>
              <TableHead className="text-xs">Acción</TableHead>
              <TableHead className="text-xs">Detalles</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(logs || []).map((log, i) => (
              <TableRow key={log.id ?? i} className="border-border">
                <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {log.createdAt ? new Date(log.createdAt).toLocaleString("es") : "—"}
                </TableCell>
                <TableCell className="text-xs">{log.userName || log.userId || "—"}</TableCell>
                <TableCell className={`text-xs font-medium ${ACTION_COLOR(log.action)}`}>{log.action}</TableCell>
                <TableCell className="text-[10px] text-muted-foreground max-w-xs truncate">{log.details || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {(logs || []).length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">No hay logs disponibles</p>
        )}
      </div>
    </div>
  );
}

// ============ MAIN PANEL ============
export default function AdminPanel() {
  const { section } = useParams<{ section?: string }>();
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState(section || "themes");

  if (!user || !isAdmin) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-64 gap-4 text-center">
        <Shield className="w-14 h-14 text-muted-foreground/30" />
        <h2 className="text-lg font-bold">Acceso restringido</h2>
        <p className="text-sm text-muted-foreground">Necesitas permisos de administrador</p>
        <Link href="/login">
          <a className="text-primary text-sm hover:underline">Iniciar sesión</a>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Settings className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">Panel de Administración</h1>
        <Badge className="bg-red-500/10 text-red-400 border-red-500/30 text-[9px]">ADMIN</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-secondary/50 border border-border h-auto flex-wrap gap-0.5">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <TabsTrigger key={id} value={id} className="text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-white" data-testid={`tab-admin-${id}`}>
              <Icon className="w-3 h-3" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="themes">
          <Card className="bg-card border-border">
            <CardContent className="p-5"><ThemesAdmin /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="news">
          <Card className="bg-card border-border">
            <CardContent className="p-5"><NewsAdmin /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="events">
          <Card className="bg-card border-border">
            <CardContent className="p-5"><EventsAdmin /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="schedule">
          <Card className="bg-card border-border">
            <CardContent className="p-5"><ScheduleAdmin /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
          <Card className="bg-card border-border">
            <CardContent className="p-5"><UsersAdmin /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="team">
          <Card className="bg-card border-border">
            <CardContent className="p-5"><TeamAdmin /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="downloads">
          <Card className="bg-card border-border">
            <CardContent className="p-5"><DownloadsAdmin /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="banned">
          <Card className="bg-card border-border">
            <CardContent className="p-5"><BannedSongsAdmin /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="contacts">
          <Card className="bg-card border-border">
            <CardContent className="p-5"><ContactsAdmin /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports">
          <Card className="bg-card border-border">
            <CardContent className="p-5"><ReportsAdmin /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="logs">
          <Card className="bg-card border-border">
            <CardContent className="p-5"><PanelLogsAdmin /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="dj">
          <Card className="bg-card border-border">
            <CardContent className="p-5"><DjPanelAdmin /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="config">
          <Card className="bg-card border-border">
            <CardContent className="p-5"><ConfigAdmin /></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
